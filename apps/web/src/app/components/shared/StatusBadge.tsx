import type { AlertStatus } from "@observatoire360/shared";
import { cn } from "@/app/lib/cn";
import { useLanguage } from "@/app/hooks/useLanguage";

interface StatusBadgeProps {
    status: AlertStatus;
    className?: string;
}

const STATUS_STYLES: Record<AlertStatus, string> = {
    a_analyser: "bg-blue-100 text-blue-700 border border-blue-200",
    a_inspecter: "bg-purple-100 text-purple-700 border border-purple-200",
    en_cours: "bg-amber-100 text-amber-700 border border-amber-200",
    infraction_confirmee: "bg-red-100 text-red-700 border border-red-200",
    cloturee: "bg-slate-800 text-slate-300 border border-slate-700",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const { t } = useLanguage();

    const STATUS_LABELS: Record<AlertStatus, string> = {
        a_analyser: t("status_a_analyser"),
        a_inspecter: t("status_a_inspecter"),
        en_cours: t("status_en_cours"),
        infraction_confirmee: t("status_infraction_confirmee"),
        cloturee: t("status_cloturee"),
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                STATUS_STYLES[status],
                className
            )}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}
