import React from 'react';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useI18n();

    const toggleLanguage = () => {
        const newLang = language === 'vi' ? 'en' : 'vi';
        setLanguage(newLang);
    };

    return (
        <button 
            className="language-switcher" 
            onClick={toggleLanguage}
            title={language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
        >
            <Icons.GlobeAltIcon />
            <span>{language.toUpperCase()}</span>
        </button>
    );
};

export default LanguageSwitcher;
