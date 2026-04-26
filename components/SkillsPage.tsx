import React, { useEffect, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';
import { useTheme } from '../contexts/ThemeContext';

// --- Type definitions ---
interface Skill {
    name: string;
    level: number;
}

interface SkillCategory {
    key: string;
    title: string;
    skills: Skill[];
    color?: string;
}

interface SkillsPageProps {
    id?: string;
}

// --- Sub-components ---
const SkillItem: React.FC<{ skill: Skill; color: string; index: number }> = ({ skill, color, index }) => {
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = itemRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    element.classList.add('is-visible');
                    observer.unobserve(element); // Animate only once
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
            ref={itemRef} 
            className="skill-item-v2 fade-in-up-on-scroll"
            style={{ transitionDelay: `${index * 50}ms` }}
        >
            <div className="skill-info">
                <h4>{skill.name}</h4>
                <span>{skill.level}%</span>
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar-bg">
                    <div
                        className="progress-bar-fill"
                        style={{
                            '--level': `${skill.level}%`,
                            backgroundColor: color,
                        } as React.CSSProperties}
                    />
                </div>
            </div>
        </div>
    );
};


// --- Main Page Component ---
const SkillsPage: React.FC<SkillsPageProps> = ({ id }) => {
    const { t } = useI18n();
    const { themeMode, lightThemeColor, darkThemeColor } = useTheme();
    const pageData = t.skillsPage;
    const categories: SkillCategory[] = (pageData.categories as SkillCategory[]) || [];

    // Palette inspired by the user's image
    const colorPalette = [
        '#f78aab', // pink
        '#9d94ff', // purple
        '#ffb780', // orange
        '#80dfff', // cyan
        '#82e0aa', // green
        '#fddb7e'  // yellow
    ];

    const themeColor = themeMode === 'light' ? lightThemeColor : darkThemeColor;
    let globalSkillIndex = 0;

    return (
        <PageLayout id={id}>
            <div className="info-card">
                <div className="about-header">
                    <InfoBadge
                        icon={<Icons.WrenchScrewdriverIcon />}
                        text={pageData.title}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>
                <div className="skills-categories-wrapper no-scrollbar">
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <div key={category.key} className="resume-item-card">
                                <h3 className="category-title" style={{ color: category.color || themeColor }}>{category.title}</h3>
                                <div className="skills-grid-v2">
                                    {category.skills.map((skill, skillIndex) => {
                                        const currentIndex = globalSkillIndex;
                                        const skillColor = colorPalette[currentIndex % colorPalette.length];
                                        globalSkillIndex++;
                                        return <SkillItem key={skillIndex} skill={skill} color={skillColor} index={skillIndex} />;
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-brand-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Icons.WrenchScrewdriverIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }}/>
                            <p>Dữ liệu về kỹ năng đang được cập nhật. <br/>Vui lòng quay lại sau.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};

export default SkillsPage;