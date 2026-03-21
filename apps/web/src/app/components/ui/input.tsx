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
                        className="text-sm font-medium text-[#1A2332]"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={inputId}
                    ref={ref}
                    className={cn(
                        "w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#1A2332]",
                        "placeholder:text-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-[#008B8B] focus:border-transparent",
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
                    <p className="text-xs text-[#2A3A4E]/60">{hint}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
