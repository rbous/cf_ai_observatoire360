import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import {
    createUserSchema,
    updateUserSchema,
} from "@observatoire360/shared";
import type { User } from "@observatoire360/shared";
import { users } from "../db/schema.js";
import { ulid } from "../lib/ulid.js";
import { hashPassword } from "../lib/auth.js";
import { requireRole } from "../middleware/auth.js";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";

type AppEnv = { Bindings: Bindings; Variables: AuthVariables };

const usersRouter = new Hono<AppEnv>();

// All user management routes require manager role or above
usersRouter.use("/*", requireRole("manager"));

// ---------------------------------------------------------------------------
// Row → domain type mapper (excludes password_hash)
// ---------------------------------------------------------------------------

function rowToUser(row: typeof users.$inferSelect): User {
    return {
        id: row.id,
        municipalityId: row.municipalityId,
        email: row.email,
        name: row.name,
        role: row.role as User["role"],
        isActive: Boolean(row.isActive),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}

function now(): number {
    return Math.floor(Date.now() / 1000);
}

// ---------------------------------------------------------------------------
// GET /users — list users in same municipality
// ---------------------------------------------------------------------------

usersRouter.get("/", async (c) => {
    const municipalityId = c.get("municipalityId");
    const db = drizzle(c.env.DB);

    const rows = await db
        .select()
        .from(users)
        .where(eq(users.municipalityId, municipalityId));

    return c.json({
        data: rows.map(rowToUser),
        total: rows.length,
    });
});

// ---------------------------------------------------------------------------
// POST /users — create user in same municipality
// ---------------------------------------------------------------------------

usersRouter.post("/", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = createUserSchema.safeParse(body);

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

    const municipalityId = c.get("municipalityId");
    const { email, name, role, password } = parsed.data;
    const db = drizzle(c.env.DB);

    // Check uniqueness
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

    if (existing) {
        return c.json(
            { error: "CONFLICT", message: "Cette adresse courriel est déjà utilisée.", statusCode: 409 },
            409,
        );
    }

    const ts = now();
    const newUser = {
        id: ulid(),
        municipalityId,
        email: email.toLowerCase(),
        passwordHash: await hashPassword(password),
        name,
        role,
        isActive: true,
        createdAt: ts,
        updatedAt: ts,
    };

    await db.insert(users).values(newUser);

    return c.json(rowToUser(newUser), 201);
});

// ---------------------------------------------------------------------------
// PUT /users/:id — update user (same municipality only)
// ---------------------------------------------------------------------------

usersRouter.put("/:id", async (c) => {
    const { id } = c.req.param();
    const municipalityId = c.get("municipalityId");

    const body = await c.req.json().catch(() => null);
    const parsed = updateUserSchema.safeParse(body);

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

    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.id, id), eq(users.municipalityId, municipalityId)))
        .limit(1);

    if (!existing) {
        return c.json(
            { error: "NOT_FOUND", message: "Utilisateur introuvable.", statusCode: 404 },
            404,
        );
    }

    const { name, role, isActive } = parsed.data;
    const updates: Partial<typeof users.$inferInsert> = { updatedAt: now() };

    if (name     !== undefined) updates.name     = name;
    if (role     !== undefined) updates.role     = role;
    if (isActive !== undefined) updates.isActive = isActive;

    await db.update(users).set(updates).where(eq(users.id, id));

    const [updated] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    return c.json(rowToUser(updated));
});

// ---------------------------------------------------------------------------
// DELETE /users/:id — deactivate (soft delete)
// ---------------------------------------------------------------------------

usersRouter.delete("/:id", async (c) => {
    const { id } = c.req.param();
    const municipalityId = c.get("municipalityId");
    const requestingUserId = c.get("userId");

    if (id === requestingUserId) {
        return c.json(
            { error: "BAD_REQUEST", message: "Vous ne pouvez pas désactiver votre propre compte.", statusCode: 400 },
            400,
        );
    }

    const db = drizzle(c.env.DB);

    const [existing] = await db
        .select({ id: users.id, isActive: users.isActive })
        .from(users)
        .where(and(eq(users.id, id), eq(users.municipalityId, municipalityId)))
        .limit(1);

    if (!existing) {
        return c.json(
            { error: "NOT_FOUND", message: "Utilisateur introuvable.", statusCode: 404 },
            404,
        );
    }

    if (!existing.isActive) {
        return c.json(
            { error: "BAD_REQUEST", message: "Compte déjà désactivé.", statusCode: 400 },
            400,
        );
    }

    await db
        .update(users)
        .set({ isActive: false, updatedAt: now() })
        .where(eq(users.id, id));

    return c.json({ success: true });
});

export default usersRouter;
