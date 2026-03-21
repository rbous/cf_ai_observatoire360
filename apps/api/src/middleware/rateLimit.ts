import type { Context, MiddlewareHandler, Next } from "hono";

interface WindowEntry {
    count: number;
    windowStart: number;
}

/**
 * In-memory sliding-window rate limiter.
 *
 * Each unique key (IP address derived from CF-Connecting-IP / X-Forwarded-For
 * or the literal string "unknown") gets an independent request counter that
 * resets after `windowMs` milliseconds.
 *
 * NOTE: This store is per-Worker isolate. On Cloudflare Workers the isolate is
 * typically long-lived for a given colo, so this provides meaningful protection
 * for the common case. For distributed / multi-colo rate limiting, use
 * Cloudflare Rate Limiting rules or a Durable Object.
 *
 * @param maxRequests - Maximum number of requests allowed per window
 * @param windowMs    - Window duration in milliseconds
 */
export function rateLimit(
    maxRequests: number,
    windowMs: number,
): MiddlewareHandler {
    const store = new Map<string, WindowEntry>();

    // Periodically clean up expired entries to prevent unbounded memory growth.
    // In Workers, setInterval is available but ticks only when the isolate is active.
    const cleanup = () => {
        const now = Date.now();
        for (const [key, entry] of store) {
            if (now - entry.windowStart >= windowMs) {
                store.delete(key);
            }
        }
    };

    return async (c: Context, next: Next) => {
        // Derive a client identifier — prefer Cloudflare's real IP header
        const ip =
            c.req.header("CF-Connecting-IP") ??
            c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ??
            "unknown";

        const now = Date.now();
        const existing = store.get(ip);

        if (!existing || now - existing.windowStart >= windowMs) {
            // Start a fresh window
            store.set(ip, { count: 1, windowStart: now });

            // Opportunistic cleanup every ~100 new windows
            if (Math.random() < 0.01) cleanup();
        } else {
            existing.count += 1;

            if (existing.count > maxRequests) {
                const retryAfterSec = Math.ceil(
                    (existing.windowStart + windowMs - now) / 1000,
                );
                c.header("Retry-After", String(retryAfterSec));
                c.header("X-RateLimit-Limit", String(maxRequests));
                c.header("X-RateLimit-Remaining", "0");
                return c.json(
                    {
                        error: "TOO_MANY_REQUESTS",
                        message: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
                        statusCode: 429,
                    },
                    429,
                );
            }

            const remaining = Math.max(0, maxRequests - existing.count);
            c.header("X-RateLimit-Limit", String(maxRequests));
            c.header("X-RateLimit-Remaining", String(remaining));
        }

        await next();
    };
}
