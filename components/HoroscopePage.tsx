
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
                .horoscope-grid-banner {
                    background: rgba(var(--accent-color-rgb), 0.1);
                    border: var(--color-brand-glass-border);
                    border-radius: 15px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
                .horoscope-traits-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                .horoscope-portrait-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.25rem;
                }
                .horoscope-compat-grid-main {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }
                .horoscope-compat-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                .horoscope-roles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                @media (max-width: 900px) {
                    .horoscope-portrait-grid, .horoscope-compat-grid-main {
                        grid-template-columns: 1fr !important;
                    }
                }
                @media (max-width: 600px) {
                    .horoscope-grid-banner {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                        padding: 1rem;
                        text-align: center;
                    }
                    .horoscope-traits-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    .horoscope-compat-grid {
                        grid-template-columns: 1fr;
                        gap: 0.75rem;
                    }
                    .horoscope-roles-grid {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }
                    .horoscope-roles-grid > div {
                        padding: 0.75rem 1rem !important;
                        font-size: 0.9rem !important;
                    }
                    .horoscope-grid-banner > div {
                        background: var(--sidebar-bg);
                        padding: 0.75rem;
                        border-radius: 8px;
                    }
                    .horoscope-grid-banner h4 {
                        font-size: 0.8rem !important;
                    }
                    .horoscope-banner-text {
                        font-size: 1.1rem !important;
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
                .horoscope-book-spine-lines {
                    display: none;
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
                    <div className="horoscope-header-row" style={{ display: 'flex', alignItems: 'stretch', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                        
                        {/* Basic Info Banner */}
                        <div className="horoscope-grid-banner" style={{ flex: 1, marginBottom: 0, minWidth: '280px' }}>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-brand-text-secondary)', textTransform: 'uppercase' }}>Họ Tên</h4>
                                <p className="horoscope-banner-text" style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-color)' }}>{info.name}</p>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-brand-text-secondary)', textTransform: 'uppercase' }}>Ngày Sinh</h4>
                                <p style={{ margin: 0, fontWeight: 600 }}>{info.birthDate}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>{info.birthHour}</p>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-brand-text-secondary)', textTransform: 'uppercase' }}>Mệnh / Cục</h4>
                                <p style={{ margin: 0, fontWeight: 600 }}>{info.element}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>{info.destiny}</p>
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-brand-text-secondary)', textTransform: 'uppercase' }}>Năm / Chi</h4>
                                <p style={{ margin: 0, fontWeight: 600 }}>{info.year}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem' }}>{info.gender}</p>
                            </div>
                        </div>

                        {/* Yin-Yang spinning coin player on the right side of the row */}
                        <div className="horoscope-player-container animate-fade-in" style={{ position: 'relative', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(var(--accent-color-rgb), 0.08)', border: 'var(--color-brand-glass-border)', borderRadius: '15px', padding: '1rem 2.25rem', minWidth: '150px' }}>
                            {showHint && (
                                <div 
                                    className="horoscope-hint-bubble"
                                    onClick={() => {
                                        setShowHint(false);
                                        handlePlayPause();
                                    }}
                                    title={language === 'vi' ? 'Bấm vào để nghe audio' : 'Click to play audio'}
                                >
                                    <span>{language === 'vi' ? 'Bấm vào đây để nghe !' : 'Click here to listen !'}</span>
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
                                style={{ margin: 0 }}
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
                                        {/* Spine detail */}
                                        <div className="horoscope-book-spine-lines"></div>
                                        
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
                    </div>

                    {/* I. Portrait */}
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>{sections.portrait.title}</h3>
                        <div className="horoscope-portrait-grid">
                            {sections.portrait.points.map((pt, i) => (
                                <div key={i} style={{ padding: '1.25rem', background: 'var(--color-brand-progress-bg)', borderRadius: '12px', border: 'var(--color-brand-glass-border)' }}>
                                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1.05rem', color: 'var(--accent-color)' }}>{pt.header}</h4>
                                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>{pt.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* II. Traits */}
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>{sections.traits.title}</h3>
                        <div className="horoscope-traits-grid">
                            <div style={{ padding: '1.5rem', background: 'rgba(39, 174, 96, 0.05)', borderRadius: '15px', border: '1px solid rgba(39, 174, 96, 0.2)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Icons.CheckIcon size={20} /> {sections.traits.strengthsTitle}
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {sections.traits.strengths.map((s, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem' }}>
                                            <span style={{ color: '#27ae60' }}>•</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div style={{ padding: '1.5rem', background: 'rgba(231, 76, 60, 0.05)', borderRadius: '15px', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Icons.XMarkIcon size={20} /> {sections.traits.weaknessesTitle}
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {sections.traits.weaknesses.map((w, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.95rem' }}>
                                            <span style={{ color: '#e74c3c' }}>•</span> {w}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <p style={{ marginTop: '1.25rem', fontWeight: 600, color: 'var(--color-brand-text-primary)', textAlign: 'center', padding: '1rem', background: 'var(--color-brand-progress-bg)', borderRadius: '10px' }}>
                            {sections.traits.solution}
                        </p>
                    </section>

                    {/* III. Compatibility */}
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>{sections.compatibility.title}</h3>
                        <div className="horoscope-compat-grid-main">
                            {sections.compatibility.groups.map((group, i) => (
                                <div key={i}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ margin: 0, color: group.color, fontSize: '1.1rem' }}>{group.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-brand-text-secondary)' }}>{group.subtitle}</p>
                                    </div>
                                    <div className="horoscope-compat-grid">
                                        {group.items.map((item, j) => (
                                            <div key={j} style={{ 
                                                padding: '1rem', 
                                                background: 'var(--sidebar-bg)', 
                                                border: `1px solid ${group.color}40`, 
                                                borderRadius: '12px',
                                                boxShadow: 'var(--card-box-shadow)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.25rem',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <strong style={{ fontSize: '1rem', color: 'var(--color-brand-text-primary)' }}>{item.age}</strong>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--color-brand-text-secondary)' }}>{item.trait}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {group.summary && (
                                        <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.9rem', color: group.color }}>{group.summary}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* IV. Ideal Roles */}
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>{sections.roles.title}</h3>
                        <div className="horoscope-roles-grid">
                            {sections.roles.items.map((role, i) => (
                                <div key={i} style={{ 
                                    padding: '0.75rem 1rem', 
                                    background: 'var(--accent-color)', 
                                    color: 'white', 
                                    borderRadius: '999px',
                                    textAlign: 'center',
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }}>
                                    {role}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* V. Conclusion */}
                    <section style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>{sections.conclusion.title}</h3>
                        <div style={{ 
                            padding: '2rem', 
                            background: 'linear-gradient(135deg, rgba(var(--accent-color-rgb), 0.1) 0%, rgba(var(--accent-color-rgb), 0.05) 100%)', 
                            borderRadius: '15px', 
                            border: 'var(--color-brand-glass-border)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Icons.SparklesIcon style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', opacity: 0.1, color: 'var(--accent-color)' }} />
                            <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.8, fontStyle: 'italic', textAlign: 'justify' }}>
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
