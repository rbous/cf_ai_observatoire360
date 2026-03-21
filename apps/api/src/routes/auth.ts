import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import {
    loginSchema,
    registerSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "@observatoire360/shared";
import {
    hashPassword,
    verifyPassword,
    signJwt,
    generateRefreshToken,
    hashRefreshToken,
} from "../lib/auth.js";
import { ulid } from "../lib/ulid.js";
import { users, refreshTokens, municipalities } from "../db/schema.js";
import type { Bindings } from "../types.js";

const ACCESS_TOKEN_TTL  = 60 * 15;           // 15 minutes
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days

const REFRESH_COOKIE = "refresh_token";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function now(): number {
    return Math.floor(Date.now() / 1000);
}

function refreshCookieOptions(env: string) {
    return {
        httpOnly: true,
        secure: env !== "development",
        sameSite: "Strict" as const,
        path: "/api/auth",
        maxAge: REFRESH_TOKEN_TTL,
    };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const auth = new Hono<{ Bindings: Bindings }>();

// POST /auth/register
auth.post("/register", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
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

    const { email, password, name, municipalityId } = parsed.data;
    const db = drizzle(c.env.DB);

    // Verify municipality exists
    const [muni] = await db
        .select({ id: municipalities.id })
        .from(municipalities)
        .where(eq(municipalities.id, municipalityId))
        .limit(1);

    if (!muni) {
        return c.json(
            { error: "NOT_FOUND", message: "Municipalité introuvable.", statusCode: 404 },
            404,
        );
    }

    // Check email uniqueness
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
        role: "inspector" as const,
        isActive: true,
        createdAt: ts,
        updatedAt: ts,
    };

    await db.insert(users).values(newUser);

    // Issue tokens
    const jwtPayload = {
        sub: newUser.id,
        role: newUser.role,
        municipalityId: newUser.municipalityId,
    };

    const accessToken = await signJwt(jwtPayload, c.env.JWT_SECRET, ACCESS_TOKEN_TTL);
    const rawRefresh  = generateRefreshToken();
    const tokenHash   = await hashRefreshToken(rawRefresh);

    await db.insert(refreshTokens).values({
        id: ulid(),
        userId: newUser.id,
        tokenHash,
        expiresAt: ts + REFRESH_TOKEN_TTL,
        createdAt: ts,
    });

    setCookie(c, REFRESH_COOKIE, rawRefresh, refreshCookieOptions(c.env.ENVIRONMENT));

    return c.json(
        {
            accessToken,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                municipalityId: newUser.municipalityId,
            },
        },
        201,
    );
});

// POST /auth/login
auth.post("/login", async (c) => {
  try {
    const body = await c.req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
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

    const { email, password } = parsed.data;
    const db = drizzle(c.env.DB);

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

    // Use constant-time verify to prevent timing attacks regardless of whether user exists
    const dummyHash =
        "pbkdf2:600000:AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    const valid =
        user && user.isActive
            ? await verifyPassword(password, user.passwordHash)
            : await verifyPassword(password, dummyHash).then(() => false);

    if (!valid) {
        return c.json(
            { error: "UNAUTHORIZED", message: "Courriel ou mot de passe incorrect.", statusCode: 401 },
            401,
        );
    }

    const ts = now();
    const jwtPayload = {
        sub: user.id,
        role: user.role,
        municipalityId: user.municipalityId,
    };

    const accessToken = await signJwt(jwtPayload, c.env.JWT_SECRET, ACCESS_TOKEN_TTL);
    const rawRefresh  = generateRefreshToken();
    const tokenHash   = await hashRefreshToken(rawRefresh);

    await db.insert(refreshTokens).values({
        id: ulid(),
        userId: user.id,
        tokenHash,
        expiresAt: ts + REFRESH_TOKEN_TTL,
        createdAt: ts,
    });

    setCookie(c, REFRESH_COOKIE, rawRefresh, refreshCookieOptions(c.env.ENVIRONMENT));

    return c.json({
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            municipalityId: user.municipalityId,
        },
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err instanceof Error ? err.message : err, err instanceof Error ? err.stack : "");
    return c.json(
        { error: "INTERNAL_SERVER_ERROR", message: String(err instanceof Error ? err.message : err), statusCode: 500 },
        500,
    );
  }
});

