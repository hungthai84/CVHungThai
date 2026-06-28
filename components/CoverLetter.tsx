import React, { useState, useRef, useCallback } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

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
    const contentRef = useRef<HTMLDivElement>(null);
    const videoWrapperRef = useRef<HTMLDivElement>(null);

    const handlePlayPause = useCallback(async () => {
        const video = videoRef.current;
        if (!video || isTogglingPlay) return;
    
        setIsTogglingPlay(true);
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
            <div className="info-card" style={{ borderRadius: '10px' }}>
                <InfoBadge
                    icon={<Icons.DocumentTextIcon />}
                    text={pageData.badge}
                    tooltipTitle={pageData.tooltipTitle}
                    tooltipText={pageData.tooltipText}
                    style={{ marginBottom: '1.5rem' }}
                />

                <div className="custom-video-player-wrapper" ref={videoWrapperRef}>
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
                            poster="https://i.ibb.co/7tnk3NTY/H-ng-Th-i-Avata-Gif.gif"
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
                
                <div className="cover-letter-content no-scrollbar" ref={contentRef}>
                    <div className="cover-letter-inner-card" style={{ lineHeight: '1.35', padding: '0px 0px 0px 20px', marginTop: '0px' }}>
                        <p style={{ marginBottom: '0.4rem', marginTop: '0px' }}>{pageData.greeting}</p>
                        {paragraphs.map((p, index) => {
                            const lines = p.split('\n').map((line, lineIndex) => (
                                <React.Fragment key={lineIndex}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ));
                            return <p key={index} style={{ marginBottom: '0.4rem', marginTop: '0px' }}>{lines}</p>;
                        })}
                        <div className="cover-letter-signature-block" style={{ marginTop: '1rem' }}>
                            <p style={{marginBottom: 0, lineHeight: '1.2', marginTop: '0px'}}>{pageData.closing}</p>
                                {pageData.signatureImage && (
                                <img src={pageData.signatureImage} alt="Chữ ký" className="signature-image" style={{ margin: '0.25rem 0' }} />
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