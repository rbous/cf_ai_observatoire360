import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { TranslationKey } from "@/app/i18n/translations";

interface BlobDef {
    problemKey: TranslationKey;
    solutionKey: TranslationKey;
    color: string;
    delay: number;
    floatY: number[];
    floatX: number[];
    rotate: number[];
}

const BLOB_DEFS: BlobDef[] = [
    {
        problemKey: "why_blob1_problem",
        solutionKey: "why_blob1_solution",
        color: "#137fec",
        delay: 0,
        floatY: [0, -16, 0],
        floatX: [0, 6, 0],
        rotate: [0, 3, 0],
    },
    {
        problemKey: "why_blob2_problem",
        solutionKey: "why_blob2_solution",
        color: "#0D6BD6",
        delay: 0.4,
        floatY: [0, -12, 0],
        floatX: [0, -8, 0],
        rotate: [0, -4, 0],
    },
    {
        problemKey: "why_blob3_problem",
        solutionKey: "why_blob3_solution",
        color: "#3B9AFF",
        delay: 0.8,
        floatY: [0, -20, 0],
        floatX: [0, 5, 0],
        rotate: [0, 5, 0],
    },
    {
        problemKey: "why_blob4_problem",
        solutionKey: "why_blob4_solution",
        color: "#D4A843",
        delay: 1.2,
        floatY: [0, -10, 0],
        floatX: [0, -4, 0],
        rotate: [0, -2, 0],
    },
];

// CSS clip-path clover/blob shape
const BLOB_CLIP =
    "polygon(50% 0%, 80% 10%, 100% 35%, 85% 65%, 65% 85%, 35% 90%, 10% 75%, 0% 45%, 15% 20%)";

interface FloatingBlobProps {
    data: BlobDef;
    index: number;
}

function FloatingBlob({ data, index }: FloatingBlobProps) {
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: data.delay }}
        >
            <motion.div
                animate={{
                    y: data.floatY,
                    x: data.floatX,
                    rotate: data.rotate,
                }}
                transition={{
                    duration: 4 + index * 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "reverse",
                }}
                className="relative"
            >
                {/* Blob shape */}
                <div
                    className="w-52 h-52 sm:w-60 sm:h-60 flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                    style={{
                        background: `radial-gradient(circle at 40% 40%, ${data.color}ee, ${data.color}bb)`,
                        clipPath: BLOB_CLIP,
                        borderRadius: "60% 40% 70% 30% / 30% 60% 40% 70%",
                        boxShadow: `0 8px 32px ${data.color}40`,
                    }}
                >
                    {/* Inner content */}
                    <div className="relative z-10">
                        <div className="mb-2">
                            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide block mb-1">
                                {t("why_problem_label")}
                            </span>
                            <p className="text-white font-bold text-sm leading-tight">
                                {t(data.problemKey)}
                            </p>
                        </div>
                        <div className="w-8 h-px bg-slate-900/40 mx-auto my-2" />
                        <div>
                            <span className="text-white/60 text-xs font-semibold uppercase tracking-wide block mb-1">
                                {t("why_solution_label")}
                            </span>
                            <p className="text-white font-black text-sm leading-tight">
                                {t(data.solutionKey)}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function WhyUs() {
    const { t } = useLanguage();

    const handleDemoClick = () => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    const STATS: { value: string; labelKey: TranslationKey }[] = [
        { value: "10x", labelKey: "why_stat1_label" },
        { value: "3 mois", labelKey: "why_stat2_label" },
        { value: "ROI +", labelKey: "why_stat3_label" },
    ];

    return (
        <section className="py-24 lg:py-32 overflow-hidden" style={{ background: "#0F172A" }}>
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
                        {t("why_title")}
                    </h2>
                    <p className="text-lg text-[#94A3B8]/70 max-w-xl mx-auto">
                        {t("why_subtitle")}
                    </p>
                    <div className="mt-4 w-16 h-1 bg-[#137fec] mx-auto rounded-full" />
                </motion.div>

                {/* Blobs grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 justify-items-center mb-16">
                    {BLOB_DEFS.map((blob, index) => (
                        <FloatingBlob key={blob.problemKey} data={blob} index={index} />
                    ))}
                </div>

                {/* Bottom stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12"
                >
                    {STATS.map((stat) => (
                        <div
                            key={stat.labelKey}
                            className="text-center p-6 rounded-2xl bg-slate-900 border border-slate-700"
                        >
                            <div className="text-3xl font-black text-[#137fec] mb-2">{stat.value}</div>
                            <div className="text-sm text-[#94A3B8]/70">{t(stat.labelKey)}</div>
                        </div>
                    ))}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center"
                >
                    <Button
                        variant="accent"
                        size="xl"
                        onClick={handleDemoClick}
                        className="font-bold tracking-wide uppercase shadow-none shadow-[#D4A843]/30"
                    >
                        {t("why_cta_demo")}
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
