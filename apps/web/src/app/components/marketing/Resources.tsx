import { motion } from "framer-motion";
import { Play } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";
import { useLanguage } from "@/app/hooks/useLanguage";
import type { TranslationKey } from "@/app/i18n/translations";

interface FAQItem {
    id: string;
    questionKey: TranslationKey;
    answerKey: TranslationKey;
}

const FAQ_ITEMS: FAQItem[] = [
    {
        id: "faq-1",
        questionKey: "resources_faq1_q",
        answerKey: "resources_faq1_a",
    },
    {
        id: "faq-2",
        questionKey: "resources_faq2_q",
        answerKey: "resources_faq2_a",
    },
    {
        id: "faq-3",
        questionKey: "resources_faq3_q",
        answerKey: "resources_faq3_a",
    },
    {
        id: "faq-4",
        questionKey: "resources_faq4_q",
        answerKey: "resources_faq4_a",
    },
];

interface TestimonialDef {
    municipalityKey: TranslationKey;
    quoteKey: TranslationKey;
}

const TESTIMONIAL_DEFS: TestimonialDef[] = [
    {
        municipalityKey: "resources_testimonial1_municipality",
        quoteKey: "resources_testimonial1_quote",
    },
    {
        municipalityKey: "resources_testimonial2_municipality",
        quoteKey: "resources_testimonial2_quote",
    },
    {
        municipalityKey: "resources_testimonial3_municipality",
        quoteKey: "resources_testimonial3_quote",
    },
];

function VideoPlaceholder({ label }: { label?: string }) {
    return (
        <div className="relative w-full aspect-video bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center group cursor-pointer hover:bg-slate-700 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#137fec] flex items-center justify-center shadow-none group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                </div>
                {label && (
                    <span className="text-sm font-semibold text-slate-300">{label}</span>
                )}
            </div>
        </div>
    );
}

export default function Resources() {
    const { t } = useLanguage();

    return (
        <section id="ressources" className="py-24 lg:py-32" style={{ background: "#0F172A" }}>
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
                        {t("resources_title")}
                    </h2>
                    <p className="text-lg text-[#94A3B8]/70 max-w-xl mx-auto">
                        {t("resources_subtitle")}
                    </p>
                    <div className="mt-4 w-16 h-1 bg-[#137fec] mx-auto rounded-full" />
                </motion.div>

                {/* Main video */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="max-w-3xl mx-auto mb-16"
                >
                    <VideoPlaceholder label={t("resources_video_label")} />
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="mb-16"
                >
                    <h3 className="text-xl font-black uppercase text-[#E2E8F0] mb-8 text-center">
                        {t("resources_testimonials_title")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TESTIMONIAL_DEFS.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.municipalityKey}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden"
                            >
                                <VideoPlaceholder />
                                <div className="p-5">
                                    <p className="font-black text-[#137fec] text-sm uppercase tracking-wide mb-2">
                                        {t(testimonial.municipalityKey)}
                                    </p>
                                    <p className="text-sm text-[#94A3B8]/80 italic leading-relaxed">
                                        "{t(testimonial.quoteKey)}"
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    <h3 className="text-xl font-black uppercase text-[#E2E8F0] mb-8 text-center">
                        {t("resources_faq_title")}
                    </h3>
                    <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden px-6">
                        <Accordion type="single" collapsible>
                            {FAQ_ITEMS.map((item) => (
                                <AccordionItem key={item.id} value={item.id}>
                                    <AccordionTrigger className="text-base font-semibold">
                                        {t(item.questionKey)}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-[#94A3B8]/80 leading-relaxed">
                                        {t(item.answerKey)}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
