import { useEffect } from "react";
import { AlertTriangle, Calendar, FileText, Bell, CheckCircle, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/app/lib/cn";
import { useNotifications } from "@/app/hooks/useNotifications";
import type { NotificationType } from "@observatoire360/shared";

// Map API notification type to display icon and colours
const TYPE_META: Record<
    NotificationType,
    {
        Icon: React.ComponentType<{ className?: string }>;
        iconColor: string;
        iconBg: string;
    }
> = {
    new_alert: {
        Icon: AlertTriangle,
        iconColor: "text-red-600",
        iconBg: "bg-red-50",
    },
    status_change: {
        Icon: CheckCircle,
        iconColor: "text-[#008B8B]",
        iconBg: "bg-[#008B8B]/10",
    },
    inspection_due: {
        Icon: Calendar,
        iconColor: "text-[#008B8B]",
        iconBg: "bg-[#008B8B]/10",
    },
    system: {
        Icon: FileText,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
    },
};

/** Format a Unix timestamp (ms or s) into a relative French label */
function formatTimestamp(createdAt: number): string {
    // API createdAt is in milliseconds (consistent with other entities)
    const now = Date.now();
    const ms = createdAt > 1e12 ? createdAt : createdAt * 1000;
    const diffMs = now - ms;
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return "Hier";
    return `${diffD} jours`;
}

interface NotificationPanelProps {
    open?: boolean;
    onClose?: () => void;
}

export function NotificationPanel({ open = true, onClose }: NotificationPanelProps) {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotifications();

    // Fetch the notifications list on mount
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <aside
            className={cn(
                "fixed right-0 top-16 bottom-0 z-40 w-72 flex flex-col",
                "bg-white border-l border-gray-200 shadow-sm",
                "transition-transform duration-300",
                !open && "translate-x-full",
                open && "translate-x-0"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#008B8B]" />
                    <h2 className="font-bold text-sm text-[#1A2332]">Notifications</h2>
                    {unreadCount > 0 && (
                        <span className="min-w-[18px] h-4.5 flex items-center justify-center rounded-full bg-[#DC2626] text-white text-[10px] font-bold px-1">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Masquer les notifications"
                    >
                        <X className="w-4 h-4 text-[#2A3A4E]/50" />
                    </button>
                )}
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32 gap-2 text-[#2A3A4E]/40">
                        <Loader2 className="w-4 h-4 animate-spin text-[#008B8B]" />
                        <span className="text-xs">Chargement…</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-xs text-[#2A3A4E]/40">
                        Aucune notification
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const meta = TYPE_META[notif.type] ?? TYPE_META.system;
                        const { Icon, iconColor, iconBg } = meta;
                        const href = notif.alertId
                            ? `/tableau-de-bord/alertes/${notif.alertId}`
                            : undefined;

                        return (
                            <button
                                key={notif.id}
                                onClick={() => {
                                    if (!notif.isRead) {
                                        markAsRead(notif.id);
                                    }
                                    if (href) navigate(href);
                                }}
                                className={cn(
                                    "w-full flex items-start gap-3 px-4 py-3 text-left",
                                    "hover:bg-gray-50 transition-colors border-b border-gray-50",
                                    !notif.isRead && "bg-[#008B8B]/3"
                                )}
                            >
                                {/* Icon */}
                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", iconBg)}>
                                    <Icon className={cn("w-4 h-4", iconColor)} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1">
                                        <p className={cn(
                                            "text-xs leading-snug text-[#1A2332]",
                                            !notif.isRead ? "font-semibold" : "font-medium"
                                        )}>
                                            {notif.title}
                                        </p>
                                        {!notif.isRead && (
                                            <span className="w-2 h-2 rounded-full bg-[#008B8B] shrink-0 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[#2A3A4E]/50 mt-0.5 truncate">{notif.message}</p>
                                    <p className="text-[10px] text-[#2A3A4E]/40 mt-1">{formatTimestamp(notif.createdAt)}</p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
                <button
                    onClick={markAllAsRead}
                    className="w-full text-xs text-[#008B8B] font-medium hover:underline"
                >
                    Tout marquer comme lu
                </button>
            </div>
        </aside>
    );
}
