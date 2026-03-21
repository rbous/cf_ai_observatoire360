// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

// App metadata
export const APP_NAME = "Observatoire 360";
export const APP_TAGLINE = "Votre Solution";
export const APP_DESCRIPTION =
    "Détectez automatiquement les constructions sans permis, recevez des alertes, récupérez vos revenus et libérez votre équipe.";

// Contact information
export const CONTACT_PHONE = "(819) 593-4346";
export const CONTACT_EMAIL = "contact@observatoir360.com";
export const CONTACT_ADDRESS = "Basé au Québec";
export const CONTACT_HOURS = "Lundi-Vendredi 8h-17h";
export const CONTACT_RESPONSE_TIME = "sous 48h ouvrables";

// Social media links
export const SOCIAL_INSTAGRAM = "https://instagram.com/observatoire360";
export const SOCIAL_FACEBOOK = "https://facebook.com/observatoire360";
export const SOCIAL_LINKEDIN = "https://linkedin.com/company/observatoire360";
export const SOCIAL_X = "https://x.com/observatoire360";

// Navigation links (anchor-based for landing page)
export const NAV_LINKS = [
    { label: "COMMENT ÇA MARCHE", href: "#comment-ca-marche" },
    { label: "FORFAITS", href: "#forfaits" },
    { label: "À PROPOS", href: "#a-propos" },
    { label: "RESSOURCES", href: "#ressources" },
    { label: "CONTACT", href: "#contact" },
] as const;

// Dashboard routes
export const DASHBOARD_ROUTES = {
    HOME: "/tableau-de-bord",
    REPORTS: "/tableau-de-bord/rapports",
    PLANNING: "/tableau-de-bord/planification",
    LAYERS: "/tableau-de-bord/calques",
} as const;

// Auth routes
export const AUTH_ROUTES = {
    LOGIN: "/connexion",
    FORGOT_PASSWORD: "/mot-de-passe-oublie",
    RESET_PASSWORD: "/reinitialiser-mot-de-passe",
} as const;

// Launch offer banner
export const LAUNCH_OFFER_TEXT =
    "OFFRE DE LANCEMENT: 3 MOIS GRATUITS POUR LES 10 PREMIÈRE MUNICIPALITÉ";

// Animation defaults
export const ANIMATION_DURATION = 0.6;
export const ANIMATION_STAGGER = 0.1;
