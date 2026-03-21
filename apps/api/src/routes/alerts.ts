import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, like, sql } from "drizzle-orm";
import {
    alertsQuerySchema,
    updateAlertSchema,
} from "@observatoire360/shared";
import type { Alert } from "@observatoire360/shared";
import { alerts } from "../db/schema.js";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";

type AppEnv = { Bindings: Bindings; Variables: AuthVariables };

const alertsRouter = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Row → domain type mapper
// ---------------------------------------------------------------------------

function rowToAlert(row: typeof alerts.$inferSelect): Alert {
    return {
        id: row.id,
        municipalityId: row.municipalityId,
        latitude: row.latitude,
        longitude: row.longitude,
        riskLevel: row.riskLevel as Alert["riskLevel"],
        riskScore: row.riskScore,
        status: row.status as Alert["status"],
        type: row.type as Alert["type"],
        detectedArea: row.detectedArea ?? null,
        authorizedArea: row.authorizedArea ?? null,
        zone: row.zone ?? null,
        hasPermit: Boolean(row.hasPermit),
        address: row.address ?? null,
        detectedAt: row.detectedAt,
        images: JSON.parse(row.images ?? "[]") as string[],
        scanJobId: row.scanJobId ?? null,
        beforeImageKey: row.beforeImageKey ?? null,
        afterImageKey: row.afterImageKey ?? null,
        confidence: row.confidence ?? null,
        createdAt: row.createdAt,
    };
}

// ---------------------------------------------------------------------------
// GET /alerts
// ---------------------------------------------------------------------------

alertsRouter.get("/", async (c) => {
    const municipalityId = c.get("municipalityId");
    // c.req.query() returns Record<string, string> in Hono v4
    const queryRaw = c.req.query();
    const parsed = alertsQuerySchema.safeParse(queryRaw);

    if (!parsed.success) {
        return c.json(
            {
                error: "VALIDATION_ERROR",
                message: "Paramètres de requête invalides.",
                details: parsed.error.flatten().fieldErrors,
                statusCode: 422,
            },
            422,
        );
    }

    const { page, pageSize, status, riskLevel, type, search } = parsed.data;
    const db = drizzle(c.env.DB);

    // Build WHERE conditions
    const conditions = [eq(alerts.municipalityId, municipalityId)];

    if (status)    conditions.push(eq(alerts.status, status));
    if (riskLevel) conditions.push(eq(alerts.riskLevel, riskLevel));
    if (type)      conditions.push(eq(alerts.type, type));
    if (search)    conditions.push(like(alerts.address, `%${search}%`));

    const where = and(...conditions);

    // Count total matching rows
    const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(alerts)
        .where(where);

    // Fetch page
    const rows = await db
        .select()
        .from(alerts)
        .where(where)
        .orderBy(sql`${alerts.detectedAt} DESC`)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

    return c.json({
        data: rows.map(rowToAlert),
        total,
        page,
        pageSize,
    });
});

// ---------------------------------------------------------------------------
// GET /alerts/:id
// ---------------------------------------------------------------------------

alertsRouter.get("/:id", async (c) => {
    const municipalityId = c.get("municipalityId");
    const { id } = c.req.param();
    const db = drizzle(c.env.DB);

    const [row] = await db
        .select()
        .from(alerts)
        .where(and(eq(alerts.id, id), eq(alerts.municipalityId, municipalityId)))
        .limit(1);

    if (!row) {
        return c.json(
            { error: "NOT_FOUND", message: "Alerte introuvable.", statusCode: 404 },
            404,
        );
    }

    return c.json(rowToAlert(row));
});

// ---------------------------------------------------------------------------
// PUT /alerts/:id
// ---------------------------------------------------------------------------

alertsRouter.put("/:id", async (c) => {
    const municipalityId = c.get("municipalityId");
    const { id } = c.req.param();

    const body = await c.req.json().catch(() => null);
    const parsed = updateAlertSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            {
                error: "VALIDATION_ERROR",
                message: "Données invalides.",
                details: parsed.error.flatten().fieldErrors,
                statusCode: 422,
            },
            422,
        );
    }

    const db = drizzle(c.env.DB);

    // Verify alert belongs to the user's municipality
    const [existing] = await db
        .select({ id: alerts.id })
        .from(alerts)
        .where(and(eq(alerts.id, id), eq(alerts.municipalityId, municipalityId)))
        .limit(1);

    if (!existing) {
        return c.json(
            { error: "NOT_FOUND", message: "Alerte introuvable.", statusCode: 404 },
            404,
        );
    }

    const { status, riskLevel, riskScore } = parsed.data;
    const updates: Partial<typeof alerts.$inferInsert> = {};

    if (status !== undefined)    updates.status    = status;
    if (riskLevel !== undefined) updates.riskLevel = riskLevel;
    if (riskScore !== undefined) updates.riskScore = riskScore;

    if (Object.keys(updates).length === 0) {
        return c.json({ error: "BAD_REQUEST", message: "Aucune modification fournie.", statusCode: 400 }, 400);
    }

    await db.update(alerts).set(updates).where(eq(alerts.id, id));

    const [updated] = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);

    return c.json(rowToAlert(updated));
});

export default alertsRouter;
