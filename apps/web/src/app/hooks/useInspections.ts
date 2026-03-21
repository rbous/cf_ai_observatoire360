import { useMemo } from "react";
import type { Inspection, PaginatedResponse } from "@observatoire360/shared";
import { useApi } from "./useApi";

interface InspectionFilters {
    status?: string;
    alertId?: string;
    inspectorId?: string;
}

interface UseInspectionsResult {
    inspections: Inspection[];
    total: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Fetches the inspections list, optionally filtered.
 *
 * @example
 * const { inspections, total, isLoading, error, refetch } = useInspections({ status: "planned" });
 */
export function useInspections(filters?: InspectionFilters): UseInspectionsResult {
    const url = useMemo(() => {
        const params = new URLSearchParams();

        if (filters?.status) {
            params.set("status", filters.status);
        }
        if (filters?.alertId) {
            params.set("alertId", filters.alertId);
        }
        if (filters?.inspectorId) {
            params.set("inspectorId", filters.inspectorId);
        }

        const qs = params.toString();
        return qs ? `/inspections?${qs}` : "/inspections";
    }, [
        filters?.status,
        filters?.alertId,
        filters?.inspectorId,
    ]);

    const { data, error, isLoading, refetch } = useApi<PaginatedResponse<Inspection>>(url);

    return {
        inspections: data?.data ?? [],
        total: data?.total ?? 0,
        isLoading,
        error,
        refetch,
    };
}
