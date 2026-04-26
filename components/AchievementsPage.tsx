import React, { useEffect, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';
import { useTheme } from '../contexts/ThemeContext';

interface Achievement {
    id: string;
    title: string;
    branch: string;
    rate: number;
    category: string;
    hashtag: string;
    icon: keyof typeof Icons;
    color: string;
}

interface AchievementCardProps {
    achievement: Achievement;
    index: number;
    onNavigate?: (key: string) => void;
    setProjectFilter: (filter: string[]) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, index, onNavigate, setProjectFilter }) => {
    const Icon = Icons[achievement.icon] || Icons.TrophyIcon;
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
                observer.unobserve(element);
            }
        };
    }, []);
    
    const handleTagClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click when tag is clicked
        if (setProjectFilter && onNavigate) {
            setProjectFilter([achievement.hashtag]);
            localStorage.setItem('projectsSelectedGroups', '[]');
            localStorage.setItem('projectsSelectedStages', '[]');
            onNavigate('projects');
        }
    };

    const handleCardClick = () => {
        if (onNavigate) {
            onNavigate(`project-${achievement.id}`);
        }
    };


    return (
        <div 
            ref={cardRef}
            className="achievement-card fade-in-up-on-scroll"
            style={{ '--item-color': achievement.color, transitionDelay: `${index * 50}ms` } as React.CSSProperties}
            onClick={handleCardClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
            role="button"
            tabIndex={0}
            aria-label={`View details for project: ${achievement.title}`}
        >
            <div className="achievement-card-main-content">
                <div className="achievement-card-title-group">
                    <Icon />
                    <h4 title={achievement.title}>{achievement.id}. {achievement.title}</h4>
                </div>
                <div className="achievement-card-tags">
                    <button onClick={handleTagClick}>{achievement.hashtag}</button>
                </div>
            </div>
            <div className="achievement-card-rate">
                {achievement.rate}
                <span className="achievement-card-percent-sign">%</span>
            </div>
        </div>
    );
}

interface AchievementsPageProps {
    id?: string;
    onNavigate?: (key: string) => void;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({ id, onNavigate }) => {
    const { t } = useI18n();
    const { setProjectFilter } = useTheme();
    const pageData = t.achievementsPage;
    const achievements: Achievement[] = (pageData as any).achievements || [];

    return (
        <PageLayout id={id}>
            <div className="info-card">
                <div className="about-header">
                    <InfoBadge
                        icon={<Icons.TrophyIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>
                {achievements.length > 0 ? (
                    <div className="achievements-content-container no-scrollbar">
                        <div className="achievement-category-grid">
                            {achievements.map((achievement, index) => (
                                <AchievementCard 
                                    key={achievement.id} 
                                    achievement={achievement} 
                                    index={index} 
                                    onNavigate={onNavigate}
                                    setProjectFilter={setProjectFilter}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-brand-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Icons.TrophyIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }}/>
                        <p>Dữ liệu về thành tựu đang được cập nhật. <br/>Vui lòng quay lại sau.</p>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default AchievementsPage;