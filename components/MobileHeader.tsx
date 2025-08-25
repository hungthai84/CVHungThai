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
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
    title, 
    onMenuClick,
    onOpenSettings,
    onOpenAiChat,
    onPrintClick,
    onSchedulerClick
}) => {
    const { t } = useI18n();
    return (
        <header className="mobile-header">
            <h1 className="mobile-header-title">{title}</h1>
            <div className="mobile-header-controls">
                <button onClick={onPrintClick} className="header-icon-button" aria-label="Print or save as PDF" title="In hoặc lưu PDF">
                    <Icons.PrinterIcon />
                </button>
                <button onClick={onOpenSettings} className="header-icon-button" aria-label="Settings" title="Cài đặt">
                    <Icons.SettingsIcon />
                </button>
                <button onClick={onSchedulerClick} className="header-icon-button" aria-label="Lên lịch hẹn" title="Lên lịch hẹn">
                    <Icons.CalendarDaysIcon />
                </button>
                <button onClick={onOpenAiChat} className="header-icon-button" aria-label={t.sidebar.nav.aiChat} title={t.sidebar.nav.aiChat}>
                    <Icons.BotIcon />
                </button>
                <button
                    className="header-icon-button menu-toggle-btn"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    <Icons.MenuIcon />
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;