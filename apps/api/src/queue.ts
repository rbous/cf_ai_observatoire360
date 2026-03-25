/**
 * Cloudflare Queue consumer handler.
 *
 * Each message in the batch represents a pending scan job.  The handler:
 *   1. Fetches the latest Sentinel-2 imagery for the municipality's bbox.
 *   2. Compares it against the OLDEST baseline image (not yesterday's) via AI.
 *   3. Persists any detections as alerts and notifications in D1.
 *   4. Emails managers via Resend.
 *   5. Marks the scan job completed (or failed on error).
 *
 * The entire per-message logic is wrapped in a try/catch so that a single
 * failing message does not crash the rest of the batch.  Failed messages
 * are left for the Queue to retry according to the max_retries configuration
 * in wrangler.toml.
 */

import { drizzle } from "drizzle-orm/d1";
import { eq, and, asc, desc, lte, isNotNull, ne } from "drizzle-orm";
import {
    scanJobs,
    alerts,
    notifications,
    municipalities,
    users,
} from "./db/schema.js";
import { ulid } from "./lib/ulid.js";
import {
    fetchLatestImagery,
    type BBox,
    type SentinelHubConfig,
} from "./lib/sentinel.js";
import { computeDiffScore, classifyChange, type ClassificationResult } from "./lib/change-detection.js";
import { fetchOrthophoto } from "./lib/orthophoto.js";
import { fetchWaybackImage } from "./lib/wayback.js";
import {
    sendEmail,
    buildAlertEmailHtml,
    type AlertSummary,
    type MunicipalitySummary,
} from "./lib/resend.js";
import type { Bindings } from "./types.js";

// ---------------------------------------------------------------------------
// Queue message shape  (must match the shape produced by scheduled.ts)
// ---------------------------------------------------------------------------

type ComparisonMode = "short_term" | "long_term";

interface ScanJobMessage {
    jobId: string;
    municipalityId: string;
    bounds: BBox;
    comparisonMode?: ComparisonMode;
    /** Custom date range (ISO date strings) for manual analyses */
    startDate?: string;
    endDate?: string;
    /** Center point for address-specific scans (triggers high-res Wayback) */
    latitude?: number;
    longitude?: number;
    /** If triggered from an alert, update alert images when scan completes */
    alertId?: string;
}

// ---------------------------------------------------------------------------
// handleQueue
// ---------------------------------------------------------------------------

/**
 * Process a batch of scan-job messages from the DETECTION_QUEUE.
 */
export async function handleQueue(
    batch: MessageBatch,
    env: Bindings,
): Promise<void> {
    const db = drizzle(env.DB);

    for (const message of batch.messages) {
        try {
            await processMessage(message.body as ScanJobMessage, env, db);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(
                `[queue] Unhandled error processing message ${message.id}:`,
                errorMsg,
            );
            // Do not call message.ack() — let the Queue retry this message.
        }
    }
}

// ---------------------------------------------------------------------------
// Per-message processing
// ---------------------------------------------------------------------------

