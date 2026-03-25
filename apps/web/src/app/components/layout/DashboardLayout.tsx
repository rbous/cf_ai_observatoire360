import { Outlet } from "react-router-dom";
import { Topbar } from "@/app/components/dashboard/Topbar";
import { Sidebar } from "@/app/components/dashboard/Sidebar";

const SIDEBAR_WIDTH = 192; // w-48 = 12rem = 192px
const TOPBAR_HEIGHT = 56;  // h-14 = 3.5rem = 56px

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-[#0F172A]">
            {/* Fixed top bar */}
            <Topbar />

            {/* Fixed left sidebar */}
            <Sidebar />

            {/* Main content area — fills space to the right of sidebar, below topbar */}
            <main
                className="fixed bottom-0 overflow-hidden"
                style={{
                    top: TOPBAR_HEIGHT,
                    left: SIDEBAR_WIDTH,
                    right: 0,
                }}
            >
                <div className="h-full w-full overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
