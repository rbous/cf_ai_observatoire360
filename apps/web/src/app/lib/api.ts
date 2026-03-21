import type { ApiError } from "@observatoire360/shared";
import { API_BASE_URL } from "./constants";

// ---------------------------------------------------------------------------
// Typed API error — thrown whenever the server returns a non-2xx status
// ---------------------------------------------------------------------------
export class ApiRequestError extends Error {
    readonly statusCode: number;
    readonly error: string;

    constructor(apiError: ApiError) {
        super(apiError.message);
        this.name = "ApiRequestError";
        this.statusCode = apiError.statusCode;
        this.error = apiError.error;
    }
}

// ---------------------------------------------------------------------------
// In-memory access token storage
// ---------------------------------------------------------------------------
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Build a full URL, stripping any duplicate leading /api segment. */
function buildUrl(path: string): string {
    // Allow callers to pass "/api/..." or just "/alerts" — normalise to one
    // prefix derived from API_BASE_URL.
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const base = API_BASE_URL.replace(/\/$/, "");
    const normalised = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalised}`;
}

/** Parse a response body as JSON and throw an ApiRequestError on non-2xx. */
async function handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
        // 204 No Content — return undefined cast to T
        if (response.status === 204) {
            return undefined as unknown as T;
        }
        return response.json() as Promise<T>;
    }

    // Try to parse a structured ApiError from the body
    let apiError: ApiError;
    try {
        apiError = (await response.json()) as ApiError;
    } catch {
        apiError = {
            error: "Erreur réseau",
            message: `Erreur ${response.status}: ${response.statusText}`,
            statusCode: response.status,
        };
    }

    throw new ApiRequestError(apiError);
}

// ---------------------------------------------------------------------------
// Token refresh logic — only one in-flight refresh at a time
// ---------------------------------------------------------------------------
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
    const response = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        accessToken = null;
        let apiError: ApiError;
        try {
            apiError = (await response.json()) as ApiError;
        } catch {
            apiError = {
                error: "Session expirée",
                message: "Votre session a expiré. Veuillez vous reconnecter.",
                statusCode: response.status,
            };
        }
        throw new ApiRequestError(apiError);
    }

    const data = await response.json() as { accessToken: string };
    accessToken = data.accessToken;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    isRetry = false,
): Promise<T> {
    const url = buildUrl(path);

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const init: RequestInit = {
        method,
        credentials: "include",
        headers,
    };

    if (body !== undefined) {
        init.body = JSON.stringify(body);
    }

    const response = await fetch(url, init);

    // On 401, attempt a single token refresh then retry the original request
    if (response.status === 401 && !isRetry) {
        // Deduplicate concurrent refresh calls
        if (!refreshPromise) {
            refreshPromise = refreshAccessToken().finally(() => {
                refreshPromise = null;
            });
        }

        try {
            await refreshPromise;
        } catch {
            // Refresh failed — bubble up the original 401
            return handleResponse<T>(response);
        }

        // Retry the original request once
        return request<T>(method, path, body, true);
    }

    return handleResponse<T>(response);
}

// ---------------------------------------------------------------------------
// Public API client
// ---------------------------------------------------------------------------
export const api = {
    get<T>(path: string): Promise<T> {
        return request<T>("GET", path);
    },

    post<T>(path: string, body?: unknown): Promise<T> {
        return request<T>("POST", path, body);
    },

    put<T>(path: string, body?: unknown): Promise<T> {
        return request<T>("PUT", path, body);
    },

    delete<T>(path: string): Promise<T> {
        return request<T>("DELETE", path);
    },
};
