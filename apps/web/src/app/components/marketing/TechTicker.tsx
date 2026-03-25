import { useRef } from "react";

const TICKER_ITEMS = [
    "Sentinel-2 + données québec",
    "Intelligence artificielle",
    "Détection automatique",
    "Système d'Information Géographique (SIG)",
    "Portail citoyen et démarches en ligne",
];

// Duplicate items for seamless infinite loop
const ITEMS_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

export default function TechTicker() {
    const trackRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full bg-[#6366F1] py-4 overflow-hidden select-none" aria-hidden="true">
            <div
                className="flex whitespace-nowrap"
                style={{
                    animation: "ticker-scroll 35s linear infinite",
                }}
                ref={trackRef}
            >
                {ITEMS_DOUBLED.map((item, index) => (
                    <span
                        key={index}
                        className="inline-flex items-center gap-6 text-white text-sm font-semibold tracking-wide pr-12"
                    >
                        <span className="text-[#D4A843] text-lg" aria-hidden="true">◆</span>
                        {item}
                    </span>
                ))}
            </div>

            <style>{`
                @keyframes ticker-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
            `}</style>
        </div>
    );
}
