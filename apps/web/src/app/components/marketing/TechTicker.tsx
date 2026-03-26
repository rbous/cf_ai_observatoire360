import { useRef } from "react";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { TranslationKey } from "@/app/i18n/translations";

const TICKER_KEYS: TranslationKey[] = [
    "tech_ticker1",
    "tech_ticker2",
    "tech_ticker3",
    "tech_ticker4",
    "tech_ticker5",
];

export default function TechTicker() {
    const { t } = useLanguage();
    const trackRef = useRef<HTMLDivElement>(null);

    const items = TICKER_KEYS.map((key) => t(key));
    const itemsDoubled = [...items, ...items, ...items];

    return (
        <div className="w-full bg-[#137fec] py-4 overflow-hidden select-none" aria-hidden="true">
            <div
                className="flex whitespace-nowrap"
                style={{
                    animation: "ticker-scroll 35s linear infinite",
                }}
                ref={trackRef}
            >
                {itemsDoubled.map((item, index) => (
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
