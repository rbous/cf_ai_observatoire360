import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, MapPin } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useAuth } from "@/app/hooks/useAuth";
import { DASHBOARD_ROUTES } from "@/app/lib/constants";
import { useLanguage } from "@/app/hooks/useLanguage";

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
    const { t } = useLanguage();

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
                    : t("login_error_default")
            );
        } finally {
            setIsSubmitting(false);
        }
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
                    <Link to="/" className="inline-flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-[#137fec] flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-[#E2E8F0]">
                            Observatoire <span className="text-[#137fec]">360</span>
                        </span>
                    </Link>
                    <h1 className="mt-6 text-2xl font-black uppercase text-[#E2E8F0]">
                        {t("login_title")}
                    </h1>
                    <p className="text-sm text-[#94A3B8]/60 mt-1">
                        {t("login_subtitle")}
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-slate-900 rounded-3xl shadow-none border border-slate-700 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-950/40 border border-red-700/50 text-red-400 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label={t("login_email")}
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="vous@municipalite.qc.ca"
                            required
                        />

                        <div className="relative">
                            <Input
                                label={t("login_password")}
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
                                className="absolute right-3 top-8 text-slate-400 hover:text-[#137fec] transition-colors"
                                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="/mot-de-passe-oublie"
                                className="text-sm text-[#137fec] hover:underline font-medium"
                            >
                                {t("login_forgot")}
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="default"
                            size="lg"
                            className="w-full font-bold tracking-wide uppercase"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t("login_submitting") : t("login_submit")}
                        </Button>
                    </form>
                </div>

                {/* Demo access */}
                <div className="mt-8 bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                        {t("login_or_demo")}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                        {DEMO_CITIES.map((city) => (
                            <button
                                key={city.email}
                                onClick={() => handleDemoLogin(city.email)}
                                disabled={demoLoading !== null}
                                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/50 hover:border-[#137fec]/50 hover:bg-[#137fec]/10 transition-all text-left disabled:opacity-40"
                            >
                                <span className="text-xl">{city.flag}</span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                                        {demoLoading === city.email ? "..." : city.label}
                                    </p>
                                </div>
                                <svg className="w-4 h-4 text-slate-600 group-hover:text-[#137fec] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-center text-sm text-slate-500 mt-5">
                    {t("login_no_account")}{" "}
                    <a
                        href="#contact"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = "/#contact";
                        }}
                        className="text-[#137fec] hover:underline font-medium"
                    >
                        {t("login_book_demo")}
                    </a>
                </p>
            </motion.div>
        </div>
    );
}
