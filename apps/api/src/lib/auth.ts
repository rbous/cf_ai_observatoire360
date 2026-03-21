import { SignJWT, jwtVerify } from "jose";
import type { JwtPayload } from "@observatoire360/shared";

// ---------------------------------------------------------------------------
// Password hashing — PBKDF2-SHA256 via Web Crypto API
// Storage format: pbkdf2:<iterations>:<salt_base64>:<hash_base64>
// ---------------------------------------------------------------------------

const PBKDF2_ITERATIONS = 600_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

function bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Hash a plaintext password using PBKDF2-SHA256.
 * Returns a string in the format: pbkdf2:600000:salt_base64:hash_base64
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = new Uint8Array(SALT_BYTES);
    crypto.getRandomValues(salt);

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
    );

    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        HASH_BYTES * 8,
    );

    const saltBase64 = bufferToBase64(salt.buffer);
    const hashBase64 = bufferToBase64(hashBuffer);

    return `pbkdf2:${PBKDF2_ITERATIONS}:${saltBase64}:${hashBase64}`;
}

/**
 * Verify a plaintext password against a stored hash string.
 * The stored string must be in the format: pbkdf2:<iterations>:<salt_base64>:<hash_base64>
 */
export async function verifyPassword(
    password: string,
    stored: string,
): Promise<boolean> {
    const parts = stored.split(":");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") {
        return false;
    }

    const [, iterStr, saltBase64, hashBase64] = parts;
    const iterations = parseInt(iterStr, 10);
    if (isNaN(iterations) || iterations <= 0) {
        return false;
    }

    const salt = base64ToBuffer(saltBase64);
    const expectedHash = base64ToBuffer(hashBase64);

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
    );

    const actualHashBuffer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations,
            hash: "SHA-256",
        },
        keyMaterial,
        HASH_BYTES * 8,
    );

    const actualHash = new Uint8Array(actualHashBuffer);

    // Constant-time comparison to prevent timing attacks
    if (actualHash.length !== expectedHash.length) {
        return false;
    }
    let diff = 0;
    for (let i = 0; i < actualHash.length; i++) {
        diff |= actualHash[i] ^ expectedHash[i];
    }
    return diff === 0;
}

// ---------------------------------------------------------------------------
// JWT — using jose (HMAC-SHA256 / HS256)
// ---------------------------------------------------------------------------

function getSecretKey(secret: string): Uint8Array {
    return new TextEncoder().encode(secret);
}

/**
 * Sign a JWT with HS256.
 * @param payload  - Claims to embed (sub, role, municipalityId, …)
 * @param secret   - Shared HMAC secret (from env.JWT_SECRET)
 * @param expiresIn - Lifetime in seconds
 */
export async function signJwt(
    payload: object,
    secret: string,
    expiresIn: number,
): Promise<string> {
    return new SignJWT(payload as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
        .sign(getSecretKey(secret));
}

/**
 * Verify a JWT and return its payload, or null if invalid / expired.
 */
export async function verifyJwt(
    token: string,
    secret: string,
): Promise<JwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecretKey(secret));
        return payload as unknown as JwtPayload;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Refresh token — random 32-byte hex string
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random 32-byte hex refresh token.
 */
export function generateRefreshToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Hash a refresh token for safe storage in the database.
 * Uses SHA-256 so the raw token is never stored.
 */
export async function hashRefreshToken(token: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(token),
    );
    return bufferToBase64(hashBuffer);
}
