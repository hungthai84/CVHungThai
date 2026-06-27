import React from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

export const AboutPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t, language } = useI18n();
    const pageData = t.aboutPage;

    const DEFAULT_VIDEO = "https://cdn.scena.ai/project/8606/9f949185c9ecaf86e263ec9eb69206a25c177599e95a8256e9452934a8f70eee.mp4";
    const INTRO_VIDEO = "https://cdn.scena.ai/project/8606/43df6bdc5cfeccdd2cadf18dc244dfab494fa7dad953bc5588d897e5d16978ce.mp4";

    const [videoUrl, setVideoUrl] = React.useState(DEFAULT_VIDEO);
    const [isMuted, setIsMuted] = React.useState(true);

    const isIntroPlaying = videoUrl === INTRO_VIDEO;

    const handleToggleIntro = () => {
        if (isIntroPlaying) {
            setVideoUrl(DEFAULT_VIDEO);
            setIsMuted(true);
        } else {
            setVideoUrl(INTRO_VIDEO);
            setIsMuted(false);
        }
    };

    return (
        <PageLayout id={id}>
            <div className="info-card" style={{ marginBottom: '0px', paddingBottom: '0px', paddingTop: '0px', paddingLeft: '25.5px' }}>
                <div 
                    onClick={handleToggleIntro} 
                    style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, opacity 0.2s ease',
                        height: '50px',
                        paddingTop: '10px',
                        paddingBottom: '10px'
                    }}
                    className="hover:scale-[1.03] active:scale-[0.98] hover:opacity-90"
                    title={isIntroPlaying ? (language === 'vi' ? 'Hủy bỏ video giới thiệu' : 'Cancel introduction video') : (language === 'vi' ? 'Xem video giới thiệu' : 'View introduction video')}
                >
                    <InfoBadge
                        icon={<Icons.UserIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                        style={{ marginTop: '0px', marginBottom: '0px' }}
                    />
                </div>

                <div className="about-page-content-wrapper no-scrollbar" style={{ marginBottom: '10px' }}>
                    <div className="about-page-grid">
                        {/* Left Column: Scena Banner and Personal Info Card (Swapped from Right) */}
                        <div className="about-left-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '610 px', minHeight: 0 }}>
                            {/* HTML5 Video Player */}
                            <div style={{ 
                                width: '100%', 
                                height: 'calc(50% - 0.75rem)',
                                borderRadius: '10px', 
                                overflow: 'hidden', 
                                background: 'rgba(var(--sidebar-bg-rgb), 0.1)',
                                border: 'var(--color-brand-glass-border)',
                                boxShadow: 'var(--card-box-shadow)',
                                position: 'relative'
                            }}>
                                <video 
                                    key={videoUrl}
                                    autoPlay 
                                    muted={isMuted} 
                                    loop={!isIntroPlaying} 
                                    playsInline 
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                        borderRadius: '10px',
                                        display: 'block'
                                    }}
                                    src={videoUrl}
                                    poster=""
                                    onEnded={() => {
                                        if (isIntroPlaying) {
                                            setVideoUrl(DEFAULT_VIDEO);
                                            setIsMuted(true);
                                        }
                                    }}
                                />
                                {/* Introduction Overlay Button */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '12px',
                                    right: '12px',
                                    zIndex: 10
                                }}>
                                    <button 
                                        onClick={handleToggleIntro}
                                        style={{
                                            background: isIntroPlaying 
                                                ? 'linear-gradient(90deg, #64748b, #334155, #0f172a)' 
                                                : 'linear-gradient(90deg, #4361ff, #a541ff, #ff4aff)',
                                            border: 'none',
                                            borderRadius: '20px',
                                            padding: '6px 16px',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        title={isIntroPlaying ? (language === 'vi' ? 'Hủy bỏ video giới thiệu' : 'Cancel introduction video') : (language === 'vi' ? 'Xem video giới thiệu' : 'View introduction video')}
                                    >
                                        {isIntroPlaying ? (
                                            <>
                                                <span>{language === 'vi' ? 'Hủy bỏ' : 'Cancel'}</span>
                                                <Icons.XMarkIcon size={14} />
                                            </>
                                        ) : (
                                            <>
                                                <span>{language === 'vi' ? 'Giới thiệu' : 'Intro'}</span>
                                                <Icons.SparklesIcon size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Personal Info Card */}
                            {pageData.infoItems && pageData.infoItems.length > 0 && (
                                <div className="about-personal-info-card" style={{ height: '290px', width: '100%', padding: '0px' }}>
                                    <h3 className="personal-info-title" style={{ marginBottom: '0px', paddingTop: '10px', paddingBottom: '15px', paddingLeft: '10px', paddingRight: '10px' }}><Icons.UserIcon className="inline mr-2" size={18} />{pageData.personalInfoTitle}</h3>
                                    <div className="personal-info-grid no-scrollbar" style={{ 
                                        height: 'calc(100% - 40px)', 
                                        padding: '1.5rem', 
                                        marginTop: '0px', 
                                        marginBottom: '0px', 
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        alignContent: 'center',
                                        gap: '1.5rem'
                                    }}>
                                        {pageData.infoItems.map((item) => {
                                            const Icon = Icons[item.icon as keyof typeof Icons] || Icons.UserIcon;
                                            
                                            return (
                                                <div key={item.key} className="personal-info-item" style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem'
                                                }}>
                                                    <div style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        borderRadius: '12px',
                                                        background: 'rgba(255, 255, 255, 0.08)',
                                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                                        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <Icon className="info-item-icon" style={{ width: '22px', height: '22px' }} />
                                                    </div>
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
                        <div className="about-right-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '610 px', minHeight: 0 }}>
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