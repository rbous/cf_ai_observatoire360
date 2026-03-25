const QUEBEC_ITEMS = [
    "Adapté aux saisons",
    "Zone humide",
    "Espèce menacée",
    "Mouvement de masse / Zone inondable",
];

const ITEMS_DOUBLED = [...QUEBEC_ITEMS, ...QUEBEC_ITEMS, ...QUEBEC_ITEMS, ...QUEBEC_ITEMS];

export default function QuebecTicker() {
    return (
        <div className="w-full py-12" style={{ background: "#1E293B" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
                <h3 className="text-xl sm:text-2xl font-black uppercase text-[#E2E8F0] tracking-wide">
                    ADAPTÉ AU{" "}
                    <span className="text-[#6366F1]">QUÉBEC</span>
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
                    {ITEMS_DOUBLED.map((item, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-6 text-white text-sm font-semibold tracking-wide pr-12"
                        >
                            <span className="text-[#6366F1] text-lg" aria-hidden="true">❄</span>
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
