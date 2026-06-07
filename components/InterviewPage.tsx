import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

const InterviewPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.interviewPage;
    
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 767 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <PageLayout id={id}>
            <div className="info-card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                
                <div className="about-header" style={{ flexShrink: 0, padding: '1.5rem 1.5rem 0' }}>
                    <InfoBadge
                        icon={<Icons.PresentationIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>

                <div style={{ flex: 1, minHeight: 0, padding: '1.5rem', paddingTop: '1rem' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '15px', overflow: 'hidden', background: '#000' }}>
                        <video
                            src="https://cdn.scena.ai/project/9626/87afcc11b91fa7e15873f067d16bf91f0575f92b90f03caa08359a6be05771de.mp4"
                            controls
                            autoPlay={!isMobile}
                            loop
                            muted={!isMobile}
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                </div>
                
            </div>
        </PageLayout>
    );
};

export default InterviewPage;