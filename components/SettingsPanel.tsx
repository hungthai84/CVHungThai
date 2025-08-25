import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';

interface SettingsPageProps {
    id?: string;
}

const lightGradientWallpapers = [
    'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 100%)',
    'linear-gradient(45deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(45deg, #fad0c4 0%, #ffd1ff 100%)',
    'linear-gradient(45deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(45deg, #c1dfc4 0%, #deecdd 100%)',
    'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(45deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(45deg, #dfe9f3 0%, #ffffff 100%)',
    'linear-gradient(45deg, #5ee7df 0%, #b490ca 100%)',
].map(grad => ({ id: grad, type: 'gradient' as const, thumbnail: grad }));

const darkGradientWallpapers = [
    'linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)',
    'linear-gradient(45deg, #13547a 0%, #80d0c7 100%)',
    'linear-gradient(45deg, #ed6ea0 0%, #ec8c69 100%)',
    'linear-gradient(45deg, #000428 0%, #004e92 100%)',
    'linear-gradient(45deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    'linear-gradient(45deg, #373b44 0%, #4286f4 100%)',
    'linear-gradient(45deg, #7028e4 0%, #e5b2ca 100%)',
    'linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)',
    'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(45deg, #0250c5 0%, #d43f8d 100%)',
].map(grad => ({ id: grad, type: 'gradient' as const, thumbnail: grad }));

const specialAndVideoWallpapers = [
    {
        id: 'gradient',
        type: 'gradient' as const,
        thumbnail: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/32524948/file/original-3c68e4ad227ae70e1875ef71289be2b0.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/jS3rSGdF/videoframe-8901.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/13498087/file/original-b120f6a1a15d71e493f8d4b2d13b0296.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/BnmJ1jNN/videoframe-3046.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/16718734/file/original-f2df9314dbf922d5452d7a8a5885d744.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/NfYtJ6zp/videoframe-1990.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/43797830/file/original-b9bafe56dd75a7ae175f827cfc662738.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/yNJW1hB0/videoframe-3097.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/16365364/file/original-dcc3ad4c0f5802c6670d36fcca720e5e.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/vBgPtKyD/videoframe-4678.png',
    },
    {
        id: 'https://cdn.dribbble.com/userupload/43797856/file/original-46c91cbdf46a3cbc3f30a85f061ed817.mp4',
        type: 'video' as const,
        thumbnail: 'https://i.postimg.cc/L6TVLSPN/videoframe-3537.png',
    },
    {
        id: 'orbiting-planets',
        type: 'custom' as const,
        thumbnail: 'https://images.pexels.com/photos/1655166/pexels-photo-1655166.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    },
    {
        id: 'dotted-pattern',
        type: 'custom' as const,
        thumbnail: `radial-gradient(circle at 25% 25%, #a3b1c6 15%, transparent 15%), radial-gradient(circle at 75% 75%, #a3b1c6 15%, transparent 15%)`,
        thumbnailBgColor: '#e0e7ed',
        thumbnailBgSize: '10px 10px',
    },
    {
        id: 'dark-dotted-pattern',
        type: 'custom' as const,
        thumbnail: `radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
        thumbnailBgColor: '#1d1f20',
        thumbnailBgSize: '11px 11px',
    },
];

const SettingsPage: React.FC<SettingsPageProps> = ({ id }) => {
    const { t, language } = useI18n();
    const pageData = t.settingsPage;
    const settingsText = t.settings;
    const {
        themeMode, setThemeMode,
        themeColor, setThemeColor,
        isCursorEffectOn, setCursorEffect,
        isSoundOn, setSoundOn,
        isAiVoiceOn, setAiVoiceOn,
        selectedAiVoiceName, setSelectedAiVoiceName,
        wallpaper, setWallpaper,
    } = useTheme();

    const { voices } = useSpeechSynthesis();

    // --- Local State for pending changes ---
    const [localThemeMode, setLocalThemeMode] = useState(themeMode);
    const [localThemeColor, setLocalThemeColor] = useState(themeColor);
    const [localCursorEffect, setLocalCursorEffect] = useState(isCursorEffectOn);
    const [localSound, setLocalSound] = useState(isSoundOn);
    const [localAiVoice, setLocalAiVoice] = useState(isAiVoiceOn);
    const [localVoiceName, setLocalVoiceName] = useState(selectedAiVoiceName);
    const [localWallpaper, setLocalWallpaper] = useState(wallpaper);
    const [activeTab, setActiveTab] = useState<'gradient' | 'video'>('gradient');
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);


    // Reset local state if context changes (e.g., settings saved or loaded initially)
    useEffect(() => {
        setLocalThemeMode(themeMode);
        setLocalThemeColor(themeColor);
        setLocalCursorEffect(isCursorEffectOn);
        setLocalSound(isSoundOn);
        setLocalAiVoice(isAiVoiceOn);
        setLocalVoiceName(selectedAiVoiceName);
        setLocalWallpaper(wallpaper);
    }, [themeMode, themeColor, isCursorEffectOn, isSoundOn, isAiVoiceOn, selectedAiVoiceName, wallpaper]);

    const handleSaveChanges = () => {
        setThemeMode(localThemeMode);
        setThemeColor(localThemeColor);
        setCursorEffect(localCursorEffect);
        setSoundOn(localSound);
        setAiVoiceOn(localAiVoice);
        setSelectedAiVoiceName(localVoiceName);
        setWallpaper(localWallpaper);
        setShowSaveSuccess(true);
        setTimeout(() => {
            setShowSaveSuccess(false);
        }, 3000);
    };

    const handleResetChanges = () => {
        // Revert local state to the master context state
        setLocalThemeMode(themeMode);
        setLocalThemeColor(themeColor);
        setLocalCursorEffect(isCursorEffectOn);
        setLocalSound(isSoundOn);
        setLocalAiVoice(isAiVoiceOn);
        setLocalVoiceName(selectedAiVoiceName);
        setLocalWallpaper(wallpaper);
    };


    const availableVoices = useMemo(() => {
        if (!voices.length) return [];
        const relevantVoices = voices.filter(v => v.lang.startsWith(language));
        const remyVoice = voices.find(v => v.name === 'Microsoft Rémy Multilingue Online (Natural) - French (France)');
        const finalVoices = [...relevantVoices];
        if (remyVoice && !relevantVoices.some(v => v.name === remyVoice.name)) {
            finalVoices.unshift(remyVoice);
        }
        return finalVoices;
    }, [voices, language]);

    const accentColors = ['#101733', '#ED1B2F', '#AE2070', '#FF6525', '#FFB300', '#49C16C', '#0078D4', '#6C6CE5', '#FFFFFF'];
    
    const gradientWallpapers = useMemo(() => {
        const themeGradients = localThemeMode === 'light' ? lightGradientWallpapers : darkGradientWallpapers;
        const animatedGradient = specialAndVideoWallpapers.find(w => w.id === 'gradient');
        const customWallpapers = specialAndVideoWallpapers.filter(w => w.type === 'custom');
        return [animatedGradient, ...themeGradients, ...customWallpapers].filter(Boolean);
    }, [localThemeMode]);

    const videoWallpapers = useMemo(() => specialAndVideoWallpapers.filter(w => w.type === 'video'), []);

    return (
        <PageLayout id={id}>
            <div className="info-card">
                 <div className="settings-header">
                    <InfoBadge
                        icon={<Icons.SettingsIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                    <div className="settings-actions">
                        <button className="btn btn-secondary" onClick={handleResetChanges}>
                            {settingsText.resetButton}
                        </button>
                        <button className="btn btn-primary" onClick={handleSaveChanges}>
                            {settingsText.saveButton}
                        </button>
                    </div>
                </div>
                <div className="settings-content-container no-scrollbar">
                    <div className="settings-grid">
                        <div className="settings-left-column">
                             <div className="settings-card">
                                <h4 className="settings-card-title">{settingsText.featuresTitle}</h4>
                                <div className="setting-item switch">
                                    <label>{settingsText.cursorEffect}</label>
                                    <div
                                        role="switch"
                                        aria-checked={localCursorEffect}
                                        className={`toggle-switch ${localCursorEffect ? 'is-on' : ''}`}
                                        onClick={() => setLocalCursorEffect(!localCursorEffect)}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>

                                <div className="setting-item switch">
                                    <label>{settingsText.soundEffects}</label>
                                    <div
                                        role="switch"
                                        aria-checked={localSound}
                                        className={`toggle-switch ${localSound ? 'is-on' : ''}`}
                                        onClick={() => setLocalSound(!localSound)}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>
                                
                                <div className="setting-item switch">
                                    <label>{settingsText.aiVoice}</label>
                                    <div
                                        role="switch"
                                        aria-checked={localAiVoice}
                                        className={`toggle-switch ${localAiVoice ? 'is-on' : ''}`}
                                        onClick={() => setLocalAiVoice(!localAiVoice)}
                                    >
                                        <div className="toggle-slider"></div>
                                    </div>
                                </div>

                                {localAiVoice && availableVoices.length > 0 && (
                                    <div className="setting-item">
                                        <label htmlFor="ai-voice-select">{settingsText.aiVoiceSelect}</label>
                                        <div className="custom-select-wrapper">
                                            <select 
                                                id="ai-voice-select"
                                                value={localVoiceName}
                                                onChange={(e) => setLocalVoiceName(e.target.value)}
                                                className="custom-select"
                                            >
                                                {availableVoices.map(voice => (
                                                    <option key={voice.name} value={voice.name}>
                                                        {voice.name} ({voice.lang})
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="select-arrow">
                                                <Icons.ChevronDownIcon size={18} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="settings-right-column">
                             <div className="settings-card">
                                <h4 className="settings-card-title">{settingsText.interfaceTitle}</h4>
                                <div className="setting-item">
                                    <label>{settingsText.mode}</label>
                                    <div className="mode-selector">
                                        <button className={`mode-button ${localThemeMode === 'light' ? 'active' : ''}`} onClick={() => setLocalThemeMode('light')}>
                                            <Icons.SunIcon /> {settingsText.light}
                                        </button>
                                        <button className={`mode-button ${localThemeMode === 'dark' ? 'active' : ''}`} onClick={() => setLocalThemeMode('dark')}>
                                            <Icons.MoonIcon /> {settingsText.dark}
                                        </button>
                                    </div>
                                </div>

                                <div className="setting-item">
                                    <label>{settingsText.accentColor}</label>
                                    <div className="color-pallet">
                                        {accentColors.map(color => (
                                            <button
                                                key={color}
                                                className={`color-dot ${localThemeColor.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setLocalThemeColor(color)}
                                                aria-label={`Select color ${color}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="setting-item">
                                    <label>{settingsText.wallpaper}</label>
                                     <div className="wallpaper-tabs">
                                        <button 
                                            className={`wallpaper-tab-btn ${activeTab === 'gradient' ? 'active' : ''}`} 
                                            onClick={() => setActiveTab('gradient')}
                                        >
                                            {settingsText.gradient}
                                        </button>
                                        <button 
                                            className={`wallpaper-tab-btn ${activeTab === 'video' ? 'active' : ''}`} 
                                            onClick={() => setActiveTab('video')}
                                        >
                                            {settingsText.video}
                                        </button>
                                    </div>

                                    {activeTab === 'gradient' && (
                                        <div className="wallpaper-tab-content">
                                            <div className="wallpaper-selector">
                                                {gradientWallpapers.map((option, index) => (
                                                    <button
                                                        key={option.id}
                                                        className={`wallpaper-thumbnail ${localWallpaper === option.id ? 'active' : ''}`}
                                                        onClick={() => setLocalWallpaper(option.id)}
                                                        aria-label={`Wallpaper option ${index + 1}`}
                                                        title={`Wallpaper option ${index + 1}`}
                                                    >
                                                        {option.type === 'gradient' || option.type === 'custom' ? (
                                                            <div 
                                                                className="wallpaper-gradient-preview" 
                                                                style={{ 
                                                                    background: (option as any).thumbnail, 
                                                                    backgroundColor: (option as any).thumbnailBgColor,
                                                                    backgroundSize: (option as any).thumbnailBgSize || '200% 200%' 
                                                                }}>
                                                            </div>
                                                        ) : (
                                                            <img src={option.thumbnail} alt={`Wallpaper thumbnail ${index}`} className="wallpaper-video-preview-img" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'video' && (
                                        <div className="wallpaper-tab-content">
                                             <div className="wallpaper-selector">
                                                {videoWallpapers.map((option, index) => (
                                                    <button
                                                        key={option.id}
                                                        className={`wallpaper-thumbnail ${localWallpaper === option.id ? 'active' : ''}`}
                                                        onClick={() => setLocalWallpaper(option.id)}
                                                        aria-label={`Wallpaper option ${index + 1}`}
                                                        title={`Wallpaper option ${index + 1}`}
                                                    >
                                                        <img src={option.thumbnail} alt={`Wallpaper thumbnail ${index}`} className="wallpaper-video-preview-img" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showSaveSuccess && createPortal(
                <div className="save-toast-notification">
                    <Icons.CheckIcon />
                    <span>Cài đặt đã được lưu thành công!</span>
                </div>,
                document.body
            )}
        </PageLayout>
    );
};

export default SettingsPage;