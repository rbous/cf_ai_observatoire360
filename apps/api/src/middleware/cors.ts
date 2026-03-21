import { cors } from "hono/cors";
import type { Context, Next } from "hono";
import type { Bindings } from "../types.js";

/**
 * CORS middleware factory.
 *
 * Allows:
 *   - The Pages domain provided via ALLOWED_ORIGIN env var (production)
 *   - http://localhost:5173 (Vite dev server)
 *
 * Credentials are allowed so that the httpOnly refresh-token cookie is
 * forwarded on cross-origin requests.
 */
export function corsMiddleware() {
    return async (c: Context<{ Bindings: Bindings }>, next: Next) => {
        const allowedOrigins = [
            c.env.ALLOWED_ORIGIN,
            "http://localhost:5173",
        ].filter(Boolean);

        const origin = c.req.header("Origin") ?? "";
        const resolvedOrigin = allowedOrigins.includes(origin)
            ? origin
            : allowedOrigins[0] ?? "*";

        return cors({
            origin: resolvedOrigin,
            allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowHeaders: ["Content-Type", "Authorization"],
            exposeHeaders: ["Content-Length"],
            maxAge: 86400,
            credentials: true,
        })(c, next);
    };
}
