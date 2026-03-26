import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { TranslationKey } from "@/app/i18n/translations";

interface PricingTierDef {
    nameKey: TranslationKey;
    taglineKey: TranslationKey;
    color: string;
    featureKeys: TranslationKey[];
    highlight?: boolean;
}

const TIER_DEFS: PricingTierDef[] = [
    {
        nameKey: "pricing_tier1_name",
        taglineKey: "pricing_tier1_tagline",
        color: "#137fec",
        featureKeys: [
            "pricing_tier1_f1",
            "pricing_tier1_f2",
            "pricing_tier1_f3",
            "pricing_tier1_f4",
            "pricing_tier1_f5",
            "pricing_tier1_f6",
        ],
    },
    {
        nameKey: "pricing_tier2_name",
        taglineKey: "pricing_tier2_tagline",
        color: "#E2E8F0",
        highlight: true,
        featureKeys: [
            "pricing_tier2_f1",
            "pricing_tier2_f2",
            "pricing_tier2_f3",
            "pricing_tier2_f4",
            "pricing_tier2_f5",
            "pricing_tier2_f6",
            "pricing_tier2_f7",
            "pricing_tier2_f8",
        ],
    },
    {
        nameKey: "pricing_tier3_name",
        taglineKey: "pricing_tier3_tagline",
        color: "#D4A843",
        featureKeys: [
            "pricing_tier3_f1",
            "pricing_tier3_f2",
            "pricing_tier3_f3",
            "pricing_tier3_f4",
            "pricing_tier3_f5",
            "pricing_tier3_f6",
            "pricing_tier3_f7",
            "pricing_tier3_f8",
            "pricing_tier3_f9",
        ],
    },
];

interface ROIValues {
    constructions: number;
    amendes: number;
    estimation: number;
}

function ROICalculator() {
    const { t, locale } = useLanguage();
    const [values, setValues] = useState<ROIValues>({
        constructions: 10,
        amendes: 3,
        estimation: 5000,
    });

    const roi = values.constructions * values.amendes * values.estimation;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numVal = Math.max(0, parseInt(e.target.value) || 0);
        setValues((prev) => ({ ...prev, [e.target.name]: numVal }));
    };

    return (
        <div className="bg-slate-900 rounded-3xl shadow-none border border-[#137fec]/10 p-8 max-w-2xl mx-auto mt-16">
            <h3 className="text-xl font-black uppercase text-[#E2E8F0] mb-2 text-center">
                {t("pricing_roi_title")}
            </h3>
            <p className="text-sm text-[#94A3B8]/60 text-center mb-8">
                {t("pricing_roi_subtitle")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#E2E8F0]">
                        {t("pricing_roi_constructions")}
                    </label>
                    <input
                        type="number"
                        name="constructions"
                        min="0"
                        value={values.constructions}
                        onChange={handleChange}
                        className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#E2E8F0]">
                        {t("pricing_roi_fines")}
                    </label>
                    <input
                        type="number"
                        name="amendes"
                        min="0"
                        value={values.amendes}
                        onChange={handleChange}
                        className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#E2E8F0]">
                        {t("pricing_roi_estimation")}
                    </label>
                    <input
                        type="number"
                        name="estimation"
                        min="0"
                        step="100"
                        value={values.estimation}
                        onChange={handleChange}
                        className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#137fec] focus:border-transparent"
                    />
                </div>
            </div>

            <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #137fec, #0D6BD6)" }}>
                <p className="text-white/80 text-sm mb-2">{t("pricing_roi_annual")}</p>
                <p className="text-4xl font-black text-white">
                    {roi.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
                </p>
                <p className="text-white/60 text-xs mt-2">
                    {t("pricing_roi_disclaimer")}
                </p>
            </div>
        </div>
    );
}

interface TierCardProps {
    tierDef: PricingTierDef;
    index: number;
}

function TierCard({ tierDef, index }: TierCardProps) {
    const { t } = useLanguage();

    const handleDemoClick = () => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="relative"
        >
            {tierDef.highlight && (
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide text-white"
                    style={{ background: tierDef.color }}
                >
                    {t("pricing_popular")}
                </div>
            )}

            {/* 3D pillow effect card */}
            <div
                className="h-full rounded-3xl p-8 flex flex-col transition-transform duration-300 hover:-translate-y-2"
                style={{
                    background: tierDef.highlight
                        ? `linear-gradient(145deg, ${tierDef.color}ee, ${tierDef.color})`
                        : "#1E293B",
                    border: tierDef.highlight ? "none" : `1px solid rgb(51 65 85)`,
                }}
            >
                <div className="mb-6">
                    <h3
                        className="text-xl font-black uppercase tracking-wide mb-2"
                        style={{ color: tierDef.highlight ? "white" : tierDef.color }}
                    >
                        {t(tierDef.nameKey)}
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: tierDef.highlight ? "rgba(255,255,255,0.8)" : "#94A3B8" }}
                    >
                        {t(tierDef.taglineKey)}
                    </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                    <p
                        className="text-2xl font-black"
                        style={{ color: tierDef.highlight ? "white" : "#E2E8F0" }}
                    >
                        {t("pricing_contact_us")}
                    </p>
                    <p
                        className="text-xs mt-1"
                        style={{ color: tierDef.highlight ? "rgba(255,255,255,0.6)" : "#94A3B880" }}
                    >
                        {t("pricing_custom_pricing")}
                    </p>
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-3 mb-8">
                    {tierDef.featureKeys.map((key) => (
                        <li key={key} className="flex items-start gap-2.5">
                            <div
                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                style={{
                                    background: tierDef.highlight ? "rgba(255,255,255,0.2)" : `${tierDef.color}15`,
                                }}
                            >
                                <Check
                                    className="w-3 h-3"
                                    style={{ color: tierDef.highlight ? "white" : tierDef.color }}
                                />
                            </div>
                            <span
                                className="text-sm"
                                style={{ color: tierDef.highlight ? "rgba(255,255,255,0.9)" : "#94A3B8" }}
                            >
                                {t(key)}
                            </span>
                        </li>
                    ))}
                </ul>

                <Button
                    onClick={handleDemoClick}
                    className="w-full font-bold tracking-wide uppercase"
                    style={{
                        background: tierDef.highlight ? "#D4A843" : tierDef.color,
                        color: "white",
                        border: "none",
                    }}
                    size="lg"
                >
                    {t("pricing_cta_demo")}
                </Button>
            </div>
        </motion.div>
    );
}

