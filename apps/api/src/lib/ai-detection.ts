/**
 * AI change-detection via Cloudflare Workers AI (free, built-in).
 *
 * Fetches a before/after pair of satellite images from R2, encodes them as
 * base64 and submits them to the Workers AI vision model. The model is
 * expected to return a JSON array of DetectionResult objects.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DetectionResult {
    latitude: number;
    longitude: number;
    type: "construction" | "extension" | "annexe" | "piscine";
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    detectedArea: number;
    confidence: number;
    address?: string;
}

interface BBox {
    north: number;
    south: number;
    east: number;
    west: number;
}

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an expert remote-sensing analyst specialising in urban planning compliance.
You will be given two satellite images of the same geographic area:
  - Image 1 (BEFORE): the reference/baseline image.
  - Image 2 (AFTER):  the most recent image.

Your task is to identify all NEW structures or changes that appeared between the two images
and that may require urban planning permits. Focus on:
  - new buildings or constructions
  - extensions to existing structures
  - annexes (garages, sheds, outbuildings)
  - swimming pools

For EACH detected change return a JSON object with EXACTLY these fields:
  latitude     (number)  – approximate WGS-84 latitude of the centroid
  longitude    (number)  – approximate WGS-84 longitude of the centroid
  type         (string)  – one of: construction | extension | annexe | piscine
  riskLevel    (string)  – one of: low | medium | high
  riskScore    (number)  – integer 0–100 reflecting permit-non-compliance risk
  detectedArea (number)  – estimated surface area in m²
  confidence   (number)  – your confidence in this detection, 0.0–1.0
  address      (string, optional) – best-guess street address if determinable

Return ONLY a valid JSON array (no markdown fences, no extra text).
If no relevant changes are detected, return an empty array: []`;

// ---------------------------------------------------------------------------
// detectChanges — using Cloudflare Workers AI (free)
// ---------------------------------------------------------------------------

/**
 * Compare a before and after satellite image pair using Cloudflare Workers AI
 * and return all detected urban changes.
 *
 * @param ai              - Cloudflare Workers AI binding (env.AI)
 * @param beforeImageKey  - R2 object key for the baseline image.
 * @param afterImageKey   - R2 object key for the most recent image.
 * @param bucket          - R2 bucket from which to fetch the images.
 * @param bbox            - Geographic bounding box of the images.
 */
