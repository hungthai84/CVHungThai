import React from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

// The type was mentioned in the previous turn's description
interface InfoItem {
    label: string;
    value: string;
    icon: keyof typeof Icons;
    url?: string;
}

export const AboutPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.aboutPage;
    
    const infoItems: InfoItem[] = (pageData.infoItems as InfoItem[]) || [];

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
                    <div className="about-page-grid">
                        <div className="about-video-card">
                            <div className="bio-video-wrapper">
                                <iframe
                                    src={pageData.bioVideoUrl}
                                    title="Bio Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                        <div className="about-bio-text-card">
                            <h3 className="hero-name-text">{pageData.bioTitle}</h3>
                            {pageData.bioParagraphs.map((p, index) => {
                                if (p.startsWith('> ')) {
                                    return <blockquote key={index}><p className="core-values">{p.substring(2)}</p></blockquote>;
                                }
                                return <p key={index}>{p}</p>;
                            })}
                        </div>
                        <div className="about-contact-card">
                            <h3>{pageData.infoTitle}</h3>
                            <div className="about-info-grid">
                                {infoItems.map((item) => {
                                    const Icon = Icons[item.icon] || Icons.LinkIcon;
                                    const content = (
                                        <>
                                            <div className="about-info-item-icon">
                                                <Icon />
                                            </div>
                                            <div className="about-info-item-text-wrapper">
                                                <div className="label">{item.label}</div>
                                                <div className="value">{item.value}</div>
                                            </div>
                                        </>
                                    );
                                    return item.url ? (
                                        <a href={item.url} key={item.label} className="about-info-item" target="_blank" rel="noopener noreferrer">
                                            {content}
                                        </a>
                                    ) : (
                                        <div key={item.label} className="about-info-item">
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};
