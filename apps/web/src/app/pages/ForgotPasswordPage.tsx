import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: implement forgot password
        setIsSubmitted(true);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-12"
            style={{ background: "linear-gradient(160deg, #B3E5FC 0%, #e0f7fa 40%, #ffffff 100%)" }}
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
                        <div className="w-10 h-10 rounded-full bg-[#008B8B] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">O</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#1A2332]">
                            Observatoire <span className="text-[#008B8B]">360</span>
                        </span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-black uppercase text-[#1A2332]">
                        MOT DE PASSE OUBLIÉ
                    </h1>
                    <p className="text-sm text-[#2A3A4E]/60 mt-1">
                        Entrez votre courriel pour recevoir un lien de réinitialisation
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-[#008B8B]/10 p-8">
                    {isSubmitted ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                            </div>
                            <h3 className="font-bold text-[#1A2332] mb-2">Courriel envoyé!</h3>
                            <p className="text-sm text-[#2A3A4E]/70">
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
                        className="inline-flex items-center gap-1.5 text-sm text-[#008B8B] hover:underline font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la connexion
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
