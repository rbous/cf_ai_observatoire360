import { useMemo } from "react";
import type { Alert, PaginatedResponse } from "@observatoire360/shared";
import { useApi } from "./useApi";

interface AlertFilters {
    status?: string;
    riskLevel?: string;
    type?: string;
    search?: string;
}

interface UseAlertsResult {
    alerts: Alert[];
    total: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Fetches the alerts list, optionally filtered.
 *
 * Undefined filter values are omitted from the query string so the backend
 * returns all records for that dimension.
 *
 * @example
 * const { alerts, total, isLoading, error, refetch } = useAlerts({ status: "a_analyser" });
 */
export function useAlerts(filters?: AlertFilters): UseAlertsResult {
    const url = useMemo(() => {
        const params = new URLSearchParams();

        if (filters?.status) {
            params.set("status", filters.status);
        }
        if (filters?.riskLevel) {
            params.set("riskLevel", filters.riskLevel);
        }
        if (filters?.type) {
            params.set("type", filters.type);
        }
        if (filters?.search) {
            params.set("search", filters.search);
        }

        const qs = params.toString();
        return qs ? `/alerts?${qs}` : "/alerts";
    }, [
        filters?.status,
        filters?.riskLevel,
        filters?.type,
        filters?.search,
    ]);

    const { data, error, isLoading, refetch } = useApi<PaginatedResponse<Alert>>(url);

    return {
        alerts: data?.data ?? [],
        total: data?.total ?? 0,
        isLoading,
        error,
        refetch,
    };
}
