import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2, BrainCircuit } from "lucide-react";
import type { RiskLevel, AlertStatus, AlertType } from "@observatoire360/shared";
import { RiskBadge } from "@/app/components/shared/RiskBadge";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/lib/cn";
import { useAlerts } from "@/app/hooks/useAlerts";
import { useLanguage } from "@/app/hooks/useLanguage";

const ALL_OPTION = "all";

export function AlertList() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<AlertStatus | "all">(ALL_OPTION);
    const [filterRisk, setFilterRisk] = useState<RiskLevel | "all">(ALL_OPTION);
    const [filterType, setFilterType] = useState<AlertType | "all">(ALL_OPTION);

    const { alerts, total, isLoading, error } = useAlerts({
        search: search || undefined,
        status: filterStatus !== ALL_OPTION ? filterStatus : undefined,
        riskLevel: filterRisk !== ALL_OPTION ? filterRisk : undefined,
        type: filterType !== ALL_OPTION ? filterType : undefined,
    });

    const RISK_LEVEL_LABELS_I18N: Record<RiskLevel, string> = {
        high: t("risk_high"),
        medium: t("risk_medium"),
        low: t("risk_low"),
    };

    const ALERT_STATUS_LABELS_I18N: Record<AlertStatus, string> = {
        a_analyser: t("status_a_analyser"),
        a_inspecter: t("status_a_inspecter"),
        en_cours: t("status_en_cours"),
        infraction_confirmee: t("status_infraction_confirmee"),
        cloturee: t("status_cloturee"),
    };

    const ALERT_TYPE_LABELS_I18N: Record<AlertType, string> = {
        construction: t("type_construction"),
        extension: t("type_extension"),
        annexe: t("type_annexe"),
        piscine: t("type_piscine"),
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-[#E2E8F0]">
                        {t("dashboard_alerts")}{" "}
                        <span className="text-[#6366F1] font-black">{isLoading ? "…" : total}</span>
                    </h2>
                    <SlidersHorizontal className="w-4 h-4 text-[#94A3B8]/40" />
                </div>

                {/* Search */}
                <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]/40" />
                    <input
                        type="text"
                        placeholder={t("dashboard_search_address")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-950 focus:outline-none focus:ring-1 focus:ring-[#6366F1] focus:border-[#6366F1] text-[#E2E8F0] placeholder:text-[#94A3B8]/40"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-1.5 flex-wrap">
                    <select
                        value={filterRisk}
                        onChange={(e) => setFilterRisk(e.target.value as RiskLevel | "all")}
                        className="flex-1 min-w-0 text-xs border border-slate-700 rounded-lg px-2 py-1 bg-slate-900 text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                    >
                        <option value={ALL_OPTION}>{t("dashboard_all_risks")}</option>
                        {(["high", "medium", "low"] as RiskLevel[]).map((r) => (
                            <option key={r} value={r}>{RISK_LEVEL_LABELS_I18N[r]}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as AlertStatus | "all")}
                        className="flex-1 min-w-0 text-xs border border-slate-700 rounded-lg px-2 py-1 bg-slate-900 text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                    >
                        <option value={ALL_OPTION}>{t("dashboard_all_statuses")}</option>
                        {(["a_analyser", "a_inspecter", "en_cours", "infraction_confirmee", "cloturee"] as AlertStatus[]).map((s) => (
                            <option key={s} value={s}>{ALERT_STATUS_LABELS_I18N[s]}</option>
                        ))}
                    </select>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as AlertType | "all")}
                        className="flex-1 min-w-0 text-xs border border-slate-700 rounded-lg px-2 py-1 bg-slate-900 text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                    >
                        <option value={ALL_OPTION}>{t("dashboard_all_types")}</option>
                        {(["construction", "extension", "annexe", "piscine"] as AlertType[]).map((tp) => (
                            <option key={tp} value={tp}>{ALERT_TYPE_LABELS_I18N[tp]}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Alert items */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32 gap-2 text-[#94A3B8]/40">
                        <Loader2 className="w-4 h-4 animate-spin text-[#6366F1]" />
                        <span className="text-xs">{t("dashboard_loading_alerts")}</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-32 text-xs text-red-500 px-4 text-center">
                        {error}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-xs text-[#94A3B8]/40">
                        {t("dashboard_no_alerts")}
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <button
                            key={alert.id}
                            onClick={() => navigate(`/tableau-de-bord/alertes/${alert.id}`)}
                            className={cn(
                                "w-full flex flex-col gap-1.5 px-4 py-3 text-left",
                                "border-b border-gray-50 hover:bg-slate-950 transition-colors",
                                "focus:outline-none focus:bg-[#6366F1]/5"
                            )}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-[#6366F1]">{alert.id}</span>
                                <div className="flex items-center gap-1">
                                    <RiskBadge level={alert.riskLevel} />
                                    {alert.scanJobId !== null && (
                                        <Badge
                                            className="gap-0.5 px-1.5 py-0.5 text-[10px] font-bold leading-none"
                                            style={{ background: "#6366F1", color: "white", border: "none" }}
                                        >
                                            <BrainCircuit className="w-2.5 h-2.5 shrink-0" />
                                            {alert.confidence != null
                                                ? `IA ${Math.round(alert.confidence * 100)}%`
                                                : "IA"}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <p className="text-xs font-semibold text-[#E2E8F0] leading-snug">
                                {alert.address ?? `${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                                <StatusBadge status={alert.status} />
                                <span className="text-[10px] text-[#94A3B8]/40">
                                    {new Date(alert.detectedAt).toLocaleDateString("fr-CA")}
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
