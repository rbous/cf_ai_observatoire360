import { useState } from "react";
import { Loader2, AlertTriangle, ScanLine, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useApi } from "@/app/hooks/useApi";
import { useAuth } from "@/app/hooks/useAuth";
import { api, ApiRequestError } from "@/app/lib/api";
import type { ScanJob, PaginatedResponse } from "@observatoire360/shared";
import { SCAN_JOB_STATUS_LABELS } from "@observatoire360/shared";
import type { ScanJobStatus } from "@observatoire360/shared";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type BadgeVariant =
    | "secondary"
    | "default"
    | "pending"
    | "active"
    | "high"
    | "inactive"
    | "outline"
    | "accent"
    | "destructive"
    | "medium"
    | "low";

function statusBadgeVariant(status: ScanJobStatus): BadgeVariant {
    switch (status) {
        case "pending":
            return "secondary";
        case "fetching":
            return "default";
        case "analyzing":
            return "pending";
        case "completed":
            return "active";
        case "failed":
            return "high";
        default:
            return "secondary";
    }
}

function formatDate(timestamp: number | null): string {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleString("fr-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ---------------------------------------------------------------------------
// ScansPage
// ---------------------------------------------------------------------------

export default function ScansPage() {
    const { user } = useAuth();
    const isManager = user?.role === "manager";

    const { data: scansResponse, isLoading, error, refetch } =
        useApi<PaginatedResponse<ScanJob>>("/scans");

    const [triggerLoading, setTriggerLoading] = useState(false);
    const [triggerError, setTriggerError] = useState<string | null>(null);
    const [triggerSuccess, setTriggerSuccess] = useState(false);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    async function handleTriggerScan() {
        setTriggerLoading(true);
        setTriggerError(null);
        setTriggerSuccess(false);
        try {
            await api.post<{ job: ScanJob }>("/scans/trigger");
            setTriggerSuccess(true);
            refetch();
            // Auto-hide success message after 5 seconds
            setTimeout(() => setTriggerSuccess(false), 5000);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setTriggerError(err.message);
            } else {
                setTriggerError("Une erreur inattendue s'est produite.");
            }
        } finally {
            setTriggerLoading(false);
        }
    }

    // -----------------------------------------------------------------------
    // Render: loading / error
    // -----------------------------------------------------------------------

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 flex items-center justify-center min-h-[300px]">
                <div className="flex items-center gap-3 text-[#2A3A4E]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#008B8B]" />
                    <span className="text-sm font-medium">Chargement des analyses…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    const scans = scansResponse?.data ?? [];

    // -----------------------------------------------------------------------
    // Render: main
    // -----------------------------------------------------------------------

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black uppercase text-[#1A2332]">Historique des analyses</h1>
                    <p className="text-sm text-[#2A3A4E]/60 mt-0.5">
                        {scansResponse?.total ?? 0} analyse{(scansResponse?.total ?? 0) !== 1 ? "s" : ""} au total
                    </p>
                </div>
                {isManager && (
                    <Button onClick={handleTriggerScan} disabled={triggerLoading}>
                        {triggerLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ScanLine className="w-4 h-4" />
                        )}
                        Lancer une analyse
                    </Button>
                )}
            </div>

            {/* Feedback banners */}
            {triggerSuccess && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Analyse lancée avec succès. Elle apparaîtra dans la liste ci-dessous.</span>
                </div>
            )}
            {triggerError && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{triggerError}</span>
                </div>
            )}

            {/* Empty state */}
            {scans.length === 0 ? (
                <Card>
                    <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#008B8B]/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-[#008B8B]" />
                        </div>
                        <p className="text-sm font-medium text-[#2A3A4E]/70">
                            Aucune analyse enregistrée pour le moment.
                        </p>
                        {isManager && (
                            <p className="text-xs text-[#2A3A4E]/40">
                                Cliquez sur "Lancer une analyse" pour démarrer la première analyse.
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-bold text-[#1A2332]">
                            Résultats des analyses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Date</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Statut</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Détections</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#2A3A4E]/60 uppercase tracking-wide">Erreur</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {scans.map((scan) => (
                                        <tr key={scan.id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-5 py-3.5 text-[#2A3A4E]/80 whitespace-nowrap">
                                                {formatDate(scan.createdAt)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <Badge variant={statusBadgeVariant(scan.status)}>
                                                    {SCAN_JOB_STATUS_LABELS[scan.status]}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-[#1A2332]">
                                                {scan.status === "completed"
                                                    ? scan.detectionsCount
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3.5 text-red-600 text-xs max-w-[240px] truncate">
                                                {scan.error ?? "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
