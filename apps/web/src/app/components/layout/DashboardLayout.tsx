import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Topbar } from "@/app/components/dashboard/Topbar";
import { Sidebar } from "@/app/components/dashboard/Sidebar";
import { ChatPanel } from "@/app/components/dashboard/ChatPanel";

const SIDEBAR_WIDTH = 192; // w-48 = 12rem = 192px
const TOPBAR_HEIGHT = 56;  // h-14 = 3.5rem = 56px

export default function DashboardLayout() {
    const [chatOpen, setChatOpen] = useState(false);

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

            {/* Chat panel (slides in from the right) */}
            <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

            {/* Floating chat button — hidden when panel is open */}
            {!chatOpen && (
                <button
                    onClick={() => setChatOpen(true)}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-colors hover:bg-blue-500"
                    aria-label="Open AI Assistant"
                >
                    <MessageCircle size={24} className="text-white" />
                </button>
            )}
        </div>
    );
}
