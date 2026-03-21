import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { LAUNCH_OFFER_TEXT } from "@/app/lib/constants";

interface PricingTier {
    name: string;
    tagline: string;
    color: string;
    features: string[];
    highlight?: boolean;
}

const TIERS: PricingTier[] = [
    {
        name: "ESSENTIEL",
        tagline: "Pour les petites municipalités",
        color: "#008B8B",
        features: [
            "Surveillance satellite mensuelle",
            "Détection automatique de constructions",
            "Rapport mensuel",
            "Jusqu'à 5 utilisateurs",
            "Support par courriel",
            "Tableau de bord de base",
        ],
    },
    {
        name: "FUTUR",
        tagline: "Fonctionnalités avancées avec analyse IA",
        color: "#1A2332",
        highlight: true,
        features: [
            "Surveillance satellite bi-mensuelle",
            "Analyse IA avancée",
            "Alertes en temps réel",
            "Jusqu'à 15 utilisateurs",
            "Support prioritaire",
            "Tableau de bord avancé",
            "Exportation des rapports",
            "Intégration SIG",
        ],
    },
    {
        name: "ADMINISTRATIF",
        tagline: "Suite complète avec utilisateurs illimités",
        color: "#D4A843",
        features: [
            "Surveillance satellite hebdomadaire",
            "IA de dernière génération",
            "Alertes instantanées avec preuves",
            "Utilisateurs illimités",
            "Support dédié 24/7",
            "Tableau de bord complet",
            "API & intégrations personnalisées",
            "Formation de l'équipe incluse",
            "Données historiques complètes",
        ],
    },
];

interface ROIValues {
    constructions: number;
    amendes: number;
    estimation: number;
}

