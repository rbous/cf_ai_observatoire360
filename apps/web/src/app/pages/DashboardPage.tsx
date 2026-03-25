import { BrainCircuit } from "lucide-react";
import { AlertList } from "@/app/components/dashboard/AlertList";
import { MapView } from "@/app/components/dashboard/MapView";
import { useAlerts } from "@/app/hooks/useAlerts";

export default function DashboardPage() {
    const { alerts } = useAlerts();
    const aiDetectionCount = alerts.filter((a) => a.scanJobId !== null).length;

    return (
        <div className="flex flex-col h-full w-full">
            {/* AI pipeline banner */}
            {aiDetectionCount > 0 && (
                <div
                    className="shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white"
                    style={{ background: "#008B8B" }}
                >
                    <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
                    Pipeline IA active — {aiDetectionCount} detection{aiDetectionCount > 1 ? "s" : ""} automatique{aiDetectionCount > 1 ? "s" : ""}
                </div>
            )}

            <div className="flex flex-1 min-h-0 w-full">
                {/* Left: Alert list (~1/3) */}
                <div className="w-72 shrink-0 h-full overflow-hidden">
                    <AlertList />
                </div>

                {/* Right: Full map (~2/3) */}
                <div className="flex-1 h-full relative">
                    <MapView className="w-full h-full" />
                </div>
            </div>
        </div>
    );
}
