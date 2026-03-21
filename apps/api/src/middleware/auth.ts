import type { Context, MiddlewareHandler, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verifyJwt } from "../lib/auth.js";
import type { JwtPayload, UserRole } from "@observatoire360/shared";
import type { Bindings } from "../types.js";

// Extend the Hono context variable map so downstream handlers get proper types.
export type AuthVariables = {
    userId: string;
    role: UserRole;
    municipalityId: string;
    jwtPayload: JwtPayload;
};

/**
 * JWT authentication middleware.
 *
 * Looks for the bearer token in (in order):
 *   1. Authorization: Bearer <token> header
 *   2. `access_token` httpOnly cookie
 *
 * On success sets the following context variables:
 *   - userId         — JWT `sub` claim
 *   - role           — user role
 *   - municipalityId — user's municipality
 *   - jwtPayload     — full decoded payload
 *
 * Returns 401 if the token is absent, malformed, or expired.
 */
export function requireAuth(): MiddlewareHandler<{
    Bindings: Bindings;
    Variables: AuthVariables;
}> {
    return async (
        c: Context<{ Bindings: Bindings; Variables: AuthVariables }>,
        next: Next,
    ) => {
        let token: string | undefined;

        // 1. Authorization header
        const authHeader = c.req.header("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        }

        // 2. Fallback to cookie
        if (!token) {
            token = getCookie(c, "access_token");
        }

        if (!token) {
            return c.json(
                {
                    error: "UNAUTHORIZED",
                    message: "Authentification requise.",
                    statusCode: 401,
                },
                401,
            );
        }

        const payload = await verifyJwt(token, c.env.JWT_SECRET);

        if (!payload) {
            return c.json(
                {
                    error: "UNAUTHORIZED",
                    message: "Jeton invalide ou expiré.",
                    statusCode: 401,
                },
                401,
            );
        }

        c.set("userId", payload.sub);
        c.set("role", payload.role);
        c.set("municipalityId", payload.municipalityId);
        c.set("jwtPayload", payload);

        await next();
    };
}

/**
 * Role-based access control middleware.
 * Must be used after requireAuth().
 *
 * @param allowed - Roles that are permitted to access the route
 */
export function requireRole(
    ...allowed: UserRole[]
): MiddlewareHandler<{
    Bindings: Bindings;
    Variables: AuthVariables;
}> {
    return async (
        c: Context<{ Bindings: Bindings; Variables: AuthVariables }>,
        next: Next,
    ) => {
        const role = c.get("role");
        if (!allowed.includes(role)) {
            return c.json(
                {
                    error: "FORBIDDEN",
                    message: "Accès refusé. Permissions insuffisantes.",
                    statusCode: 403,
                },
                403,
            );
        }
        await next();
    };
}
