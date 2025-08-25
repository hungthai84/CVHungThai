import React from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

interface InfoItem {
    label: string;
    value: string;
    icon: keyof typeof Icons;
    url?: string;
}

interface AboutPageProps {
    id?: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.aboutPage;

    return (
        <PageLayout id={id}>
            <div className="info-card">
                <div className="about-header">
                    <InfoBadge
                        icon={<Icons.UserIcon />}
                        text={pageData.bioBadge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>
                <div className="about-page-content-wrapper no-scrollbar">
                    {/* Bio Section */}
                    <div className="bio-section">
                        <div className="left-bio-column">
                            <div className="bio-video-wrapper">
                                <iframe
                                    src={pageData.bioVideoUrl}
                                    title="Giới thiệu bản thân"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                        <div className="right-bio-column">
                            <h3>{pageData.bioTitle}</h3>
                            {pageData.bioParagraphs.map((p: string, index: number) => {
                                if (p.startsWith('>')) {
                                    return <p key={index} className="core-values">{p.substring(1).trim()}</p>;
                                }
                                return <p key={index}>{p}</p>;
                            })}
                        </div>
                    </div>
                    {/* Personal Info Section */}
                    <div className="personal-info-section">
                        <h3>{pageData.infoTitle}</h3>
                        <div className="about-info-grid">
                            {(pageData.infoItems as InfoItem[]).map((item: InfoItem) => {
                                const Icon = Icons[item.icon] || Icons.UserIcon;
                                const ValueComponent = item.url 
                                    ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="value">{item.value}</a>
                                    : <span className="value">{item.value}</span>;
                                
                                return (
                                    <div key={item.label} className="about-info-item">
                                        <div className="about-info-item-icon"><Icon /></div>
                                        <div className="about-info-item-text-wrapper">
                                            <div className="label">{item.label}</div>
                                            {ValueComponent}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};