import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { api } from "@/app/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post("/auth/forgot-password", { email });
        setIsSubmitted(true);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ background: "#0F172A" }}
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#137fec] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#E2E8F0]">
                            Observatoire <span className="text-[#137fec]">360</span>
                        </span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-black uppercase text-[#E2E8F0]">
                        MOT DE PASSE OUBLIÉ
                    </h1>
                    <p className="text-sm text-[#94A3B8]/60 mt-1">
                        Entrez votre courriel pour recevoir un lien de réinitialisation
                    </p>
                </div>

                <div className="bg-slate-900 rounded-3xl border border-slate-700 p-8">
                    {isSubmitted ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                            </div>
                            <h3 className="font-bold text-[#E2E8F0] mb-2">Courriel envoyé!</h3>
                            <p className="text-sm text-[#94A3B8]/70">
                                Si un compte existe pour {email}, vous recevrez un lien de réinitialisation sous peu.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Courriel"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vous@municipalite.qc.ca"
                                required
                            />
                            <Button
                                type="submit"
                                variant="default"
                                size="lg"
                                className="w-full font-bold tracking-wide uppercase"
                            >
                                ENVOYER LE LIEN
                            </Button>
                        </form>
                    )}
                </div>

                <div className="text-center mt-6">
                    <Link
                        to="/connexion"
                        className="inline-flex items-center gap-1.5 text-sm text-[#137fec] hover:underline font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la connexion
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
