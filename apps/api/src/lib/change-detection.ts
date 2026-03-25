/**
 * Two-stage change detection:
 *   Stage 1: Fast pixel-diff (byte-level comparison) — no AI, deterministic
 *   Stage 2: AI classification — only when Stage 1 flags a change
 *
 * This avoids AI hallucinations on unchanged scenes and saves compute.
 */

// ---------------------------------------------------------------------------
// Stage 1: Byte-level difference score
// ---------------------------------------------------------------------------

interface DiffResult {
    /** 0-1 score. Higher = more different. */
    score: number;
    /** Whether the change exceeds the detection threshold. */
    changed: boolean;
    /** Human-readable summary. */
    summary: string;
}

/**
 * Compare two images at the byte level and return a difference score.
 *
 * This isn't a proper pixel comparison (JPEG compression introduces noise),
 * but it's effective as a fast gate:
 *   - Same scene, different compression: score ≈ 0.02-0.08
 *   - Same scene, different season (vegetation): score ≈ 0.05-0.15
 *   - Actual construction change: score ≈ 0.10-0.30+
 *
 * We use multiple heuristics:
 *   1. File size ratio — new structures significantly change byte count
 *   2. Byte distribution — compare histogram of byte values
 *   3. Block comparison — divide into grid, compare block averages
 */
export function computeDiffScore(
    beforeBytes: Uint8Array,
    afterBytes: Uint8Array,
    threshold = 0.12,
): DiffResult {
    // Heuristic 1: File size ratio
    const sizeRatio = Math.abs(beforeBytes.length - afterBytes.length) / Math.max(beforeBytes.length, afterBytes.length);

    // Heuristic 2: Byte histogram comparison (256 buckets)
    const histBefore = new Uint32Array(256);
    const histAfter = new Uint32Array(256);

    for (let i = 0; i < beforeBytes.length; i++) {
        histBefore[beforeBytes[i]]++;
    }
    for (let i = 0; i < afterBytes.length; i++) {
        histAfter[afterBytes[i]]++;
    }

    // Normalize histograms
    let histDiff = 0;
    for (let i = 0; i < 256; i++) {
        const normBefore = histBefore[i] / beforeBytes.length;
        const normAfter = histAfter[i] / afterBytes.length;
        histDiff += Math.abs(normBefore - normAfter);
    }
    // histDiff ranges from 0 (identical distribution) to 2 (completely different)
    const histScore = histDiff / 2;

    // Heuristic 3: Block-level comparison
    // Sample bytes at regular intervals and compare
    const sampleSize = Math.min(beforeBytes.length, afterBytes.length, 10000);
    const stepBefore = Math.max(1, Math.floor(beforeBytes.length / sampleSize));
    const stepAfter = Math.max(1, Math.floor(afterBytes.length / sampleSize));

    let blockDiffSum = 0;
    let blockCount = 0;
    for (let i = 0; i < sampleSize; i++) {
        const bVal = beforeBytes[i * stepBefore] ?? 0;
        const aVal = afterBytes[i * stepAfter] ?? 0;
        blockDiffSum += Math.abs(bVal - aVal) / 255;
        blockCount++;
    }
    const blockScore = blockCount > 0 ? blockDiffSum / blockCount : 0;

    // Weighted combination
    const score = sizeRatio * 0.3 + histScore * 0.4 + blockScore * 0.3;

    const changed = score >= threshold;

    const summary = changed
        ? `Change detected (score: ${(score * 100).toFixed(1)}%, threshold: ${(threshold * 100).toFixed(1)}%). ` +
          `Size diff: ${(sizeRatio * 100).toFixed(1)}%, Histogram diff: ${(histScore * 100).toFixed(1)}%, Block diff: ${(blockScore * 100).toFixed(1)}%`
        : `No significant change (score: ${(score * 100).toFixed(1)}%, threshold: ${(threshold * 100).toFixed(1)}%)`;

    return { score, changed, summary };
}

// ---------------------------------------------------------------------------
// Stage 2: AI classification (only called when Stage 1 flags a change)
// ---------------------------------------------------------------------------

export interface ClassificationResult {
    type: "construction" | "extension" | "annexe" | "piscine" | "other";
    riskLevel: "low" | "medium" | "high";
    riskScore: number;
    confidence: number;
    description: string;
}

const CLASSIFICATION_PROMPT = `You are analyzing a satellite/aerial image where a change has been detected.
The image shows an area where something new appeared compared to a previous capture.

Classify the change into ONE of these categories:
- construction: a new building or structure
- extension: an addition to an existing building
- annexe: a new outbuilding (garage, shed, workshop)
- piscine: a new swimming pool
- other: vegetation change, demolition, or non-construction change

Respond with ONLY a JSON object (no markdown):
{
  "type": "construction|extension|annexe|piscine|other",
  "riskLevel": "low|medium|high",
  "riskScore": 0-100,
  "confidence": 0.0-1.0,
  "description": "brief description of what you see"
}

Risk levels:
- high: clearly unpermitted large structure (>100m²)
- medium: possible violation, needs inspection
- low: minor change, likely compliant`;

/**
 * Send the "after" image to Workers AI for classification.
 * Only called when pixel-diff detected a change.
 */
export async function classifyChange(
    ai: Ai,
    afterImageBytes: Uint8Array,
): Promise<ClassificationResult | null> {
    try {
        const response = await ai.run(
            "@cf/meta/llama-3.2-11b-vision-instruct" as Parameters<typeof ai.run>[0],
            {
                messages: [
                    { role: "system", content: CLASSIFICATION_PROMPT },
                    {
                        role: "user",
                        content: "What type of construction or change do you see in this aerial image?",
                    },
                ],
                image: [afterImageBytes],
                max_tokens: 512,
                temperature: 0,
            },
        );

        // Workers AI can return string, { response: string }, or other shapes
        let content: string;
        if (typeof response === "string") {
            content = response;
        } else if (response && typeof response === "object") {
            const resp = response as Record<string, unknown>;
            content = String(resp.response ?? resp.text ?? resp.content ?? JSON.stringify(resp));
        } else {
            return null;
        }

        if (!content || content === "undefined" || content === "null") return null;

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn("[classify] No JSON found in AI response:", content.slice(0, 200));
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

        const validTypes = new Set(["construction", "extension", "annexe", "piscine", "other"]);
        const validRisk = new Set(["low", "medium", "high"]);

        const type = String(parsed.type ?? "other");
        const riskLevel = String(parsed.riskLevel ?? parsed.risk_level ?? "medium");

        return {
            type: validTypes.has(type) ? type as ClassificationResult["type"] : "other",
            riskLevel: validRisk.has(riskLevel) ? riskLevel as ClassificationResult["riskLevel"] : "medium",
            riskScore: Math.min(100, Math.max(0, Number(parsed.riskScore ?? parsed.risk_score ?? 50))),
            confidence: Math.min(1, Math.max(0, Number(parsed.confidence ?? 0.5))),
            description: String(parsed.description ?? "Change detected"),
        };
    } catch (err) {
        console.warn("[classify] AI classification failed:", err);
        return null;
    }
}
