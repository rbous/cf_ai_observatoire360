/**
 * Quebec government orthophoto fetcher via WMS.
 *
 * Fetches a high-resolution aerial image from the MERN orthophoto WMS service
 * for a given bounding box. These images are ~20cm resolution — far sharper
 * than Sentinel-2 (10m) — but are updated yearly, not in real-time.
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

const WMS_BASE = "https://ws.mapserver.mern.gouv.qc.ca/cgi-bin/ortho";

/**
 * Fetch a high-resolution orthophoto for the given bounding box.
 * Uses CRS:84 (lon/lat order) for the BBOX parameter.
 *
 * @param bbox             - Geographic extent.
 * @param bucket           - R2 bucket to store the image.
 * @param keyPrefix        - R2 key prefix (e.g. "ortho/GAT-abc123").
 * @param width            - Image width in pixels (default 1024).
 * @param height           - Image height in pixels (default 1024).
 */
export async function fetchOrthophoto(
    bbox: BBox,
    bucket: R2Bucket,
    keyPrefix: string,
    width = 1024,
    height = 1024,
): Promise<OrthoResult | null> {
    const params = new URLSearchParams({
        SERVICE: "WMS",
        VERSION: "1.3.0",
        REQUEST: "GetMap",
        LAYERS: "orthophotos",
        CRS: "CRS:84",
        BBOX: `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`,
        WIDTH: String(width),
        HEIGHT: String(height),
        FORMAT: "image/png",
        TRANSPARENT: "false",
    });

    const url = `${WMS_BASE}?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
        console.warn(`[orthophoto] WMS request failed (${response.status})`);
        return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    // WMS may return XML error instead of image
    if (!contentType.includes("image")) {
        const text = await response.text();
        console.warn(`[orthophoto] WMS returned non-image response: ${text.slice(0, 200)}`);
        return null;
    }

    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength < 1000) {
        // Likely an empty/blank tile
        return null;
    }

    const imageKey = `${keyPrefix}-ortho.png`;

    await bucket.put(imageKey, imageBuffer, {
        httpMetadata: { contentType: "image/png" },
        customMetadata: {
            source: "mern-orthophoto",
            bboxWest: String(bbox.west),
            bboxSouth: String(bbox.south),
            bboxEast: String(bbox.east),
            bboxNorth: String(bbox.north),
        },
    });

    return { imageKey };
}
