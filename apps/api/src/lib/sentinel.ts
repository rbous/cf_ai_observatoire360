/**
 * Copernicus Data Space Ecosystem API client (free, no trial).
 *
 * Handles OAuth2 token acquisition (with module-level caching) and fetching
 * the latest Sentinel-2 L2A true-colour imagery for a bounding box via the
 * Process API.  The raw PNG response is uploaded directly to the R2 bucket
 * so callers never need to touch the binary blob themselves.
 *
 * Register at: https://dataspace.copernicus.eu
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SentinelHubConfig {
    clientId: string;
    clientSecret: string;
}

export interface BBox {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface FetchImageryResult {
    imageKey: string;
    imageryDate: string;
}

// ---------------------------------------------------------------------------
// Token cache
// The access token issued by Sentinel Hub is valid for ~1 hour.  We keep it
// in module scope so that multiple calls within the same Worker invocation
// (or warm-instance reuse) avoid redundant token requests.
// ---------------------------------------------------------------------------

interface CachedToken {
    token: string;
    /** Unix epoch ms at which the token expires */
    expiresAt: number;
}

let _tokenCache: CachedToken | null = null;

/**
 * Return a valid OAuth2 access token for the Sentinel Hub API.
 * Re-uses the cached token when it still has more than 60 seconds of life.
 */
export async function getAccessToken(config: SentinelHubConfig): Promise<string> {
    const now = Date.now();

    if (_tokenCache && _tokenCache.expiresAt - now > 60_000) {
        return _tokenCache.token;
    }

    const body = new URLSearchParams({
        grant_type: "client_credentials",
        client_id: config.clientId,
        client_secret: config.clientSecret,
    });

    const response = await fetch(
        "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        },
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Copernicus CDSE token request failed (${response.status}): ${text}`,
        );
    }

    const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
    };

    _tokenCache = {
        token: data.access_token,
        // expires_in is in seconds; convert to ms and back-off by 30 s
        expiresAt: now + (data.expires_in - 30) * 1_000,
    };

    return _tokenCache.token;
}

// ---------------------------------------------------------------------------
// Evalscript — Sentinel-2 L2A true colour (bands B04, B03, B02)
// ---------------------------------------------------------------------------

const TRUE_COLOR_EVALSCRIPT = `
//VERSION=3
function setup() {
    return {
        input: [{ bands: ["B04", "B03", "B02"] }],
        output: { bands: 3 }
    };
}
function evaluatePixel(sample) {
    return [3.5 * sample.B04, 3.5 * sample.B03, 3.5 * sample.B02];
}
`.trim();

// ---------------------------------------------------------------------------
// fetchLatestImagery
// ---------------------------------------------------------------------------

/**
 * Retrieve the most recent cloud-free Sentinel-2 L2A image for the given
 * bounding box, upload it to the R2 bucket and return the storage key and
 * imagery date.  Returns `null` when no suitable image is available within
 * the last 30 days.
 *
 * @param config           - Sentinel Hub OAuth2 credentials.
 * @param bbox             - Geographic extent to image.
 * @param bucket           - R2 bucket to store the PNG.
 * @param municipalityCode - Used to build the R2 object key.
 */
export async function fetchLatestImagery(
    config: SentinelHubConfig,
    bbox: BBox,
    bucket: R2Bucket,
    municipalityCode: string,
): Promise<FetchImageryResult | null> {
    const token = await getAccessToken(config);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1_000);

    const toIso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

    const requestBody = {
        input: {
            bounds: {
                bbox: [bbox.west, bbox.south, bbox.east, bbox.north],
                properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" },
            },
            data: [
                {
                    type: "sentinel-2-l2a",
                    dataFilter: {
                        timeRange: {
                            from: toIso(thirtyDaysAgo),
                            to: toIso(now),
                        },
                        maxCloudCoverage: 30,
                    },
                },
            ],
        },
        output: {
            width: 512,
            height: 512,
            responses: [
                {
                    identifier: "default",
                    format: { type: "image/png" },
                },
            ],
        },
        evalscript: TRUE_COLOR_EVALSCRIPT,
    };

    const response = await fetch(
        "https://sh.dataspace.copernicus.eu/api/v1/process",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "image/png",
            },
            body: JSON.stringify(requestBody),
        },
    );

    // A 204 or specific error codes indicate no available imagery
    if (response.status === 204) {
        return null;
    }

    if (!response.ok) {
        // A 400 with "No data available" is also treated as no imagery
        const text = await response.text();
        if (
            response.status === 400 &&
            text.toLowerCase().includes("no data available")
        ) {
            return null;
        }
        throw new Error(
        `Copernicus CDSE process request failed (${response.status}): ${text}`,
        );
    }

    const imageBuffer = await response.arrayBuffer();
    if (imageBuffer.byteLength === 0) {
        return null;
    }

    // Derive the imagery date from the response header when available,
    // otherwise fall back to today.
    const dateHeader = response.headers.get("x-imagery-date");
    const imageryDate = dateHeader
        ? dateHeader.slice(0, 10)
        : now.toISOString().slice(0, 10);

    const imageKey = `sentinel/${imageryDate}/${municipalityCode}.png`;

    await bucket.put(imageKey, imageBuffer, {
        httpMetadata: { contentType: "image/png" },
        customMetadata: {
            municipalityCode,
            imageryDate,
            bboxWest: String(bbox.west),
            bboxSouth: String(bbox.south),
            bboxEast: String(bbox.east),
            bboxNorth: String(bbox.north),
        },
    });

    return { imageKey, imageryDate };
}