// POST /auth/refresh
auth.post("/refresh", async (c) => {
    const rawRefresh = getCookie(c, REFRESH_COOKIE);

    if (!rawRefresh) {
        return c.json(
            { error: "UNAUTHORIZED", message: "Jeton de rafraîchissement manquant.", statusCode: 401 },
            401,
        );
    }

    const db = drizzle(c.env.DB);
    const tokenHash = await hashRefreshToken(rawRefresh);
    const ts = now();

    const [stored] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1);

    if (!stored || stored.expiresAt < ts) {
        return c.json(
            { error: "UNAUTHORIZED", message: "Jeton de rafraîchissement invalide ou expiré.", statusCode: 401 },
            401,
        );
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, stored.userId))
        .limit(1);

    if (!user || !user.isActive) {
        return c.json(
            { error: "UNAUTHORIZED", message: "Compte inactif ou introuvable.", statusCode: 401 },
            401,
        );
    }

    // Rotate: delete old token, issue new pair
    await db.delete(refreshTokens).where(eq(refreshTokens.id, stored.id));

    const jwtPayload = {
        sub: user.id,
        role: user.role,
        municipalityId: user.municipalityId,
    };

    const accessToken = await signJwt(jwtPayload, c.env.JWT_SECRET, ACCESS_TOKEN_TTL);
    const newRawRefresh  = generateRefreshToken();
    const newTokenHash   = await hashRefreshToken(newRawRefresh);

    await db.insert(refreshTokens).values({
        id: ulid(),
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt: ts + REFRESH_TOKEN_TTL,
        createdAt: ts,
    });

    setCookie(c, REFRESH_COOKIE, newRawRefresh, refreshCookieOptions(c.env.ENVIRONMENT));

    return c.json({ accessToken });
});

// POST /auth/logout
auth.post("/logout", async (c) => {
    const rawRefresh = getCookie(c, REFRESH_COOKIE);

    if (rawRefresh) {
        const db = drizzle(c.env.DB);
        const tokenHash = await hashRefreshToken(rawRefresh);
        await db
            .delete(refreshTokens)
            .where(eq(refreshTokens.tokenHash, tokenHash));
    }

    deleteCookie(c, REFRESH_COOKIE, { path: "/api/auth" });
    return c.json({ success: true });
});

// POST /auth/forgot-password
auth.post("/forgot-password", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);
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

    // Always return the same response to avoid email-enumeration attacks.
    // Internally: look up the user; if found, generate + store a reset token.
    const db = drizzle(c.env.DB);
    const [user] = await db
        .select({ id: users.id, email: users.email, isActive: users.isActive })
        .from(users)
        .where(eq(users.email, parsed.data.email.toLowerCase()))
        .limit(1);

    if (user && user.isActive) {
        const rawToken = generateRefreshToken(); // 32-byte hex — reuse same generator
        const tokenHash = await hashRefreshToken(rawToken);
        const ts = now();

        // Re-use refresh_tokens table for password-reset tokens
        // (expires in 1 hour; identified by userId + token hash)
        await db.insert(refreshTokens).values({
            id: ulid(),
            userId: user.id,
            tokenHash: `reset:${tokenHash}`,
            expiresAt: ts + 3600,
            createdAt: ts,
        });

        // In production, send `rawToken` via email here.
        // e.g. await sendResetEmail(user.email, rawToken);
    }

    return c.json({
        success: true,
        message:
            "Si cette adresse courriel est associée à un compte, un lien de réinitialisation a été envoyé.",
    });
});

// POST /auth/reset-password
auth.post("/reset-password", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);
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

    const { token, password } = parsed.data;
    const db = drizzle(c.env.DB);
    const tokenHash = await hashRefreshToken(token);
    const ts = now();

    const [stored] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, `reset:${tokenHash}`))
        .limit(1);

    if (!stored || stored.expiresAt < ts) {
        return c.json(
            { error: "BAD_REQUEST", message: "Jeton invalide ou expiré.", statusCode: 400 },
            400,
        );
    }

    const newHash = await hashPassword(password);

    await db
        .update(users)
        .set({ passwordHash: newHash, updatedAt: ts })
        .where(eq(users.id, stored.userId));

    // Invalidate the reset token and all refresh tokens for this user
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, stored.userId));

    return c.json({ success: true, message: "Mot de passe réinitialisé avec succès." });
});

export default auth;
