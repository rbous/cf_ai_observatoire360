import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, sql } from "drizzle-orm";
import {
    createInspectionSchema,
    updateInspectionSchema,
} from "@observatoire360/shared";
import type { Inspection } from "@observatoire360/shared";
import { inspections, alerts, users } from "../db/schema.js";
import { ulid } from "../lib/ulid.js";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";

type AppEnv = { Bindings: Bindings; Variables: AuthVariables };

const inspectionsRouter = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Row → domain type mapper
// ---------------------------------------------------------------------------

function rowToInspection(row: typeof inspections.$inferSelect): Inspection {
    return {
        id: row.id,
        alertId: row.alertId,
        inspectorId: row.inspectorId,
        scheduledDate: row.scheduledDate,
        status: row.status as Inspection["status"],
        notes: row.notes ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

function now(): number {
    return Math.floor(Date.now() / 1000);
}

// ---------------------------------------------------------------------------
// GET /inspections
// ---------------------------------------------------------------------------

inspectionsRouter.get("/", async (c) => {
    const municipalityId = c.get("municipalityId");
    const db = drizzle(c.env.DB);

    // Join through alerts to scope to the user's municipality
    const rows = await db
        .select({ inspection: inspections })
        .from(inspections)
        .innerJoin(alerts, eq(inspections.alertId, alerts.id))
        .where(eq(alerts.municipalityId, municipalityId))
        .orderBy(sql`${inspections.scheduledDate} DESC`);

    return c.json({
        data: rows.map((r) => rowToInspection(r.inspection)),
        total: rows.length,
    });
});

// ---------------------------------------------------------------------------
// POST /inspections
// ---------------------------------------------------------------------------

inspectionsRouter.post("/", async (c) => {
    if (c.get("role") === "readonly") {
        return c.json(
            { error: "FORBIDDEN", message: "Accès refusé. Permissions insuffisantes.", statusCode: 403 },
            403,
        );
    }

    const body = await c.req.json().catch(() => null);
    const parsed = createInspectionSchema.safeParse(body);

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

    const { alertId, inspectorId, scheduledDate, notes } = parsed.data;
    const municipalityId = c.get("municipalityId");
    const db = drizzle(c.env.DB);

    // Verify alert belongs to the user's municipality
    const [alert] = await db
        .select({ id: alerts.id })
        .from(alerts)
        .where(and(eq(alerts.id, alertId), eq(alerts.municipalityId, municipalityId)))
        .limit(1);

    if (!alert) {
        return c.json(
            { error: "NOT_FOUND", message: "Alerte introuvable.", statusCode: 404 },
            404,
        );
    }

    // Verify inspector exists and belongs to the same municipality
    const [inspector] = await db
        .select({ id: users.id })
        .from(users)
        .where(
            and(
                eq(users.id, inspectorId),
                eq(users.municipalityId, municipalityId),
                eq(users.isActive, true),
            ),
        )
        .limit(1);

    if (!inspector) {
        return c.json(
            { error: "NOT_FOUND", message: "Inspecteur introuvable.", statusCode: 404 },
            404,
        );
    }

    const ts = now();
    const newInspection = {
        id: ulid(),
        alertId,
        inspectorId,
        scheduledDate,
        status: "planned" as const,
        notes: notes ?? null,
        createdAt: ts,
        updatedAt: ts,
    };

    await db.insert(inspections).values(newInspection);

    return c.json(rowToInspection(newInspection), 201);
});

// ---------------------------------------------------------------------------
// PUT /inspections/:id
// ---------------------------------------------------------------------------

inspectionsRouter.put("/:id", async (c) => {
    if (c.get("role") === "readonly") {
        return c.json(
            { error: "FORBIDDEN", message: "Accès refusé. Permissions insuffisantes.", statusCode: 403 },
            403,
        );
    }

    const { id } = c.req.param();
    const municipalityId = c.get("municipalityId");

    const body = await c.req.json().catch(() => null);
    const parsed = updateInspectionSchema.safeParse(body);

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

    // Verify inspection belongs to user's municipality (via alert)
    const [row] = await db
        .select({ inspection: inspections })
        .from(inspections)
        .innerJoin(alerts, eq(inspections.alertId, alerts.id))
        .where(and(eq(inspections.id, id), eq(alerts.municipalityId, municipalityId)))
        .limit(1);

    if (!row) {
        return c.json(
            { error: "NOT_FOUND", message: "Inspection introuvable.", statusCode: 404 },
            404,
        );
    }

    const { scheduledDate, status, notes } = parsed.data;
    const updates: Partial<typeof inspections.$inferInsert> = {
        updatedAt: now(),
    };

    if (scheduledDate !== undefined) updates.scheduledDate = scheduledDate;
    if (status !== undefined)        updates.status        = status;
    if (notes !== undefined)         updates.notes         = notes;

    await db.update(inspections).set(updates).where(eq(inspections.id, id));

    const [updated] = await db
        .select()
        .from(inspections)
        .where(eq(inspections.id, id))
        .limit(1);

    return c.json(rowToInspection(updated));
});

// ---------------------------------------------------------------------------
// DELETE /inspections/:id  — soft cancel
// ---------------------------------------------------------------------------

inspectionsRouter.delete("/:id", async (c) => {
    if (c.get("role") === "readonly") {
        return c.json(
            { error: "FORBIDDEN", message: "Accès refusé. Permissions insuffisantes.", statusCode: 403 },
            403,
        );
    }

    const { id } = c.req.param();
    const municipalityId = c.get("municipalityId");
    const db = drizzle(c.env.DB);

    // Verify scoping
    const [row] = await db
        .select({ inspection: inspections })
        .from(inspections)
        .innerJoin(alerts, eq(inspections.alertId, alerts.id))
        .where(and(eq(inspections.id, id), eq(alerts.municipalityId, municipalityId)))
        .limit(1);

    if (!row) {
        return c.json(
            { error: "NOT_FOUND", message: "Inspection introuvable.", statusCode: 404 },
            404,
        );
    }

    if (row.inspection.status === "cancelled") {
        return c.json(
            { error: "BAD_REQUEST", message: "Inspection déjà annulée.", statusCode: 400 },
            400,
        );
    }

    await db
        .update(inspections)
        .set({ status: "cancelled", updatedAt: now() })
        .where(eq(inspections.id, id));

    return c.json({ success: true });
});

export default inspectionsRouter;
