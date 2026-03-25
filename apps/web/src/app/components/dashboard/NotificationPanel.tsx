import { useEffect } from "react";
import { AlertTriangle, Calendar, FileText, Bell, CheckCircle, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/app/lib/cn";
import { useNotifications } from "@/app/hooks/useNotifications";
import { useLanguage } from "@/app/hooks/useLanguage";
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
        iconColor: "text-red-400",
        iconBg: "bg-red-950/50",
    },
    status_change: {
        Icon: CheckCircle,
        iconColor: "text-[#137fec]",
        iconBg: "bg-[#137fec]/10",
    },
    inspection_due: {
        Icon: Calendar,
        iconColor: "text-[#137fec]",
        iconBg: "bg-[#137fec]/10",
    },
    system: {
        Icon: FileText,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-950/50",
    },
};

/** Format a Unix timestamp (ms or s) into a relative label */
function formatTimestamp(createdAt: number, locale: string): string {
    // API createdAt is in milliseconds (consistent with other entities)
    const now = Date.now();
    const ms = createdAt > 1e12 ? createdAt : createdAt * 1000;
    const diffMs = now - ms;
    const diffMin = Math.floor(diffMs / 60_000);
    if (locale === "en") {
        if (diffMin < 1) return "Just now";
        if (diffMin < 60) return `${diffMin} min ago`;
        const diffH = Math.floor(diffMin / 60);
        if (diffH < 24) return `${diffH} h ago`;
        const diffD = Math.floor(diffH / 24);
        if (diffD === 1) return "Yesterday";
        return `${diffD} days ago`;
    }
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
    const { t, locale } = useLanguage();
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
                "bg-slate-900 border-l border-slate-700 shadow-none",
                "transition-transform duration-300",
                !open && "translate-x-full",
                open && "translate-x-0"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#137fec]" />
                    <h2 className="font-bold text-sm text-[#E2E8F0]">{t("notifications_title")}</h2>
                    {unreadCount > 0 && (
                        <span className="min-w-[18px] h-4.5 flex items-center justify-center rounded-full bg-[#DC2626] text-white text-[10px] font-bold px-1">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
                        aria-label={t("notifications_hide")}
                    >
                        <X className="w-4 h-4 text-[#94A3B8]/50" />
                    </button>
                )}
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32 gap-2 text-[#94A3B8]/40">
                        <Loader2 className="w-4 h-4 animate-spin text-[#137fec]" />
                        <span className="text-xs">{t("notifications_loading")}</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-xs text-[#94A3B8]/40">
                        {t("notifications_empty")}
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
                                    "hover:bg-slate-800 transition-colors border-b border-slate-800",
                                    !notif.isRead && "bg-[#137fec]/3"
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
                                            "text-xs leading-snug text-[#E2E8F0]",
                                            !notif.isRead ? "font-semibold" : "font-medium"
                                        )}>
                                            {notif.title}
                                        </p>
                                        {!notif.isRead && (
                                            <span className="w-2 h-2 rounded-full bg-[#137fec] shrink-0 mt-1" />
                                        )}
                                    </div>
                                    <p className="text-[11px] text-[#94A3B8]/50 mt-0.5 truncate">{notif.message}</p>
                                    <p className="text-[10px] text-[#94A3B8]/40 mt-1">{formatTimestamp(notif.createdAt, locale)}</p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-slate-800 shrink-0">
                <button
                    onClick={markAllAsRead}
                    className="w-full text-xs text-[#137fec] font-medium hover:underline"
                >
                    {t("notifications_mark_all_read")}
                </button>
            </div>
        </aside>
    );
}
