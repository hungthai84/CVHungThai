import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

// --- Type definitions ---
interface Service {
    key: string;
    title: string;
    description: string;
    icon: keyof typeof Icons;
    color: string;
    logos: string[]; // URLs of logos
}

interface ServicesPageProps {
    id?: string;
}

// --- Sub-components ---
const ServiceCard: React.FC<{ service: Service, index: number }> = ({ service, index }) => {
    const Icon = Icons[service.icon] || Icons.FolderIcon;
    const cardRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const element = cardRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    element.classList.add('is-visible');
                    observer.unobserve(element);
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(element);
        return () => {
            if (element) {
                observer.disconnect();
            }
        };
    }, []);
    
    return (
        <div 
            ref={cardRef} 
            className="service-box fade-in-up-on-scroll" 
            style={{ 
                '--item-color': service.color, 
                transitionDelay: `${index * 50}ms` 
            } as React.CSSProperties}
        >
            <div>
                <div className="service-title-wrapper">
                    <Icon style={{ color: service.color }} />
                    <h4 style={{ color: service.color }}>{service.title}</h4>
                </div>
                <p className="service-description">{service.description}</p>
            </div>
            {service.logos && service.logos.length > 0 && (
                <div className="service-logos-container">
                    {service.logos.map((logoUrl, logoIndex) => (
                        <img key={logoIndex} src={logoUrl} alt={`Logo ${logoIndex + 1}`} className="service-logo-item-new" />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
const ServicesPage: React.FC<ServicesPageProps> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.servicesPage;
    const services: Service[] = (pageData.services as Service[]) || [];
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isTogglingPlay, setIsTogglingPlay] = useState(false);

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
            <div className="info-card is-services">
                <div className="about-header">
                     <InfoBadge
                        icon={<Icons.LayersIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>
                
                <div className="custom-video-player-wrapper">
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
                            src="https://cdn.scena.ai/project/9626/1de3dfa3764c2adbd549d480eedb22a9775d676a88d8d26a6277a2086274dbbc.mp4"
                            playsInline
                            loop
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            className="cover-letter-video-element"
                            poster="https://i.postimg.cc/0QyHjYN4/Avata-Gif.gif"
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

                <div className="services-grid no-scrollbar">
                     {services.length > 0 ? (
                        services.map((service, index) => (
                           <ServiceCard key={service.key} service={service} index={index} />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-brand-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gridColumn: '1 / -1' }}>
                            <Icons.LayersIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }}/>
                            <p>Dữ liệu về lĩnh vực chuyên môn đang được cập nhật. <br/>Vui lòng quay lại sau.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default ServicesPage;