import React, { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';

interface Achievement {
    label: string;
    value: number;
}

interface Job {
    key: string;
    date: string;
    company: string;
    logoUrl: string;
    color: string;
    title: string;
    teamSize: string;
    responsibilities: string[];
    achievements: Achievement[];
    images?: string[];
}

interface JobAchievementCardProps {
    achievement: Achievement;
    color: string;
    isForPrint?: boolean;
}

interface WorkExperiencePageProps {
    id?: string;
    onNavigate?: (key: string) => void;
    isForPrint?: boolean;
}

// This helper function maps keywords in the achievement label to specific icons.
const getAchievementIcon = (label: string): React.FC<any> => {
    const lowerLabel = label.toLowerCase();
    // English keywords
    if (lowerLabel.includes('process')) return Icons.ClipboardDocumentListIcon;
    if (lowerLabel.includes('support') || lowerLabel.includes('response')) return Icons.LifebuoyIcon;
    if (lowerLabel.includes('community')) return Icons.UsersIcon;
    if (lowerLabel.includes('event')) return Icons.SparklesIcon;
    if (lowerLabel.includes('project')) return Icons.FolderIcon;
    if (lowerLabel.includes('call center') || lowerLabel.includes('call')) return Icons.PhoneIcon;
    if (lowerLabel.includes('commerce')) return Icons.CubeIcon;
    if (lowerLabel.includes('insurance')) return Icons.ShieldCheckIcon;
    if (lowerLabel.includes('completion')) return Icons.CheckIcon;
    // Vietnamese keywords
    if (lowerLabel.includes('quy trình')) return Icons.ClipboardDocumentListIcon;
    if (lowerLabel.includes('hỗ trợ')) return Icons.LifebuoyIcon;
    if (lowerLabel.includes('cộng đồng')) return Icons.UsersIcon;
    if (lowerLabel.includes('sự kiện')) return Icons.SparklesIcon;
    if (lowerLabel.includes('dự án')) return Icons.FolderIcon;
    if (lowerLabel.includes('tổng đài') || lowerLabel.includes('cuộc gọi')) return Icons.PhoneIcon;
    if (lowerLabel.includes('thương mại')) return Icons.CubeIcon;
    if (lowerLabel.includes('bảo hiểm')) return Icons.ShieldCheckIcon;
    if (lowerLabel.includes('hoàn tất')) return Icons.CheckIcon;

    return Icons.TrophyIcon; // Default icon
};

const JobAchievementCard: React.FC<JobAchievementCardProps> = ({ achievement, color, isForPrint = false }) => {
    const Icon = getAchievementIcon(achievement.label);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isForPrint) return; // Skip observer for print

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
                observer.unobserve(element);
            }
        };
    }, [isForPrint]);
    
    return (
        <div 
            ref={cardRef} 
            className={`job-achievement-card fade-in-up-on-scroll ${isForPrint ? 'is-visible' : ''}`}
            style={{ '--achievement-color': color } as React.CSSProperties}
        >
            <div className="job-achievement-card-header">
                <div className="job-achievement-card-icon" style={{ backgroundColor: color }}>
                    <Icon />
                </div>
                <span className="job-achievement-card-label">{achievement.label}</span>
                <span className="job-achievement-card-value">{achievement.value}%</span>
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{
                            '--level': `${achievement.value}%`,
                            backgroundColor: color,
                        } as React.CSSProperties}
                    />
                </div>
            </div>
        </div>
    );
};


import OptimizedImage from './OptimizedImage';

