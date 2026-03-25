/**
 * Esri World Imagery Wayback — high-resolution historical aerial imagery.
 *
 * Provides sub-meter before/after imagery from Esri's Wayback archive
 * (191 releases from 2014 to present). Each release is a full global
 * mosaic captured at a specific date.
 *
 * Free, no API key required.
 */

interface BBox {
    north: number;
    south: number;
    east: number;
    west: number;
}

interface WaybackRelease {
    releaseId: string;
    title: string;
    date: string; // YYYY-MM-DD
}

interface WaybackImageResult {
    imageKey: string;
    releaseDate: string;
}

// ---------------------------------------------------------------------------
// Wayback config cache
// ---------------------------------------------------------------------------

let _releasesCache: WaybackRelease[] | null = null;
let _releasesCacheExpiry = 0;

const CONFIG_URL = "https://s3-us-west-2.amazonaws.com/config.maptiles.arcgis.com/waybackconfig.json";
const TILE_BASE = "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile";

/**
 * Load and cache the list of available Wayback releases.
 */
async function getReleases(): Promise<WaybackRelease[]> {
    const now = Date.now();
    if (_releasesCache && now < _releasesCacheExpiry) {
        return _releasesCache;
    }

    const res = await fetch(CONFIG_URL);
    if (!res.ok) {
        throw new Error(`Failed to fetch Wayback config: ${res.status}`);
    }

    const config = (await res.json()) as Record<string, {
        itemTitle: string;
        itemURL: string;
    }>;

    _releasesCache = Object.values(config)
        .map((item) => {
            const releaseId = item.itemURL.match(/tile\/(\d+)\//)?.[1];
            const dateMatch = item.itemTitle.match(/(\d{4}-\d{2}-\d{2})/);
            if (!releaseId || !dateMatch) return null;
            return {
                releaseId,
                title: item.itemTitle,
                date: dateMatch[1],
            };
        })
        .filter((x): x is WaybackRelease => x !== null)
        .sort((a, b) => a.date.localeCompare(b.date));

    // Cache for 24 hours
    _releasesCacheExpiry = now + 24 * 60 * 60 * 1000;
    return _releasesCache;
}

/**
 * Find the closest Wayback release to a target date.
 */
function findClosestRelease(releases: WaybackRelease[], targetDate: string): WaybackRelease {
    const target = new Date(targetDate).getTime();
    let best = releases[0];
    let bestDiff = Infinity;

    for (const release of releases) {
        const diff = Math.abs(new Date(release.date).getTime() - target);
        if (diff < bestDiff) {
            bestDiff = diff;
            best = release;
        }
    }

    return best;
}

// ---------------------------------------------------------------------------
// Tile math
// ---------------------------------------------------------------------------

/**
 * Convert lat/lng to the tile that places the point closest to center.
 * Uses Math.round instead of Math.floor so the point gravitates toward
 * the middle of the returned tile rather than always the top-left.
 */
function latLngToTileCentered(lat: number, lng: number, zoom: number): { x: number; y: number } {
    const n = Math.pow(2, zoom);
    const rawX = (lng + 180) / 360 * n;
    const rawY = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n;

    // Check if rounding gives a better centering than flooring
    const floorX = Math.floor(rawX);
    const floorY = Math.floor(rawY);

    // Pick the tile where the fractional position is closest to 0.5 (center)
    const fracX = rawX - floorX;
    const fracY = rawY - floorY;

    // If point is in the left 25% of the tile, use the tile to the left
    // If in the right 25%, use the tile to the right. Otherwise keep current.
    const x = fracX < 0.25 && floorX > 0 ? floorX - 1 : fracX > 0.75 ? floorX + 1 : floorX;
    const y = fracY < 0.25 && floorY > 0 ? floorY - 1 : fracY > 0.75 ? floorY + 1 : floorY;

    return { x, y };
}

/**
 * Fetch a tile, trying z=20 first then falling back to z=19 and z=18.
 * Not all Wayback releases have tiles at high zoom levels.
 */
async function fetchTileImage(
    releaseId: string,
    lat: number,
    lng: number,
): Promise<ArrayBuffer | null> {
    for (const zoom of [20, 19, 18]) {
        const { x, y } = latLngToTileCentered(lat, lng, zoom);
        const url = `${TILE_BASE}/${releaseId}/${zoom}/${y}/${x}`;

        const res = await fetch(url);
        if (res.ok) {
            const buffer = await res.arrayBuffer();
            if (buffer.byteLength >= 500) {
                console.log(`[wayback] Tile fetched at z=${zoom}`);
                return buffer;
            }
        }
        console.log(`[wayback] z=${zoom} not available for release ${releaseId}, trying lower...`);
    }
    return null;
}


// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a high-resolution historical aerial image for a location
 * at the closest available date to the target.
 *
 * @param lat        - Latitude of the center point.
 * @param lng        - Longitude of the center point.
 * @param targetDate - Target date (ISO string, e.g. "2024-06-15").
 * @param bucket     - R2 bucket to store the image.
 * @param keyPrefix  - R2 key prefix.
 * @returns Image key and the actual release date used.
 */
export async function fetchWaybackImage(
    lat: number,
    lng: number,
    targetDate: string,
    bucket: R2Bucket,
    keyPrefix: string,
): Promise<WaybackImageResult | null> {
    const releases = await getReleases();
    const release = findClosestRelease(releases, targetDate);

    console.log(`[wayback] Target: ${targetDate} → Using release: ${release.date} (${release.title})`);

    const imageBuffer = await fetchTileImage(release.releaseId, lat, lng);
    if (!imageBuffer) {
        console.warn(`[wayback] No tile data for (${lat}, ${lng}) at release ${release.date}`);
        return null;
    }

    const suffix = Math.random().toString(36).slice(2, 8);
    const imageKey = `${keyPrefix}-${release.date}-${suffix}.jpg`;

    await bucket.put(imageKey, imageBuffer, {
        httpMetadata: { contentType: "image/jpeg" },
        customMetadata: {
            source: "esri-wayback",
            releaseId: release.releaseId,
            releaseDate: release.date,
            latitude: String(lat),
            longitude: String(lng),
        },
    });

    return { imageKey, releaseDate: release.date };
}

/**
 * Get the list of available release dates (for UI display).
 */
export async function getAvailableReleaseDates(): Promise<string[]> {
    const releases = await getReleases();
    return releases.map((r) => r.date);
}
