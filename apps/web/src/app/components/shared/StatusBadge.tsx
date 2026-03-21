import type { AlertStatus } from "@observatoire360/shared";
import { ALERT_STATUS_LABELS } from "@observatoire360/shared";
import { cn } from "@/app/lib/cn";

interface StatusBadgeProps {
    status: AlertStatus;
    className?: string;
}

const STATUS_STYLES: Record<AlertStatus, string> = {
    a_analyser: "bg-blue-100 text-blue-700 border border-blue-200",
    a_inspecter: "bg-purple-100 text-purple-700 border border-purple-200",
    en_cours: "bg-amber-100 text-amber-700 border border-amber-200",
    infraction_confirmee: "bg-red-100 text-red-700 border border-red-200",
    cloturee: "bg-gray-100 text-gray-600 border border-gray-200",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                STATUS_STYLES[status],
                className
            )}
        >
            {ALERT_STATUS_LABELS[status]}
        </span>
    );
}
