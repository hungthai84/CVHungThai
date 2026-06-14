import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../contexts/i18nContext';
import * as Icons from './Icons';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'en', name: 'English' }
    ];
    
    const currentLanguageName = language === 'vi' ? 'Tiếng Việt' : 'English';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    const handleLanguageChange = (langCode: 'vi' | 'en') => {
        setLanguage(langCode);
        setIsOpen(false);
    }

    return (
        <div className="language-switcher-dropdown" ref={dropdownRef}>
            <button className="language-switcher-button highlighted-white-btn" onClick={() => setIsOpen(!isOpen)} aria-haspopup="true" aria-expanded={isOpen}>
                <Icons.GlobeAltIcon size={18} />
                <span>{currentLanguageName}</span>
                <Icons.ChevronDownIcon size={16} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
            </button>
            {isOpen && (
                <div className="language-dropdown-panel">
                    {languages.map(lang => (
                        <button 
                            key={lang.code} 
                            className={`dropdown-item ${language === lang.code ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.code as 'vi' | 'en')}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
