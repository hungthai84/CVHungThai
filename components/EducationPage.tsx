import React, { useEffect, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

// --- Type definitions ---
interface EducationItem {
    year: string;
    title: string;
    institution: string;
    description: string;
    icon: keyof typeof Icons;
    color?: string;
}

interface EducationPageProps {
    id?: string;
}

// --- Sub-components ---
const EducationCard: React.FC<{ item: EducationItem, index: number }> = ({ item, index }) => {
    const Icon = Icons[item.icon] || Icons.AcademicCapIcon;
    const { t } = useI18n();
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

    const itemColor = item.color || 'var(--accent-color)';
    const yearBgColor = item.color ? `${item.color}1A` : 'rgba(var(--accent-color-rgb), 0.1)';

    return (
        <div 
            ref={cardRef} 
            className="education-card fade-in-up-on-scroll" 
            style={{ 
                '--item-color': itemColor,
                transitionDelay: `${index * 50}ms` 
            } as React.CSSProperties}
        >
            <div className="education-title-wrapper">
                <div className="education-title-left-group">
                    <Icon className="icon" style={{ color: itemColor }} />
                    <h4 className="title" style={{ color: itemColor }}>{item.title}</h4>
                </div>
                <span className="year" style={{ backgroundColor: yearBgColor, color: itemColor }}>
                    {t.educationPage.yearPrefix} {item.year}
                </span>
            </div>
            <p style={{ fontWeight: 600, color: 'var(--color-brand-text-primary)', margin: '0 0 0.5rem 0' }}>{item.institution}</p>
            <p className="description" style={{margin: 0}}>{item.description}</p>
        </div>
    );
};


// --- Main Page Component ---
const EducationPage: React.FC<EducationPageProps> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.educationPage;
    const items: EducationItem[] = (pageData.items as EducationItem[]) || [];

    return (
        <PageLayout id={id}>
            <div className="info-card">
                <div className="about-header">
                    <InfoBadge
                        icon={<Icons.AcademicCapIcon />}
                        text={pageData.title}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>
                <div className="education-grid no-scrollbar">
                    {items.length > 0 ? (
                        items.map((item, index) => (
                           <EducationCard key={index} item={item} index={index} />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-brand-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gridColumn: '1 / -1' }}>
                            <Icons.AcademicCapIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }}/>
                            <p>Dữ liệu về học vấn đang được cập nhật. <br/>Vui lòng quay lại sau.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default EducationPage;