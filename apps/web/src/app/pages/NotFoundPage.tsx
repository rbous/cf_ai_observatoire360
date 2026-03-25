import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export default function NotFoundPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "#0F172A" }}
        >
            <div className="text-center max-w-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    {/* 404 */}
                    <div className="mb-6">
                        <span
                            className="text-[160px] sm:text-[200px] font-black leading-none select-none"
                            style={{
                                background: "linear-gradient(135deg, #6366F1, #1E293B)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            404
                        </span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h1 className="text-2xl sm:text-3xl font-black uppercase text-[#E2E8F0] mb-3">
                            Page introuvable
                        </h1>
                        <p className="text-[#94A3B8]/70 mb-8 leading-relaxed">
                            Oops! La page que vous cherchez n'existe pas ou a été déplacée.
                            Retournez à l'accueil pour continuer votre exploration.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/">
                                <Button variant="default" size="lg" className="gap-2 font-semibold">
                                    <Home className="w-4 h-4" />
                                    Retour à l'accueil
                                </Button>
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 border-[#6366F1] text-[#6366F1] font-semibold hover:bg-[#6366F1] hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Page précédente
                            </button>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Decorative globe hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-12 text-6xl select-none"
                    aria-hidden="true"
                >
                    🌐
                </motion.div>
            </div>
        </div>
    );
}
