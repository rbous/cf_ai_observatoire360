import { useState } from "react";
import { Layers, Map, Droplets, Eye } from "lucide-react";
import { WMS_LAYERS } from "@observatoire360/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/cn";
import { useLanguage } from "@/app/hooks/useLanguage";

type LayerKey = keyof typeof WMS_LAYERS;

interface LayerState {
    enabled: boolean;
    opacity: number;
}

type LayerStates = Record<LayerKey, LayerState>;

function buildInitialState(): LayerStates {
    const state: Partial<LayerStates> = {};
    (Object.keys(WMS_LAYERS) as LayerKey[]).forEach((key) => {
        state[key] = { enabled: false, opacity: 80 };
    });
    // Enable cadastre and limites by default
    state["cadastre"] = { enabled: true, opacity: 80 };
    state["limites_municipales"] = { enabled: true, opacity: 80 };
    return state as LayerStates;
}

export function LayersPanel() {
    const [layers, setLayers] = useState<LayerStates>(buildInitialState);
    const [applied, setApplied] = useState(false);
    const { t } = useLanguage();

    const LAYER_CATEGORIES: { label: string; icon: React.ComponentType<{ className?: string }>; keys: LayerKey[] }[] = [
        {
            label: t("layers_cat_cadastre"),
            icon: Map,
            keys: ["cadastre", "limites_municipales", "adresses"],
        },
        {
            label: t("layers_cat_environment"),
            icon: Droplets,
            keys: ["hydrographie", "ecoforestiere", "courbes_niveau"],
        },
        {
            label: t("layers_cat_imagery"),
            icon: Eye,
            keys: ["orthophotos"],
        },
    ];

    function toggleLayer(key: LayerKey) {
        setLayers((prev) => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled },
        }));
        setApplied(false);
    }

    function setOpacity(key: LayerKey, value: number) {
        setLayers((prev) => ({
            ...prev,
            [key]: { ...prev[key], opacity: value },
        }));
        setApplied(false);
    }

    function handleApply() {
        setApplied(true);
        // In a real app, emit changes to the MapView via context/store
    }

    const activeCount = Object.values(layers).filter((l) => l.enabled).length;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-xl font-black uppercase text-[#E2E8F0]">{t("layers_title")}</h1>
                <p className="text-sm text-[#94A3B8]/60 mt-0.5">
                    {t("layers_subtitle")}
                </p>
            </div>

            {/* Apply banner */}
            <div className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all",
                applied
                    ? "bg-green-50 border-green-200"
                    : "bg-[#137fec]/5 border-[#137fec]/20"
            )}>
                <div>
                    <p className="text-sm font-semibold text-[#E2E8F0]">
                        {activeCount} {activeCount !== 1 ? t("layers_active_count_many") : t("layers_active_count_one")}
                    </p>
                    <p className="text-xs text-[#94A3B8]/50">
                        {applied ? t("layers_applied") : t("layers_pending")}
                    </p>
                </div>
                <Button onClick={handleApply} size="sm" className={applied ? "bg-green-600 hover:bg-green-700" : ""}>
                    {applied ? t("layers_applied_check") : t("layers_apply")}
                </Button>
            </div>

            {/* Categories */}
            <div className="space-y-5">
                {LAYER_CATEGORIES.map(({ label, icon: Icon, keys }) => (
                    <Card key={label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-[#E2E8F0] flex items-center gap-2">
                                <Icon className="w-4 h-4 text-[#137fec]" />
                                {label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {keys.map((key) => {
                                const layer = WMS_LAYERS[key];
                                const state = layers[key];
                                return (
                                    <div
                                        key={key}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all",
                                            state.enabled
                                                ? "bg-[#137fec]/5 border-[#137fec]/20"
                                                : "bg-slate-950 border-slate-800"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "w-3 h-3 rounded-full border-2 border-white shadow-none",
                                                        state.enabled ? "bg-[#137fec]" : "bg-gray-300"
                                                    )}
                                                />
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    state.enabled ? "text-[#E2E8F0]" : "text-[#94A3B8]/50"
                                                )}>
                                                    {layer.label}
                                                </span>
                                            </div>

                                            {/* Toggle switch */}
                                            <button
                                                onClick={() => toggleLayer(key)}
                                                className={cn(
                                                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                                                    state.enabled ? "bg-[#137fec]" : "bg-gray-300"
                                                )}
                                                role="switch"
                                                aria-checked={state.enabled}
                                            >
                                                <span
                                                    className={cn(
                                                        "absolute left-0.5 inline-block h-4 w-4 rounded-full bg-slate-900 shadow-none transition-transform",
                                                        state.enabled ? "translate-x-4" : "translate-x-0"
                                                    )}
                                                />
                                            </button>
                                        </div>

                                        {/* Opacity slider */}
                                        {state.enabled && (
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-[#94A3B8]/50 font-medium w-14 shrink-0">
                                                    {t("layers_opacity")}
                                                </span>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    value={state.opacity}
                                                    onChange={(e) => setOpacity(key, Number(e.target.value))}
                                                    className="flex-1 h-1.5 accent-[#137fec] cursor-pointer"
                                                />
                                                <span className="text-[10px] text-[#94A3B8]/50 font-mono w-8 text-right shrink-0">
                                                    {state.opacity}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Source info */}
            <Card className="bg-slate-950 border-slate-800">
                <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-2">
                        <Layers className="w-4 h-4 text-[#94A3B8]/40 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-semibold text-[#94A3B8]/60">{t("layers_source_title")}</p>
                            <p className="text-xs text-[#94A3B8]/40 mt-0.5">
                                {t("layers_source_desc")}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
