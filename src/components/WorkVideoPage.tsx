import React, { useState, useEffect } from 'react';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';
import * as Icons from './Icons';
import { useI18n } from '../contexts/i18nContext';

interface WorkVideoPageProps {
    id?: string;
    onNavigate?: (key: string) => void;
}

const WorkVideoPage: React.FC<WorkVideoPageProps> = ({ id, onNavigate }) => {
    const { t } = useI18n();
    const pageData = t.workExperiencePage; // Re-use translations for badge
    
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 767 : false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <PageLayout id={id}>
            <div className="info-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div className="about-header" style={{ padding: '1.5rem 1.5rem 0', flexShrink: 0, justifyContent: 'space-between' }}>
                    <InfoBadge
                        icon={<Icons.BriefcaseIcon />}
                        text={pageData.title}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                    <button
                        onClick={() => onNavigate?.('experience')}
                        className="btn btn-secondary"
                    >
                        <Icons.ChevronLeftIcon size={18} />
                        <span>Trở về Kinh nghiệm</span>
                    </button>
                </div>
                <div style={{ flex: 1, minHeight: 0, padding: '1.5rem', paddingTop: '1rem' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '15px', overflow: 'hidden', background: '#000' }}>
                        <video
                            src="https://cdn.scena.ai/project/9626/a5b5bdf1659991c0c74510ddfc59b9d27a3c7478f17c711b0fc39c5e51cf43d2.mp4"
                            controls
                            autoPlay={!isMobile}
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

export default WorkVideoPage;
