/**
 * ULID (Universally Unique Lexicographically Sortable Identifier) generator.
 * Uses the Web Crypto API (crypto.getRandomValues) — no external dependencies.
 *
 * Format: 26-character Crockford Base32 string
 * - First 10 chars: timestamp (milliseconds since epoch)
 * - Last 16 chars: random component
 */

const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ENCODING_LEN = ENCODING.length;
const TIME_LEN = 10;
const RANDOM_LEN = 16;

function encodeTime(now: number, len: number): string {
    let str = "";
    for (let i = len - 1; i >= 0; i--) {
        str = ENCODING[now % ENCODING_LEN] + str;
        now = Math.floor(now / ENCODING_LEN);
    }
    return str;
}

function encodeRandom(len: number): string {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    let str = "";
    for (let i = 0; i < len; i++) {
        str += ENCODING[bytes[i] % ENCODING_LEN];
    }
    return str;
}

/**
 * Generate a new ULID string.
 * Lexicographically sortable by creation time, URL-safe, 26 characters.
 */
export function ulid(): string {
    const now = Date.now();
    return encodeTime(now, TIME_LEN) + encodeRandom(RANDOM_LEN);
}
