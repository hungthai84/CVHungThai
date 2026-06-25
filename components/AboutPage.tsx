import React from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

const ScenaAiBanner = 'scena-ai-banner' as any;

export const AboutPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t, language } = useI18n();
    const pageData = t.aboutPage;

    return (
        <PageLayout id={id}>
            <div className="info-card" style={{ marginBottom: '0px', paddingBottom: '0px', paddingTop: '0px', paddingLeft: '25.5px' }}>
                <InfoBadge
                    icon={<Icons.UserIcon />}
                    text={pageData.badge}
                    tooltipTitle={pageData.tooltipTitle}
                    tooltipText={pageData.tooltipText}
                    style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
                />

                <div className="about-page-content-wrapper no-scrollbar" style={{ marginBottom: '10px' }}>
                    <div className="about-page-grid">
                        {/* Left Column: Scena Banner and Personal Info Card (Swapped from Right) */}
                        <div className="about-left-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '615px', minHeight: 0 }}>
                            {/* Embedded Scena AI Banner */}
                            <div style={{ 
                                width: '100%', 
                                borderRadius: '10px', 
                                overflow: 'hidden', 
                                background: 'rgba(var(--sidebar-bg-rgb), 0.1)',
                                border: 'var(--color-brand-glass-border)',
                                boxShadow: 'var(--card-box-shadow)'
                            }}>
                                <ScenaAiBanner key-id="nmxffobkkmcj" aspect-ratio="16/9" style={{ width: '100%', display: 'block', borderRadius: '10px' }}></ScenaAiBanner>
                                <script src="https://scena.link/app.js"></script>
                            </div>

                            {/* Personal Info Card */}
                            {pageData.infoItems && pageData.infoItems.length > 0 && (
                                <div className="about-personal-info-card" style={{ height: '400px', width: '100%', padding: '0px' }}>
                                    <h3 className="personal-info-title" style={{ marginBottom: '0px', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', paddingRight: '10px' }}><Icons.UserIcon className="inline mr-2" size={18} />{pageData.personalInfoTitle}</h3>
                                    <div className="personal-info-grid no-scrollbar" style={{ 
                                        height: '360px', 
                                        paddingRight: '0px', 
                                        marginTop: '0px', 
                                        marginBottom: '0px', 
                                        paddingTop: '0px',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        justifyContent: 'center',
                                        alignContent: 'center',
                                        gap: '1.5rem'
                                    }}>
                                        {pageData.infoItems.map((item) => {
                                            const Icon = Icons[item.icon as keyof typeof Icons] || Icons.UserIcon;
                                            
                                            return (
                                                <div key={item.key} className="personal-info-item" style={{ 
                                                    width: 'calc(33.333% - 1.5rem)', 
                                                    minWidth: '160px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <Icon className="info-item-icon" />
                                                    <div className="info-item-text">
                                                        <span className="info-item-label">{item.label}</span>
                                                        <span className="info-item-value" style={{ fontSize: '0.85rem' }}>
                                                            {item.link ? (
                                                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                                                    {item.key === 'website' ? (language === 'vi' ? 'Liên kết' : 'Link') : item.value}
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

                        {/* Right Column: Bio Text Card (Swapped from Left) */}
                        <div className="about-right-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', minHeight: 0 }}>
                            {/* Bio Text Card */}
                            <div className="about-bio-text-card no-scrollbar" style={{ flex: '1 1 0%', minHeight: 0, overflowY: 'auto' }}>
                                <h3 className="personal-info-title" style={{ marginBottom: '0px', paddingBottom: '0px' }}><Icons.SparklesIcon className="inline mr-2" size={20} />{pageData.tooltipTitle}</h3>
                                <div className="about-bio-and-video-container m-0 p-0">
                                    {pageData.paragraphs.map((p, index) => (
                                        <p key={index} className="m-0 p-0" style={{ marginTop: '0px', marginBottom: '0px' }} dangerouslySetInnerHTML={{ __html: p }} />
                                    ))}
                                    <div className="core-values m-0 p-0" role="complementary" style={{ marginTop: '0px', marginBottom: '0px', paddingBottom: '0px', paddingTop: '0px', paddingRight: '0px', paddingLeft: '0px' }}>
                                        {pageData.coreValues}
                                    </div>
                                    <p className="m-0 p-0" style={{ marginTop: '0px', marginBottom: '0px' }} dangerouslySetInnerHTML={{ __html: pageData.concludingParagraph }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default AboutPage;