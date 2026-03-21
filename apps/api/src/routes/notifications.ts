import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, or, isNull, sql } from "drizzle-orm";
import type { Notification, PaginatedResponse } from "@observatoire360/shared";
import { notifications } from "../db/schema.js";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";

type AppEnv = { Bindings: Bindings; Variables: AuthVariables };

const notificationsRouter = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Row → domain type mapper
// ---------------------------------------------------------------------------

function rowToNotification(row: typeof notifications.$inferSelect): Notification {
    return {
        id: row.id,
        municipalityId: row.municipalityId,
        userId: row.userId ?? null,
        alertId: row.alertId ?? null,
        type: row.type as Notification["type"],
        title: row.title,
        message: row.message,
        isRead: Boolean(row.isRead),
        createdAt: row.createdAt,
    };
}

// ---------------------------------------------------------------------------
// GET / — List notifications for user's municipality
// ---------------------------------------------------------------------------

notificationsRouter.get("/", async (c) => {
    const municipalityId = c.get("municipalityId");
    const userId = c.get("userId");

    const pageRaw = parseInt(c.req.query("page") ?? "1", 10);
    const pageSizeRaw = parseInt(c.req.query("pageSize") ?? "20", 10);
    const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
    const pageSize = Math.min(isNaN(pageSizeRaw) || pageSizeRaw < 1 ? 20 : pageSizeRaw, 100);

    const db = drizzle(c.env.DB);

    const where = and(
        eq(notifications.municipalityId, municipalityId),
        or(isNull(notifications.userId), eq(notifications.userId, userId)),
    );

    const [{ total }] = await db
        .select({ total: sql<number>`count(*)` })
        .from(notifications)
        .where(where);

    const rows = await db
        .select()
        .from(notifications)
        .where(where)
        .orderBy(sql`${notifications.createdAt} DESC`)
        .limit(pageSize)
        .offset((page - 1) * pageSize);

    return c.json<PaginatedResponse<Notification>>({
        data: rows.map(rowToNotification),
        total,
        page,
        pageSize,
    });
});

// ---------------------------------------------------------------------------
// GET /unread-count — Count unread notifications
// ---------------------------------------------------------------------------

notificationsRouter.get("/unread-count", async (c) => {
    const municipalityId = c.get("municipalityId");
    const userId = c.get("userId");

    const db = drizzle(c.env.DB);

    const where = and(
        eq(notifications.municipalityId, municipalityId),
        or(isNull(notifications.userId), eq(notifications.userId, userId)),
        eq(notifications.isRead, false),
    );

    const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(where);

    return c.json<{ count: number }>({ count });
});

// ---------------------------------------------------------------------------
// PUT /:id/read — Mark one notification as read
// ---------------------------------------------------------------------------

notificationsRouter.put("/:id/read", async (c) => {
    const municipalityId = c.get("municipalityId");
    const { id } = c.req.param();

    const db = drizzle(c.env.DB);

    const [existing] = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
            and(
                eq(notifications.id, id),
                eq(notifications.municipalityId, municipalityId),
            ),
        )
        .limit(1);

    if (!existing) {
        return c.json(
            {
                error: "NOT_FOUND",
                message: "Notification introuvable.",
                statusCode: 404,
            },
            404,
        );
    }

    await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));

    return c.json<{ success: true }>({ success: true });
});

// ---------------------------------------------------------------------------
// PUT /read-all — Mark all notifications as read
// ---------------------------------------------------------------------------

notificationsRouter.put("/read-all", async (c) => {
    const municipalityId = c.get("municipalityId");
    const userId = c.get("userId");

    const db = drizzle(c.env.DB);

    const where = and(
        eq(notifications.municipalityId, municipalityId),
        or(isNull(notifications.userId), eq(notifications.userId, userId)),
        eq(notifications.isRead, false),
    );

    const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(where);

    return c.json<{ success: true; updated: number }>({
        success: true,
        updated: result.meta?.changes ?? 0,
    });
});

export default notificationsRouter;
