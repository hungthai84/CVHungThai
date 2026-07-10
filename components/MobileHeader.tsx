import React from 'react';
import * as Icons from './Icons';
import { useI18n } from '../contexts/i18n';
import { useTheme } from '../contexts/ThemeContext';

interface MobileHeaderProps {
    title: string;
    onMenuClick: () => void;
    onOpenAiChat: () => void;
    isIdle?: boolean;
    activePageKey?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
    title, 
    onMenuClick,
    onOpenAiChat,
    isIdle,
    activePageKey,
}) => {
    const { t, language } = useI18n();
    const { themeMode, setThemeMode } = useTheme();

    return (
        <header className="mobile-header">
            <button
                className="header-icon-button menu-toggle-btn"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <Icons.MenuIcon size={24} />
            </button>
            {activePageKey !== 'home' && <h1 className="mobile-header-title">{title}</h1>}
            <div className="mobile-header-controls">
                <button
                    onClick={() => {
                        setThemeMode(themeMode === 'light' ? 'dark' : 'light');
                    }}
                    className="header-icon-button theme-toggle-btn"
                    title={themeMode === 'dark' ? (language === 'vi' ? 'Chế độ tối' : 'Dark mode') : (language === 'vi' ? 'Chế độ sáng' : 'Light mode')}
                    aria-label="Toggle theme"
                >
                    {themeMode === 'dark' ? (
                        <Icons.MoonIcon size={24} style={{ color: 'var(--accent-color)' }} />
                    ) : (
                        <Icons.SunIcon size={24} style={{ color: '#f59e0b' }} />
                    )}
                </button>
                <button onClick={onOpenAiChat} className={`header-icon-button ${isIdle && activePageKey !== 'aiChat' ? 'ai-chat-pulse' : ''}`} aria-label={t.sidebar.nav.aiChat} title={t.sidebar.nav.aiChat}>
                    <Icons.BotIcon size={24} />
                </button>
                <a href="https://zalo.me/0909097882" target="_blank" rel="noopener noreferrer" className="header-icon-button control-zalo" title="Chat Zalo">
                    <Icons.MessageCircleIcon size={24} />
                </a>
            </div>
        </header>
    );
};

export default MobileHeader;