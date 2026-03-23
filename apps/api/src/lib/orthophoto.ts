/**
 * High-resolution aerial imagery fetcher via Esri World Imagery.
 *
 * Fetches sub-meter resolution aerial/satellite imagery from Esri's
 * ArcGIS World Imagery service (free). Much sharper than Sentinel-2 (10m)
 * but not real-time (updated periodically by Esri from commercial sources).
 */

interface BBox {
    north: number;
    south: number;
    east: number;
    west: number;
}

interface OrthoResult {
    imageKey: string;
}

const ESRI_BASE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export";

/**
 * Fetch a high-resolution aerial image for the given bounding box.
 *
 * @param bbox       - Geographic extent.
 * @param bucket     - R2 bucket to store the image.
 * @param keyPrefix  - R2 key prefix (e.g. "ortho/GAT/jobid").
 * @param size       - Image size in pixels (default 1024).
 */
export async function fetchOrthophoto(
    bbox: BBox,
    bucket: R2Bucket,
    keyPrefix: string,
    size = 1024,
): Promise<OrthoResult | null> {
    const params = new URLSearchParams({
        bbox: `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`,
        bboxSR: "4326",
        imageSR: "4326",
        size: `${size},${size}`,
        format: "jpg",
        f: "image",
    });

    const url = `${ESRI_BASE}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
        console.warn(`[orthophoto] Esri request failed (${response.status})`);
        return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("image")) {
        const text = await response.text();
        console.warn(`[orthophoto] Esri returned non-image response: ${text.slice(0, 200)}`);
        return null;
    }

    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength < 1000) {
        return null;
    }

    const imageKey = `${keyPrefix}-ortho.jpg`;

    await bucket.put(imageKey, imageBuffer, {
        httpMetadata: { contentType: "image/jpeg" },
        customMetadata: {
            source: "esri-world-imagery",
            bboxWest: String(bbox.west),
            bboxSouth: String(bbox.south),
            bboxEast: String(bbox.east),
            bboxNorth: String(bbox.north),
        },
    });

    return { imageKey };
}
