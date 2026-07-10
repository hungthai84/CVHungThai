import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import * as translations from '../translations';

type Language = 'vi' | 'en';
type Translations = typeof translations.vi;

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper for deep merging objects, used for custom translations
const isObject = (item: any): item is Record<string, any> => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

const deepMerge = <T extends Record<string, any>>(target: T, source: Record<string, any>): T => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    (output as Record<string, any>)[key] = deepMerge(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
};


export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang === 'en' || savedLang === 'vi') return savedLang;
        
        // Detect browser language
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('vi')) return 'vi';
        if (browserLang.startsWith('en')) return 'en';
        
        return 'vi'; // Default to Vietnamese
    });

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);
    
    const t = useMemo(() => {
        const defaultTranslations = translations;
        const customTranslationsStr = localStorage.getItem('customTranslations');
        
        if (customTranslationsStr) {
            try {
                const customTranslations = JSON.parse(customTranslationsStr);
                // Create a deep clone of default translations to avoid mutating the imported module
                const merged = deepMerge(JSON.parse(JSON.stringify(defaultTranslations)), customTranslations);
                return merged[language] || defaultTranslations[language];
            } catch (e) {
                console.error("Failed to parse or merge custom translations:", e);
                // Fallback to default if parsing or merging fails
                return defaultTranslations[language];
            }
        }
        
        return defaultTranslations[language];
    }, [language]);

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        console.warn('useI18n was called outside I18nProvider. Using fallback translations.');
        return {
            language: 'vi' as Language,
            setLanguage: () => {},
            t: translations.vi
        };
    }
    return context;
};