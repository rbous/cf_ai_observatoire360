import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface ImageComparatorProps {
    beforeSrc: string;
    afterSrc: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

export function ImageComparator({
    beforeSrc,
    afterSrc,
    beforeLabel = "AVANT",
    afterLabel = "APRÈS",
    className,
}: ImageComparatorProps) {
    const [position, setPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // -------------------------------------------------------------------------
    // Position calculation
    // -------------------------------------------------------------------------

    function clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    function getPositionFromClientX(clientX: number): number {
        const container = containerRef.current;
        if (!container) return 50;
        const rect = container.getBoundingClientRect();
        const relative = clientX - rect.left;
        const percentage = (relative / rect.width) * 100;
        return clamp(percentage, 0, 100);
    }

    // -------------------------------------------------------------------------
    // Mouse events
    // -------------------------------------------------------------------------

    function handleMouseDown(e: React.MouseEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDragging) return;
            setPosition(getPositionFromClientX(e.clientX));
        },
        [isDragging]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // -------------------------------------------------------------------------
    // Touch events
    // -------------------------------------------------------------------------

    function handleTouchStart(e: React.TouchEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            if (!touch) return;
            setPosition(getPositionFromClientX(touch.clientX));
        },
        [isDragging]
    );

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("touchmove", handleTouchMove, { passive: false });
            window.addEventListener("touchend", handleTouchEnd);
        }
        return () => {
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isDragging, handleTouchMove, handleTouchEnd]);

    // -------------------------------------------------------------------------
    // Also allow clicking anywhere on the container to reposition
    // -------------------------------------------------------------------------

    function handleContainerClick(e: React.MouseEvent) {
        // Only reposition if the click wasn't on the handle (handle sets isDragging)
        if (isDragging) return;
        setPosition(getPositionFromClientX(e.clientX));
    }

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative overflow-hidden rounded-xl border border-gray-200 h-[400px] select-none",
                "cursor-col-resize",
                className
            )}
            onClick={handleContainerClick}
        >
            {/* After image — full width, always visible underneath */}
            <img
                src={afterSrc}
                alt={afterLabel}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                draggable={false}
            />

            {/* Before image — clipped to the left of the divider */}
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${position}%` }}
            >
                <img
                    src={beforeSrc}
                    alt={beforeLabel}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: `${containerRef.current?.offsetWidth ?? 800}px`, maxWidth: "none" }}
                    draggable={false}
                />
            </div>

            {/* Divider line */}
            <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                style={{ left: `calc(${position}% - 1px)`, pointerEvents: "none" }}
            />

            {/* Drag handle */}
            <div
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                    "w-10 h-10 rounded-full bg-white shadow-lg border-2 border-[#008B8B]",
                    "flex items-center justify-center",
                    "transition-transform duration-75",
                    isDragging
                        ? "cursor-grabbing scale-110"
                        : "cursor-grab hover:scale-105",
                    "z-10"
                )}
                style={{ left: `${position}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <ChevronsLeftRight className="w-5 h-5 text-[#008B8B]" />
            </div>

            {/* AVANT label */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm">
                    {beforeLabel}
                </span>
            </div>

            {/* APRÈS label */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-sm">
                    {afterLabel}
                </span>
            </div>
        </div>
    );
}
