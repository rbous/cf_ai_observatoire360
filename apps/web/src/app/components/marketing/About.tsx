import { motion } from "framer-motion";
import { Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/hooks/useLanguage";
import {
    SOCIAL_INSTAGRAM,
    SOCIAL_FACEBOOK,
    SOCIAL_LINKEDIN,
    SOCIAL_X,
} from "@/app/lib/constants";

const SOCIALS = [
    { icon: Instagram, href: SOCIAL_INSTAGRAM, label: "Instagram" },
    { icon: Facebook, href: SOCIAL_FACEBOOK, label: "Facebook" },
    { icon: Linkedin, href: SOCIAL_LINKEDIN, label: "LinkedIn" },
    { icon: Twitter, href: SOCIAL_X, label: "X (Twitter)" },
];

export default function About() {
    const { t } = useLanguage();

    const handleDemoClick = () => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section id="a-propos" className="py-24 lg:py-32" style={{ background: "#0F172A" }}>
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
                        {t("about_title")}
                    </h2>
                    <div className="mt-4 w-16 h-1 bg-[#137fec] mx-auto rounded-full" />
                </motion.div>

                {/* Founder card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="bg-slate-900 rounded-3xl shadow-none overflow-hidden border border-[#137fec]/10">
                        <div className="flex flex-col md:flex-row">
                            {/* Image placeholder */}
                            <div className="md:w-64 lg:w-80 flex-shrink-0 bg-gradient-to-br from-[#137fec]/10 to-[#0F172A] flex items-center justify-center py-12 md:py-0">
                                <div className="flex flex-col items-center gap-4">
                                    {/* Gray circle with user icon */}
                                    <div className="w-32 h-32 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                                        <svg
                                            className="w-16 h-16 text-slate-400"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
                                {/* Quote marks */}
                                <div className="text-5xl font-black text-[#137fec]/20 leading-none mb-2 font-serif">
                                    "
                                </div>

                                <blockquote className="text-lg text-[#94A3B8] leading-relaxed mb-6 italic">
                                    {t("about_founder_quote")}
                                </blockquote>

                                <div className="mb-6">
                                    <p className="text-[#E2E8F0] font-black text-lg uppercase tracking-wide">
                                        {t("about_founder_name")}
                                    </p>
                                    <p className="text-[#137fec] font-semibold text-sm tracking-widest">
                                        {t("about_founder_role")}
                                    </p>
                                </div>

                                {/* Social icons */}
                                <div className="flex items-center gap-3 mb-8">
                                    {SOCIALS.map(({ icon: Icon, href, label }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={label}
                                            className="w-9 h-9 rounded-full bg-[#E2E8F0] text-white flex items-center justify-center hover:bg-[#137fec] transition-colors duration-200"
                                        >
                                            <Icon className="w-4 h-4" />
                                        </a>
                                    ))}
                                </div>

                                <Button
                                    variant="accent"
                                    size="lg"
                                    onClick={handleDemoClick}
                                    className="self-start font-bold tracking-wide uppercase"
                                >
                                    {t("about_cta")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
