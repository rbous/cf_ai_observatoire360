import { Hono } from "hono";
import type { Bindings } from "../types.js";

const healthRouter = new Hono<{ Bindings: Bindings }>();

// ---------------------------------------------------------------------------
// GET /health — public, no auth required
// ---------------------------------------------------------------------------

healthRouter.get("/", (c) => {
    return c.json({
        status: "ok",
        timestamp: Math.floor(Date.now() / 1000),
        environment: c.env.ENVIRONMENT ?? "unknown",
    });
});

export default healthRouter;
