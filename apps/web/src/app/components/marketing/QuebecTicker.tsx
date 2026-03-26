import { useLanguage } from "@/app/hooks/useLanguage";
import type { TranslationKey } from "@/app/i18n/translations";

const TICKER_KEYS: TranslationKey[] = [
    "quebec_ticker1",
    "quebec_ticker2",
    "quebec_ticker3",
    "quebec_ticker4",
];

export default function QuebecTicker() {
    const { t } = useLanguage();

    const items = TICKER_KEYS.map((key) => t(key));
    const itemsDoubled = [...items, ...items, ...items, ...items];

    return (
        <div className="w-full py-12" style={{ background: "#1E293B" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
                <h3 className="text-xl sm:text-2xl font-black uppercase text-[#E2E8F0] tracking-wide">
                    {t("quebec_ticker_title")}{" "}
                    <span className="text-[#137fec]">{t("quebec_ticker_highlight")}</span>
                </h3>
                <div className="mt-2 w-12 h-1 bg-[#D4A843] mx-auto rounded-full" />
            </div>

            <div className="w-full bg-[#E2E8F0] py-4 overflow-hidden select-none" aria-hidden="true">
                <div
                    className="flex whitespace-nowrap"
                    style={{
                        animation: "quebec-ticker-scroll 28s linear infinite",
                    }}
                >
                    {itemsDoubled.map((item, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-6 text-white text-sm font-semibold tracking-wide pr-12"
                        >
                            <span className="text-[#137fec] text-lg" aria-hidden="true">❄</span>
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes quebec-ticker-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-25%); }
                }
            `}</style>
        </div>
    );
}
