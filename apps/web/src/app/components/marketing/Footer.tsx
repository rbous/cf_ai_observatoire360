import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Twitter, Phone, Mail } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
    CONTACT_PHONE,
    CONTACT_EMAIL,
    SOCIAL_INSTAGRAM,
    SOCIAL_FACEBOOK,
    SOCIAL_LINKEDIN,
    SOCIAL_X,
} from "@/app/lib/constants";

const FOOTER_LINKS = {
    PRODUIT: [
        { label: "Accueil", href: "/" },
        { label: "Comment ça marche", href: "#comment-ca-marche" },
        { label: "Forfaits", href: "#forfaits" },
        { label: "Ressources", href: "#ressources" },
    ],
    ENTREPRISE: [
        { label: "À propos", href: "#a-propos" },
    ],
    SUPPORT: [
        { label: "Centre d'aide", href: "#" },
        { label: "Documentation", href: "#" },
        { label: "Contact", href: "#contact" },
        { label: "FAQ", href: "#ressources" },
    ],
};

const SOCIALS = [
    { icon: Instagram, href: SOCIAL_INSTAGRAM, label: "Instagram" },
    { icon: Facebook, href: SOCIAL_FACEBOOK, label: "Facebook" },
    { icon: Linkedin, href: SOCIAL_LINKEDIN, label: "LinkedIn" },
    { icon: Twitter, href: SOCIAL_X, label: "X (Twitter)" },
];

function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href.startsWith("#")) {
        e.preventDefault();
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
    }
}

export default function Footer() {
    return (
        <footer style={{ background: "#1A2332" }} className="text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                            <div className="w-8 h-8 rounded-full bg-[#008B8B] flex items-center justify-center">
                                <span className="text-white font-bold text-xs">O</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                Observatoire{" "}
                                <span className="text-[#008B8B]">360</span>
                            </span>
                        </Link>

                        <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
                            Essayez et voyez par vous-même comment la détection satellite peut transformer
                            la gestion de votre territoire.
                        </p>

                        <Button
                            variant="accent"
                            size="lg"
                            className="font-bold tracking-wide uppercase mb-6"
                            onClick={() => {
                                const el = document.getElementById("contact");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            DÉMO GRATUITE
                        </Button>

                        {/* Contact info */}
                        <div className="space-y-2">
                            <a
                                href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                                <Phone className="w-4 h-4 text-[#008B8B] shrink-0" />
                                {CONTACT_PHONE}
                            </a>
                            <a
                                href={`mailto:${CONTACT_EMAIL}`}
                                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                                <Mail className="w-4 h-4 text-[#008B8B] shrink-0" />
                                {CONTACT_EMAIL}
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([section, links]) => (
                        <div key={section}>
                            <h4 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">
                                {section}
                            </h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        {link.href.startsWith("#") ? (
                                            <a
                                                href={link.href}
                                                onClick={(e) => handleAnchorClick(e, link.href)}
                                                className="text-sm text-white/60 hover:text-white transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                to={link.href}
                                                className="text-sm text-white/60 hover:text-white transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Social + bottom bar */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Social icons */}
                        <div className="flex items-center gap-3">
                            {SOCIALS.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#008B8B] transition-colors duration-200"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>

                        {/* Legal links */}
                        <div className="flex items-center gap-4 text-xs text-white/40">
                            <a href="#" className="hover:text-white/70 transition-colors">
                                Politique de confidentialité
                            </a>
                            <span>|</span>
                            <a href="#" className="hover:text-white/70 transition-colors">
                                Conditions d'utilisation
                            </a>
                        </div>
                    </div>

                    <p className="text-center text-xs text-white/30 mt-6">
                        © 2026 OBSERVATOIRE 360. Conçu par un inspecteur pour les municipalités.
                    </p>
                </div>
            </div>
        </footer>
    );
}
