/**
 * Cloudflare Workers environment bindings.
 * Defined here (not in index.ts) to avoid circular imports between
 * index.ts ↔ middleware modules.
 */
export interface Bindings {
    /** Cloudflare D1 database binding */
    DB: D1Database;
    /** HS256 JWT signing secret */
    JWT_SECRET: string;
    /** "development" | "production" */
    ENVIRONMENT: string;
    /** Allowed CORS origin (e.g. https://observatoire360.pages.dev) */
    ALLOWED_ORIGIN: string;
}
