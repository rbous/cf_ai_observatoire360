import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Twitter, Phone, Mail } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/hooks/useLanguage";
import {
    CONTACT_PHONE,
    CONTACT_EMAIL,
    SOCIAL_INSTAGRAM,
    SOCIAL_FACEBOOK,
    SOCIAL_LINKEDIN,
    SOCIAL_X,
} from "@/app/lib/constants";

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
    const { t } = useLanguage();

    const FOOTER_LINKS = {
        [t("footer_section_product")]: [
            { label: t("footer_link_home"), href: "/" },
            { label: t("footer_link_how_it_works"), href: "#comment-ca-marche" },
            { label: t("footer_link_pricing"), href: "#forfaits" },
            { label: t("footer_link_resources"), href: "#ressources" },
        ],
        [t("footer_section_company")]: [
            { label: t("footer_link_about"), href: "#a-propos" },
        ],
        [t("footer_section_support")]: [
            { label: t("footer_link_help"), href: "#" },
            { label: t("footer_link_docs"), href: "#" },
            { label: t("footer_link_contact"), href: "#contact" },
            { label: t("footer_link_faq"), href: "#ressources" },
        ],
    };

    return (
        <footer style={{ background: "#0F172A" }} className="text-slate-200 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
                            <div className="w-8 h-8 rounded-full bg-[#137fec] flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                Observatoire{" "}
                                <span className="text-[#137fec]">360</span>
                            </span>
                        </Link>

                        <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
                            {t("footer_tagline")}
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
                            {t("footer_cta_demo")}
                        </Button>

                        {/* Contact info */}
                        <div className="space-y-2">
                            <a
                                href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                                <Phone className="w-4 h-4 text-[#137fec] shrink-0" />
                                {CONTACT_PHONE}
                            </a>
                            <a
                                href={`mailto:${CONTACT_EMAIL}`}
                                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                                <Mail className="w-4 h-4 text-[#137fec] shrink-0" />
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
                                    <li key={link.href}>
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
                                    className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-[#137fec] hover:border-[#137fec] transition-colors duration-200"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>

                        {/* Legal links */}
                        <div className="flex items-center gap-4 text-xs text-white/40">
                            <a href="#" className="hover:text-white/70 transition-colors">
                                {t("footer_privacy")}
                            </a>
                            <span>|</span>
                            <a href="#" className="hover:text-white/70 transition-colors">
                                {t("footer_terms")}
                            </a>
                        </div>
                    </div>

                    <p className="text-center text-xs text-white/30 mt-6">
                        {t("footer_copyright")}
                    </p>
                </div>
            </div>
        </footer>
    );
}
