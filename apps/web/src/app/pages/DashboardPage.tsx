import { AlertList } from "@/app/components/dashboard/AlertList";
import { MapView } from "@/app/components/dashboard/MapView";

export default function DashboardPage() {
    return (
        <div className="flex h-full w-full">
            {/* Left: Alert list (~1/3) */}
            <div className="w-72 shrink-0 h-full overflow-hidden">
                <AlertList />
            </div>

            {/* Right: Full map (~2/3) */}
            <div className="flex-1 h-full relative">
                <MapView className="w-full h-full" />
            </div>
        </div>
    );
}
