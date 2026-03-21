import { cn } from "@/app/lib/cn";

interface LoadingSpinnerProps {
    text?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

const SIZE_CLASSES = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-14 h-14 border-4",
};

export function LoadingSpinner({ text, className, size = "md" }: LoadingSpinnerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div
                className={cn(
                    "rounded-full border-[#008B8B] border-t-transparent animate-spin",
                    SIZE_CLASSES[size]
                )}
                style={{ borderWidth: size === "md" ? "3px" : undefined }}
            />
            {text && (
                <p className="text-sm text-[#1A2332]/60 font-medium">{text}</p>
            )}
        </div>
    );
}
