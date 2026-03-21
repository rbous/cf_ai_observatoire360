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
                    "bg-[#008B8B] text-white hover:bg-[#006666] focus-visible:ring-[#008B8B]",
                accent:
                    "bg-[#D4A843] text-white hover:bg-[#C49B38] focus-visible:ring-[#D4A843] rounded-full",
                outline:
                    "border-2 border-[#008B8B] text-[#008B8B] bg-transparent hover:bg-[#008B8B] hover:text-white focus-visible:ring-[#008B8B]",
                ghost:
                    "bg-transparent text-[#1A2332] hover:bg-[#008B8B]/10 hover:text-[#008B8B] focus-visible:ring-[#008B8B]",
                destructive:
                    "bg-[#DC2626] text-white hover:bg-red-700 focus-visible:ring-[#DC2626]",
                link:
                    "text-[#008B8B] underline-offset-4 hover:underline bg-transparent p-0 h-auto",
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
