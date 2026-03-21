import { useState } from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface MapLegendProps {
    className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div
            className={cn(
                "absolute bottom-6 left-4 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden",
                className
            )}
            style={{ minWidth: "160px", maxWidth: "200px" }}
        >
            {/* Header */}
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#008B8B]/8 hover:bg-[#008B8B]/12 transition-colors"
            >
                <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#008B8B]" />
                    <span className="text-xs font-bold text-[#1A2332]">Légende</span>
                </div>
                {expanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-[#2A3A4E]/50" />
                ) : (
                    <ChevronUp className="w-3.5 h-3.5 text-[#2A3A4E]/50" />
                )}
            </button>

            {expanded && (
                <div className="px-3 py-2.5 space-y-3">
                    {/* Risk levels */}
                    <div>
                        <p className="text-[10px] text-[#2A3A4E]/50 uppercase font-semibold tracking-wide mb-1.5">
                            Niveau de risque
                        </p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500 shrink-0 border-2 border-white shadow-sm" />
                                <span className="text-xs text-[#1A2332]">Élevé</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0 border-2 border-white shadow-sm" />
                                <span className="text-xs text-[#1A2332]">Moyen</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-green-500 shrink-0 border-2 border-white shadow-sm" />
                                <span className="text-xs text-[#1A2332]">Faible</span>
                            </div>
                        </div>
                    </div>

                    {/* WMS layers */}
                    <div>
                        <p className="text-[10px] text-[#2A3A4E]/50 uppercase font-semibold tracking-wide mb-1.5">
                            Calques WMS
                        </p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1.5 rounded-full bg-[#008B8B] shrink-0" />
                                <span className="text-xs text-[#1A2332]">Cadastre</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                <span className="text-xs text-[#1A2332]">Limites mun.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-1.5 rounded-full bg-sky-400 shrink-0" />
                                <span className="text-xs text-[#1A2332]">Hydrographie</span>
                            </div>
                        </div>
                    </div>

                    {/* Status indicators */}
                    <div>
                        <p className="text-[10px] text-[#2A3A4E]/50 uppercase font-semibold tracking-wide mb-1.5">
                            Statut
                        </p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-sm bg-blue-400 shrink-0" />
                                <span className="text-xs text-[#1A2332]">À analyser</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-sm bg-purple-400 shrink-0" />
                                <span className="text-xs text-[#1A2332]">À inspecter</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-sm bg-gray-300 shrink-0" />
                                <span className="text-xs text-[#1A2332]">Clôturée</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
