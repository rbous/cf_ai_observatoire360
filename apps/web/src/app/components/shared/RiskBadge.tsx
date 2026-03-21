import type { RiskLevel } from "@observatoire360/shared";
import { RISK_LEVEL_LABELS } from "@observatoire360/shared";
import { cn } from "@/app/lib/cn";

interface RiskBadgeProps {
    level: RiskLevel;
    className?: string;
}

const RISK_STYLES: Record<RiskLevel, string> = {
    high: "bg-red-100 text-red-700 border border-red-200",
    medium: "bg-amber-100 text-amber-700 border border-amber-200",
    low: "bg-green-100 text-green-700 border border-green-200",
};

export function RiskBadge({ level, className }: RiskBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                RISK_STYLES[level],
                className
            )}
        >
            {RISK_LEVEL_LABELS[level]}
        </span>
    );
}
