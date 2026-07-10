import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import CardTitle from './CardTitle';

interface CoverLetterProps {
    id?: string;
}

const CoverLetter: React.FC<CoverLetterProps> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.coverLetterPage;
    const paragraphs: string[] = pageData.paragraphs || [];
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTogglingPlay, setIsTogglingPlay] = useState(false);
    const [showHint, setShowHint] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);
    const videoWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const handlePlayPause = useCallback(async () => {
        const video = videoRef.current;
        if (!video || isTogglingPlay) return;
    
        setIsTogglingPlay(true);
        setShowHint(false);
        try {
            if (video.paused) {
                await video.play();
            } else {
                video.pause();
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                 console.error("Video play/pause error:", error);
            }
        } finally {
            setIsTogglingPlay(false);
        }
    }, [isTogglingPlay]);

    return (
        <PageLayout id={id}>
            <style>{`
                .custom-video-player-wrapper {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    width: 100px;
                    height: 100px;
                    z-index: 50;
                    overflow: visible !important;
                }
                
                .custom-video-player-wrapper.is-playing::before {
                    content: '';
                    position: absolute;
                    top: -4px;
                    left: -4px;
                    right: -4px;
                    bottom: -4px;
                    background: linear-gradient(45deg, #ff0000, #dc2626, #991b1b, #ef4444, #7f1d1d, #f87171, #b91c1c);
                    background-size: 400%;
                    z-index: -1;
                    filter: blur(5px);
                    width: calc(100% + 8px);
                    height: calc(100% + 8px);
                    animation: glowing-border 20s linear infinite;
                    opacity: 1;
                    border-radius: 50%;
                }

                @keyframes glowing-border {
                    0% { background-position: 0 0; }
                    50% { background-position: 400% 0; }
                    100% { background-position: 0 0; }
                }

                .custom-video-player-wrapper .cover-letter-video-container {
                    width: 100px;
                    height: 100px;
                    overflow: hidden;
                    border-radius: 50%;
                    position: relative;
                    z-index: 2;
                    border: 2px solid rgba(255, 255, 255, 0.8);
                }
                .cover-letter-video-element {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .custom-video-player-wrapper .custom-play-button {
                    width: 30px;
                    height: 30px;
                    bottom: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                }
                .custom-video-player-wrapper .custom-play-button svg {
                    width: 14px;
                    height: 14px;
                }

                .cover-letter-hint-bubble {
                    position: absolute;
                    right: calc(100% + 15px);
                    top: 50%;
                    transform: translateY(-50%);
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    padding: 10px 16px;
                    border-radius: 18px 18px 4px 18px;
                    font-size: 13.5px;
                    font-weight: 500;
                    line-height: 1.4;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                    z-index: 60;
                    pointer-events: auto;
                    animation: cover-letter-hint-bounce-x 1.5s infinite ease-in-out;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    width: max-content;
                    max-width: 200px;
                    text-align: left;
                }
                @media (min-width: 640px) {
                    .cover-letter-hint-bubble {
                        right: calc(100% + 20px);
                    }
                }
                .cover-letter-hint-bubble::after {
                    content: '';
                    position: absolute;
                    bottom: 6px;
                    right: -6px;
                    transform: none;
                    border-width: 6px 0 6px 6px;
                    border-style: solid;
                    border-color: transparent transparent transparent #dc2626;
                    display: block;
                    width: 0;
                }
                @keyframes cover-letter-hint-bounce-x {
                    0%, 100% { transform: translate(0, -50%); }
                    50% { transform: translate(-6px, -50%); }
                }
            `}</style>
            <div className="info-card" style={{ borderRadius: '10px' }}>
                <CardTitle
                    icon={<Icons.DocumentTextIcon />}
                    text={pageData.badge}
                    tooltipTitle={pageData.tooltipTitle}
                    tooltipText={pageData.tooltipText}
                    style={{ marginBottom: '1.5rem' }}
                />

                <div className={`custom-video-player-wrapper ${isPlaying ? 'is-playing' : ''}`} ref={videoWrapperRef}>
                    {showHint && (
                        <div 
                            className="cover-letter-hint-bubble"
                            onClick={() => {
                                setShowHint(false);
                                handlePlayPause();
                            }}
                            title={t.language === 'vi' ? 'Bấm vào để xem video' : 'Click to watch video'}
                        >
                            <span>{t.language === 'vi' ? 'Bấm vào để xem video giới thiệu của anh!' : 'Hãy bấm nút để nghe lời chào thư ngõ!'}</span>
                        </div>
                    )}
                    <div 
                        className="cover-letter-video-container" 
                        title={isPlaying ? "Tạm dừng video" : "Xem video giới thiệu"}
                        onClick={handlePlayPause}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handlePlayPause(); }}
                        role="button"
                        tabIndex={0}
                        aria-label="Play or pause the introduction video"
                    >
                        <video
                            ref={videoRef}
                            src="https://cdn.scena.ai/project/9626/f4d02f974e1736ae00f0875bc7845fa8fac2226a618b4ac4bf99eaa8e8988b42.mp4"
                            playsInline
                            loop
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            className="cover-letter-video-element"
                            poster="https://i.ibb.co/5Xk5Fckg/Avata-Gif.gif"
                        >
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                    </div>
                    <button 
                        className="custom-play-button" 
                        onClick={handlePlayPause} 
                        aria-label={isPlaying ? "Tạm dừng video" : "Phát video"}
                    >
                        {isPlaying ? <Icons.PauseIcon /> : <Icons.PlayIcon style={{ marginLeft: '2px' }}/>}
                    </button>
                </div>
                
                <div className="cover-letter-content no-scrollbar" ref={contentRef} style={{ padding: '0.5rem' }}>
                    <div className="cover-letter-inner-card" style={{ 
                        lineHeight: '1.6', 
                        padding: '2rem', 
                        marginTop: '0px',
                        background: 'var(--card-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        borderRadius: '16px',
                        border: '1px solid var(--card-border)',
                        boxShadow: 'var(--card-box-shadow)',
                        color: 'var(--color-brand-text-primary)'
                    }}>
                        <p style={{ marginBottom: '1rem', marginTop: '0px', fontWeight: '600', fontSize: '1.1rem' }}>{pageData.greeting}</p>
                        {paragraphs.map((p, index) => {
                            const lines = p.split('\n').map((line, lineIndex) => (
                                <React.Fragment key={lineIndex}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ));
                            return <p key={index} style={{ marginBottom: '1rem', marginTop: '0px' }}>{lines}</p>;
                        })}
                        <div className="cover-letter-signature-block" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--card-border)' }}>
                            <p style={{marginBottom: 0, lineHeight: '1.2', marginTop: '0px', fontStyle: 'italic'}}>{pageData.closing}</p>
                            {pageData.signatureImage && (
                                <img src={pageData.signatureImage} alt="Chữ ký" className="signature-image" style={{ margin: '0.75rem 0', maxWidth: '120px' }} />
                            )}
                            <p style={{margin: 0, lineHeight: '1.2', marginTop: '0px'}} className="signature-name">{pageData.signature}</p>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default CoverLetter;