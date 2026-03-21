/**
 * Cloudflare Queue consumer handler.
 *
 * Each message in the batch represents a pending scan job.  The handler:
 *   1. Fetches the latest Sentinel-2 imagery for the municipality's bbox.
 *   2. Compares it against the previous baseline image via the AI detection API.
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
import { eq, and, desc } from "drizzle-orm";
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
import { detectChanges, type DetectionResult } from "./lib/ai-detection.js";
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

interface ScanJobMessage {
    jobId: string;
    municipalityId: string;
    bounds: BBox;
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
    const { jobId, municipalityId, bounds } = body;
    const now = Math.floor(Date.now() / 1_000);

    console.log(`[queue] Processing job ${jobId} for municipality ${municipalityId}.`);

    // ------------------------------------------------------------------
    // 1. Mark job as "fetching"
    // ------------------------------------------------------------------
    await db
        .update(scanJobs)
        .set({ status: "fetching", startedAt: now })
        .where(eq(scanJobs.id, jobId));

    // ------------------------------------------------------------------
    // 2. Fetch the latest Sentinel-2 imagery
    // ------------------------------------------------------------------
    const sentinelConfig: SentinelHubConfig = {
        clientId: env.COPERNICUS_CLIENT_ID,
        clientSecret: env.COPERNICUS_CLIENT_SECRET,
    };

    // We need the municipality code to build the R2 object key
    const [municipalityRow] = await db
        .select()
        .from(municipalities)
        .where(eq(municipalities.id, municipalityId))
        .limit(1);

    if (!municipalityRow) {
        throw new Error(`Municipality ${municipalityId} not found in database.`);
    }

    let afterResult: { imageKey: string; imageryDate: string } | null;
    try {
        afterResult = await fetchLatestImagery(
            sentinelConfig,
            bounds,
            env.IMAGES_BUCKET,
            municipalityRow.code,
        );
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await markJobFailed(db, jobId, `fetchLatestImagery failed: ${errorMsg}`);
        return;
    }

    // No imagery available within the last 30 days
    if (!afterResult) {
        console.log(`[queue] No imagery available for job ${jobId}, marking completed.`);
        await db
            .update(scanJobs)
            .set({ status: "completed", detectionsCount: 0, completedAt: now })
            .where(eq(scanJobs.id, jobId));
        return;
    }

    const { imageKey: afterImageKey, imageryDate } = afterResult;

    // ------------------------------------------------------------------
    // 3. Find the previous completed scan job to use as the baseline
    // ------------------------------------------------------------------
    const [previousJob] = await db
        .select({
            afterImageKey: scanJobs.afterImageKey,
        })
        .from(scanJobs)
        .where(
            and(
                eq(scanJobs.municipalityId, municipalityId),
                eq(scanJobs.status, "completed"),
            ),
        )
        .orderBy(desc(scanJobs.completedAt))
        .limit(1);

    const beforeImageKey = previousJob?.afterImageKey ?? null;

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
    // 4. Mark job as "analyzing" and store the after-image key
    // ------------------------------------------------------------------
    await db
        .update(scanJobs)
        .set({ status: "analyzing", afterImageKey, imageryDate })
        .where(eq(scanJobs.id, jobId));

    // ------------------------------------------------------------------
    // 5. Run AI change detection
    // ------------------------------------------------------------------
    let detections: DetectionResult[];
    try {
        detections = await detectChanges(
            env.AI,
            beforeImageKey,
            afterImageKey,
            env.IMAGES_BUCKET,
            bounds,
        );
    } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await markJobFailed(db, jobId, `detectChanges failed: ${errorMsg}`);
        return;
    }

    console.log(
        `[queue] Job ${jobId}: ${detections.length} detection(s) found.`,
    );

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

    for (const detection of detections) {
        // 6a. Create alert
        const alertId = ulid();
        await db.insert(alerts).values({
            id: alertId,
            municipalityId,
            latitude: detection.latitude,
            longitude: detection.longitude,
            riskLevel: detection.riskLevel,
            riskScore: detection.riskScore,
            status: "a_analyser",
            type: detection.type,
            detectedArea: detection.detectedArea,
            address: detection.address ?? null,
            detectedAt,
            images: JSON.stringify([]),
            scanJobId: jobId,
            beforeImageKey,
            afterImageKey,
            confidence: detection.confidence,
            createdAt: now,
        });

        // 6b. Create notifications for all managers and inspectors
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
                    `Une nouvelle ${typeLabel.toLowerCase()} a été détectée` +
                    (detection.address ? ` au ${detection.address}` : "") +
                    ` avec un risque ${formatRiskLabel(detection.riskLevel)}.`,
                isRead: false,
                createdAt: now,
            });
        }

        // 6c. Send email to managers only
        if (managers.length > 0) {
            const alertSummary: AlertSummary = {
                id: alertId,
                type: detection.type,
                riskLevel: detection.riskLevel,
                riskScore: detection.riskScore,
                confidence: detection.confidence,
                address: detection.address ?? null,
                detectedArea: detection.detectedArea,
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
            detectionsCount: detections.length,
            completedAt: now,
        })
        .where(eq(scanJobs.id, jobId));

    console.log(`[queue] Job ${jobId} completed with ${detections.length} detection(s).`);
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

function formatTypeLabel(type: DetectionResult["type"]): string {
    switch (type) {
        case "construction": return "Construction";
        case "extension":    return "Extension";
        case "annexe":       return "Annexe";
        case "piscine":      return "Piscine";
        default:             return "Détection";
    }
}

function formatRiskLabel(level: DetectionResult["riskLevel"]): string {
    switch (level) {
        case "low":    return "faible";
        case "medium": return "moyen";
        case "high":   return "élevé";
        default:       return level;
    }
}
