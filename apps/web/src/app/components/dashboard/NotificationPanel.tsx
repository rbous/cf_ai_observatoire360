import { AlertTriangle, Calendar, FileText, Bell, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/app/lib/cn";

interface Notification {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
    href?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: "n1",
        icon: AlertTriangle,
        iconColor: "text-red-600",
        iconBg: "bg-red-50",
        title: "Nouvelle alerte détectée",
        description: "Secteur Nord — 45 Rue Bowen",
        timestamp: "Il y a 5 min",
        read: false,
        href: "/tableau-de-bord/alertes/ALT-001",
    },
    {
        id: "n2",
        icon: AlertTriangle,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-50",
        title: "Alerte — risque moyen",
        description: "Secteur Est — 12 Ave du Plateau",
        timestamp: "Il y a 32 min",
        read: false,
        href: "/tableau-de-bord/alertes/ALT-002",
    },
    {
        id: "n3",
        icon: Calendar,
        iconColor: "text-[#008B8B]",
        iconBg: "bg-[#008B8B]/10",
        title: "Inspection planifiée",
        description: "Lot 123-456 — demain à 9h00",
        timestamp: "Il y a 1 h",
        read: false,
        href: "/tableau-de-bord/planification",
    },
    {
        id: "n4",
        icon: FileText,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
        title: "Rapport mensuel disponible",
        description: "Rapport Mars 2026 prêt à consulter",
        timestamp: "Hier",
        read: true,
        href: "/tableau-de-bord/rapports",
    },
    {
        id: "n5",
        icon: CheckCircle,
        iconColor: "text-green-600",
        iconBg: "bg-green-50",
        title: "Inspection complétée",
        description: "ALT-009 — Lot 456-789 clôturée",
        timestamp: "Hier",
        read: true,
        href: "/tableau-de-bord/alertes/ALT-009",
    },
    {
        id: "n6",
        icon: AlertTriangle,
        iconColor: "text-red-600",
        iconBg: "bg-red-50",
        title: "Infraction confirmée",
        description: "Secteur Sud — 88 Chemin des Pins",
        timestamp: "2 jours",
        read: true,
        href: "/tableau-de-bord/alertes/ALT-007",
    },
];

interface NotificationPanelProps {
    open?: boolean;
    onClose?: () => void;
}

export function NotificationPanel({ open = true, onClose }: NotificationPanelProps) {
    const navigate = useNavigate();
    const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

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
                {MOCK_NOTIFICATIONS.map((notif) => {
                    const Icon = notif.icon;
                    return (
                        <button
                            key={notif.id}
                            onClick={() => notif.href && navigate(notif.href)}
                            className={cn(
                                "w-full flex items-start gap-3 px-4 py-3 text-left",
                                "hover:bg-gray-50 transition-colors border-b border-gray-50",
                                !notif.read && "bg-[#008B8B]/3"
                            )}
                        >
                            {/* Icon */}
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", notif.iconBg)}>
                                <Icon className={cn("w-4 h-4", notif.iconColor)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                    <p className={cn(
                                        "text-xs leading-snug text-[#1A2332]",
                                        !notif.read ? "font-semibold" : "font-medium"
                                    )}>
                                        {notif.title}
                                    </p>
                                    {!notif.read && (
                                        <span className="w-2 h-2 rounded-full bg-[#008B8B] shrink-0 mt-1" />
                                    )}
                                </div>
                                <p className="text-[11px] text-[#2A3A4E]/50 mt-0.5 truncate">{notif.description}</p>
                                <p className="text-[10px] text-[#2A3A4E]/40 mt-1">{notif.timestamp}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-gray-100 shrink-0">
                <button className="w-full text-xs text-[#008B8B] font-medium hover:underline">
                    Tout marquer comme lu
                </button>
            </div>
        </aside>
    );
}
