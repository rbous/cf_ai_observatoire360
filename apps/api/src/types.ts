/**
 * Cloudflare Workers environment bindings.
 * Defined here (not in index.ts) to avoid circular imports between
 * index.ts ↔ middleware modules.
 */
export interface Bindings {
    /** Cloudflare D1 database binding */
    DB: D1Database;
    /** Cloudflare R2 bucket for satellite imagery */
    IMAGES_BUCKET: R2Bucket;
    /** Cloudflare Queue for detection jobs */
    DETECTION_QUEUE: Queue;
    /** HS256 JWT signing secret */
    JWT_SECRET: string;
    /** "development" | "production" */
    ENVIRONMENT: string;
    /** Allowed CORS origin (e.g. https://observatoire360.pages.dev) */
    ALLOWED_ORIGIN: string;
    /** Copernicus Data Space OAuth2 credentials (free) */
    COPERNICUS_CLIENT_ID: string;
    COPERNICUS_CLIENT_SECRET: string;
    /** Resend API key for email */
    RESEND_API_KEY: string;
    /** Email from address (e.g. "Observatoire 360 <alerts@yourdomain.com>") */
    EMAIL_FROM: string;
    /** Cloudflare Workers AI (free, built-in) */
    AI: Ai;
}
