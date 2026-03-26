import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/app/components/ui/button";
import { NAV_LINKS } from "@/app/lib/constants";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { locale, setLocale, t } = useLanguage();

    const toggleLocale = () => setLocale(locale === "fr" ? "en" : "fr");

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleNavClick = (href: string) => {
        setIsMobileOpen(false);
        const id = href.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? "bg-[#0F172A] border-b border-slate-700 backdrop-blur-md"
                        : "bg-transparent"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-full bg-[#137fec] flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </div>
                            <span
                                className={`font-bold text-lg tracking-tight transition-colors ${
                                    isScrolled ? "text-[#E2E8F0]" : "text-[#E2E8F0]"
                                } group-hover:text-[#137fec]`}
                            >
                                Observatoire <span className="text-[#137fec]">360</span>
                            </span>
                        </Link>

                        {/* Desktop nav links */}
                        <div className="hidden lg:flex items-center gap-6">
                            {NAV_LINKS.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavClick(link.href)}
                                    className="text-xs font-semibold tracking-wide text-[#E2E8F0] hover:text-[#137fec] transition-colors cursor-pointer whitespace-nowrap"
                                >
                                    {link.href === "#comment-ca-marche" && t("nav_link_how_it_works")}
                                    {link.href === "#forfaits" && t("nav_link_pricing")}
                                    {link.href === "#a-propos" && t("nav_link_about")}
                                    {link.href === "#ressources" && t("nav_link_resources")}
                                    {link.href === "#contact" && t("nav_link_contact")}
                                </button>
                            ))}
                        </div>

                        {/* CTA + hamburger */}
                        <div className="flex items-center gap-3">
                            {/* Language toggle */}
                            <button
                                onClick={toggleLocale}
                                className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#E2E8F0]/60 hover:text-[#137fec] transition-colors tracking-wide"
                                aria-label="Toggle language"
                            >
                                <span className={locale === "fr" ? "text-[#137fec] font-bold" : ""}>FR</span>
                                <span className="text-[#E2E8F0]/30">|</span>
                                <span className={locale === "en" ? "text-[#137fec] font-bold" : ""}>EN</span>
                            </button>
                            <Link to="/connexion" className="hidden sm:block">
                                <Button variant="accent" size="default" className="font-bold tracking-wide text-xs uppercase">
                                    {t("nav_client_area")}
                                </Button>
                            </Link>
                            <button
                                onClick={() => setIsMobileOpen(!isMobileOpen)}
                                className="lg:hidden p-2 rounded-lg text-[#E2E8F0] hover:bg-[#137fec]/10 transition-colors"
                                aria-label="Menu"
                            >
                                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-16 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-md shadow-none border-t border-slate-800 lg:hidden"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                            {NAV_LINKS.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavClick(link.href)}
                                    className="text-left px-4 py-3 text-sm font-semibold text-[#E2E8F0] hover:text-[#137fec] hover:bg-[#137fec]/5 rounded-lg transition-colors tracking-wide"
                                >
                                    {link.href === "#comment-ca-marche" && t("nav_link_how_it_works")}
                                    {link.href === "#forfaits" && t("nav_link_pricing")}
                                    {link.href === "#a-propos" && t("nav_link_about")}
                                    {link.href === "#ressources" && t("nav_link_resources")}
                                    {link.href === "#contact" && t("nav_link_contact")}
                                </button>
                            ))}
                            <div className="pt-2 border-t border-slate-800 mt-2 flex flex-col gap-2">
                                <button
                                    onClick={toggleLocale}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#E2E8F0]/60 hover:text-[#137fec] transition-colors"
                                    aria-label="Toggle language"
                                >
                                    <span className={locale === "fr" ? "text-[#137fec] font-bold" : ""}>FR</span>
                                    <span className="text-[#E2E8F0]/30">|</span>
                                    <span className={locale === "en" ? "text-[#137fec] font-bold" : ""}>EN</span>
                                </button>
                                <Link to="/connexion" onClick={() => setIsMobileOpen(false)}>
                                    <Button variant="accent" size="lg" className="w-full font-bold tracking-wide text-sm uppercase">
                                        {t("nav_client_area")}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
