import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiRequestError } from "@/app/lib/api";

interface UseApiResult<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    refetch: () => void;
}

/**
 * Generic hook for GET requests.
 *
 * Pass `null` as the URL to skip fetching (useful for conditional requests).
 *
 * @example
 * const { data, error, isLoading, refetch } = useApi<Alert[]>("/api/alerts");
 */
export function useApi<T>(url: string | null): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(url !== null);

    // A counter that increments on each refetch call to re-trigger the effect
    const [fetchCounter, setFetchCounter] = useState(0);

    // Keep a stable ref to the current url so the cleanup cancel works correctly
    const urlRef = useRef(url);
    urlRef.current = url;

    const refetch = useCallback(() => {
        setFetchCounter((c) => c + 1);
    }, []);

    useEffect(() => {
        if (url === null) {
            setData(null);
            setError(null);
            setIsLoading(false);
            return;
        }

        let cancelled = false;
        setIsLoading(true);
        setError(null);

        api.get<T>(url)
            .then((result) => {
                if (!cancelled) {
                    setData(result);
                    setError(null);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    if (err instanceof ApiRequestError) {
                        setError(err.message);
                    } else if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError("Une erreur inattendue s'est produite.");
                    }
                    setData(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, fetchCounter]);

    return { data, error, isLoading, refetch };
}
