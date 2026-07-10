import React, { useState, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import CardTitle from './CardTitle';

const DEFAULT_VIDEO_URL = "https://cdn.scena.ai/project/9741/a5c3dae9a7911b77acee79f91a1c33bfa49c0f329f63f71cc22f9a224738f091.mp4";
const INTERVIEW_VIDEO_URL = " https://cdn.scena.ai/project/9741/8e359f7d80ed61ab0bb3e01d8e8c0bfad6a1d94681084ff483a5d0fb6aa55aed.mp4";

const InterviewPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.interviewPage;
    
    const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
    const [isPlayingInterview, setIsPlayingInterview] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const playInterview = () => {
        setVideoUrl(INTERVIEW_VIDEO_URL);
        setIsPlayingInterview(true);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.muted = false;
            videoRef.current.play().catch(err => console.log("Playback failed:", err));
        }
    };

    const cancelInterview = () => {
        setVideoUrl(DEFAULT_VIDEO_URL);
        setIsPlayingInterview(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <PageLayout id={id}>
            <style>{`
                .magic-btn-main {
                    position: relative;
                    background: linear-gradient(90deg, #4361ff, #a541ff, #ff4aff);
                    border-radius: 40px;
                    height: 58px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    font-weight: 300;
                    letter-spacing: 0.5px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
                    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
                    padding-left: 60px;
                    padding-right: 32px;
                    min-width: 200px;
                }
                .magic-btn-main:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 12px 30px rgba(168, 85, 247, 0.6);
                }
                .magic-btn-cancel {
                    background: linear-gradient(90deg, #64748b, #334155, #0f172a);
                    box-shadow: 0 8px 25px rgba(51, 65, 85, 0.3);
                }
                .magic-btn-glass {
                    position: absolute;
                    left: -25px;
                    top: -5px;
                    bottom: -5px;
                    width: 105px;
                    border-radius: 40px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.02) 100%);
                    backdrop-filter: blur(12px);
                    border: 1.5px solid rgba(255, 255, 255, 0.4);
                    z-index: 2;
                    pointer-events: none;
                }
                .magic-btn-content {
                    position: relative;
                    z-index: 3;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 14px;
                    width: 100%;
                }
            `}</style>
            <div className="info-card" style={{ position: 'relative', height: '100%', width: '100%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Floating InfoBadge */}
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 20 }}>
                    <CardTitle
                        icon={<Icons.PresentationIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>

                {/* Full-bleed Video Container */}
                <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', height: '100%' }}>
                    <video
                        key={videoUrl}
                        ref={videoRef}
                        src={videoUrl}
                        playsInline
                        autoPlay
                        loop={!isPlayingInterview}
                        muted={!isPlayingInterview}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                        onEnded={() => {
                            if (isPlayingInterview) {
                                cancelInterview();
                            }
                        }}
                    />

                    {isPlayingInterview && (
                        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 30 }}>
                             <button onClick={cancelInterview} className="magic-btn-main magic-btn-cancel" style={{ height: '40px', minWidth: '100px', fontSize: '1rem', padding: '0 20px' }}>
                                 <div className="magic-btn-glass" style={{ width: '60px', left: '-15px' }}></div>
                                 <div className="magic-btn-content">
                                     <span>Hủy</span>
                                     <Icons.XMarkIcon size={20} />
                                 </div>
                             </button>
                        </div>
                    )}

                    {!isPlayingInterview && (
                        <div style={{ position: 'absolute', bottom: '150px', right: '20px', zIndex: 30 }}>
                             <button onClick={playInterview} className="magic-btn-main" style={{ height: '50px', fontSize: '1rem' }}>
                                 <div className="magic-btn-glass"></div>
                                 <div className="magic-btn-content">
                                     <span>Nghe trao đổi</span>
                                     <Icons.MicrophoneIcon size={20} />
                                 </div>
                             </button>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default InterviewPage;