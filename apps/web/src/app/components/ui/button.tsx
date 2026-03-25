import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/cn";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    {
        variants: {
            variant: {
                default:
                    "bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-500",
                accent:
                    "bg-amber-500 text-white hover:bg-amber-400 focus-visible:ring-amber-500 rounded-full",
                outline:
                    "border-2 border-[#137fec] text-[#137fec] bg-transparent hover:bg-[#137fec] hover:text-white focus-visible:ring-[#137fec]",
                ghost:
                    "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-slate-100 focus-visible:ring-slate-500",
                destructive:
                    "bg-[#DC2626] text-white hover:bg-red-700 focus-visible:ring-[#DC2626]",
                link:
                    "text-[#137fec] underline-offset-4 hover:underline bg-transparent p-0 h-auto",
            },
            size: {
                sm: "h-8 px-3 text-sm rounded-md",
                default: "h-10 px-5 text-sm rounded-lg",
                lg: "h-12 px-8 text-base rounded-xl",
                xl: "h-14 px-10 text-lg rounded-full",
                icon: "h-10 w-10 rounded-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
