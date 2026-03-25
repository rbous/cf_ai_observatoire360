import { useState } from "react";
import { motion } from "framer-motion";
import { Satellite, BrainCircuit, Bell, CheckCircle2, type LucideIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface Step {
    id: number;
    title: string;
    icon: LucideIcon;
    color: string;
    popupItems: string[];
}

const STEPS: Step[] = [
    {
        id: 1,
        title: "SURVEILLANCE",
        icon: Satellite,
        color: "#137fec",
        popupItems: [
            "Images satellite",
            "Imagerie haute définition",
            "Couverture totale du territoire",
        ],
    },
    {
        id: 2,
        title: "DÉTECTION IA",
        icon: BrainCircuit,
        color: "#0D6BD6",
        popupItems: [
            "Dernière technologie",
            "Comparaison des imageries",
            "Identifie toute nouvelle construction",
        ],
    },
    {
        id: 3,
        title: "ALERTE",
        icon: Bell,
        color: "#D4A843",
        popupItems: [
            "Notification",
            "Preuves datées à l'appui",
            "Photo avant/après",
            "Gabarit de l'avis rédigé",
            "Information prête à l'emploi",
        ],
    },
    {
        id: 4,
        title: "VOUS AGISSEZ",
        icon: CheckCircle2,
        color: "#10B981",
        popupItems: [
            "Vous prenez la décision en connaissance de cause.",
            "Vous restez le décideur!",
        ],
    },
];

interface StepCardProps {
    step: Step;
    index: number;
    isActive: boolean;
    onToggle: () => void;
}

function StepCard({ step, index, isActive, onToggle }: StepCardProps) {
    const Icon = step.icon;

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
                ÉTAPE {step.id}
            </div>

            {/* Card */}
            <button
                onClick={onToggle}
                className="relative group flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-900 border-2 transition-all duration-300 cursor-pointer w-full max-w-[200px]"
                style={{
                    borderColor: isActive ? step.color : "transparent",
                    boxShadow: isActive
                        ? `0 0 0 4px ${step.color}20, 0 8px 24px ${step.color}30`
                        : "0 4px 16px rgba(0,0,0,0.08)",
                }}
            >
                {/* Icon circle */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${step.color}15` }}
                >
                    <Icon className="w-8 h-8" style={{ color: step.color }} />
                </div>

                <h3 className="text-sm font-black text-[#E2E8F0] tracking-wide text-center">
                    {step.title}
                </h3>

                <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    style={{ borderColor: step.color, color: step.color }}
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
                    style={{ boxShadow: `0 8px 30px ${step.color}25` }}
                >
                    <div
                        className="w-3 h-3 bg-slate-900 border-l border-t border-slate-800 absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-45"
                    />
                    <ul className="space-y-2">
                        {step.popupItems.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                                <span style={{ color: step.color }} className="mt-0.5 shrink-0">✓</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </motion.div>
    );
}

export default function HowItWorks() {
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
                        COMMENT ÇA MARCHE?
                    </h2>
                    <p className="text-lg text-[#94A3B8]/70 max-w-xl mx-auto">
                        Une technologie simple, une valeur concrète
                    </p>
                    <div className="mt-4 w-16 h-1 bg-[#137fec] mx-auto rounded-full" />
                </motion.div>

                {/* Steps grid */}
                <div className="relative">
                    {/* Dashed connecting line (desktop) */}
                    <div className="hidden lg:block absolute top-[88px] left-[calc(12.5%+40px)] right-[calc(12.5%+40px)] h-0 border-t-2 border-dashed border-[#137fec]/30 z-0" />

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative z-10 pb-24">
                        {STEPS.map((step, index) => (
                            <StepCard
                                key={step.id}
                                step={step}
                                index={index}
                                isActive={activeStep === step.id}
                                onToggle={() => toggle(step.id)}
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
                        DÉMO GRATUITE
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
