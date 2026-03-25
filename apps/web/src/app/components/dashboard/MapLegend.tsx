import { useState } from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { cn } from "@/app/lib/cn";
import { useLanguage } from "@/app/hooks/useLanguage";

interface MapLegendProps {
    className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
    const [expanded, setExpanded] = useState(true);
    const { t } = useLanguage();

    return (
        <div
            className={cn(
                "absolute bottom-6 left-4 z-[1000] bg-slate-900 rounded-xl shadow-none border border-slate-700 overflow-hidden",
                className
            )}
            style={{ minWidth: "160px", maxWidth: "200px" }}
        >
            {/* Header */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#6366F1]/8 hover:bg-[#6366F1]/12 transition-colors"
            >
                <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#6366F1]" />
                    <span className="text-xs font-bold text-[#E2E8F0]">{t("legend_title")}</span>
                </div>
                {expanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]/50" />
                ) : (
                    <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]/50" />
                )}
            </button>

            {expanded && (
                <div className="px-3 py-2.5 space-y-3">
                    {/* Risk levels */}
                    <div>
                        <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-1.5">
                            {t("legend_risk_level")}
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0 border-2 border-white shadow-none" />
                                <span className="text-xs text-[#E2E8F0]">{t("risk_high")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0 border-2 border-white shadow-none" />
                                <span className="text-xs text-[#E2E8F0]">{t("risk_medium")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0 border-2 border-white shadow-none" />
                                <span className="text-xs text-[#E2E8F0]">{t("risk_low")}</span>
                            </div>
                        </div>
                    </div>

                    {/* WMS layers */}
                    <div>
                        <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-1.5">
                            {t("legend_wms_layers")}
                        </p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1.5 rounded-full bg-[#6366F1] shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("legend_cadastre")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("legend_city_limits")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("legend_hydrography")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status indicators */}
                    <div>
                        <p className="text-[10px] text-[#94A3B8]/50 uppercase font-semibold tracking-wide mb-1.5">
                            {t("legend_status")}
                        </p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-sm bg-blue-400 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("status_a_analyser")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-sm bg-purple-400 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("status_a_inspecter")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-sm bg-gray-300 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("status_cloturee")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
