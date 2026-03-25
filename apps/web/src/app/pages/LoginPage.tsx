import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAuth } from "@/app/hooks/useAuth";
import { DASHBOARD_ROUTES } from "@/app/lib/constants";

const DEMO_CITIES = [
    { label: "Gatineau, QC", flag: "\u{1F1E8}\u{1F1E6}", email: "demo@observatoire360.com" },
    { label: "Austin, TX", flag: "\u{1F1FA}\u{1F1F8}", email: "demo.austin@observatoire360.com" },
    { label: "London, UK", flag: "\u{1F1EC}\u{1F1E7}", email: "demo.london@observatoire360.com" },
    { label: "Lisbon, PT", flag: "\u{1F1F5}\u{1F1F9}", email: "demo.lisbon@observatoire360.com" },
] as const;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [demoLoading, setDemoLoading] = useState<string | null>(null);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleDemoLogin = async (email: string) => {
        setError(null);
        setDemoLoading(email);
        try {
            await login(email, "REDACTED_DEMO_PASSWORD");
            navigate(DASHBOARD_ROUTES.HOME, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Demo login failed.");
        } finally {
            setDemoLoading(null);
        }
    };

    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
        navigate(DASHBOARD_ROUTES.HOME, { replace: true });
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login(form.email, form.password);
            navigate(DASHBOARD_ROUTES.HOME, { replace: true });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Courriel ou mot de passe incorrect."
            );
        } finally {
            setIsSubmitting(false);
        }
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
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

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
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "CONNEXION..." : "SE CONNECTER"}
                        </Button>
                    </form>
                </div>

                {/* Demo access */}
                <div className="mt-6">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-3 text-[#2A3A4E]/40 font-semibold tracking-wider">
                                ou essayer la démo
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {DEMO_CITIES.map((city) => (
                            <button
                                key={city.email}
                                onClick={() => handleDemoLogin(city.email)}
                                disabled={demoLoading !== null}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#008B8B]/40 hover:bg-[#008B8B]/5 transition-all text-left disabled:opacity-50"
                            >
                                <span className="text-lg">{city.flag}</span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#1A2332] truncate">
                                        {demoLoading === city.email ? "Connexion..." : city.label}
                                    </p>
                                    <p className="text-[10px] text-[#2A3A4E]/40">Démo gratuite</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-center text-sm text-[#2A3A4E]/60 mt-4">
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
