import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [form, setForm] = useState({ password: "", confirm: "" });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (form.password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }
        // TODO: implement reset password
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
                        RÉINITIALISER LE MOT DE PASSE
                    </h1>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-[#008B8B]/10 p-8">
                    {isSubmitted ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
                            </div>
                            <h3 className="font-bold text-[#1A2332] mb-2">Mot de passe réinitialisé!</h3>
                            <p className="text-sm text-[#2A3A4E]/70 mb-6">
                                Votre mot de passe a été mis à jour avec succès.
                            </p>
                            <Link to="/connexion">
                                <Button variant="default" size="lg" className="w-full font-bold uppercase">
                                    SE CONNECTER
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="relative">
                                <Input
                                    label="Nouveau mot de passe"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    hint="Au moins 8 caractères"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-[#008B8B] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    label="Confirmer le mot de passe"
                                    name="confirm"
                                    type={showConfirm ? "text" : "password"}
                                    value={form.confirm}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    error={error ?? undefined}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-8 text-gray-400 hover:text-[#008B8B] transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            <Button
                                type="submit"
                                variant="default"
                                size="lg"
                                className="w-full font-bold tracking-wide uppercase"
                            >
                                METTRE À JOUR
                            </Button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
