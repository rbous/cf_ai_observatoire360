/**
 * Cloudflare Workers Cron Trigger handler.
 *
 * Runs daily and checks if a new Esri Wayback release is available.
 * If so, enqueues high-res scans for all enabled municipalities.
 * If not, skips — no point scanning without new imagery.
 *
 * Wayback releases happen every 1-3 weeks with sub-meter resolution.
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
    startDate?: string;
    endDate?: string;
    latitude?: number;
    longitude?: number;
    comparisonMode?: string;
}

// ---------------------------------------------------------------------------
// Wayback release check
// ---------------------------------------------------------------------------

const WAYBACK_CONFIG_URL = "https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json";

interface WaybackRelease {
    date: string;
    releaseId: string;
}

async function getLatestRelease(): Promise<WaybackRelease | null> {
    try {
        const res = await fetch(WAYBACK_CONFIG_URL);
        if (!res.ok) return null;

        const config = (await res.json()) as Record<string, {
            itemTitle: string;
            itemURL: string;
        }>;

        let latest: WaybackRelease | null = null;

        for (const item of Object.values(config)) {
            const releaseId = item.itemURL.match(/tile\/(\d+)\//)?.[1];
            const dateMatch = item.itemTitle.match(/(\d{4}-\d{2}-\d{2})/);
            if (!releaseId || !dateMatch) continue;

            const date = dateMatch[1];
            if (!latest || date > latest.date) {
                latest = { date, releaseId };
            }
        }

        return latest;
    } catch (err) {
        console.error("[scheduler] Failed to fetch Wayback config:", err);
        return null;
    }
}

// ---------------------------------------------------------------------------
// handleScheduled
// ---------------------------------------------------------------------------

export async function handleScheduled(env: Bindings): Promise<void> {
    const db = drizzle(env.DB);
    const now = Math.floor(Date.now() / 1_000);

    // Check if there's a new Wayback release
    const latestRelease = await getLatestRelease();
    if (!latestRelease) {
        console.log("[scheduler] Could not fetch Wayback releases. Skipping.");
        return;
    }

    console.log(`[scheduler] Latest Wayback release: ${latestRelease.date}`);

    // Get all scan-enabled municipalities
    const rows = await db
        .select()
        .from(municipalities)
        .where(eq(municipalities.scanEnabled, true));

    console.log(`[scheduler] Evaluating ${rows.length} scan-enabled municipality(ies).`);

    let enqueued = 0;

    for (const municipality of rows) {
        // Skip if we already scanned with this release
        // (lastScanAt stores the date string of the last Wayback release used)
        const lastScanDate = municipality.lastScanAt
            ? new Date(municipality.lastScanAt * 1000).toISOString().slice(0, 10)
            : null;

        if (lastScanDate && lastScanDate >= latestRelease.date) {
            console.log(`[scheduler] ${municipality.name}: already scanned with release ${lastScanDate}, skipping.`);
            continue;
        }

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

        // Compute center point of the municipality for Wayback tile fetch
        const centerLat = (bounds.north + bounds.south) / 2;
        const centerLng = (bounds.east + bounds.west) / 2;

        // Find the comparison date: use the release before this one
        // Default to ~6 months ago if this is the first scan
        const startDate = lastScanDate ?? new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const endDate = latestRelease.date;

        const jobId = ulid();
        await db.insert(scanJobs).values({
            id: jobId,
            municipalityId: municipality.id,
            status: "pending",
            startDate,
            endDate,
            latitude: centerLat,
            longitude: centerLng,
            createdAt: now,
        });

        await env.DETECTION_QUEUE.send({
            jobId,
            municipalityId: municipality.id,
            bounds,
            startDate,
            endDate,
            latitude: centerLat,
            longitude: centerLng,
        } satisfies ScanJobMessage);

        // Update last_scan_at
        await db
            .update(municipalities)
            .set({ lastScanAt: now })
            .where(eq(municipalities.id, municipality.id));

        enqueued++;
        console.log(`[scheduler] Enqueued scan for ${municipality.name}: ${startDate} → ${endDate} (Wayback release ${latestRelease.date})`);
    }

    console.log(`[scheduler] Done — ${enqueued} job(s) enqueued.`);
}
