import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: implement authentication
        console.log("Login attempt", form);
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
                    <Link to="/" className="inline-flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-[#008B8B] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">O</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#1A2332]">
                            Observatoire <span className="text-[#008B8B]">360</span>
                        </span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-black uppercase text-[#1A2332]">
                        ESPACE CLIENT
                    </h1>
                    <p className="text-sm text-[#2A3A4E]/60 mt-1">
                        Connectez-vous à votre tableau de bord
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-white rounded-3xl shadow-xl border border-[#008B8B]/10 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Courriel"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="vous@municipalite.qc.ca"
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Mot de passe"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-8 text-gray-400 hover:text-[#008B8B] transition-colors"
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/mot-de-passe-oublie"
                                className="text-sm text-[#008B8B] hover:underline font-medium"
                            >
                                Mot de passe oublié?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="default"
                            size="lg"
                            className="w-full font-bold tracking-wide uppercase"
                        >
                            SE CONNECTER
                        </Button>
                    </form>
                </div>

                <p className="text-center text-sm text-[#2A3A4E]/60 mt-6">
                    Pas encore client?{" "}
                    <a
                        href="#contact"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = "/#contact";
                        }}
                        className="text-[#008B8B] hover:underline font-medium"
                    >
                        Réservez une démo
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
