import { Hono } from "hono";
import type { ApiError } from "@observatoire360/shared";

// Middleware
import { corsMiddleware } from "./middleware/cors.js";
import { securityHeaders } from "./middleware/security.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { requireAuth } from "./middleware/auth.js";
import type { AuthVariables } from "./middleware/auth.js";

// Routes
import authRouter      from "./routes/auth.js";
import alertsRouter    from "./routes/alerts.js";
import inspectionsRouter from "./routes/inspections.js";
import reportsRouter   from "./routes/reports.js";
import usersRouter     from "./routes/users.js";
import contactRouter   from "./routes/contact.js";
import healthRouter    from "./routes/health.js";
import meRouter        from "./routes/me.js";
import notificationsRouter from "./routes/notifications.js";
import scansRouter     from "./routes/scans.js";
import imagesRouter    from "./routes/images.js";

// Bindings — defined in types.ts to avoid circular imports
import type { Bindings } from "./types.js";
export type { Bindings } from "./types.js";

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

// ---------------------------------------------------------------------------
// Global middleware — applied to every request
// ---------------------------------------------------------------------------

// 1. Security headers (before anything else so they're always present)
app.use("*", securityHeaders);

// 2. CORS (must run before route handlers so preflight OPTIONS is handled)
app.use("*", corsMiddleware());

// ---------------------------------------------------------------------------
// Mount public routes (no auth required)
// ---------------------------------------------------------------------------

// Health check
app.route("/api/health", healthRouter);

// Public contact form — rate-limited (10 req / 10 minutes per IP)
app.use("/api/contact/*", rateLimit(10, 10 * 60 * 1000));
app.route("/api/contact", contactRouter);

// Auth routes — rate-limited (20 req / 15 minutes per IP)
app.use("/api/auth/*", rateLimit(20, 15 * 60 * 1000));
app.route("/api/auth", authRouter);

// ---------------------------------------------------------------------------
// Protected routes — JWT required for all /api/* routes below
// ---------------------------------------------------------------------------

app.use("/api/me",             requireAuth());
app.use("/api/me/*",           requireAuth());
app.use("/api/alerts/*",       requireAuth());
app.use("/api/inspections/*",  requireAuth());
app.use("/api/reports/*",      requireAuth());
app.use("/api/users/*",        requireAuth());
app.use("/api/notifications/*", requireAuth());
app.use("/api/scans/*",        requireAuth());
// Images are public — R2 keys are unguessable ULIDs, no auth needed for <img src>

app.route("/api/me",            meRouter);
app.route("/api/alerts",        alertsRouter);
app.route("/api/inspections",   inspectionsRouter);
app.route("/api/reports",       reportsRouter);
app.route("/api/users",         usersRouter);
app.route("/api/notifications", notificationsRouter);
app.route("/api/scans",         scansRouter);
app.route("/api/images",        imagesRouter);

// ---------------------------------------------------------------------------
// 404 handler — must come after all route registrations
// ---------------------------------------------------------------------------

app.notFound((c) => {
    return c.json<ApiError>(
        {
            error: "NOT_FOUND",
            message: `Route ${c.req.method} ${c.req.path} introuvable.`,
            statusCode: 404,
        },
        404,
    );
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------

app.onError((err, c) => {
    console.error("[ERROR]", err);

    // Handle Hono's built-in HTTPException
    if ("status" in err && typeof (err as { status: unknown }).status === "number") {
        const httpErr = err as { status: number; message: string };
        return c.json<ApiError>(
            {
                error: "HTTP_ERROR",
                message: httpErr.message,
                statusCode: httpErr.status,
            },
            httpErr.status as Parameters<typeof c.json>[1],
        );
    }

    return c.json<ApiError>(
        {
            error: "INTERNAL_SERVER_ERROR",
            message: "Une erreur interne est survenue.",
            statusCode: 500,
        },
        500,
    );
});

import { handleScheduled } from "./scheduled.js";
import { handleQueue } from "./queue.js";

export default {
    fetch: app.fetch,
    async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
        ctx.waitUntil(handleScheduled(env));
    },
    async queue(batch: MessageBatch, env: Bindings, ctx: ExecutionContext) {
        ctx.waitUntil(handleQueue(batch, env));
    },
};
