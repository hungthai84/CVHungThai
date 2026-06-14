
import React, { useState, useRef, useCallback } from 'react';
import { useI18n } from '../contexts/i18nContext';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

const HoroscopePage: React.FC<{ id?: string }> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.horoscopePage;
    const info = pageData.personalInfo;
    const sections = pageData.sections;

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTogglingPlay, setIsTogglingPlay] = useState(false);

    const handlePlayPause = useCallback(async () => {
        const video = videoRef.current;
        if (!video || isTogglingPlay) return;
    
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
                .horoscope-compat-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                }
                .horoscope-roles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
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
            `}</style>
            <div className="info-card">
                <div className="about-header">
                    <InfoBadge
                        icon={<Icons.SparklesIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>

                <div className="custom-video-player-wrapper">
                    <div 
                        className="cover-letter-video-container" 
                        title={isPlaying ? "Tạm dừng" : "Nghe tử vi"}
                        onClick={handlePlayPause}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayPause(); }}
                        role="button"
                        tabIndex={0}
                        aria-label="Play or pause the horoscope audio"
                    >
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
                            className="cover-letter-video-element"
                            poster="https://i.postimg.cc/0QyHjYN4/Avata-Gif.gif"
                        >
                            Trình duyệt của bạn không hỗ trợ thẻ media.
                        </video>
                    </div>
                    <button 
                        className="custom-play-button" 
                        onClick={handlePlayPause} 
                        aria-label={isPlaying ? "Tạm dừng" : "Phát"}
                    >
                        {isPlaying ? <Icons.PauseIcon /> : <Icons.PlayIcon style={{ marginLeft: '2px' }}/>}
                    </button>
                </div>

                <div className="horoscope-content no-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                    
                    {/* Basic Info Banner */}
                    <div className="horoscope-grid-banner">
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

                    {/* I. Portrait */}
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ borderLeft: '4px solid var(--accent-color)', paddingLeft: '1rem', marginBottom: '1.5rem' }}>{sections.portrait.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
                                                gap: '0.25rem'
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
