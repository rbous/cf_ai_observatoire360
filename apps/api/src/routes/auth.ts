import { Hono } from "hono";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import {
    loginSchema,
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
import { users, refreshTokens } from "../db/schema.js";
import type { Bindings } from "../types.js";

const ACCESS_TOKEN_TTL  = 60 * 15;           // 15 minutes
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days

const REFRESH_COOKIE = "refresh_token";

// Dummy hash used for constant-time comparison when user is not found.
// Iteration count matches PBKDF2_ITERATIONS in lib/auth.ts (100,000).
const DUMMY_HASH =
    "pbkdf2:100000:AAAAAAAAAAAAAAAAAAAAAA==:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

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
        sameSite: "None" as const,
        path: "/api/auth",
        maxAge: REFRESH_TOKEN_TTL,
    };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const auth = new Hono<{ Bindings: Bindings }>();

// POST /auth/register — disabled; invitation-only
auth.post("/register", (c) => {
    return c.json(
        {
            error: "FORBIDDEN",
            message: "L'inscription est réservée aux administrateurs. Contactez votre gestionnaire.",
            statusCode: 403,
        },
        403,
    );
});

// POST /auth/login
auth.post("/login", async (c) => {
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
    const valid =
        user && user.isActive
            ? await verifyPassword(password, user.passwordHash)
            : await verifyPassword(password, DUMMY_HASH).then(() => false);

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

        // Send password reset email via Resend
        const resetUrl = `${c.env.ALLOWED_ORIGIN}/reinitialiser-mot-de-passe?token=${rawToken}`;
        try {
            const { sendEmail } = await import("../lib/resend.js");
            await sendEmail(c.env.RESEND_API_KEY, {
                to: user.email,
                subject: "[Observatoire 360] Réinitialisation de votre mot de passe",
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
                        <div style="background:#008B8B;padding:16px 24px;border-radius:12px 12px 0 0;text-align:center">
                            <h1 style="color:white;margin:0;font-size:20px">Observatoire 360</h1>
                        </div>
                        <div style="background:#f8fffe;padding:24px;border:1px solid #e0f2f1;border-top:none;border-radius:0 0 12px 12px">
                            <p style="color:#1A2332;font-size:15px">Vous avez demandé la réinitialisation de votre mot de passe.</p>
                            <p style="color:#1A2332;font-size:15px">Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.</p>
                            <div style="text-align:center;margin:24px 0">
                                <a href="${resetUrl}" style="display:inline-block;background:#D4A843;color:white;padding:12px 32px;border-radius:9999px;text-decoration:none;font-weight:bold;font-size:15px">
                                    Réinitialiser mon mot de passe
                                </a>
                            </div>
                            <p style="color:#666;font-size:13px">Si vous n'avez pas fait cette demande, ignorez simplement ce courriel.</p>
                        </div>
                    </div>
                `.trim(),
            });
        } catch (err) {
            console.error("[auth] Failed to send password reset email:", err);
        }
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
