import React, { useEffect, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import CardTitle from './CardTitle';

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
    const [isFlipped, setIsFlipped] = React.useState(false);
    
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
            className={`education-card fade-in-up-on-scroll ${isFlipped ? 'is-flipped' : ''}`}
            style={{ 
                '--item-color': itemColor,
                transitionDelay: `${index * 50}ms`,
                height: '110px',
                minHeight: '110px'
            } as React.CSSProperties}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className="education-card-inner">
                <div className="education-card-front" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '110px' }}>
                    {/* Dòng 1: Năm 2024 & Icon & Thiết kế hệ thống Webspages */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', marginBottom: '0.5rem' }}>
                        <span className="year" style={{ backgroundColor: yearBgColor, color: itemColor, fontSize: '0.75rem', padding: '0.3rem 0.5rem', borderRadius: '6px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {t.educationPage.yearPrefix} {item.year}
                        </span>
                        <Icon className="icon" style={{ color: itemColor, flexShrink: 0, width: '18px', height: '18px' }} />
                        <h4 style={{ color: itemColor, margin: 0, fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.3, textAlign: 'left', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.title}>
                            {item.title}
                        </h4>
                    </div>
                    {/* Dòng 2: Tự học và phát triển */}
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                        <p style={{ fontWeight: 600, color: 'var(--color-brand-text-primary)', margin: 0, fontSize: '0.85rem', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {item.institution}
                        </p>
                    </div>
                </div>
                <div className="education-card-back" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p className="description" style={{margin: 0, fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--color-brand-text-secondary)', textAlign: 'left'}}>{item.description}</p>
                </div>
            </div>
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
            <div className="info-card" >
                <CardTitle
                    icon={<Icons.AcademicCapIcon />}
                    text={pageData.title}
                    tooltipTitle={pageData.tooltipTitle}
                    tooltipText={pageData.tooltipText}
                    style={{ marginBottom: '1.5rem' }}
                />
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