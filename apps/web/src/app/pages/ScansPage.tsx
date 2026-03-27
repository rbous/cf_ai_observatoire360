import { useState, useEffect, useRef } from "react";
import { Loader2, AlertTriangle, ScanLine, CheckCircle2, Clock, ArrowRight, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/app/components/ui/dialog";
import { ImageComparator } from "@/app/components/dashboard/ImageComparator";
import { useApi } from "@/app/hooks/useApi";
import { useAuth } from "@/app/hooks/useAuth";
import { api, ApiRequestError } from "@/app/lib/api";
import { API_BASE_URL } from "@/app/lib/constants";
import type { ScanJob, PaginatedResponse } from "@observatoire360/shared";
import type { ScanJobStatus } from "@observatoire360/shared";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { TranslationKey } from "@/app/i18n/translations";

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

function getDefaultStartDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().slice(0, 10);
}

function getDefaultEndDate(): string {
    return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// ScansPage
// ---------------------------------------------------------------------------

export default function ScansPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const isManager = user?.role === "manager";

    const { data: scansResponse, isLoading, error, refetch } =
        useApi<PaginatedResponse<ScanJob>>("/scans");

    // Auto-poll every 5s when any scan is in progress
    const hasActiveScans = scansResponse?.data?.some(
        (s) => s.status === "pending" || s.status === "fetching" || s.status === "analyzing"
    ) ?? false;

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (hasActiveScans) {
            pollRef.current = setInterval(() => refetch(), 5000);
        }
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [hasActiveScans, refetch]);

    // -----------------------------------------------------------------------
    // Trigger dialog state
    // -----------------------------------------------------------------------

    const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
    const [scanMode, setScanMode] = useState<"municipality" | "address" | "coordinates">("address");
    const [startDate, setStartDate] = useState(getDefaultStartDate);
    const [endDate, setEndDate] = useState(getDefaultEndDate);
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [triggerLoading, setTriggerLoading] = useState(false);
    const [triggerError, setTriggerError] = useState<string | null>(null);
    const [triggerSuccess, setTriggerSuccess] = useState(false);

    // -----------------------------------------------------------------------
    // Compare dialog state
    // -----------------------------------------------------------------------

    const [compareScan, setCompareScan] = useState<ScanJob | null>(null);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    function openTriggerDialog() {
        setScanMode("address");
        setStartDate(getDefaultStartDate());
        setEndDate(getDefaultEndDate());
        setAddress("");
        setLatitude("");
        setLongitude("");
        setTriggerError(null);
        setTriggerDialogOpen(true);
    }

    async function handleTriggerScan() {
        if (scanMode === "coordinates") {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (isNaN(lat) || isNaN(lng)) {
                setTriggerError(t("scans_lat_lng_required"));
                return;
            }
        }
        if (scanMode === "address" && !address.trim()) {
            setTriggerError(t("scans_address_required"));
            return;
        }
        setTriggerLoading(true);
        setTriggerError(null);
        try {
            const payload: Record<string, unknown> = {
                mode: scanMode,
                startDate,
                endDate,
            };

            if (scanMode === "address") {
                // Geocode the address using Nominatim (free, no API key)
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
                    { headers: { "User-Agent": "Observatoire360/1.0" } },
                );
                const geoData = await geoRes.json() as Array<{ lat: string; lon: string }>;
                if (!geoData.length) {
                    setTriggerError(t("scans_address_not_found"));
                    setTriggerLoading(false);
                    return;
                }
                payload.latitude = parseFloat(geoData[0].lat);
                payload.longitude = parseFloat(geoData[0].lon);
                payload.address = address;
            } else if (scanMode === "coordinates") {
                payload.latitude = parseFloat(latitude);
                payload.longitude = parseFloat(longitude);
            }

            await api.post<{ job: ScanJob }>("/scans/trigger", payload);
            setTriggerSuccess(true);
            setTriggerDialogOpen(false);
            refetch();
            setTimeout(() => setTriggerSuccess(false), 5000);
        } catch (err) {
            if (err instanceof ApiRequestError) {
                setTriggerError(err.message);
            } else {
                setTriggerError(t("scans_unexpected_error"));
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
                <div className="flex items-center gap-3 text-[#94A3B8]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#137fec]" />
                    <span className="text-sm font-medium">{t("scans_loading")}</span>
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
    const totalCount = scansResponse?.total ?? 0;

    // -----------------------------------------------------------------------
    // Render: main
    // -----------------------------------------------------------------------

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black uppercase text-[#E2E8F0]">{t("scans_title")}</h1>
                    <p className="text-sm text-[#94A3B8]/60 mt-0.5">
                        {totalCount} {totalCount !== 1 ? t("scans_count_many") : t("scans_count_one")} {t("scans_total")}
                    </p>
                </div>
                {isManager && (
                    <Button onClick={openTriggerDialog}>
                        <ScanLine className="w-4 h-4" />
                        {t("scans_trigger")}
                    </Button>
                )}
            </div>

            {/* Feedback banners */}
            {triggerSuccess && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{t("scans_launched_success")}</span>
                </div>
            )}

            {/* Empty state */}
            {scans.length === 0 ? (
                <Card>
                    <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-[#137fec]/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-[#137fec]" />
                        </div>
                        <p className="text-sm font-medium text-[#94A3B8]/70">
                            {t("scans_empty")}
                        </p>
                        {isManager && (
                            <p className="text-xs text-[#94A3B8]/40">
                                {t("scans_empty_hint")}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm font-bold text-[#E2E8F0]">
                            {t("scans_results")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 mt-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("scans_col_date")}</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("scans_col_address")}</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("scans_col_status")}</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("scans_col_period")}</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("scans_col_detections")}</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("scans_col_ai_result")}</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("scans_col_images")}</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-[#94A3B8]/60 uppercase tracking-wide">{t("scans_col_error")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {scans.map((scan) => (
                                        <tr key={scan.id} className="hover:bg-slate-950/60 transition-colors">
                                            <td className="px-5 py-3.5 text-[#94A3B8]/80 whitespace-nowrap">
                                                {formatDate(scan.createdAt)}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-[#94A3B8]/70 max-w-[200px] truncate">
                                                {scan.address ?? "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <Badge variant={statusBadgeVariant(scan.status)}>
                                                    {t(`scans_status_${scan.status}` as TranslationKey)}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                {scan.startDate && scan.endDate ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8]/70">
                                                        <span>{scan.startDate}</span>
                                                        <ArrowRight className="w-3 h-3 shrink-0 text-[#94A3B8]/40" />
                                                        <span>{scan.endDate}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-[#94A3B8]/30">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 font-medium text-[#E2E8F0]">
                                                {scan.status === "completed"
                                                    ? scan.detectionsCount
                                                    : "—"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {scan.status === "failed" ? (
                                                    <Badge variant="high">{t("scans_failed_badge")}</Badge>
                                                ) : scan.status === "analyzing" ? (
                                                    <Badge variant="pending">{t("scans_analyzing_badge")}</Badge>
                                                ) : scan.status === "completed" && scan.detectionsCount > 0 ? (
                                                    <Badge variant="active">
                                                        &#10003; {scan.detectionsCount} detection{scan.detectionsCount > 1 ? "s" : ""}
                                                    </Badge>
                                                ) : scan.status === "completed" && scan.detectionsCount === 0 ? (
                                                    <Badge variant="secondary">{t("scans_no_change")}</Badge>
                                                ) : (
                                                    <span className="text-[#94A3B8]/30">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {scan.beforeImageKey && scan.afterImageKey ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs px-2.5 border-[#137fec]/40 text-[#137fec] hover:bg-[#137fec]/5"
                                                        onClick={() => setCompareScan(scan)}
                                                    >
                                                        <Layers className="w-3.5 h-3.5" />
                                                        {t("scans_compare")}
                                                    </Button>
                                                ) : (
                                                    <span className="text-[#94A3B8]/30">—</span>
                                                )}
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

            {/* ---------------------------------------------------------------- */}
            {/* Trigger scan dialog                                               */}
            {/* ---------------------------------------------------------------- */}
            <Dialog open={triggerDialogOpen} onOpenChange={setTriggerDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{t("scans_new")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Mode selector */}
                        <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
                            {([
                                { value: "municipality" as const, label: t("scans_municipality") },
                                { value: "address" as const, label: t("scans_address") },
                                { value: "coordinates" as const, label: t("scans_coordinates") },
                            ]).map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setScanMode(opt.value)}
                                    className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors ${
                                        scanMode === opt.value
                                            ? "bg-slate-900 text-[#137fec] shadow-none"
                                            : "text-[#94A3B8]/60 hover:text-[#94A3B8]"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {scanMode === "municipality" && (
                            <p className="text-sm text-[#94A3B8]/70 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                {t("scans_municipality_warning")}
                            </p>
                        )}

                        {scanMode === "address" && (
                            <>
                                <Input
                                    label={t("scans_address")}
                                    placeholder={t("scans_address_placeholder")}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-[#94A3B8]/50">
                                    {t("scans_address_hint")}
                                </p>
                            </>
                        )}

                        {scanMode === "coordinates" && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label={t("scans_lat_label")}
                                        type="number"
                                        step="any"
                                        placeholder="45.4765"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label={t("scans_lng_label")}
                                        type="number"
                                        step="any"
                                        placeholder="-75.7013"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-[#94A3B8]/50">
                                    {t("scans_coord_hint")}
                                </p>
                            </>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="date"
                                label={t("scans_start_date")}
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate}
                            />
                            <Input
                                type="date"
                                label={t("scans_end_date")}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                                max={getDefaultEndDate()}
                            />
                        </div>

                        {triggerError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>{triggerError}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setTriggerDialogOpen(false)}
                            disabled={triggerLoading}
                        >
                            {t("cancel")}
                        </Button>
                        <Button
                            onClick={handleTriggerScan}
                            disabled={
                                triggerLoading || !startDate || !endDate ||
                                (scanMode === "address" && !address.trim()) ||
                                (scanMode === "coordinates" && (!latitude || !longitude))
                            }
                        >
                            {triggerLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ScanLine className="w-4 h-4" />
                            )}
                            {t("scans_launch")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---------------------------------------------------------------- */}
            {/* Image comparator dialog                                           */}
            {/* ---------------------------------------------------------------- */}
            <Dialog open={compareScan !== null} onOpenChange={(open) => { if (!open) setCompareScan(null); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg">{t("scans_comparison")}</DialogTitle>
                        {compareScan?.address && (
                            <p className="text-sm text-[#94A3B8]/60">{compareScan.address}</p>
                        )}
                        {compareScan?.startDate && compareScan?.endDate && (
                            <p className="text-xs text-[#94A3B8]/40">{compareScan.startDate} → {compareScan.endDate}</p>
                        )}
                    </DialogHeader>

                    {compareScan?.beforeImageKey && compareScan?.afterImageKey ? (
                        <ImageComparator
                            beforeSrc={`${API_BASE_URL}/images/${compareScan.beforeImageKey}`}
                            afterSrc={`${API_BASE_URL}/images/${compareScan.afterImageKey}`}
                            beforeLabel={compareScan.startDate ? `AVANT (${compareScan.startDate})` : "AVANT"}
                            afterLabel={compareScan.endDate ? `APRÈS (${compareScan.endDate})` : "APRÈS"}
                        />
                    ) : (
                        <div className="flex items-center justify-center py-12 text-sm text-[#94A3B8]/40">
                            {t("scans_no_images")}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
