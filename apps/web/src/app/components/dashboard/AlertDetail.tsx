import { useState } from "react";
import { ArrowLeft, MapPin, Calendar, FileText, User, Clock, CheckCircle, AlertTriangle, Image, Loader2, ScanLine, BrainCircuit } from "lucide-react";
import { api } from "@/app/lib/api";
import { ImageComparator } from "./ImageComparator";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { RiskBadge } from "@/app/components/shared/RiskBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import type { Alert, AlertStatus } from "@observatoire360/shared";
import { useApi } from "@/app/hooks/useApi";
import { API_BASE_URL } from "@/app/lib/constants";
import { useLanguage } from "@/app/hooks/useLanguage";

// ---------------------------------------------------------------------------
// Sub-component: prompt to analyze zone when no images exist
// ---------------------------------------------------------------------------

function AnalyzeZonePrompt({ alertId, latitude, longitude, address, onComplete }: {
    alertId: string;
    latitude: number;
    longitude: number;
    address: string | null;
    onComplete: () => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<"idle" | "success" | "polling" | "done" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const { t } = useLanguage();

    const today = new Date().toISOString().slice(0, 10);
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    async function handleAnalyze() {
        setIsLoading(true);
        setResult("idle");
        try {
            const res = await api.post<{ job: { id: string } }>("/scans/trigger", {
                mode: "coordinates",
                latitude,
                longitude,
                address: address ?? undefined,
                alertId,
                startDate: sixMonthsAgo,
                endDate: today,
            });
            setResult("polling");

            // Poll scan job until completed
            const jobId = res.job.id;
            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;
                try {
                    const job = await api.get<{ job: { status: string } }>(`/scans/${jobId}`);
                    if (job.job.status === "completed" || job.job.status === "failed") {
                        clearInterval(poll);
                        if (job.job.status === "completed") {
                            setResult("done");
                            onComplete();
                        } else {
                            setResult("error");
                            setErrorMsg(t("alert_analysis_failed"));
                        }
                        setIsLoading(false);
                    }
                } catch {
                    // Keep polling
                }
                if (attempts > 30) {
                    clearInterval(poll);
                    setResult("success");
                    setIsLoading(false);
                }
            }, 5000);
        } catch (err) {
            setResult("error");
            setErrorMsg(err instanceof Error ? err.message : t("alert_unexpected_error"));
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl bg-slate-950 border border-dashed border-slate-700">
            <Image className="w-10 h-10 text-[#94A3B8]/20 mb-3" />
            <p className="text-sm text-[#94A3B8]/60 mb-1 text-center">{t("alert_no_images")}</p>
            <p className="text-xs text-[#94A3B8]/40 mb-4 text-center">
                {t("alert_analyze_zone_sub")}
            </p>

            {result === "success" ? (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <CheckCircle className="w-4 h-4" />
                    {t("alert_analysis_launched")}
                </div>
            ) : result === "error" ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-2">
                    {errorMsg}
                </div>
            ) : null}

            {result !== "success" && (
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <ScanLine className="w-4 h-4" />
                    )}
                    {t("alert_analyze_zone")}
                </Button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------

const STATUS_OPTIONS: AlertStatus[] = [
    "a_analyser",
    "a_inspecter",
    "en_cours",
    "infraction_confirmee",
    "cloturee",
];

interface AlertDetailProps {
    alertId?: string;
}

export function AlertDetail({ alertId = "ALT-001" }: AlertDetailProps) {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { data: alert, isLoading, error, refetch } = useApi<Alert>(`/alerts/${alertId}`);
    const [currentStatus, setCurrentStatus] = useState<AlertStatus | null>(null);

    const effectiveStatus = currentStatus ?? alert?.status ?? "a_analyser";

    const ALERT_STATUS_LABELS_I18N: Record<AlertStatus, string> = {
        a_analyser: t("status_a_analyser"),
        a_inspecter: t("status_a_inspecter"),
        en_cours: t("status_en_cours"),
        infraction_confirmee: t("status_infraction_confirmee"),
        cloturee: t("status_cloturee"),
    };

    const ALERT_TYPE_LABELS_I18N: Record<string, string> = {
        construction: t("type_construction"),
        extension: t("type_extension"),
        annexe: t("type_annexe"),
        piscine: t("type_piscine"),
    };

    const eventColors = {
        detection: "text-red-500 bg-red-50",
        status: "text-[#6366F1] bg-[#6366F1]/10",
        assign: "text-blue-500 bg-blue-50",
        inspect: "text-amber-500 bg-amber-50",
    };

    if (isLoading) {
        return (
            <div className="min-h-full bg-slate-950 p-4 md:p-6 flex items-center justify-center">
                <div className="flex items-center gap-3 text-[#94A3B8]/60">
                    <Loader2 className="w-5 h-5 animate-spin text-[#6366F1]" />
                    <span className="text-sm font-medium">{t("alert_loading")}</span>
                </div>
            </div>
        );
    }

    if (error || !alert) {
        return (
            <div className="min-h-full bg-slate-950 p-4 md:p-6">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate("/tableau-de-bord")}
                        className="inline-flex items-center gap-1.5 text-sm text-[#6366F1] hover:underline mb-5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t("alert_back_to_map")}
                    </button>
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>{error ?? t("alert_not_found")}</span>
                    </div>
                </div>
            </div>
        );
    }

    const detectedAtDate = new Date(alert.detectedAt).toLocaleDateString("fr-CA");

    return (
        <div className="min-h-full bg-slate-950 p-4 md:p-6">
            <div className="max-w-5xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate("/tableau-de-bord")}
                    className="inline-flex items-center gap-1.5 text-sm text-[#6366F1] hover:underline mb-5"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t("alert_back_to_map")}
                </button>

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1 className="text-xl font-black uppercase text-[#E2E8F0]">
                                {t("alert_title")} {alert.id}
                            </h1>
                            <RiskBadge level={alert.riskLevel} />
                            <StatusBadge status={effectiveStatus} />
                        </div>
                        <p className="text-sm text-[#94A3B8]/60">{ALERT_TYPE_LABELS_I18N[alert.type] ?? alert.type}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={effectiveStatus}
                            onChange={(e) => setCurrentStatus(e.target.value as AlertStatus)}
                            className="text-sm border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-900 text-[#E2E8F0] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{ALERT_STATUS_LABELS_I18N[s]}</option>
                            ))}
                        </select>
                        <Button size="sm" variant="outline">
                            <User className="w-4 h-4" />
                            {t("alert_assign")}
                        </Button>
                        <Button size="sm">
                            <Calendar className="w-4 h-4" />
                            {t("alert_plan")}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Before / After images */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Image className="w-4 h-4 text-[#6366F1]" />
                                    {t("alert_comparison")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {alert.beforeImageKey && alert.afterImageKey ? (
                                    <div className="relative">
                                        {alert.scanJobId && (
                                            <div className="absolute inset-0 z-10 pointer-events-none rounded-xl border-2 border-red-500/60" />
                                        )}
                                        <ImageComparator
                                            beforeSrc={API_BASE_URL + "/images/" + alert.beforeImageKey}
                                            afterSrc={API_BASE_URL + "/images/" + alert.afterImageKey}
                                            beforeLabel="AVANT"
                                            afterLabel="APRÈS"
                                        />
                                        {alert.scanJobId && (
                                            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                                {t("alert_ai_detected")}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <AnalyzeZonePrompt
                                        alertId={alert.id}
                                        latitude={alert.latitude}
                                        longitude={alert.longitude}
                                        address={alert.address}
                                        onComplete={() => refetch()}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* AI analysis */}
                        {alert.scanJobId !== null && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                        <BrainCircuit className="w-4 h-4 text-[#6366F1]" />
                                        {t("alert_ai_analysis")}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Confidence */}
                                    <div>
                                        <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-1.5">
                                            {t("alert_ai_confidence")}
                                        </p>
                                        {alert.confidence != null ? (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-[#E2E8F0]">
                                                        {Math.round(alert.confidence * 100)} %
                                                    </span>
                                                    <span
                                                        className="text-xs font-medium"
                                                        style={{
                                                            color: alert.confidence >= 0.7
                                                                ? "#10B981"
                                                                : alert.confidence >= 0.4
                                                                    ? "#F59E0B"
                                                                    : "#DC2626",
                                                        }}
                                                    >
                                                        {alert.confidence >= 0.7
                                                            ? t("alert_ai_confidence_high")
                                                            : alert.confidence >= 0.4
                                                                ? t("alert_ai_confidence_medium")
                                                                : t("alert_ai_confidence_low")}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${Math.round(alert.confidence * 100)}%`,
                                                            background: alert.confidence >= 0.7
                                                                ? "#10B981"
                                                                : alert.confidence >= 0.4
                                                                    ? "#F59E0B"
                                                                    : "#DC2626",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[#94A3B8]/50 italic">
                                                {t("alert_ai_confidence_na")}
                                            </p>
                                        )}
                                    </div>

                                    {/* Source */}
                                    <div>
                                        <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-0.5">
                                            {t("alert_ai_source")}
                                        </p>
                                        <p className="text-xs text-[#94A3B8]/70">
                                            {t("alert_ai_source_desc")}
                                        </p>
                                    </div>

                                    {/* AI Summary */}
                                    {alert.aiSummary && (
                                        <div>
                                            <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-1">
                                                {t("alert_ai_summary")}
                                            </p>
                                            <div className="bg-[#6366F1]/5 border border-[#6366F1]/15 rounded-lg p-3">
                                                <p className="text-sm text-[#E2E8F0] leading-relaxed">
                                                    {alert.aiSummary}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Method */}
                                    <div>
                                        <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-0.5">
                                            {t("alert_ai_method")}
                                        </p>
                                        <p className="text-xs text-[#94A3B8]/70">
                                            {t("alert_ai_method_desc")}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Technical data */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <FileText className="w-4 h-4 text-[#6366F1]" />
                                    {t("alert_technical_data")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                                    {[
                                        {
                                            label: t("alert_detected_area"),
                                            value: alert.detectedArea != null ? `${alert.detectedArea} m²` : t("alert_not_available"),
                                        },
                                        {
                                            label: t("alert_authorized_area"),
                                            value: alert.authorizedArea != null && alert.authorizedArea > 0
                                                ? `${alert.authorizedArea} m²`
                                                : t("alert_not_applicable"),
                                        },
                                        {
                                            label: t("alert_zone"),
                                            value: alert.zone ?? t("alert_not_specified"),
                                        },
                                        {
                                            label: t("alert_permit"),
                                            value: alert.hasPermit ? t("alert_permit_yes") : t("alert_permit_no"),
                                        },
                                        {
                                            label: t("alert_coordinates"),
                                            value: `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`,
                                        },
                                        {
                                            label: t("alert_risk_score"),
                                            value: `${alert.riskScore}/100`,
                                        },
                                        ...(alert.confidence != null
                                            ? [{ label: t("alert_ai_confidence"), value: `${Math.round(alert.confidence * 100)} %` }]
                                            : []),
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide">{label}</p>
                                            <p className="text-sm font-medium text-[#E2E8F0] mt-0.5">{value}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action timeline */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-[#6366F1]" />
                                    {t("alert_history")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    {/* Vertical line */}
                                    <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-700" />

                                    <div className="space-y-4">
                                        {/* Detection event derived from detectedAt */}
                                        <div className="flex items-start gap-3 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${eventColors.detection}`}>
                                                <AlertTriangle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-xs font-semibold text-[#E2E8F0]">{t("alert_auto_detection")}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] text-[#94A3B8]/50">{detectedAtDate}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status creation event derived from createdAt */}
                                        <div className="flex items-start gap-3 relative">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${eventColors.status}`}>
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-xs font-semibold text-[#E2E8F0]">
                                                    {t("alert_created")} {ALERT_STATUS_LABELS_I18N[alert.status]}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] text-[#94A3B8]/50">
                                                        {new Date(alert.createdAt).toLocaleString("fr-CA")}
                                                    </p>
                                                    <span className="text-[10px] text-[#94A3B8]/40">— {t("alert_system")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right sidebar */}
                    <div className="space-y-4">
                        {/* Location */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-[#6366F1]" />
                                    {t("alert_location")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-0.5">{t("alert_address")}</p>
                                    <p className="text-sm text-[#E2E8F0] font-medium leading-snug">
                                        {alert.address ?? t("alert_address_unavailable")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-0.5">{t("alert_gps")}</p>
                                    <p className="text-xs font-mono text-[#E2E8F0]">
                                        {alert.latitude}, {alert.longitude}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => navigate("/tableau-de-bord")}
                                >
                                    {t("alert_view_on_map")}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Detection info */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-[#6366F1]" />
                                    {t("alert_detection")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-0.5">{t("alert_date")}</p>
                                    <p className="text-sm text-[#E2E8F0] font-medium">{detectedAtDate}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-0.5">{t("alert_method")}</p>
                                    <p className="text-xs text-[#94A3B8]/70">{t("alert_detection_method")}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick actions */}
                        <div className="space-y-2">
                            <Button className="w-full" size="sm">
                                {t("alert_generate_notice")}
                            </Button>
                            <Button variant="outline" className="w-full" size="sm">
                                {t("alert_schedule_inspection")}
                            </Button>
                            <Button variant="ghost" className="w-full" size="sm">
                                {t("alert_download_pdf")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
