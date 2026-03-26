import { useState } from "react";
import { motion } from "framer-motion";
import { Satellite, BrainCircuit, Bell, CheckCircle2, type LucideIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { TranslationKey } from "@/app/i18n/translations";

interface StepDef {
    id: number;
    titleKey: TranslationKey;
    icon: LucideIcon;
    color: string;
    popupKeys: TranslationKey[];
}

const STEP_DEFS: StepDef[] = [
    {
        id: 1,
        titleKey: "how_step1_title",
        icon: Satellite,
        color: "#137fec",
        popupKeys: ["how_step1_item1", "how_step1_item2", "how_step1_item3"],
    },
    {
        id: 2,
        titleKey: "how_step2_title",
        icon: BrainCircuit,
        color: "#0D6BD6",
        popupKeys: ["how_step2_item1", "how_step2_item2", "how_step2_item3"],
    },
    {
        id: 3,
        titleKey: "how_step3_title",
        icon: Bell,
        color: "#D4A843",
        popupKeys: [
            "how_step3_item1",
            "how_step3_item2",
            "how_step3_item3",
            "how_step3_item4",
            "how_step3_item5",
        ],
    },
    {
        id: 4,
        titleKey: "how_step4_title",
        icon: CheckCircle2,
        color: "#10B981",
        popupKeys: ["how_step4_item1", "how_step4_item2"],
    },
];

interface StepCardProps {
    stepDef: StepDef;
    index: number;
    isActive: boolean;
    onToggle: () => void;
}

function StepCard({ stepDef, index, isActive, onToggle }: StepCardProps) {
    const { t } = useLanguage();
    const Icon = stepDef.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="relative flex flex-col items-center"
        >
            {/* Step number */}
            <div className="text-xs font-bold text-[#94A3B8]/40 mb-2 tracking-widest">
                {t("how_step_label")} {stepDef.id}
            </div>

            {/* Card */}
            <button
                onClick={onToggle}
                className="relative group flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900 border-2 transition-all duration-300 cursor-pointer w-full max-w-[200px]"
                style={{
                    borderColor: isActive ? stepDef.color : "transparent",
                    boxShadow: isActive
                        ? `0 0 0 4px ${stepDef.color}20, 0 8px 24px ${stepDef.color}30`
                        : "0 4px 16px rgba(0,0,0,0.08)",
                }}
            >
                {/* Icon circle */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${stepDef.color}15` }}
                >
                    <Icon className="w-8 h-8" style={{ color: stepDef.color }} />
                </div>

                <h3 className="text-sm font-black text-[#E2E8F0] tracking-wide text-center">
                    {t(stepDef.titleKey)}
                </h3>

                <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{ borderColor: stepDef.color, color: stepDef.color }}
                >
                    <span className="text-xs font-bold">{isActive ? "−" : "+"}</span>
                </div>
            </button>

            {/* Popup */}
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-3 z-20 w-56 rounded-xl bg-slate-900 shadow-none border border-slate-800 p-4"
                    style={{ boxShadow: `0 8px 30px ${stepDef.color}25` }}
                >
                    <div
                        className="w-3 h-3 bg-slate-900 border-l border-t border-slate-800 absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-45"
                    />
                    <ul className="space-y-2">
                        {stepDef.popupKeys.map((key) => (
                            <li key={key} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                                <span style={{ color: stepDef.color }} className="mt-0.5 shrink-0">✓</span>
                                {t(key)}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </motion.div>
    );
}

export default function HowItWorks() {
    const { t } = useLanguage();
    const [activeStep, setActiveStep] = useState<number | null>(null);

    const toggle = (id: number) => {
        setActiveStep((prev) => (prev === id ? null : id));
    };

    const handleDemoClick = () => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section id="comment-ca-marche" className="py-24 lg:py-32" style={{ background: "#0F172A" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#E2E8F0] mb-4">
                        {t("how_title")}
                    </h2>
                    <p className="text-lg text-[#94A3B8]/70 max-w-xl mx-auto">
                        {t("how_subtitle")}
                    </p>
                    <div className="mt-4 w-16 h-1 bg-[#137fec] mx-auto rounded-full" />
                </motion.div>

                {/* Steps grid */}
                <div className="relative">
                    {/* Dashed connecting line (desktop) */}
                    <div className="hidden lg:block absolute top-[88px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-0 border-t-2 border-dashed border-[#137fec]/30 z-0" />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative z-10 pb-24">
                        {STEP_DEFS.map((stepDef, index) => (
                            <StepCard
                                key={stepDef.id}
                                stepDef={stepDef}
                                index={index}
                                isActive={activeStep === stepDef.id}
                                onToggle={() => toggle(stepDef.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center mt-4"
                >
                    <Button
                        variant="accent"
                        size="xl"
                        onClick={handleDemoClick}
                        className="font-bold tracking-wide uppercase shadow-none shadow-[#D4A843]/30"
                    >
                        {t("how_cta_demo")}
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
