import type { Context, Next } from "hono";

/**
 * Security headers middleware.
 *
 * Sets the following response headers on every request:
 *   - Strict-Transport-Security (HSTS)
 *   - Content-Security-Policy (CSP)
 *   - X-Content-Type-Options
 *   - X-Frame-Options
 *   - Referrer-Policy
 *   - Permissions-Policy
 */
export async function securityHeaders(c: Context, next: Next): Promise<Response | void> {
    await next();

    // Enforce HTTPS for 1 year, including sub-domains
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    // Restrict resource loading to same origin; this is an API so no scripts/styles needed
    c.header(
        "Content-Security-Policy",
        [
            "default-src 'none'",
            "frame-ancestors 'none'",
        ].join("; "),
    );

    // Prevent MIME-type sniffing
    c.header("X-Content-Type-Options", "nosniff");

    // Prevent clickjacking
    c.header("X-Frame-Options", "DENY");

    // No referrer information leaked outside the origin
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");

    // Disable browser features that an API server never needs
    c.header(
        "Permissions-Policy",
        [
            "camera=()",
            "microphone=()",
            "geolocation=()",
            "payment=()",
            "usb=()",
            "interest-cohort=()",
        ].join(", "),
    );

    // Remove the X-Powered-By header if present
    c.header("X-Powered-By", "");
}
