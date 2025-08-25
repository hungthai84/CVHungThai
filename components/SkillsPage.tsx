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

// --- Helper Functions for Color Manipulation ---
const isValidHex = (hex: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

const hexToHSL = (hex: string): [number, number, number] | null => {
    if (!isValidHex(hex)) return null;
    let H = hex;
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (H.length === 4) {
        r = parseInt("0x" + H[1] + H[1]);
        g = parseInt("0x" + H[2] + H[2]);
        b = parseInt("0x" + H[3] + H[3]);
    } else if (H.length === 7) {
        r = parseInt("0x" + H[1] + H[2]);
        g = parseInt("0x" + H[3] + H[4]);
        b = parseInt("0x" + H[5] + H[6]);
    }
    // Then convert RGB to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l];
};

const hslToHex = (h: number, s: number, l: number): string => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
    else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
    else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
    else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }
    
    const toHex = (val: number) => {
        const hex = Math.round(val * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r + m)}${toHex(g + m)}${toHex(b + m)}`;
};


// --- Sub-components ---
const SkillItem: React.FC<{ skill: Skill; color: string }> = ({ skill, color }) => {
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
        <div ref={itemRef} className="skill-item-v2 fade-in-up-on-scroll">
            <div className="skill-info">
                <h4 style={{ color }}>{skill.name}</h4>
                <span style={{ color }}>{skill.level}%</span>
            </div>
            <div className="progress-bar-bg">
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `0%`, // Initial state
                        '--level': `${skill.level}%`, // CSS variable for animation
                        backgroundColor: color,
                    } as React.CSSProperties}
                />
            </div>
        </div>
    );
};


// --- Main Page Component ---
const SkillsPage: React.FC<SkillsPageProps> = ({ id }) => {
    const { t } = useI18n();
    const { themeColor } = useTheme();
    const pageData = t.skillsPage;
    const categories: SkillCategory[] = (pageData.categories as SkillCategory[]) || [];

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
                        categories.map((category) => {
                            const baseCategoryColor = category.color || themeColor;
                            const baseHsl = hexToHSL(baseCategoryColor);

                            return (
                                <div key={category.key} className="resume-item-card">
                                    <h3 className="category-title" style={{ color: baseCategoryColor }}>{category.title}</h3>
                                    <div className="skills-grid-v2">
                                        {category.skills.map((skill, skillIndex) => {
                                            let skillColor = baseCategoryColor;
                                            // Generate a unique color for each skill bar by shifting the hue
                                            if (baseHsl) {
                                                const [h, s, l] = baseHsl;
                                                // Shift hue to create analogous colors
                                                const newHue = (h + skillIndex * 15) % 360;
                                                // Adjust saturation and lightness for better aesthetics
                                                const newSaturation = Math.max(50, s - 5);
                                                const newLightness = Math.min(65, l + 5);
                                                skillColor = hslToHex(newHue, newSaturation, newLightness);
                                            }
                                            return <SkillItem key={skillIndex} skill={skill} color={skillColor} />;
                                        })}
                                    </div>
                                </div>
                            );
                        })
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