function ROICalculator() {
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
        <div className="bg-white rounded-3xl shadow-lg border border-[#008B8B]/10 p-8 max-w-2xl mx-auto mt-16">
            <h3 className="text-xl font-black uppercase text-[#1A2332] mb-2 text-center">
                CALCULATEUR DE ROI
            </h3>
            <p className="text-sm text-[#2A3A4E]/60 text-center mb-8">
                Estimez les revenus que vous pourriez récupérer
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#1A2332]">
                        Constructions illégales évitées / an
                    </label>
                    <input
                        type="number"
                        name="constructions"
                        min="0"
                        value={values.constructions}
                        onChange={handleChange}
                        className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#1A2332]">
                        Nombre d'amendes moyennes
                    </label>
                    <input
                        type="number"
                        name="amendes"
                        min="0"
                        value={values.amendes}
                        onChange={handleChange}
                        className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[#1A2332]">
                        Estimation par dossier ($)
                    </label>
                    <input
                        type="number"
                        name="estimation"
                        min="0"
                        step="100"
                        value={values.estimation}
                        onChange={handleChange}
                        className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#008B8B] focus:border-transparent"
                    />
                </div>
            </div>

            <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #008B8B, #006666)" }}>
                <p className="text-white/80 text-sm mb-2">Estimation de gains annuels</p>
                <p className="text-4xl font-black text-white">
                    {roi.toLocaleString("fr-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })}
                </p>
                <p className="text-white/60 text-xs mt-2">
                    * Estimation basée sur les données fournies. Résultats réels peuvent varier.
                </p>
            </div>
        </div>
    );
}

interface TierCardProps {
    tier: PricingTier;
    index: number;
}

function TierCard({ tier, index }: TierCardProps) {
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
            {tier.highlight && (
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide text-white"
                    style={{ background: tier.color }}
                >
                    POPULAIRE
                </div>
            )}

            {/* 3D pillow effect card */}
            <div
                className="h-full rounded-3xl p-8 flex flex-col transition-transform duration-300 hover:-translate-y-2"
                style={{
                    background: tier.highlight
                        ? `linear-gradient(145deg, ${tier.color}ee, ${tier.color})`
                        : `linear-gradient(145deg, #ffffff, #f8f9fa)`,
                    boxShadow: tier.highlight
                        ? `0 20px 60px ${tier.color}40, 0 4px 16px ${tier.color}20, inset 0 1px 0 rgba(255,255,255,0.2)`
                        : `0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)`,
                    border: tier.highlight ? "none" : `2px solid ${tier.color}20`,
                }}
            >
                <div className="mb-6">
                    <h3
                        className="text-xl font-black uppercase tracking-wide mb-2"
                        style={{ color: tier.highlight ? "white" : tier.color }}
                    >
                        {tier.name}
                    </h3>
                    <p
                        className="text-sm"
                        style={{ color: tier.highlight ? "rgba(255,255,255,0.8)" : "#2A3A4E" }}
                    >
                        {tier.tagline}
                    </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                    <p
                        className="text-2xl font-black"
                        style={{ color: tier.highlight ? "white" : "#1A2332" }}
                    >
                        Contactez-nous
                    </p>
                    <p
                        className="text-xs mt-1"
                        style={{ color: tier.highlight ? "rgba(255,255,255,0.6)" : "#2A3A4E80" }}
                    >
                        Tarification personnalisée selon votre territoire
                    </p>
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-3 mb-8">
                    {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                            <div
                                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                style={{
                                    background: tier.highlight ? "rgba(255,255,255,0.2)" : `${tier.color}15`,
                                }}
                            >
                                <Check
                                    className="w-3 h-3"
                                    style={{ color: tier.highlight ? "white" : tier.color }}
                                />
                            </div>
                            <span
                                className="text-sm"
                                style={{ color: tier.highlight ? "rgba(255,255,255,0.9)" : "#2A3A4E" }}
                            >
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                <Button
                    onClick={handleDemoClick}
                    className="w-full font-bold tracking-wide uppercase"
                    style={{
                        background: tier.highlight ? "#D4A843" : tier.color,
                        color: "white",
                        border: "none",
                    }}
                    size="lg"
                >
                    RÉSERVER UNE DÉMO
                </Button>
            </div>
        </motion.div>
    );
}

function MRCCard() {
    const handleDemoClick = () => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-16"
        >
            <div className="rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #1A2332, #2A3A4E)" }}>
                <div className="p-8 sm:p-10">
                    <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-3">
                        VOUS ÊTES UNE MRC?{" "}
                        <span className="text-[#D4A843]">PAS DE PROBLÈME</span>
                    </h3>
                    <p className="text-white/70 mb-6">
                        Solution spécialement adaptée pour les MRC avec plusieurs municipalités.
                        Gestion centralisée, tarification groupée et support dédié.
                    </p>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {[
                            "Toutes les municipalités de la MRC",
                            "Tableau de bord centralisé",
                            "Rapport consolidé mensuel",
                            "Tarification groupée avantageuse",
                            "Formateur dédié sur site",
                            "Intégration avec vos systèmes",
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                                <span className="text-[#D4A843] font-bold shrink-0">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <Button
                        variant="accent"
                        size="lg"
                        onClick={handleDemoClick}
                        className="font-bold tracking-wide uppercase"
                    >
                        CONTACTEZ-NOUS POUR LES MRC
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}

export default function Pricing() {
    return (
        <section id="forfaits" className="py-24 lg:py-32 bg-gradient-to-b from-[#f0fafa] to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Launch offer banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 rounded-2xl overflow-hidden"
                    style={{ background: "linear-gradient(135deg, #1A2332, #2A3A4E)" }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 sm:px-8 py-5">
                        <p className="text-white font-bold text-sm sm:text-base text-center sm:text-left">
                            {LAUNCH_OFFER_TEXT}
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
                            [RÉSERVER MA DÉMO]
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
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase text-[#1A2332] mb-4">
                        FORFAITS:{" "}
                        <span className="text-[#008B8B]">UN INVESTISSEMENT RENTABLE!</span>
                    </h2>
                    <p className="text-lg text-[#2A3A4E]/70 max-w-xl mx-auto">
                        Choisissez le forfait adapté à la taille et aux besoins de votre municipalité
                    </p>
                    <div className="mt-4 w-16 h-1 bg-[#008B8B] mx-auto rounded-full" />
                </motion.div>

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {TIERS.map((tier, index) => (
                        <TierCard key={tier.name} tier={tier} index={index} />
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
