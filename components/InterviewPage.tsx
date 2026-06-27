import React, { useState, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

const InterviewPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.interviewPage;
    
    const [showPrompt, setShowPrompt] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleAccept = () => {
        setShowPrompt(false);
        if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play().catch(err => {
                console.log("Playback failed:", err);
            });
        }
    };

    const handleDecline = () => {
        setShowPrompt(false);
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    return (
        <PageLayout id={id}>
            <div className="info-card" style={{ position: 'relative', height: '100%', width: '100%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* Floating InfoBadge */}
                <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 20 }}>
                    <InfoBadge
                        icon={<Icons.PresentationIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>

                {/* Full-bleed Video Container */}
                <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', height: '100%' }}>
                    <video
                        ref={videoRef}
                        src="https://cdn.scena.ai/project/9626/87afcc11b91fa7e15873f067d16bf91f0575f92b90f03caa08359a6be05771de.mp4"
                        controls
                        loop
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {showPrompt && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            padding: '1.5rem',
                            color: '#fff',
                            textAlign: 'center'
                        }}>
                                <div style={{
                                    maxWidth: '400px',
                                    backgroundColor: 'var(--color-card-bg, #1a2035)',
                                    border: '1px solid rgba(249, 115, 22, 0.35)',
                                    borderRadius: '16px',
                                    padding: '2rem 1.5rem',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1.25rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        background: 'rgba(249, 115, 22, 0.15)',
                                        color: '#f97316',
                                        marginBottom: '0.25rem',
                                        transform: 'scale(1.15)'
                                    }}>
                                        <Icons.PresentationIcon />
                                    </div>
                                    <h3 style={{ fontSize: '13pt', fontWeight: 700, color: 'var(--color-text-primary, #ffffff)', margin: 0, letterSpacing: '-0.3px' }}>
                                        Bắt đầu buổi phỏng vấn
                                    </h3>
                                    <p style={{ fontSize: '9.5pt', color: 'var(--color-text-secondary, #94a3b8)', margin: 0, lineHeight: 1.5 }}>
                                        Bạn có muốn bắt đầu xem buổi phỏng vấn chuyên nghiệp hay không?
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                                        <button 
                                            id="btn-interview-yes"
                                            onClick={handleAccept} 
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem 1rem',
                                                backgroundColor: '#f97316',
                                                color: '#ffffff',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '9.5pt',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.25)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = '#ea580c';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f97316';
                                                e.currentTarget.style.transform = 'none';
                                            }}
                                        >
                                            Có, phát video
                                        </button>
                                        <button 
                                            id="btn-interview-no"
                                            onClick={handleDecline} 
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem 1rem',
                                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                color: 'var(--color-text-primary, #ffffff)',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                borderRadius: '10px',
                                                fontSize: '9.5pt',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                                                e.currentTarget.style.transform = 'none';
                                            }}
                                        >
                                            Không, dừng lại
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </PageLayout>
    );
};

export default InterviewPage;