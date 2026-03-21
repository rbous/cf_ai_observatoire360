import { useState } from "react";
import { Outlet } from "react-router-dom";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Topbar } from "@/app/components/dashboard/Topbar";
import { Sidebar } from "@/app/components/dashboard/Sidebar";
import { NotificationPanel } from "@/app/components/dashboard/NotificationPanel";
import { cn } from "@/app/lib/cn";

const SIDEBAR_WIDTH = 224; // w-56 = 14rem = 224px
const NOTIF_WIDTH = 288;   // w-72 = 18rem = 288px
const TOPBAR_HEIGHT = 64;  // h-16 = 4rem = 64px

export default function DashboardLayout() {
    const [notifOpen, setNotifOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed top bar */}
            <Topbar
                notificationCount={3}
                onNotificationToggle={() => setNotifOpen((v) => !v)}
            />

            {/* Fixed left sidebar */}
            <Sidebar />

            {/* Notification panel toggle button (desktop) */}
            <button
                onClick={() => setNotifOpen((v) => !v)}
                className={cn(
                    "fixed z-40 hidden md:flex items-center justify-center",
                    "w-6 h-10 rounded-l-lg bg-white border border-r-0 border-gray-200 shadow-sm",
                    "hover:bg-gray-50 transition-all duration-300",
                )}
                style={{
                    top: TOPBAR_HEIGHT + 24,
                    right: notifOpen ? NOTIF_WIDTH : 0,
                }}
                aria-label={notifOpen ? "Masquer les notifications" : "Afficher les notifications"}
            >
                {notifOpen ? (
                    <PanelRightOpen className="w-3.5 h-3.5 text-[#2A3A4E]/50" />
                ) : (
                    <PanelRightClose className="w-3.5 h-3.5 text-[#2A3A4E]/50" />
                )}
            </button>

            {/* Fixed right notification panel */}
            <NotificationPanel
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
            />

            {/* Main content area */}
            <main
                className={cn(
                    "transition-all duration-300",
                    "fixed top-16 bottom-0",
                )}
                style={{
                    left: SIDEBAR_WIDTH,
                    right: notifOpen ? NOTIF_WIDTH : 0,
                }}
            >
                {/* Inner scroll/fill container — pages that need scroll get it; map fills full height */}
                <div className="h-full w-full overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
