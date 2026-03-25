import * as React from "react";
import { cn } from "@/app/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, hint, id, ...props }, ref) => {
        const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

        return (
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-[#E2E8F0]"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200",
                        "placeholder:text-slate-500",
                        "focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-colors duration-150",
                        error && "border-[#DC2626] focus:ring-[#DC2626]",
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-[#DC2626]">{error}</p>
                )}
                {hint && !error && (
                    <p className="text-xs text-[#94A3B8]/60">{hint}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
