import { AlertList } from "@/app/components/dashboard/AlertList";
import { MapView } from "@/app/components/dashboard/MapView";

export default function DashboardPage() {
    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Map fills the entire content area */}
            <MapView className="absolute inset-0 w-full h-full" />

            {/* Alert list floats over the left side of the map */}
            <div className="absolute top-3 left-3 bottom-3 z-[500] w-72 flex flex-col pointer-events-auto">
                <div className="flex flex-col h-full bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700/60 overflow-hidden">
                    <AlertList />
                </div>
            </div>
        </div>
    );
}
