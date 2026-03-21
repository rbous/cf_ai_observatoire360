/**
 * Cloudflare Workers Cron Trigger handler.
 *
 * Runs on a schedule (configured in wrangler.toml) and enqueues a scan job
 * for every municipality whose scan frequency threshold has been exceeded.
 */

import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { municipalities, scanJobs } from "./db/schema.js";
import { ulid } from "./lib/ulid.js";
import type { Bindings } from "./types.js";

// ---------------------------------------------------------------------------
// Queue message shape
// ---------------------------------------------------------------------------

export interface ScanJobMessage {
    jobId: string;
    municipalityId: string;
    bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
}

// ---------------------------------------------------------------------------
// handleScheduled
// ---------------------------------------------------------------------------

/**
 * Evaluate all municipalities that have scanning enabled and enqueue a
 * detection job for those whose scan frequency threshold has been exceeded.
 */
export async function handleScheduled(env: Bindings): Promise<void> {
    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1_000); // Unix epoch seconds

    // Fetch all municipalities with scanning enabled
    const rows = await db
        .select()
        .from(municipalities)
        .where(eq(municipalities.scanEnabled, true));

    console.log(`[scheduler] Evaluating ${rows.length} scan-enabled municipality(ies).`);

    let enqueued = 0;

    for (const municipality of rows) {
        if (!shouldScan(municipality.scanFrequency, municipality.lastScanAt, now)) {
            continue;
        }

        // Parse bounds from the JSON column
        let bounds: ScanJobMessage["bounds"] | null = null;
        if (municipality.bounds) {
            try {
                bounds = JSON.parse(municipality.bounds) as ScanJobMessage["bounds"];
            } catch {
                console.warn(
                    `[scheduler] Could not parse bounds for municipality ${municipality.id}, skipping.`,
                );
                continue;
            }
        }

        if (!bounds) {
            console.warn(
                `[scheduler] Municipality ${municipality.id} has no bounds defined, skipping.`,
            );
            continue;
        }

        // Create the scan_jobs row
        const jobId = ulid();
        await db.insert(scanJobs).values({
            id: jobId,
            municipalityId: municipality.id,
            status: "pending",
            createdAt: now,
        });

        // Enqueue the message
        const message: ScanJobMessage = {
            jobId,
            municipalityId: municipality.id,
            bounds,
        };
        await env.DETECTION_QUEUE.send(message);

        // Update last_scan_at on the municipality
        await db
            .update(municipalities)
            .set({ lastScanAt: now })
            .where(eq(municipalities.id, municipality.id));

        console.log(
            `[scheduler] Enqueued job ${jobId} for municipality ${municipality.id} (${municipality.name}).`,
        );
        enqueued++;
    }

    console.log(`[scheduler] Done — ${enqueued} job(s) enqueued.`);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const SECONDS_IN_DAY = 86_400;

/**
 * Determine whether a municipality is due for a new scan based on its
 * configured frequency and the timestamp of its last scan.
 *
 * @param frequency  - "daily" | "weekly" | "biweekly" | "monthly"
 * @param lastScanAt - Unix epoch seconds of the last scan, or null / undefined.
 * @param now        - Current Unix epoch seconds.
 */
function shouldScan(
    frequency: string,
    lastScanAt: number | null | undefined,
    now: number,
): boolean {
    if (lastScanAt === null || lastScanAt === undefined) {
        // Never scanned — always eligible
        return true;
    }

    const elapsedDays = (now - lastScanAt) / SECONDS_IN_DAY;

    switch (frequency) {
        case "daily":
            return true;
        case "weekly":
            return elapsedDays > 7;
        case "biweekly":
            return elapsedDays > 14;
        case "monthly":
            return elapsedDays > 30;
        default:
            // Unknown frequency — default to daily behaviour
            console.warn(`[scheduler] Unknown scan frequency "${frequency}", defaulting to daily.`);
            return true;
    }
}
