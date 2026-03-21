import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { updateProfileSchema, changePasswordSchema } from "@observatoire360/shared";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../lib/auth.js";
import type { Bindings } from "../types.js";
import type { AuthVariables } from "../middleware/auth.js";

const me = new Hono<{ Bindings: Bindings; Variables: AuthVariables }>();

// GET /me — return current user profile
me.get("/", async (c) => {
    const userId = c.get("userId");
    const db = drizzle(c.env.DB);

    const [user] = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            municipalityId: users.municipalityId,
            isActive: users.isActive,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        return c.json(
            { error: "NOT_FOUND", message: "Utilisateur introuvable.", statusCode: 404 },
            404,
        );
    }

    return c.json({ user });
});

// PUT /me — update current user profile
me.put("/", async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);

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
    const now = Math.floor(Date.now() / 1000);

    await db
        .update(users)
        .set({ ...parsed.data, updatedAt: now })
        .where(eq(users.id, userId));

    const [updated] = await db
        .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            municipalityId: users.municipalityId,
            isActive: users.isActive,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return c.json({ user: updated });
});

// PUT /me/password — change password
me.put("/password", async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);

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

    const [user] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        return c.json(
            { error: "NOT_FOUND", message: "Utilisateur introuvable.", statusCode: 404 },
            404,
        );
    }

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
        return c.json(
            { error: "UNAUTHORIZED", message: "Mot de passe actuel incorrect.", statusCode: 401 },
            401,
        );
    }

    const newHash = await hashPassword(parsed.data.newPassword);
    const now = Math.floor(Date.now() / 1000);

    await db
        .update(users)
        .set({ passwordHash: newHash, updatedAt: now })
        .where(eq(users.id, userId));

    return c.json({ success: true, message: "Mot de passe modifié avec succès." });
});

export default me;