export async function detectChanges(
    ai: Ai,
    beforeImageKey: string,
    afterImageKey: string,
    bucket: R2Bucket,
    bbox: BBox,
): Promise<DetectionResult[]> {
    // ------------------------------------------------------------------
    // 1. Fetch both images from R2
    // ------------------------------------------------------------------
    const [beforeObject, afterObject] = await Promise.all([
        bucket.get(beforeImageKey),
        bucket.get(afterImageKey),
    ]);

    if (!beforeObject) {
        throw new Error(
            `AI detection: before image not found in R2 (key: ${beforeImageKey})`,
        );
    }
    if (!afterObject) {
        throw new Error(
            `AI detection: after image not found in R2 (key: ${afterImageKey})`,
        );
    }

    // ------------------------------------------------------------------
    // 2. Convert to base64 data URLs for the prompt
    // ------------------------------------------------------------------
    const beforeBytes = new Uint8Array(await beforeObject.arrayBuffer());
    const afterBytes = new Uint8Array(await afterObject.arrayBuffer());

    const beforeBase64 = arrayBufferToBase64(beforeBytes);
    const afterBase64 = arrayBufferToBase64(afterBytes);

    // ------------------------------------------------------------------
    // 3. Build the prompt with bbox context
    // ------------------------------------------------------------------
    const bboxDescription =
        `N: ${bbox.north.toFixed(5)}, S: ${bbox.south.toFixed(5)}, ` +
        `E: ${bbox.east.toFixed(5)}, W: ${bbox.west.toFixed(5)}`;

    const userPrompt =
        `Geographic bounding box: ${bboxDescription}\n\n` +
        `I am providing two satellite images as base64-encoded PNGs.\n` +
        `Image 1 (BEFORE): data:image/png;base64,${beforeBase64.slice(0, 100)}...[truncated for context]\n` +
        `Image 2 (AFTER): data:image/png;base64,${afterBase64.slice(0, 100)}...[truncated for context]\n\n` +
        `Identify all new constructions, extensions, annexes or pools that appeared ` +
        `between the two images. Return only a JSON array as instructed.`;

    // ------------------------------------------------------------------
    // 4. Call Cloudflare Workers AI (free, no API key needed)
    // ------------------------------------------------------------------
    const response = await ai.run(
        "@cf/meta/llama-3.2-11b-vision-instruct" as Parameters<typeof ai.run>[0],
        {
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: userPrompt,
                },
            ],
            image: [beforeBytes, afterBytes],
            max_tokens: 2048,
            temperature: 0,
        },
    );

    const content = typeof response === "string"
        ? response
        : (response as { response?: string }).response ?? "";

    if (!content) {
        console.warn("[AI detection] Workers AI returned an empty response.");
        return [];
    }

    // ------------------------------------------------------------------
    // 5. Parse and validate the JSON response
    // ------------------------------------------------------------------
    let parsed: unknown;
    try {
        // Try to extract JSON from the response (model may include markdown fences)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        } else {
            parsed = JSON.parse(content);
        }
    } catch {
        console.warn(`[AI detection] Response is not valid JSON: ${content.slice(0, 200)}`);
        return [];
    }

    const rawArray = normaliseToArray(parsed);

    if (rawArray === null) {
        console.warn(`[AI detection] Could not parse as detections array: ${content.slice(0, 200)}`);
        return [];
    }

    const results: DetectionResult[] = [];
    for (const item of rawArray) {
        const detection = parseDetection(item);
        if (detection !== null) {
            results.push(detection);
        } else {
            console.warn("[AI detection] Skipping malformed detection item:", item);
        }
    }

    return results;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function arrayBufferToBase64(bytes: Uint8Array): string {
    let binary = "";
    const CHUNK = 8_192;
    for (let i = 0; i < bytes.length; i += CHUNK) {
        binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    return btoa(binary);
}

function normaliseToArray(value: unknown): unknown[] | null {
    if (Array.isArray(value)) {
        return value;
    }
    if (value !== null && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        for (const key of ["detections", "results", "changes", "items"]) {
            if (Array.isArray(obj[key])) {
                return obj[key] as unknown[];
            }
        }
    }
    return null;
}

const VALID_TYPES = new Set(["construction", "extension", "annexe", "piscine"]);
const VALID_RISK_LEVELS = new Set(["low", "medium", "high"]);

function parseDetection(raw: unknown): DetectionResult | null {
    if (raw === null || typeof raw !== "object") return null;
    const obj = raw as Record<string, unknown>;

    const latitude = Number(obj.latitude);
    const longitude = Number(obj.longitude);
    const type = String(obj.type ?? "");
    const riskLevel = String(obj.riskLevel ?? obj.risk_level ?? "");
    const riskScore = Number(obj.riskScore ?? obj.risk_score ?? 0);
    const detectedArea = Number(obj.detectedArea ?? obj.detected_area ?? 0);
    const confidence = Number(obj.confidence ?? 0);
    const address =
        typeof obj.address === "string" && obj.address.length > 0
            ? obj.address
            : undefined;

    if (isNaN(latitude) || isNaN(longitude)) return null;
    if (!VALID_TYPES.has(type)) return null;
    if (!VALID_RISK_LEVELS.has(riskLevel)) return null;
    if (isNaN(riskScore) || isNaN(detectedArea) || isNaN(confidence)) return null;

    return {
        latitude,
        longitude,
        type: type as DetectionResult["type"],
        riskLevel: riskLevel as DetectionResult["riskLevel"],
        riskScore: Math.min(100, Math.max(0, Math.round(riskScore))),
        detectedArea,
        confidence: Math.min(1, Math.max(0, confidence)),
        ...(address !== undefined ? { address } : {}),
    };
}
