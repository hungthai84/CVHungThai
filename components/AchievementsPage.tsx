import React, { useEffect, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

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

interface AchievementsPageProps {
    id?: string;
}

const AchievementCard: React.FC<{ achievement: Achievement, index: number }> = ({ achievement, index }) => {
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

    return (
        <div 
            ref={cardRef}
            className="achievement-card fade-in-up-on-scroll"
            style={{ '--item-color': achievement.color, transitionDelay: `${index * 50}ms` } as React.CSSProperties}
        >
            <div className="achievement-card-rate">
                {achievement.rate}
                <span className="achievement-card-percent-sign">%</span>
            </div>
            <div className="achievement-card-main-content">
                <div className="achievement-card-title-group">
                    <Icon />
                    <h4 title={achievement.title}>{achievement.title}</h4>
                </div>
                <div className="achievement-card-tags">
                    <span>{achievement.hashtag}</span>
                </div>
            </div>
        </div>
    );
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({ id }) => {
    const { t } = useI18n();
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
                    <div className="achievement-category-grid no-scrollbar">
                        {achievements.map((ach, index) => (
                            <AchievementCard 
                                key={ach.id} 
                                achievement={ach} 
                                index={index} 
                            />
                        ))}
                    </div>
                ) : (
                     <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-text-secondary)', textAlign: 'center' }}>
                        <div>
                            <Icons.TrophyIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }}/>
                            <p>Nội dung thành tựu đang được cập nhật. <br/>Vui lòng quay lại sau.</p>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default AchievementsPage;