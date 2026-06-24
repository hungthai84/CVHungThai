import React from 'react';
import * as Icons from './Icons';
import { useI18n } from '../contexts/i18n';

interface MobileHeaderProps {
    title: string;
    onMenuClick: () => void;
    onOpenSettings: () => void;
    onOpenAiChat: () => void;
    onPrintClick: () => void;
    onSchedulerClick: () => void;
    isIdle?: boolean;
    activePageKey?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
    title, 
    onMenuClick,
    onOpenSettings,
    onOpenAiChat,
    onPrintClick,
    onSchedulerClick,
    isIdle,
    activePageKey,
}) => {
    const { t } = useI18n();
    return (
        <header className="mobile-header">
            <h1 className="mobile-header-title">{title}</h1>
            <div className="mobile-header-controls">
                <button onClick={onPrintClick} className="header-icon-button" aria-label="View or download CV" title="Xem & Tải CV">
                    <Icons.PrinterIcon size={24} />
                </button>
                <button onClick={onOpenSettings} className="header-icon-button" aria-label="Settings" title="Cài đặt">
                    <Icons.SettingsIcon size={24} />
                </button>
                <button onClick={onSchedulerClick} className="header-icon-button" aria-label="Lên lịch hẹn" title="Lên lịch hẹn">
                    <Icons.CalendarDaysIcon size={24} />
                </button>
                <button onClick={onOpenAiChat} className={`header-icon-button ${isIdle && activePageKey !== 'aiChat' ? 'ai-chat-pulse' : ''}`} aria-label={t.sidebar.nav.aiChat} title={t.sidebar.nav.aiChat}>
                    <Icons.BotIcon size={24} />
                </button>
                <a href="https://zalo.me/0909097882" target="_blank" rel="noopener noreferrer" className="header-icon-button control-zalo" title="Chat Zalo">
                    <Icons.MessageCircleIcon size={24} />
                </a>
                <button
                    className="header-icon-button menu-toggle-btn"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    <Icons.MenuIcon size={24} />
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;