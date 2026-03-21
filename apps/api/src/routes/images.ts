import { Hono } from "hono";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";

type AppEnv = { Bindings: Bindings; Variables: AuthVariables };

const images = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// GET /:key — Serve image from R2
// ---------------------------------------------------------------------------

images.get("/:key{.+}", async (c) => {
    const key = c.req.param("key");

    const object = await c.env.IMAGES_BUCKET.get(key);

    if (!object) {
        return c.json(
            {
                error: "NOT_FOUND",
                message: "Image introuvable.",
                statusCode: 404,
            },
            404,
        );
    }

    const contentType =
        object.httpMetadata?.contentType ?? inferContentType(key);

    return new Response(object.body, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "private, max-age=3600",
        },
    });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inferContentType(key: string): string {
    const ext = key.split(".").pop()?.toLowerCase();
    switch (ext) {
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "png":
            return "image/png";
        case "webp":
            return "image/webp";
        case "gif":
            return "image/gif";
        case "tiff":
        case "tif":
            return "image/tiff";
        default:
            return "application/octet-stream";
    }
}

export default images;
