import { createContext, useState, useCallback, type ReactNode } from "react";
import { translations, type Locale, type TranslationKey } from "@/app/i18n/translations";

const STORAGE_KEY = "obs360_locale";

function getInitialLocale(): Locale {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "fr" || stored === "en") {
            return stored;
        }
    } catch {
        // localStorage may be unavailable in some environments
    }
    return "fr";
}

export interface LanguageContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey) => string;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        try {
            localStorage.setItem(STORAGE_KEY, newLocale);
        } catch {
            // localStorage may be unavailable in some environments
        }
    }, []);

    const t = useCallback(
        (key: TranslationKey): string => {
            return translations[locale][key] as string;
        },
        [locale]
    );

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}
