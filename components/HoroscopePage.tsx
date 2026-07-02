
import React, { useState, useRef, useCallback } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

const HoroscopePage: React.FC<{ id?: string }> = ({ id }) => {
    const { t, language } = useI18n();
    const pageData = t.horoscopePage;
    const info = pageData.personalInfo;
    const sections = pageData.sections;

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTogglingPlay, setIsTogglingPlay] = useState(false);
    const [showHint, setShowHint] = useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const handlePlayPause = useCallback(async () => {
        const video = videoRef.current;
        if (!video || isTogglingPlay) return;
    
        setShowHint(false);
        setIsTogglingPlay(true);
        try {
            if (video.paused || video.muted) {
                video.muted = false;
                await video.play();
            } else {
                video.pause();
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                 console.error("Media play/pause error:", error);
            }
        } finally {
            setIsTogglingPlay(false);
        }
    }, [isTogglingPlay]);

    return (
        <PageLayout id={id}>
            <style>{`
                 .horoscope-banner-card {
                     background: var(--card-bg);
                     border: var(--color-brand-glass-border);
                     border-radius: 15px;
                     padding: 1.25rem;
                     display: grid;
                     grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                     gap: 1.25rem;
                     box-shadow: var(--card-box-shadow);
                     backdrop-filter: var(--glass-blur);
                     -webkit-backdrop-filter: var(--glass-blur-webkit);
                     flex: 1;
                     min-width: 280px;
                 }
                 .horoscope-banner-item {
                     border-left: 3px solid rgba(212, 175, 55, 0.5);
                     padding-left: 0.75rem;
                     display: flex;
                     flex-direction: column;
                     justify-content: center;
                 }
                 .horoscope-banner-item h4 {
                     margin: 0 0 0.25rem 0;
                     font-size: 0.75rem;
                     color: var(--color-brand-text-muted);
                     text-transform: uppercase;
                     font-weight: 700;
                     letter-spacing: 0.05em;
                 }
                 .horoscope-banner-item .value-main {
                     margin: 0;
                     font-weight: 700;
                     font-size: 1.05rem;
                     color: var(--color-brand-text-primary);
                 }
                 .horoscope-banner-item .value-sub {
                     margin: 0;
                     font-size: 0.8rem;
                     color: var(--color-brand-text-secondary);
                 }
                 .horoscope-player-card {
                     display: flex;
                     align-items: center;
                     gap: 1.25rem;
                     background: var(--card-bg);
                     border: 1px solid rgba(212, 175, 55, 0.25);
                     box-shadow: 0 4px 20px rgba(212, 175, 55, 0.05);
                     border-radius: 15px;
                     padding: 1rem 1.5rem;
                     min-width: 250px;
                     flex-shrink: 0;
                     backdrop-filter: var(--glass-blur);
                     -webkit-backdrop-filter: var(--glass-blur-webkit);
                 }
                 .horoscope-player-info {
                     display: flex;
                     flex-direction: column;
                     gap: 0.25rem;
                 }
                 .horoscope-player-info h4 {
                     margin: 0;
                     font-size: 0.85rem;
                     font-weight: 700;
                     text-transform: uppercase;
                     color: #d4af37;
                 }
                 .horoscope-player-info p {
                     margin: 0;
                     font-size: 0.75rem;
                     color: var(--color-brand-text-secondary);
                 }
                 .horoscope-portrait-grid {
                     display: grid;
                     grid-template-columns: repeat(3, 1fr);
                     gap: 1.25rem;
                 }
                 .portrait-item-card {
                     padding: 1.25rem;
                     background: var(--card-bg);
                     border: var(--color-brand-glass-border);
                     border-radius: 16px;
                     box-shadow: var(--card-box-shadow);
                     backdrop-filter: var(--glass-blur);
                     -webkit-backdrop-filter: var(--glass-blur-webkit);
                     transition: all 0.3s ease;
                     display: flex;
                     flex-direction: column;
                     gap: 0.5rem;
                 }
                 .portrait-item-card:hover {
                     transform: translateY(-2px);
                     border-color: rgba(var(--accent-color-rgb), 0.3);
                 }
                 .portrait-card-header {
                     display: flex;
                     align-items: center;
                     gap: 0.5rem;
                     color: var(--accent-color);
                     font-size: 0.95rem;
                     font-weight: 700;
                     line-height: 1.4;
                 }
                 .portrait-card-icon {
                     color: #d4af37;
                     flex-shrink: 0;
                 }
                 .portrait-card-body {
                     margin: 0;
                     font-size: 0.875rem;
                     line-height: 1.6;
                     color: var(--color-brand-text-secondary);
                 }
                 .horoscope-traits-grid {
                     display: grid;
                     grid-template-columns: repeat(2, 1fr);
                     gap: 1.25rem;
                 }
                 .traits-card {
                     padding: 1.25rem;
                     border-radius: 16px;
                     backdrop-filter: var(--glass-blur);
                     -webkit-backdrop-filter: var(--glass-blur-webkit);
                     box-shadow: var(--card-box-shadow);
                 }
                 .traits-card.strengths {
                     background: linear-gradient(135deg, rgba(39, 174, 96, 0.05), rgba(39, 174, 96, 0.01));
                     border: 1px solid rgba(39, 174, 96, 0.2);
                 }
                 .traits-card.weaknesses {
                     background: linear-gradient(135deg, rgba(231, 76, 60, 0.05), rgba(231, 76, 60, 0.01));
                     border: 1px solid rgba(231, 76, 60, 0.2);
                 }
                 .traits-card-header {
                     display: flex;
                     align-items: center;
                     gap: 0.5rem;
                     font-size: 1rem;
                     font-weight: 700;
                     margin-bottom: 1rem;
                 }
                 .traits-card.strengths .traits-card-header {
                     color: #27ae60;
                 }
                 .traits-card.weaknesses .traits-card-header {
                     color: #e74c3c;
                 }
                 .traits-list-item {
                     margin-bottom: 0.5rem;
                     display: flex;
                     align-items: flex-start;
                     gap: 0.5rem;
                     font-size: 0.875rem;
                     color: var(--color-brand-text-secondary);
                 }
                 .traits-list-item span {
                     font-size: 0.75rem;
                     margin-top: 0.25rem;
                 }
                 .traits-solution-card {
                     margin-top: 1.25rem;
                     padding: 1rem;
                     background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.01));
                     border: 1px solid rgba(59, 130, 246, 0.2);
                     border-radius: 12px;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     gap: 0.5rem;
                     font-size: 0.9rem;
                     font-weight: 600;
                     color: var(--color-brand-text-primary);
                 }
                 .traits-solution-icon {
                     color: var(--color-brand-accent, #3b82f6);
                 }
                 .horoscope-compat-grid-main {
                     display: grid;
                     grid-template-columns: repeat(3, 1fr);
                     gap: 1.25rem;
                 }
                 .compat-group-column {
                     display: flex;
                     flex-direction: column;
                 }
                 .compat-group-header {
                     margin-bottom: 0.75rem;
                 }
                 .compat-group-title {
                     margin: 0;
                     font-size: 0.95rem;
                     font-weight: 700;
                     letter-spacing: 0.02em;
                 }
                 .compat-group-subtitle {
                     margin: 0;
                     font-size: 0.75rem;
                     color: var(--color-brand-text-muted);
                 }
                 .horoscope-compat-grid {
                     display: flex;
                     flex-direction: column;
                     gap: 0.5rem;
                 }
                 .compat-item-card {
                     padding: 0.625rem 0.875rem;
                     background: var(--card-bg);
                     border: var(--color-brand-glass-border);
                     border-radius: 12px;
                     display: flex;
                     align-items: center;
                     justify-content: space-between;
                     gap: 0.5rem;
                     box-shadow: var(--card-box-shadow);
                     transition: all 0.2s ease;
                 }
                 .compat-item-card:hover {
                     transform: translateX(3px);
                 }
                 .compat-age {
                     font-weight: 700;
                     font-size: 0.875rem;
                     color: var(--color-brand-text-primary);
                     white-space: nowrap;
                 }
                 .compat-trait {
                     font-size: 0.8rem;
                     color: var(--color-brand-text-secondary);
                     text-align: right;
                 }
                 .compat-group-summary {
                     margin-top: 0.75rem;
                     font-style: italic;
                     font-size: 0.8rem;
                     font-weight: 500;
                 }
                 .horoscope-roles-grid {
                     display: flex;
                     flex-wrap: wrap;
                     gap: 0.75rem;
                 }
                 .role-pill {
                     padding: 0.5rem 1.25rem;
                     background: var(--card-bg);
                     color: var(--color-brand-text-secondary);
                     border: 1px solid rgba(var(--accent-color-rgb), 0.25);
                     border-radius: 999px;
                     text-align: center;
                     font-size: 0.825rem;
                     font-weight: 500;
                     box-shadow: var(--card-box-shadow);
                     backdrop-filter: var(--glass-blur);
                     -webkit-backdrop-filter: var(--glass-blur-webkit);
                     transition: all 0.25s ease;
                     cursor: default;
                 }
                 .role-pill:hover {
                     background: var(--accent-color);
                     color: white;
                     border-color: var(--accent-color);
                     box-shadow: 0 4px 12px rgba(var(--accent-color-rgb), 0.2);
                     transform: translateY(-1px);
                 }
                 .conclusion-card {
                     padding: 1.5rem 2rem;
                     background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.03));
                     border: 1px solid rgba(212, 175, 55, 0.25);
                     border-radius: 16px;
                     position: relative;
                     overflow: hidden;
                     box-shadow: 0 4px 20px rgba(212, 175, 55, 0.03);
                 }
                 .conclusion-text {
                     margin: 0;
                     font-size: 0.95rem;
                     line-height: 1.7;
                     font-style: italic;
                     text-align: justify;
                     color: var(--color-brand-text-primary);
                     position: relative;
                     z-index: 2;
                 }
                 @media (max-width: 900px) {
                     .horoscope-portrait-grid, .horoscope-compat-grid-main {
                         grid-template-columns: 1fr !important;
                     }
                     .horoscope-traits-grid {
                         grid-template-columns: 1fr;
                     }
                     .horoscope-header-row {
                         flex-direction: column;
                     }
                 }

                 /* Horoscope 3D Book Styles */
                 .horoscope-book-wrapper {
                     position: relative;
                     width: 70px;
                     height: 70px;
                     perspective: 400px;
                     cursor: pointer;
                     margin: 0 auto;
                 }
                 .horoscope-hint-bubble {
                     position: absolute;
                     bottom: 85px;
                     left: 50%;
                     transform: translateX(-50%);
                     background: linear-gradient(135deg, #d4af37 0%, #aa8410 100%);
                     color: white;
                     padding: 8px 14px;
                     border-radius: 20px;
                     font-size: 13px;
                     font-weight: 600;
                     white-space: nowrap;
                     box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
                     z-index: 50;
                     pointer-events: auto;
                     animation: hint-bounce 1.5s infinite ease-in-out;
                     border: 1px solid rgba(255, 255, 255, 0.2);
                     cursor: pointer;
                     display: flex;
                     align-items: center;
                     gap: 6px;
                     transition: opacity 0.3s ease;
                 }
                 .horoscope-hint-bubble::after {
                     content: '';
                     position: absolute;
                     bottom: -8px;
                     left: 50%;
                     transform: translateX(-50%);
                     border-width: 8px 8px 0;
                     border-style: solid;
                     border-color: #aa8410 transparent;
                     display: block;
                     width: 0;
                 }
                 @keyframes hint-bounce {
                     0%, 100% { transform: translate(-50%, 0); }
                     50% { transform: translate(-50%, -6px); }
                 }
                 .horoscope-book {
                     width: 100%;
                     height: 100%;
                     position: relative;
                     transform-style: preserve-3d;
                     transition: transform 0.55s cubic-bezier(0.25, 0.8, 0.25, 1);
                     box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                     border-radius: 50%;
                 }
                 .horoscope-book-wrapper:hover .horoscope-book {
                     transform: scale(1.05);
                     box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
                 }
                 .horoscope-book-cover {
                     position: absolute;
                     width: 100%;
                     height: 100%;
                     background: #ffffff;
                     border: 2px solid #d4af37;
                     border-radius: 50%;
                     display: flex;
                     flex-direction: column;
                     align-items: center;
                     justify-content: center;
                     overflow: hidden;
                     box-sizing: border-box;
                 }
                 .horoscope-book-cover::before {
                     content: '';
                     position: absolute;
                     inset: 4px;
                     border: 1px dashed rgba(212, 175, 55, 0.4);
                     border-radius: 50%;
                     pointer-events: none;
                 }
                 .yinyang-symbol {
                     width: 54px;
                     height: 54px;
                     border-radius: 50%;
                     overflow: hidden;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     border: 1.5px solid #d4af37;
                     background: white;
                     box-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
                 }
                 .yinyang-symbol img {
                     width: 100%;
                     height: 100%;
                     object-fit: cover;
                 }
                 .yinyang-spinning {
                     animation: yinyang-spin 8s infinite linear;
                 }
                 @keyframes yinyang-spin {
                     from { transform: rotate(0deg); }
                     to { transform: rotate(360deg); }
                 }
                 .book-glow {
                     position: absolute;
                     inset: -15px;
                     background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
                     border-radius: 50%;
                     opacity: 0;
                     transition: opacity 0.5s ease;
                     pointer-events: none;
                     z-index: -1;
                 }
                 .book-glow-active {
                     opacity: 1;
                     animation: pulse-glow 2s infinite ease-in-out;
                 }
                 @keyframes pulse-glow {
                     0%, 100% { transform: scale(1); opacity: 0.25; }
                     50% { transform: scale(1.15); opacity: 0.5; }
                 }
                 .magical-stars-container {
                     position: absolute;
                     top: -15px;
                     left: 0;
                     right: 0;
                     height: 30px;
                     pointer-events: none;
                     display: flex;
                     justify-content: space-around;
                     z-index: 2;
                 }
                 .magical-star {
                     font-size: 14px;
                     color: #d4af37;
                     opacity: 0;
                 }
                 .magical-star-active {
                     animation: float-up 1.6s infinite ease-out;
                 }
                 @keyframes float-up {
                     0% { transform: translateY(15px) scale(0.6); opacity: 0; }
                     50% { opacity: 1; }
                     100% { transform: translateY(-15px) scale(1.1); opacity: 0; }
                 }
            `}</style>
            <div className="info-card" style={{ borderRadius: '10px' }}>
                <InfoBadge
                    icon={<Icons.SparklesIcon />}
                    text={pageData.badge}
                    tooltipTitle={pageData.tooltipTitle}
                    tooltipText={pageData.tooltipText}
                    style={{ marginBottom: '1.5rem' }}
                />

                <div className="horoscope-content no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                    
                    {/* Unified Header with Basic Info and Audio Player */}
                    <div className="horoscope-header-row animate-fadeIn" style={{ display: 'flex', alignItems: 'stretch', gap: '1.25rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        
                        {/* Basic Info Banner */}
                        <div className="horoscope-banner-card">
                            <div className="horoscope-banner-item">
                                <h4>Họ Tên</h4>
                                <p className="value-main" style={{ color: 'var(--accent-color)' }}>{info.name}</p>
                            </div>
                            <div className="horoscope-banner-item">
                                <h4>Ngày Sinh</h4>
                                <p className="value-main">{info.birthDate}</p>
                                <p className="value-sub">{info.birthHour}</p>
                            </div>
                            <div className="horoscope-banner-item">
                                <h4>Mệnh / Cục</h4>
                                <p className="value-main">{info.element}</p>
                                <p className="value-sub">{info.destiny}</p>
                            </div>
                            <div className="horoscope-banner-item">
                                <h4>Năm / Chi</h4>
                                <p className="value-main">{info.year}</p>
                                <p className="value-sub">{info.gender}</p>
                            </div>
                        </div>

                        {/* Yin-Yang spinning coin player on the right side of the row */}
                        <div className="horoscope-player-card">
                            <div className="horoscope-book-container" style={{ position: 'relative' }}>
                                {showHint && (
                                    <div 
                                        className="horoscope-hint-bubble"
                                        onClick={() => {
                                            setShowHint(false);
                                            handlePlayPause();
                                        }}
                                        title={language === 'vi' ? 'Bấm vào để nghe audio' : 'Click to play audio'}
                                    >
                                        <span>{language === 'vi' ? 'Bấm vào nghe giải!' : 'Listen to Horoscope!'}</span>
                                        <span style={{ fontSize: '14px' }}>🎧</span>
                                    </div>
                                )}

                                <div 
                                    className="horoscope-book-wrapper" 
                                    title={isPlaying ? (language === 'vi' ? "Tạm dừng" : "Pause") : (language === 'vi' ? "Nghe tử vi" : "Listen")}
                                    onClick={handlePlayPause}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayPause(); }}
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Play or pause the horoscope audio"
                                >
                                    {/* Magical glowing back aura */}
                                    <div className={`book-glow ${isPlaying ? 'book-glow-active' : ''}`}></div>
                                    
                                    {/* Audio track inside hidden video element to keep perfect API mapping */}
                                    <video
                                        ref={videoRef}
                                        src="https://cdn.scena.ai/project/9626/b40b848d5a2ad108760073e8c64bd80f963850ab7e79c19af228c82a83f6419d.mp3"
                                        playsInline
                                        autoPlay
                                        muted
                                        loop
                                        onPlay={() => setIsPlaying(true)}
                                        onPause={() => setIsPlaying(false)}
                                        onEnded={() => setIsPlaying(false)}
                                        style={{ display: 'none' }}
                                    >
                                        Trình duyệt của bạn không hỗ trợ thẻ media.
                                    </video>

                                    {/* Stitched 3D style book */}
                                    <div className="horoscope-book">
                                        <div className="horoscope-book-cover">
                                            {/* Yin-Yang spinning center wheel */}
                                            <div className={`yinyang-symbol ${isPlaying ? 'yinyang-spinning' : ''}`}>
                                                <img 
                                                    src="https://i.ibb.co/nsKpgT8V/Yin-Yan.jpg" 
                                                    alt="Thái cực" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ambient stars rising when playing */}
                                    {isPlaying && (
                                        <div className="magical-stars-container">
                                            <span className="magical-star magical-star-active" style={{ animationDelay: '0s' }}>✧</span>
                                            <span className="magical-star magical-star-active" style={{ animationDelay: '0.5s' }}>✦</span>
                                            <span className="magical-star magical-star-active" style={{ animationDelay: '1s' }}>✧</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="horoscope-player-info">
                                <h4>{language === 'vi' ? 'Lá Số Luận Giải' : 'Horoscope Audio'}</h4>
                                <p>{isPlaying ? (language === 'vi' ? 'Đang phát âm thanh...' : 'Audio playing...') : (language === 'vi' ? 'Nhấp Thái Cực để nghe' : 'Click symbol to listen')}</p>
                            </div>
                        </div>
                    </div>

                    {/* I. Portrait */}
                    <section style={{ marginBottom: '2rem' }}>
                        <div className="project-section-title">
                            <Icons.UserIcon size={18} className="shrink-0 text-[var(--accent-color)]" />
                            <span>{sections.portrait.title}</span>
                        </div>
                        <div className="horoscope-portrait-grid">
                            {sections.portrait.points.map((pt, i) => {
                                const CardIcon = i === 0 
                                    ? Icons.LayersIcon 
                                    : i === 1 
                                        ? Icons.SparklesIcon 
                                        : Icons.CpuIcon;
                                return (
                                    <div key={i} className="portrait-item-card animate-fadeIn">
                                        <div className="portrait-card-header">
                                            <CardIcon className="portrait-card-icon" size={16} />
                                            <span>{pt.header}</span>
                                        </div>
                                        <p className="portrait-card-body">{pt.content}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* II. Traits */}
                    <section style={{ marginBottom: '2rem' }}>
                        <div className="project-section-title">
                            <Icons.CheckIcon size={18} className="shrink-0 text-[var(--accent-color)]" />
                            <span>{sections.traits.title}</span>
                        </div>
                        <div className="horoscope-traits-grid">
                            <div className="traits-card strengths animate-fadeIn">
                                <div className="traits-card-header">
                                    <Icons.CheckIcon size={18} />
                                    <span>{sections.traits.strengthsTitle}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {sections.traits.strengths.map((s, i) => (
                                        <div key={i} className="traits-list-item">
                                            <span className="text-[#27ae60]">✦</span>
                                            <span>{s}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="traits-card weaknesses animate-fadeIn">
                                <div className="traits-card-header">
                                    <Icons.XMarkIcon size={18} />
                                    <span>{sections.traits.weaknessesTitle}</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {sections.traits.weaknesses.map((w, i) => (
                                        <div key={i} className="traits-list-item">
                                            <span className="text-[#e74c3c]">✦</span>
                                            <span>{w}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {sections.traits.solution && (
                            <div className="traits-solution-card animate-fadeIn">
                                <Icons.LightBulbIcon size={16} className="traits-solution-icon shrink-0" />
                                <span>{sections.traits.solution}</span>
                            </div>
                        )}
                    </section>

                    {/* III. Compatibility */}
                    <section style={{ marginBottom: '2rem' }}>
                        <div className="project-section-title">
                            <Icons.UserIcon size={18} className="shrink-0 text-[var(--accent-color)]" />
                            <span>{sections.compatibility.title}</span>
                        </div>
                        <div className="horoscope-compat-grid-main">
                            {sections.compatibility.groups.map((group, i) => (
                                <div key={i} className="compat-group-column">
                                    <div className="compat-group-header">
                                        <h4 className="compat-group-title" style={{ color: group.color }}>{group.title}</h4>
                                        <p className="compat-group-subtitle">{group.subtitle}</p>
                                    </div>
                                    <div className="horoscope-compat-grid">
                                        {group.items.map((item, j) => (
                                            <div key={j} className="compat-item-card animate-fadeIn" style={{ borderLeft: `3px solid ${group.color}` }}>
                                                <span className="compat-age">{item.age}</span>
                                                <span className="compat-trait">{item.trait}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {group.summary && (
                                        <p className="compat-group-summary" style={{ color: group.color }}>{group.summary}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* IV. Ideal Roles */}
                    <section style={{ marginBottom: '2rem' }}>
                        <div className="project-section-title">
                            <Icons.PresentationIcon size={18} className="shrink-0 text-[var(--accent-color)]" />
                            <span>{sections.roles.title}</span>
                        </div>
                        <div className="horoscope-roles-grid">
                            {sections.roles.items.map((role, i) => (
                                <div key={i} className="role-pill animate-fadeIn">
                                    {role}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* V. Conclusion */}
                    <section style={{ marginBottom: '1rem' }}>
                        <div className="project-section-title">
                            <Icons.SparklesIcon size={18} className="shrink-0 text-[var(--accent-color)]" />
                            <span>{sections.conclusion.title}</span>
                        </div>
                        <div className="conclusion-card animate-fadeIn">
                            <Icons.SparklesIcon style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', opacity: 0.08, color: '#d4af37' }} />
                            <p className="conclusion-text">
                                "{sections.conclusion.content}"
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </PageLayout>
    );
};

export default HoroscopePage;