const JobImageSlider: React.FC<{ images: string[] }> = ({ images }) => {
    if (!images || images.length === 0) {
        return null;
    }

    // Duplicate images for a seamless loop
    const doubledImages = [...images, ...images];

    return (
        <div className="job-image-slider-container">
            <div className="job-image-slider-track">
                {doubledImages.map((src, index) => (
                    <div className="job-image-slider-slide" key={index}>
                        <div className="job-image-slide">
                           <OptimizedImage src={src} alt={`Work sample ${index + 1}`} loading="lazy" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WorkExperiencePage: React.FC<WorkExperiencePageProps> = ({ id, onNavigate, isForPrint = false }) => {
    const { t, language } = useI18n();
    const pageData = t.workExperiencePage;
    const jobs: Job[] = useMemo(() => [...(pageData.jobs || [])], [pageData.jobs]);
    const [activeJobIndex, setActiveJobIndex] = useState(jobs.length - 1);
    
    const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);
    const timelineContainerRef = useRef<HTMLDivElement | null>(null);
    
    const [showVideoPopup, setShowVideoPopup] = useState(false);
    const videoUrl = "https://cdn.scena.ai/project/9626/a5b5bdf1659991c0c74510ddfc59b9d27a3c7478f17c711b0fc39c5e51cf43d2.mp4";

    useEffect(() => {
        milestoneRefs.current = milestoneRefs.current.slice(0, jobs.length);
    }, [jobs]);

    const calculateLines = useCallback(() => {
        const container = timelineContainerRef.current;
        if (!container || milestoneRefs.current.length === 0 || isForPrint) return;

        requestAnimationFrame(() => {
            const milestones = milestoneRefs.current.filter(Boolean) as HTMLDivElement[];
            if (milestones.length === 0) return;

            const firstMilestone = milestones[0];
            const lastMilestone = milestones[milestones.length - 1];
            const activeMilestone = milestones[activeJobIndex] || firstMilestone;

            // Use offsetLeft/OffsetWidth for more reliable relative positioning
            const firstCenter = firstMilestone.offsetLeft + firstMilestone.offsetWidth / 2;
            const lastCenter = lastMilestone.offsetLeft + lastMilestone.offsetWidth / 2;
            const activeCenter = activeMilestone.offsetLeft + activeMilestone.offsetWidth / 2;

            const segmentsLeft = firstCenter;
            const segmentsWidth = lastCenter - firstCenter;
            
            const progressLeft = firstCenter;
            const progressWidth = activeCenter - firstCenter;
            
            container.style.setProperty('--segments-left', `${segmentsLeft}px`);
            container.style.setProperty('--segments-width', `${segmentsWidth}px`);
            container.style.setProperty('--progress-left', `${progressLeft}px`);
            container.style.setProperty('--progress-width', `${progressWidth}px`);
            container.style.setProperty('--progress-bg-color', jobs[activeJobIndex]?.color || 'var(--accent-color)');
            container.style.setProperty('--timeline-opacity', '1');
        });
    }, [activeJobIndex, isForPrint, jobs]);

    useLayoutEffect(() => {
        if (isForPrint) return;

        const container = timelineContainerRef.current;
        if (!container) return;

        // Use ResizeObserver for more robust tracking of layout changes
        const observer = new ResizeObserver(() => {
            calculateLines();
        });

        observer.observe(container);
        milestoneRefs.current.forEach(m => {
            if (m) observer.observe(m);
        });

        // Initial calculation
        calculateLines();

        return () => {
            observer.disconnect();
        };
    }, [isForPrint, calculateLines]);

    const formatJobDate = (dateString: string) => {
        if (language === 'vi') {
            return dateString.replace(/(\d{4})\s*-\s*(\d{4})/, 'Từ năm $1 đến Năm $2');
        }
        return dateString;
    };

    if (isForPrint) {
        return (
             <div className="print-page">
                <div className="info-card is-for-print">
                    <div className="about-header">
                        <InfoBadge
                            icon={<Icons.BriefcaseIcon />}
                            text={pageData.title}
                            tooltipTitle={pageData.tooltipTitle}
                            tooltipText={pageData.tooltipText}
                        />
                    </div>
                    <div className="experience-layout no-scrollbar">
                        {jobs.map(job => (
                            <div key={job.key} className="print-job-item">
                                <div className="job-header">
                                   <div className="job-header-info">
                                       <span className="job-date">{formatJobDate(job.date)}</span>
                                       <h3>{job.title}</h3>
                                       <h4>{job.company}</h4>
                                   </div>
                               </div>
                               <h5>{pageData.descriptionTitle}</h5>
                               <ul>
                                   {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                               </ul>
                               {job.achievements.length > 0 && (
                                   <>
                                   <h5>{pageData.achievementsTitle}</h5>
                                   <div className="job-achievements-grid">
                                       {job.achievements.map((ach, index) => (
                                           <JobAchievementCard key={index} achievement={ach} color={job.color} isForPrint={true} />
                                       ))}
                                   </div>
                                   </>
                               )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const activeJob = jobs[activeJobIndex];
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 767 : false);
    const [showDetailPopup, setShowDetailPopup] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 767);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMilestoneClick = (index: number) => {
        setActiveJobIndex(index);
        if (isMobile) {
            setShowDetailPopup(true);
        }
    };
    return (
        <PageLayout id={id}>
            <div className={`info-card work-experience-card`}>
                 <div className="about-header">
                    <InfoBadge
                        icon={<Icons.BriefcaseIcon />}
                        text={pageData.title}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>

                <div className="custom-video-player-wrapper" style={{ transform: 'scale(0.7)', transformOrigin: 'top right' }}>
                    <div 
                        className="cover-letter-video-container" 
                        title="Xem video giới thiệu"
                        onClick={() => setShowVideoPopup(true)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowVideoPopup(true); }}
                        role="button"
                        tabIndex={0}
                        aria-label="Play introduction video"
                    >
                        <video
                            src={videoUrl}
                            playsInline
                            autoPlay
                            muted
                            loop
                            className="cover-letter-video-element"
                            poster="https://i.postimg.cc/0QyHjYN4/Avata-Gif.gif"
                        >
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                    </div>
                    <button 
                        className="custom-play-button" 
                        onClick={() => setShowVideoPopup(true)} 
                        aria-label="Play video"
                    >
                        <Icons.PlayIcon style={{ marginLeft: '2px' }}/>
                    </button>
                </div>

                <div className="work-experience-info">
                    <div className="timeline-navigation-wrapper no-scrollbar">
                        <div className="timeline-container" ref={timelineContainerRef}>
                             <div id="timeline-segments-container"></div>
                             <div id="timeline-progress-bar"></div>
                            {jobs.map((job, index) => (
                                <div
                                    key={job.key}
                                    ref={el => { if(el) milestoneRefs.current[index] = el; }}
                                    className={`timeline-milestone ${index === activeJobIndex ? 'active' : ''}`}
                                    onClick={() => handleMilestoneClick(index)}
                                    style={{ '--item-color': job.color } as React.CSSProperties}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveJobIndex(index); }}
                                    aria-label={`View details for ${job.company}`}
                                >
                                    <div className="year-text" style={{ color: index === activeJobIndex ? job.color : undefined }}>
                                        <Icons.CalendarDaysIcon size={16} />
                                        <span>{job.date.split(' - ')[0]}</span>
                                    </div>
                                    <div className="timeline-dot-container">
                                        <div className="timeline-dot" style={{ borderColor: index === activeJobIndex ? job.color : undefined }}>
                                             <img src={job.logoUrl} alt={`${job.company} logo`} className="timeline-dot-img"/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {activeJob && !isMobile && (
                        <div className="job-card" key={activeJob.key}>
                           <div className="job-card-scrollable-content no-scrollbar">
                                <div className="job-card-details-grid">
                                    <div>
                                        <div className="job-header-info">
                                            <span className="job-date">{formatJobDate(activeJob.date)}</span>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                                <div style={{ 
                                                    width: '32px', 
                                                    height: '32px', 
                                                    borderRadius: '50%', 
                                                    backgroundColor: 'white', 
                                                    padding: '2px', 
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    border: `1px solid ${activeJob.color}`
                                                }}>
                                                    <img src={activeJob.logoUrl} alt={activeJob.company} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                                </div>
                                                <h4 style={{ margin: 0, color: activeJob.color }}>{activeJob.company}</h4>
                                            </div>

                                            <h3 style={{ marginTop: '0.25rem', marginBottom: '0.5rem', lineHeight: 1.3, fontSize: '1rem' }}>{activeJob.title}</h3>

                                            <div className="job-team-size" style={{marginTop: '0.5rem'}}>
                                               <span>{pageData.managedTitle}: </span>
                                               <strong>{activeJob.teamSize}</strong>
                                           </div>
                                        </div>
                                        <h5 style={{marginTop: '1.5rem'}}>{pageData.descriptionTitle}</h5>
                                        <ul>
                                           {activeJob.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        {activeJob.achievements.length > 0 && (
                                           <>
                                           <h5>{pageData.achievementsTitle}</h5>
                                           <div className="achievements-grid">
                                               {activeJob.achievements.map((ach, index) => (
                                                   <JobAchievementCard key={index} achievement={ach} color={activeJob.color} />
                                               ))}
                                           </div>
                                           </>
                                       )}
                                        
                                    </div>
                                </div>
                               
                               {activeJob.images && activeJob.images.length > 0 && (
                                   <div className="job-image-slider-wrapper">
                                       <h5>{pageData.relatedImagesTitle}</h5>
                                       <JobImageSlider images={activeJob.images} />
                                   </div>
                               )}
                           </div>
                        </div>
                    )}
                </div>
            </div>
            {showDetailPopup && activeJob && document.getElementById('popup-root') && createPortal(
                <div className="video-popup-overlay" onClick={() => setShowDetailPopup(false)}>
                    <div className="video-popup-content experience-popup-content no-scrollbar" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem', overflowY: 'auto' }}>
                        <button className="video-popup-close-btn" onClick={() => setShowDetailPopup(false)} aria-label="Close details">
                            <Icons.XMarkIcon />
                        </button>
                        
                        <div className="job-header-info">
                            <span className="job-date">{formatJobDate(activeJob.date)}</span>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'white', 
                                    padding: '2px', 
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    border: `1px solid ${activeJob.color}`
                                }}>
                                    <img src={activeJob.logoUrl} alt={activeJob.company} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                </div>
                                <h4 style={{ margin: 0, color: activeJob.color }}>{activeJob.company}</h4>
                            </div>

                            <h3 style={{ marginTop: '0.25rem', marginBottom: '0.5rem', lineHeight: 1.3, fontSize: '1.1rem' }}>{activeJob.title}</h3>

                            <div className="job-team-size" style={{marginTop: '0.5rem'}}>
                                <span>{pageData.managedTitle}: </span>
                                <strong>{activeJob.teamSize}</strong>
                            </div>
                        </div>

                        <h5 style={{marginTop: '1.5rem', borderTop: '1px solid var(--color-brand-glass-border)', paddingTop: '1rem'}}>{pageData.descriptionTitle}</h5>
                        <ul className="popup-responsibilities">
                            {activeJob.responsibilities.map((item, index) => <li key={index} style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>{item}</li>)}
                        </ul>

                        {activeJob.achievements.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h5 style={{ marginBottom: '1rem' }}>{pageData.achievementsTitle}</h5>
                                <div className="achievements-grid" style={{ gridTemplateColumns: '1fr' }}>
                                    {activeJob.achievements.map((ach, index) => (
                                        <JobAchievementCard key={index} achievement={ach} color={activeJob.color} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeJob.images && activeJob.images.length > 0 && (
                            <div className="job-image-slider-wrapper" style={{ marginTop: '1.5rem' }}>
                                <h5>{pageData.relatedImagesTitle}</h5>
                                <JobImageSlider images={activeJob.images} />
                            </div>
                        )}
                    </div>
                </div>,
                document.getElementById('popup-root')!
            )}
            {showVideoPopup && document.getElementById('popup-root') && createPortal(
                <div className="video-popup-overlay" onClick={() => setShowVideoPopup(false)}>
                    <div className="video-popup-content" onClick={e => e.stopPropagation()}>
                        <button className="video-popup-close-btn" onClick={() => setShowVideoPopup(false)} aria-label="Close video">
                            <Icons.XMarkIcon />
                        </button>
                        <video 
                            src={videoUrl}
                            controls 
                            autoPlay 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    </div>
                </div>,
                document.getElementById('popup-root')!
            )}
        </PageLayout>
    );
};
export default WorkExperiencePage;