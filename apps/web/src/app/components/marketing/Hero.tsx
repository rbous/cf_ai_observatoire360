import { motion } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import Globe3D from "./Globe3D";

export default function Hero() {
    const handleDemoClick = () => {
        const el = document.getElementById("contact");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section
            className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20"
            style={{
                background: "linear-gradient(160deg, #B3E5FC 0%, #e0f7fa 40%, #ffffff 100%)",
            }}
        >
            {/* Decorative background blobs */}
            <div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, #008B8B, transparent)" }}
            />
            <div
                className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, #D4A843, transparent)" }}
            />

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-16">
                {/* Text content */}
                <div className="flex-1 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <span className="inline-block text-xs font-bold tracking-widest text-[#008B8B] uppercase mb-4 bg-[#008B8B]/10 px-4 py-1.5 rounded-full">
                            Technologie québécoise
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#1A2332] leading-tight mb-6"
                    >
                        OBSERVATOIRE{" "}
                        <span className="text-[#008B8B]">360</span>
                        <br />
                        <span className="text-3xl sm:text-4xl lg:text-5xl">
                            — VOTRE{" "}
                            <span className="relative">
                                SOLUTION
                                <span
                                    className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                                    style={{ background: "#D4A843" }}
                                />
                            </span>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="text-lg sm:text-xl text-[#2A3A4E]/80 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
                    >
                        Détectez automatiquement les constructions sans permis, recevez des alertes,
                        récupérez vos revenus et libérez votre équipe.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                        <Button
                            variant="accent"
                            size="xl"
                            onClick={handleDemoClick}
                            className="font-bold tracking-wide uppercase shadow-lg shadow-[#D4A843]/30 hover:shadow-[#D4A843]/50 transition-shadow"
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
                        className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start"
                    >
                        {[
                            { value: "100%", label: "Couverture territoire" },
                            { value: "24/7", label: "Surveillance automatique" },
                            { value: "48h", label: "Délai de réponse" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center lg:text-left">
                                <div className="text-2xl font-black text-[#008B8B]">{stat.value}</div>
                                <div className="text-xs text-[#2A3A4E]/60 font-medium mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Globe */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="flex-1 w-full max-w-sm lg:max-w-lg xl:max-w-xl"
                    style={{ height: "420px" }}
                >
                    <Globe3D />
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
                    className="w-6 h-10 rounded-full border-2 border-[#008B8B]/40 flex items-start justify-center p-1.5"
                >
                    <div className="w-1 h-2 rounded-full bg-[#008B8B]" />
                </motion.div>
            </motion.div>
        </section>
    );
}
