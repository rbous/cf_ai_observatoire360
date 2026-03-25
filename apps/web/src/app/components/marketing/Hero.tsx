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
                        "linear-gradient(rgba(19,127,236,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(19,127,236,0.06) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Blue radial glow behind main text */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(19,127,236,0.10) 0%, transparent 68%)",
                }}
            />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center py-20">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="text-7xl sm:text-8xl lg:text-[9rem] font-black uppercase tracking-tight text-white leading-none mb-0"
                >
                    OBSERVATOIRE
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
                    className="text-7xl sm:text-8xl lg:text-[9rem] font-black uppercase tracking-tight leading-none mb-6"
                    style={{ color: "#137fec" }}
                >
                    360
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
                    className="text-base sm:text-lg text-slate-400 font-semibold tracking-widest mb-4 uppercase"
                >
                    — VOTRE SOLUTION DE SURVEILLANCE TERRITORIALE
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
                    className="text-sm sm:text-base text-slate-500 max-w-xl mb-10 leading-relaxed"
                >
                    Détectez automatiquement les constructions sans permis, recevez des alertes,
                    récupérez vos revenus et libérez votre équipe.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.32, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <Button
                        variant="accent"
                        size="xl"
                        onClick={handleDemoClick}
                        className="font-bold tracking-widest uppercase rounded-full px-8"
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
                        className="rounded-full px-8"
                    >
                        Comment ça marche
                    </Button>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.52 }}
                    className="mt-16 flex flex-wrap gap-0 justify-center divide-x divide-slate-700"
                >
                    {[
                        { value: "100%", label: "COUVERTURE TERRITOIRE" },
                        { value: "24/7", label: "SURVEILLANCE AUTOMATIQUE" },
                        { value: "48h", label: "DÉLAI DE RÉPONSE" },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center px-8 py-2">
                            <div className="text-2xl font-black text-[#E2E8F0]">{stat.value}</div>
                            <div className="text-[10px] text-slate-500 font-semibold mt-1 uppercase tracking-widest">{stat.label}</div>
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
                    className="w-6 h-10 rounded-full border-2 border-[#137fec]/40 flex items-start justify-center p-1.5"
                >
                    <div className="w-1 h-2 rounded-full bg-[#137fec]" />
                </motion.div>
            </motion.div>
        </section>
    );
}
