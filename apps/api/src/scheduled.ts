/**
 * Cloudflare Workers Cron Trigger handler.
 *
 * Runs daily and enqueues TWO types of scan jobs:
 *   1. SHORT-TERM (daily): compare today vs yesterday → catches sudden changes
 *   2. LONG-TERM (biweekly): compare today vs ~90 days ago → catches gradual construction
 */

import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { municipalities, scanJobs } from "./db/schema.js";
import { ulid } from "./lib/ulid.js";
import type { Bindings } from "./types.js";

// ---------------------------------------------------------------------------
// Queue message shape
// ---------------------------------------------------------------------------

export type ComparisonMode = "short_term" | "long_term";

export interface ScanJobMessage {
    jobId: string;
    municipalityId: string;
    bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    /** Custom date range for manual analyses (ISO date strings) */
    startDate?: string;
    endDate?: string;
    comparisonMode: ComparisonMode;
}

// ---------------------------------------------------------------------------
// handleScheduled
// ---------------------------------------------------------------------------

export async function handleScheduled(env: Bindings): Promise<void> {
    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1_000);

    const rows = await db
        .select()
        .from(municipalities)
        .where(eq(municipalities.scanEnabled, true));

    console.log(`[scheduler] Evaluating ${rows.length} scan-enabled municipality(ies).`);

    let enqueued = 0;

    for (const municipality of rows) {
        // Parse bounds
        let bounds: ScanJobMessage["bounds"] | null = null;
        if (municipality.bounds) {
            try {
                bounds = JSON.parse(municipality.bounds) as ScanJobMessage["bounds"];
            } catch {
                console.warn(`[scheduler] Could not parse bounds for ${municipality.id}, skipping.`);
                continue;
            }
        }
        if (!bounds) {
            console.warn(`[scheduler] Municipality ${municipality.id} has no bounds, skipping.`);
            continue;
        }

        // --- Always enqueue a SHORT-TERM (daily) job ---
        const shortJobId = ulid();
        await db.insert(scanJobs).values({
            id: shortJobId,
            municipalityId: municipality.id,
            status: "pending",
            createdAt: now,
        });
        await env.DETECTION_QUEUE.send({
            jobId: shortJobId,
            municipalityId: municipality.id,
            bounds,
            comparisonMode: "short_term",
        } satisfies ScanJobMessage);
        enqueued++;

        console.log(`[scheduler] Enqueued SHORT-TERM job ${shortJobId} for ${municipality.name}`);

        // --- Enqueue a LONG-TERM job every 14 days ---
        const lastScan = municipality.lastScanAt ?? 0;
        const daysSinceLastLongTerm = (now - lastScan) / 86_400;
        if (daysSinceLastLongTerm >= 14 || lastScan === 0) {
            const longJobId = ulid();
            await db.insert(scanJobs).values({
                id: longJobId,
                municipalityId: municipality.id,
                status: "pending",
                createdAt: now,
            });
            await env.DETECTION_QUEUE.send({
                jobId: longJobId,
                municipalityId: municipality.id,
                bounds,
                comparisonMode: "long_term",
            } satisfies ScanJobMessage);
            enqueued++;

            console.log(`[scheduler] Enqueued LONG-TERM job ${longJobId} for ${municipality.name}`);
        }

        // Update last_scan_at
        await db
            .update(municipalities)
            .set({ lastScanAt: now })
            .where(eq(municipalities.id, municipality.id));
    }

    console.log(`[scheduler] Done — ${enqueued} job(s) enqueued.`);
}
