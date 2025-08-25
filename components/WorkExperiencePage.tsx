import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
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

interface WorkExperiencePageProps {
    id?: string;
}

const VideoPopup: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="video-popup-overlay" onClick={onClose}>
            <div className="video-popup-content" onClick={handleContentClick}>
                <button className="video-popup-close-btn" onClick={onClose} aria-label="Đóng video">
                    <Icons.XMarkIcon />
                </button>
                <video src={src} controls autoPlay playsInline />
            </div>
        </div>
    );
};

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

const JobAchievementCard: React.FC<{ achievement: Achievement; color: string }> = ({ achievement, color }) => {
    const Icon = getAchievementIcon(achievement.label);
    
    return (
        <div className="job-achievement-card" style={{ '--achievement-color': color } as React.CSSProperties}>
            <div className="job-achievement-card-header">
                <div className="job-achievement-card-icon" style={{ backgroundColor: color }}>
                    <Icon />
                </div>
                <span className="job-achievement-card-label">{achievement.label}</span>
                <span className="job-achievement-card-value">{achievement.value}%</span>
            </div>
            <div className="job-achievement-card-progress-bg">
                <div
                    className="job-achievement-card-progress-fill"
                    style={{ width: `${achievement.value}%` }}
                />
            </div>
        </div>
    );
};


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
                           <img src={src} alt={`Work sample ${index + 1}`} loading="lazy" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const WorkExperiencePage: React.FC<WorkExperiencePageProps> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.workExperiencePage;
    const jobs: Job[] = useMemo(() => [...(pageData.jobs || [])], [pageData.jobs]);
    const [activeJobIndex, setActiveJobIndex] = useState(jobs.length - 1);
    
    const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);
    const timelineContainerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoPopupOpen, setVideoPopupOpen] = useState(false);

    const handleVideoClick = useCallback(() => {
        setVideoPopupOpen(true);
    }, []);
    
    useEffect(() => {
        if (isVideoPopupOpen) {
            document.body.classList.add('popup-open');
        } else {
            document.body.classList.remove('popup-open');
        }
        return () => {
            document.body.classList.remove('popup-open');
        };
    }, [isVideoPopupOpen]);

    useEffect(() => {
        milestoneRefs.current = milestoneRefs.current.slice(0, jobs.length);
    }, [jobs]);

    const calculateLines = useCallback(() => {
        const container = timelineContainerRef.current;
        if (!container) {
            return;
        }

        const firstMilestone = milestoneRefs.current[0];
        const lastMilestone = milestoneRefs.current[jobs.length - 1];
        const activeMilestone = milestoneRefs.current[activeJobIndex];

        if (firstMilestone && lastMilestone && activeMilestone) {
            const containerRect = container.getBoundingClientRect();
            const firstRect = firstMilestone.getBoundingClientRect();
            const lastRect = lastMilestone.getBoundingClientRect();
            const activeRect = activeMilestone.getBoundingClientRect();

            // Calculate for the full segment line (grey background)
            const segmentsLeft = (firstRect.left + firstRect.width / 2) - containerRect.left;
            const segmentsWidth = (lastRect.left + lastRect.width / 2) - (firstRect.left + firstRect.width / 2);
            
            // Calculate for the progress line (colored)
            const progressLeft = (firstRect.left + firstRect.width / 2) - containerRect.left;
            const progressWidth = (activeRect.left + activeRect.width / 2) - (firstRect.left + firstRect.width / 2);
            
            const jobColor = jobs[activeJobIndex]?.color || 'var(--accent-color)';
            
            // Set CSS Custom Properties instead of state
            container.style.setProperty('--segments-left', `${segmentsLeft}px`);
            container.style.setProperty('--segments-width', `${segmentsWidth}px`);
            container.style.setProperty('--progress-left', `${progressLeft}px`);
            container.style.setProperty('--progress-width', `${progressWidth}px`);
            container.style.setProperty('--progress-bg-color', jobColor);
            container.style.setProperty('--timeline-opacity', '1');

        } else {
             container.style.setProperty('--timeline-opacity', '0');
        }
    }, [activeJobIndex, jobs]);

    useLayoutEffect(() => {
        const container = timelineContainerRef.current;
        if (!container) return;

        let animationFrameId: number | null = null;
        
        const handleResize = () => {
            // Debounce with requestAnimationFrame to prevent loops
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = window.requestAnimationFrame(() => {
                calculateLines();
            });
        };
        
        // Initial calculation
        handleResize();

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
            }
        };
    }, [calculateLines]);

    const handleMilestoneClick = (index: number) => {
        setActiveJobIndex(index);
    }

    const selectedJob = jobs[activeJobIndex];

    if (!jobs.length || !selectedJob) {
        return <PageLayout id={id}><div>Loading experience...</div></PageLayout>;
    }
    
    const hasAchievements = selectedJob.achievements && selectedJob.achievements.length > 0;
    const hasImages = selectedJob.images && selectedJob.images.length > 0;
    const selectedJobColor = jobs[activeJobIndex]?.color || 'var(--accent-color)';


    return (
        <PageLayout id={id}>
            <div className="info-card work-experience-info">
                <div className="about-header" style={{ width: '100%' }}>
                    <InfoBadge
                        icon={<Icons.BriefcaseIcon />}
                        text={pageData.title}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>

                <div className="custom-video-player-wrapper work-page-video-player">
                    <div 
                        className="cover-letter-video-container" 
                        title={"Xem video giới thiệu"}
                        onClick={handleVideoClick}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleVideoClick(); }}
                        role="button"
                        tabIndex={0}
                        aria-label="Play introduction video"
                    >
                        <video
                            ref={videoRef}
                            src="https://cdn.scena.ai/project/9626/c13427551694c688b832b49a06aea6542f15c0cc81e740941e025a814bf43920.mp4"
                            playsInline
                            muted
                            className="cover-letter-video-element"
                            poster="https://i.postimg.cc/HsF8trp4/Book-Story.png"
                        >
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                    </div>
                    <button 
                        className="custom-play-button" 
                        onClick={handleVideoClick} 
                        aria-label={"Phát video"}
                    >
                        <Icons.PlayIcon style={{ marginLeft: '2px' }}/>
                    </button>
                </div>

                <div className="timeline-navigation-wrapper no-scrollbar">
                    <div className="timeline-container" ref={timelineContainerRef}>
                        <div id="timeline-segments-container"></div>
                        <div id="timeline-progress-bar"></div>
                        {jobs.map((job, index) => {
                            const isHighlighted = index <= activeJobIndex;
                            const isActive = index === activeJobIndex;
                            return (
                                <div 
                                    key={job.key} 
                                    ref={el => { milestoneRefs.current[index] = el; }}
                                    className={`timeline-milestone ${isActive ? 'active' : ''}`} 
                                    onClick={() => handleMilestoneClick(index)}
                                    style={{ '--color-brand-orange': selectedJobColor } as React.CSSProperties}
                                >
                                    <span className={`year-text ${isActive ? 'active' : ''}`} style={isHighlighted ? { color: selectedJobColor } : {}}>
                                        <Icons.CalendarDaysIcon className="year-icon" />
                                        {job.date.split(' - ')[0]}
                                    </span>
                                    <div className="timeline-dot-container">
                                        <div className="timeline-dot" style={{ borderColor: isHighlighted ? selectedJobColor : undefined }}>
                                            <img src={job.logoUrl} alt={`${job.company} logo`} className="timeline-dot-img" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="job-card" style={{
                        borderColor: selectedJob.color,
                        boxShadow: `0 0 15px ${selectedJob.color}50, 0 0 30px ${selectedJob.color}30`,
                    }}>
                    <div className="job-card-scrollable-content no-scrollbar">
                        <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1.5rem' }}>
                                <img src={selectedJob.logoUrl} alt={`${selectedJob.company} Logo`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'contain', background: 'white', padding: '5px' }} />
                                <div>
                                    <h2 style={{ margin: '0', fontSize: '1.8rem', color: selectedJob.color }}>{selectedJob.company}</h2>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        <Icons.CalendarDaysIcon style={{width: '24px', height: '24px'}} />
                                        <span>{pageData.durationTitle}</span>
                                    </div>
                                    <p style={{ margin: 0 }}>{selectedJob.date}</p>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        <Icons.BriefcaseIcon style={{width: '24px', height: '24px'}} />
                                        <span>{pageData.positionTitle}</span>
                                    </div>
                                    <p style={{ margin: 0 }}>{selectedJob.title}</p>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        <Icons.UsersIcon style={{width: '24px', height: '24px'}} />
                                        <span>{pageData.managedTitle}</span>
                                    </div>
                                    <p style={{ margin: 0 }}>{selectedJob.teamSize}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="job-card-details-grid">
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Icons.DocumentTextIcon />
                                    <span>{pageData.descriptionTitle}</span>
                                </h4>
                                <ul style={{ paddingLeft: '1.25rem', margin: 0, listStyle: 'disc' }}>
                                    {selectedJob.responsibilities.map((item, index) => <li key={index} style={{ marginBottom: '0.5rem' }}>{item}</li>)}
                                </ul>
                            </div>
                            {hasAchievements && (
                                <div>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Icons.TrophyIcon />
                                        <span>{pageData.achievementsTitle}</span>
                                    </h4>
                                    <div className="achievements-grid">
                                        {selectedJob.achievements.map((ach, index) => (
                                            <JobAchievementCard key={index} achievement={ach} color={selectedJob.color} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                         {hasImages && (
                            <div className="job-image-slider-wrapper">
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Icons.PhotoIcon />
                                    <span>{pageData.relatedImagesTitle}</span>
                                </h4>
                                <JobImageSlider images={selectedJob.images!} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isVideoPopupOpen && document.getElementById('popup-root') && createPortal(
                <VideoPopup
                    src="https://cdn.scena.ai/project/9626/c13427551694c688b832b49a06aea6542f15c0cc81e740941e025a814bf43920.mp4"
                    onClose={() => setVideoPopupOpen(false)}
                />,
                document.getElementById('popup-root')!
            )}
        </PageLayout>
    );
};

export default WorkExperiencePage;