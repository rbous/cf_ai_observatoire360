import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@observatoire360/shared";
import type { UpdateProfileInput } from "@observatoire360/shared";
import { api, ApiRequestError } from "@/app/lib/api";
import { AUTH_ROUTES } from "@/app/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
    municipalityId: string;
}

interface AuthLoginResponse {
    user: User;
}

export interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileInput) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // -----------------------------------------------------------------------
    // Restore session on mount — attempts GET /api/me using the existing
    // HttpOnly refresh/access cookie.  A 401 simply means no active session.
    // -----------------------------------------------------------------------
    useEffect(() => {
        let cancelled = false;

        async function restoreSession() {
            try {
                const data = await api.get<{ user: User }>("/me");
                if (!cancelled) {
                    setUser(data.user);
                }
            } catch (err) {
                // 401 is expected when there is no active session — swallow it
                if (err instanceof ApiRequestError && err.statusCode === 401) {
                    // no-op: user simply isn't logged in
                } else {
                    console.error("Erreur lors de la restauration de la session:", err);
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        restoreSession();
        return () => {
            cancelled = true;
        };
    }, []);

    // -----------------------------------------------------------------------
    // login
    // -----------------------------------------------------------------------
    const login = useCallback(async (email: string, password: string) => {
        const credentials: LoginCredentials = { email, password };
        const data = await api.post<AuthLoginResponse>("/auth/login", credentials);
        setUser(data.user);
    }, []);

    // -----------------------------------------------------------------------
    // register
    // -----------------------------------------------------------------------
    const register = useCallback(async (data: RegisterData) => {
        const response = await api.post<AuthLoginResponse>("/auth/register", data);
        setUser(response.user);
    }, []);

    // -----------------------------------------------------------------------
    // logout
    // -----------------------------------------------------------------------
    const logout = useCallback(async () => {
        try {
            await api.post("/auth/logout");
        } catch (err) {
            // Even if the server call fails, clear local state and redirect
            console.error("Erreur lors de la déconnexion:", err);
        } finally {
            setUser(null);
            navigate(AUTH_ROUTES.LOGIN, { replace: true });
        }
    }, [navigate]);

    // -----------------------------------------------------------------------
    // updateProfile
    // -----------------------------------------------------------------------
    const updateProfile = useCallback(async (data: UpdateProfileInput) => {
        const response = await api.put<{ user: User }>("/me", data);
        setUser(response.user);
    }, []);

    // -----------------------------------------------------------------------
    // Memoised context value
    // -----------------------------------------------------------------------
    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: user !== null,
            isLoading,
            login,
            register,
            logout,
            updateProfile,
        }),
        [user, isLoading, login, register, logout, updateProfile],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
