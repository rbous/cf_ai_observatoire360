import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";

export default function Hero() {
    const handleDemoClick = () => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
            style={{ background: "#0F172A" }}
        >
            {/* Subtle CSS grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Radial glow behind text */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)",
                }}
            />

            {/* Amber accent glow */}
            <div
                className="absolute bottom-1/3 right-1/4 w-64 h-64 pointer-events-none opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, #D4A843, transparent)" }}
            />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    <span className="inline-block text-xs font-bold tracking-widest text-[#6366F1] uppercase mb-6 bg-[#6366F1]/10 px-4 py-1.5 rounded-full border border-[#6366F1]/20">
                        Technologie québécoise
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                    className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none mb-4"
                >
                    OBSERVATOIRE
                    <br />
                    <span className="text-[#6366F1]">360</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-4 leading-relaxed"
                >
                    — VOTRE SOLUTION DE SURVEILLANCE TERRITORIALE
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
                    className="text-base text-slate-500 max-w-xl mb-10 leading-relaxed"
                >
                    Détectez automatiquement les constructions sans permis, recevez des alertes,
                    récupérez vos revenus et libérez votre équipe.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Button
                        variant="accent"
                        size="xl"
                        onClick={handleDemoClick}
                        className="font-bold tracking-wide uppercase"
                    >
                        DÉMO GRATUITE
                    </Button>
                    <Button
                        variant="outline"
                        size="xl"
                        onClick={() => {
                            const el = document.getElementById("comment-ca-marche");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        Comment ça marche
                    </Button>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="mt-16 flex flex-wrap gap-10 justify-center"
                >
                    {[
                        { value: "100%", label: "Couverture territoire" },
                        { value: "24/7", label: "Surveillance automatique" },
                        { value: "48h", label: "Délai de réponse" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl font-black text-[#6366F1]">{stat.value}</div>
                            <div className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="w-6 h-10 rounded-full border-2 border-[#6366F1]/40 flex items-start justify-center p-1.5"
                >
                    <div className="w-1 h-2 rounded-full bg-[#6366F1]" />
                </motion.div>
            </motion.div>
        </section>
    );
}
