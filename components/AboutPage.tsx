import React from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

export const AboutPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.aboutPage;

    return (
        <PageLayout id={id}>
            <div className="info-card">
                <div className="about-header">
                    <InfoBadge
                        icon={<Icons.UserIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>

                <div className="about-page-content-wrapper no-scrollbar">
                    <div className="about-page-grid">
                        {/* Left Column: Bio and Video */}
                        <div className="about-bio-text-card no-scrollbar">
                            <div className="about-bio-and-video-container">
                                <div className="about-video-card">
                                   <div className="bio-video-wrapper">
                                        <iframe
                                            src="https://scena.link/nmxffobkkmcj"
                                            title="Giới thiệu bản thân - Nguyễn Hùng Thái"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                                {pageData.paragraphs.map((p, index) => (
                                    <p key={index} dangerouslySetInnerHTML={{ __html: p }} />
                                ))}
                                <div className="core-values" role="complementary">
                                    {pageData.coreValues}
                                </div>
                                <p dangerouslySetInnerHTML={{ __html: pageData.concludingParagraph }} />
                            </div>
                        </div>

                        {/* Right Column: Personal Info Card */}
                        {pageData.infoItems && pageData.infoItems.length > 0 && (
                            <div className="about-personal-info-card">
                                <h3 className="personal-info-title">{pageData.personalInfoTitle}</h3>
                                <div className="personal-info-grid no-scrollbar">
                                    {pageData.infoItems.map(item => {
                                        const Icon = Icons[item.icon as keyof typeof Icons] || Icons.UserIcon;
                                        return (
                                            <div key={item.key} className="personal-info-item">
                                                <Icon className="info-item-icon" />
                                                <div className="info-item-text">
                                                    <span className="info-item-label">{item.label}</span>
                                                    <span className="info-item-value">
                                                        {item.link ? (
                                                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                                {item.value}
                                                            </a>
                                                        ) : (
                                                            item.value
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default AboutPage;