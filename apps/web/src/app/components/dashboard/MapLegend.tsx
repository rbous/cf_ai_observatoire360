import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
                "absolute bottom-6 right-4 z-[1000] bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-700/60 overflow-hidden",
                className
            )}
            style={{ minWidth: "150px", maxWidth: "185px" }}
        >
            {/* Header */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800/60 transition-colors"
            >
                <span className="text-xs font-bold text-[#E2E8F0]">{t("legend_title")}</span>
                {expanded ? (
                    <ChevronDown className="w-3 h-3 text-[#94A3B8]/50" />
                ) : (
                    <ChevronUp className="w-3 h-3 text-[#94A3B8]/50" />
                )}
            </button>

            {expanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-slate-700/60 pt-2">
                    {/* Risk levels */}
                    <div>
                        <p className="text-[10px] text-[#94A3B8]/60 uppercase font-semibold tracking-wider mb-2">
                            {t("legend_risk_level")}
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("risk_high")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("risk_medium")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("risk_low")}</span>
                            </div>
                        </div>
                    </div>

                    {/* WMS layers */}
                    <div>
                        <p className="text-[10px] text-[#94A3B8]/60 uppercase font-semibold tracking-wider mb-2">
                            {t("legend_wms_layers")}
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1 rounded-full bg-[#137fec] shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("legend_cadastre")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1 rounded-full bg-blue-400 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("legend_city_limits")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1 rounded-full bg-sky-400 shrink-0" />
                                <span className="text-xs text-[#E2E8F0]">{t("legend_hydrography")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