function MRCCard() {
    const { t } = useLanguage();

    const handleDemoClick = () => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    const MRC_FEATURES: TranslationKey[] = [
        "pricing_mrc_f1",
        "pricing_mrc_f2",
        "pricing_mrc_f3",
        "pricing_mrc_f4",
        "pricing_mrc_f5",
        "pricing_mrc_f6",
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-16"
        >
            <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #E2E8F0, #94A3B8)" }}>
                <div className="p-8 sm:p-10">
                    <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-3">
                        {t("pricing_mrc_title")}{" "}
                        <span className="text-[#D4A843]">{t("pricing_mrc_highlight")}</span>
                    </h3>
                    <p className="text-white/70 mb-6">
                        {t("pricing_mrc_desc")}
                    </p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {MRC_FEATURES.map((key) => (
                            <li key={key} className="flex items-center gap-2 text-sm text-white/80">
                                <span className="text-[#D4A843] font-bold shrink-0">✓</span>
                                {t(key)}
                            </li>
                        ))}
                    </ul>

                    <Button
                        variant="accent"
                        size="lg"
                        onClick={handleDemoClick}
                        className="font-bold tracking-wide uppercase"
                    >
                        {t("pricing_mrc_cta")}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

export default function Pricing() {
    const { t } = useLanguage();

    return (
        <section id="forfaits" className="py-24 lg:py-32" style={{ background: "#0F172A" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Launch offer banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 rounded-2xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #E2E8F0, #94A3B8)" }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-8 py-5">
                        <p className="text-white font-bold text-sm sm:text-base text-center sm:text-left">
                            {t("launch_offer_text")}
                        </p>
                        <Button
                            variant="accent"
                            size="lg"
                            className="shrink-0 font-bold tracking-wide uppercase whitespace-nowrap"
                            onClick={() => {
                                const el = document.getElementById("contact");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            {t("pricing_banner_btn")}
                        </Button>
                    </div>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#E2E8F0] mb-4">
                        {t("pricing_title")}{" "}
                        <span className="text-[#137fec]">{t("pricing_title_highlight")}</span>
                    </h2>
                    <p className="text-lg text-[#94A3B8]/70 max-w-xl mx-auto">
                        {t("pricing_subtitle")}
                    </p>
                    <div className="mt-4 w-16 h-1 bg-[#137fec] mx-auto rounded-full" />
                </motion.div>

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {TIER_DEFS.map((tierDef, index) => (
                        <TierCard key={tierDef.nameKey} tierDef={tierDef} index={index} />
                    ))}
                </div>

                {/* ROI Calculator */}
                <ROICalculator />

                {/* MRC section */}
                <MRCCard />
            </div>
        </section>
    );
}
