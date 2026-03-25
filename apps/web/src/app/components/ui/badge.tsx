import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/cn";

const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
    {
        variants: {
            variant: {
                default:
                    "bg-[#137fec]/10 text-[#137fec] border border-[#137fec]/20",
                secondary:
                    "bg-slate-800 text-slate-300 border border-slate-700",
                outline:
                    "border border-current bg-transparent",
                // Risk levels
                high:
                    "bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20",
                medium:
                    "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
                low:
                    "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20",
                // Status variants
                active:
                    "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20",
                inactive:
                    "bg-slate-800 text-slate-400 border border-slate-700",
                pending:
                    "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
                // Accent
                accent:
                    "bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20",
                destructive:
                    "bg-[#DC2626] text-white",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