async function processMessage(
    body: ScanJobMessage,
    env: Bindings,
    db: ReturnType<typeof drizzle>,
): Promise<void> {
    const { jobId, municipalityId, bounds, comparisonMode = "short_term", startDate, endDate, latitude, longitude } = body;
    const now = Math.floor(Date.now() / 1_000);
    const isAddressLevel = latitude !== undefined && longitude !== undefined;

    console.log(`[queue] Processing job ${jobId} (mode: ${comparisonMode}, address-level: ${isAddressLevel}, dates: ${startDate ?? "auto"} → ${endDate ?? "auto"})`);

    // ------------------------------------------------------------------
    // 1. Mark job as "fetching"
    // ------------------------------------------------------------------
    await db
        .update(scanJobs)
        .set({ status: "fetching", startedAt: now })
        .where(eq(scanJobs.id, jobId));

    // We need the municipality code for R2 key prefixes
    const [municipalityRow] = await db
        .select()
        .from(municipalities)
        .where(eq(municipalities.id, municipalityId))
        .limit(1);

    if (!municipalityRow) {
        throw new Error(`Municipality ${municipalityId} not found in database.`);
    }

    // ------------------------------------------------------------------
    // 2. Fetch imagery — Wayback (high-res) for address, Sentinel-2 for city
    // ------------------------------------------------------------------
    let afterImageKey: string | null = null;
    let beforeImageKey: string | null = null;
    let imageryDate: string | null = null;

    if (isAddressLevel) {
        // --- HIGH-RES: Esri export (after) + Wayback (before) ---
        const effectiveEndDate = endDate ?? new Date().toISOString().slice(0, 10);
        const effectiveStartDate = startDate ?? new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        try {
            // "After" = current Esri World Imagery (latest, 1024px, exact bbox)
            const afterOrtho = await fetchOrthophoto(
                bounds, env.IMAGES_BUCKET, `hires/${municipalityRow.code}/${jobId}-after`, 1024,
            );
            // "Before" = Wayback historical at start date
            const beforeWb = await fetchWaybackImage(
                latitude, longitude, effectiveStartDate, env.IMAGES_BUCKET, `wayback/${municipalityRow.code}/${jobId}-before`,
            );

            afterImageKey = afterOrtho?.imageKey ?? null;
            beforeImageKey = beforeWb?.imageKey ?? null;
            imageryDate = effectiveEndDate;

            console.log(`[queue] High-res: before=Wayback(${beforeWb?.releaseDate ?? "none"}), after=Esri(latest)`);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            await markJobFailed(db, jobId, `High-res image fetch failed: ${errorMsg}`);
            return;
        }
    } else {
        // --- STANDARD: Sentinel-2 for municipality-wide scans ---
        const sentinelConfig: SentinelHubConfig = {
            clientId: env.COPERNICUS_CLIENT_ID,
            clientSecret: env.COPERNICUS_CLIENT_SECRET,
        };

        try {
            const afterResult = await fetchLatestImagery(
                sentinelConfig, bounds, env.IMAGES_BUCKET, municipalityRow.code, endDate,
            );
            if (afterResult) {
                afterImageKey = afterResult.imageKey;
                imageryDate = afterResult.imageryDate;
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            await markJobFailed(db, jobId, `Sentinel-2 fetch failed: ${errorMsg}`);
            return;
        }
    }

    if (!afterImageKey) {
        console.log(`[queue] No imagery available for job ${jobId}, marking completed.`);
        await db
            .update(scanJobs)
            .set({ status: "completed", detectionsCount: 0, completedAt: now })
            .where(eq(scanJobs.id, jobId));
        return;
    }

    // ------------------------------------------------------------------
    // 3. Get "before" image for municipality-wide (Sentinel-2) scans.
    //    Address-level scans already have before/after from Wayback.
    // ------------------------------------------------------------------
    if (!isAddressLevel && !beforeImageKey) {
        if (comparisonMode === "long_term") {
            const ninetyDaysAgo = now - 90 * 24 * 60 * 60;
            let [baselineJob] = await db
                .select({ afterImageKey: scanJobs.afterImageKey })
                .from(scanJobs)
                .where(
                    and(
                        eq(scanJobs.municipalityId, municipalityId),
                        eq(scanJobs.status, "completed"),
                        isNotNull(scanJobs.afterImageKey),
                        lte(scanJobs.completedAt, ninetyDaysAgo),
                    ),
                )
                .orderBy(asc(scanJobs.completedAt))
                .limit(1);

            if (!baselineJob) {
                [baselineJob] = await db
                    .select({ afterImageKey: scanJobs.afterImageKey })
                    .from(scanJobs)
                    .where(
                        and(
                            eq(scanJobs.municipalityId, municipalityId),
                            eq(scanJobs.status, "completed"),
                            isNotNull(scanJobs.afterImageKey),
                        ),
                    )
                    .orderBy(asc(scanJobs.completedAt))
                    .limit(1);
            }
            beforeImageKey = baselineJob?.afterImageKey ?? null;
        } else {
            const [recentJob] = await db
                .select({ afterImageKey: scanJobs.afterImageKey })
                .from(scanJobs)
                .where(
                    and(
                        eq(scanJobs.municipalityId, municipalityId),
                        eq(scanJobs.status, "completed"),
                        isNotNull(scanJobs.afterImageKey),
                    ),
                )
                .orderBy(desc(scanJobs.completedAt))
                .limit(1);
            beforeImageKey = recentJob?.afterImageKey ?? null;
        }
    }

    if (!beforeImageKey) {
        // No previous image — store this as the new baseline and exit
        console.log(
            `[queue] No baseline image for municipality ${municipalityId}. ` +
            `Storing ${afterImageKey} as the new baseline.`,
        );
        await db
            .update(scanJobs)
            .set({
                status: "completed",
                imageryDate,
                afterImageKey,
                detectionsCount: 0,
                completedAt: now,
            })
            .where(eq(scanJobs.id, jobId));
        return;
    }

    // ------------------------------------------------------------------
    // 4. Fetch high-res Quebec orthophoto (address-level scans only)
    // ------------------------------------------------------------------
    let orthoImageKey: string | null = null;
    try {
        const orthoResult = await fetchOrthophoto(
            bounds,
            env.IMAGES_BUCKET,
            `ortho/${municipalityRow.code}/${jobId}`,
        );
        orthoImageKey = orthoResult?.imageKey ?? null;
        if (orthoImageKey) {
            console.log(`[queue] Orthophoto saved: ${orthoImageKey}`);
        }
    } catch (err) {
        console.warn("[queue] Orthophoto fetch failed (non-fatal):", err);
    }

    // ------------------------------------------------------------------
    // 5. Mark job as "analyzing" and store image keys
    // ------------------------------------------------------------------
    await db
        .update(scanJobs)
        .set({ status: "analyzing", afterImageKey, beforeImageKey, orthoImageKey, imageryDate, startDate: startDate ?? null, endDate: endDate ?? null })
        .where(eq(scanJobs.id, jobId));

    // ------------------------------------------------------------------
    // 6. TWO-STAGE CHANGE DETECTION
    //    Stage 1: Fast pixel-diff (no AI) — gate to avoid false positives
    //    Stage 2: AI classification — only when pixel-diff flags a change
    // ------------------------------------------------------------------

    // Stage 1: Pixel-diff
    if (!beforeImageKey || !afterImageKey) {
        console.log(`[queue] Job ${jobId}: missing before/after images, skipping detection.`);
        await db.update(scanJobs).set({ status: "completed", detectionsCount: 0, completedAt: now }).where(eq(scanJobs.id, jobId));
        return;
    }

    const [beforeObj, afterObj] = await Promise.all([
        env.IMAGES_BUCKET.get(beforeImageKey),
        env.IMAGES_BUCKET.get(afterImageKey),
    ]);

    if (!beforeObj || !afterObj) {
        console.log(`[queue] Job ${jobId}: could not retrieve images from R2, skipping.`);
        await db.update(scanJobs).set({ status: "completed", detectionsCount: 0, completedAt: now }).where(eq(scanJobs.id, jobId));
        return;
    }

    const beforeBytes = new Uint8Array(await beforeObj.arrayBuffer());
    const afterBytes = new Uint8Array(await afterObj.arrayBuffer());

    const diff = computeDiffScore(beforeBytes, afterBytes);
    console.log(`[queue] Job ${jobId} pixel-diff: ${diff.summary}`);

    type Detection = {
        type: "construction" | "extension" | "annexe" | "piscine";
        riskLevel: "low" | "medium" | "high";
        riskScore: number;
        confidence: number;
        description: string;
    };

    const detections: Detection[] = [];

    if (diff.changed) {
        // Stage 2: AI classification — what type of change is it?
        console.log(`[queue] Job ${jobId}: change detected, running AI classification...`);

        const classification = await classifyChange(env.AI, afterBytes);

        if (classification && classification.type !== "other") {
            detections.push({
                type: classification.type as Detection["type"],
                riskLevel: classification.riskLevel,
                riskScore: classification.riskScore,
                confidence: classification.confidence,
                description: classification.description,
            });
            console.log(`[queue] Job ${jobId}: AI classified as ${classification.type} (${classification.riskLevel}, confidence: ${classification.confidence})`);
        } else if (classification) {
            console.log(`[queue] Job ${jobId}: AI classified as "other" (non-construction change) — skipping alert.`);
        } else {
            // AI failed but pixel-diff was positive — create a generic alert
            console.log(`[queue] Job ${jobId}: AI classification failed, creating generic alert from pixel-diff.`);
            detections.push({
                type: "construction",
                riskLevel: "medium",
                riskScore: Math.round(diff.score * 100),
                confidence: diff.score,
                description: `Changement détecté par analyse d'image (score: ${(diff.score * 100).toFixed(0)}%)`,
            });
        }
    }

    console.log(`[queue] Job ${jobId}: ${detections.length} detection(s) after two-stage analysis.`);

    // ------------------------------------------------------------------
    // 6. Persist detections as alerts + notifications + emails
    // ------------------------------------------------------------------
    const detectedAt = now;

    // Fetch managers and inspectors for notification/email targeting
    const recipientUsers = await db
        .select()
        .from(users)
        .where(
            and(
                eq(users.municipalityId, municipalityId),
                eq(users.isActive, true),
            ),
        );

    const managers = recipientUsers.filter((u) => u.role === "manager");
    const notifyUsers = recipientUsers.filter(
        (u) => u.role === "manager" || u.role === "inspector",
    );

    const municipalitySummary: MunicipalitySummary = {
        id: municipalityRow.id,
        name: municipalityRow.name,
    };

    // Pre-fetch existing open alerts for deduplication (within ~50m radius)
    const existingAlerts = await db
        .select({ latitude: alerts.latitude, longitude: alerts.longitude })
        .from(alerts)
        .where(
            and(
                eq(alerts.municipalityId, municipalityId),
                ne(alerts.status, "cloturee"),
            ),
        );

    function isDuplicate(lat: number, lng: number): boolean {
        // ~0.00045 degrees ≈ 50 meters at Quebec's latitude
        const threshold = 0.00045;
        return existingAlerts.some(
            (a) => Math.abs(a.latitude - lat) < threshold && Math.abs(a.longitude - lng) < threshold,
        );
    }

    let skippedDuplicates = 0;

    // Use scan center point as the alert location
    const alertLat = latitude ?? (bounds.north + bounds.south) / 2;
    const alertLng = longitude ?? (bounds.east + bounds.west) / 2;

    for (const detection of detections) {
        // 6a. Deduplication — skip if an open alert already exists nearby
        if (isDuplicate(alertLat, alertLng)) {
            skippedDuplicates++;
            continue;
        }

        // 6b. Create alert
        const alertId = ulid();
        await db.insert(alerts).values({
            id: alertId,
            municipalityId,
            latitude: alertLat,
            longitude: alertLng,
            riskLevel: detection.riskLevel,
            riskScore: detection.riskScore,
            status: "a_analyser",
            type: detection.type,
            detectedArea: null,
            address: body.alertId ? null : (municipalityRow.name ?? null),
            detectedAt,
            images: JSON.stringify([]),
            scanJobId: jobId,
            beforeImageKey,
            afterImageKey,
            confidence: detection.confidence,
            createdAt: now,
        });

        // 6d. Create notifications for all managers and inspectors
        for (const user of notifyUsers) {
            const notifId = ulid();
            const typeLabel = formatTypeLabel(detection.type);
            await db.insert(notifications).values({
                id: notifId,
                municipalityId,
                userId: user.id,
                alertId,
                type: "new_alert",
                title: `Nouvelle détection : ${typeLabel}`,
                message:
                    `${detection.description} — risque ${formatRiskLabel(detection.riskLevel)}.`,
                isRead: false,
                createdAt: now,
            });
        }

        // 6d. Send email to managers only
        if (managers.length > 0) {
            const alertSummary: AlertSummary = {
                id: alertId,
                type: detection.type,
                riskLevel: detection.riskLevel,
                riskScore: detection.riskScore,
                confidence: detection.confidence,
                address: null,
                detectedArea: null,
            };

            const html = buildAlertEmailHtml(alertSummary, municipalitySummary);
            const toAddresses = managers.map((m) => m.email);

            const emailResult = await sendEmail(env.RESEND_API_KEY, {
                to: toAddresses,
                subject: `[Observatoire 360] Nouvelle détection — ${municipalityRow.name}`,
                html,
            });

            if (!emailResult.success) {
                // Log but do not fail the job — email delivery is best-effort
                console.warn(
                    `[queue] Email delivery failed for alert ${alertId}: ${emailResult.error}`,
                );
            }
        }
    }

    // ------------------------------------------------------------------
    // 7. Mark job as completed
    // ------------------------------------------------------------------
    await db
        .update(scanJobs)
        .set({
            status: "completed",
            detectionsCount: detections.length - skippedDuplicates,
            completedAt: now,
        })
        .where(eq(scanJobs.id, jobId));

    // ------------------------------------------------------------------
    // 8. If triggered from an alert, link images back to it
    // ------------------------------------------------------------------
    if (body.alertId && (afterImageKey || beforeImageKey)) {
        try {
            await db
                .update(alerts)
                .set({
                    beforeImageKey: beforeImageKey ?? undefined,
                    afterImageKey: afterImageKey ?? undefined,
                    scanJobId: jobId,
                })
                .where(eq(alerts.id, body.alertId));
            console.log(`[queue] Linked images to alert ${body.alertId}`);
        } catch (err) {
            console.warn(`[queue] Failed to link images to alert ${body.alertId}:`, err);
        }
    }

    console.log(
        `[queue] Job ${jobId} completed: ${detections.length} detection(s), ` +
        `${skippedDuplicates} duplicate(s) skipped, ` +
        `${detections.length - skippedDuplicates} new alert(s) created.`,
    );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function markJobFailed(
    db: ReturnType<typeof drizzle>,
    jobId: string,
    error: string,
): Promise<void> {
    const now = Math.floor(Date.now() / 1_000);
    console.error(`[queue] Job ${jobId} failed: ${error}`);
    await db
        .update(scanJobs)
        .set({ status: "failed", error, completedAt: now })
        .where(eq(scanJobs.id, jobId));
}

function formatTypeLabel(type: string): string {
    switch (type) {
        case "construction": return "Construction";
        case "extension":    return "Extension";
        case "annexe":       return "Annexe";
        case "piscine":      return "Piscine";
        default:             return "Détection";
    }
}

function formatRiskLabel(level: string): string {
    switch (level) {
        case "low":    return "faible";
        case "medium": return "moyen";
        case "high":   return "élevé";
        default:       return level;
    }
}
