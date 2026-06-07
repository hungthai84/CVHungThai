import React from 'react';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { AboutPage } from './AboutPage';
import WorkExperiencePage from './WorkExperiencePage';

interface PrintableViewProps {
    activePageKey?: string;
}

const PrintableView: React.FC<PrintableViewProps> = ({ activePageKey }) => {
    const { t } = useI18n();

    // Specific page printing for 'About Me'
    if (activePageKey === 'about') {
        return (
            <div id="printable-content">
                <div className="print-page">
                    <AboutPage />
                </div>
            </div>
        );
    }
    
    // Specific page printing for 'Work Experience'
    if (activePageKey === 'experience') {
        return (
            <div id="printable-content">
                <WorkExperiencePage isForPrint={true} />
            </div>
        );
    }

    // --- Data Extraction for the default multi-page resume ---
    const contactInfo = t.aboutPage.infoItems.filter(item => 
        ['phone', 'email', 'website', 'tempResidence'].includes(item.key)
    );
    const professionalSkills = t.skillsPage.categories.find(c => c.key === 'professional')?.skills || [];
    const softSkills = t.skillsPage.categories.find(c => c.key === 'soft')?.skills || [];
    const jobs = t.workExperiencePage.jobs.filter(job => job.key !== 'jobsearch');
    const projects = t.projectsPage.projects;
    const education = t.educationPage.items;
    const achievements = t.achievementsPage.achievements;
    const services = t.servicesPage.services;

    // Custom name parser for the aesthetic first/last name styling
    const formatName = (fullName: string) => {
        const parts = fullName.trim().split(/\s+/);
        if (parts.length <= 1) return { first: '', last: fullName };
        const last = parts[parts.length - 1];
        const first = parts.slice(0, parts.length - 1).join(' ');
        return { first, last };
    };
    const { first, last } = formatName(t.sidebar.name);

    // Language state
    const isVi = t.aboutPage.badge === "Giới thiệu";
    const refTitle = isVi ? "THAM CHIẾU" : "REFERENCES";
    const stratTitle = isVi ? "CHIẾN LƯỢC & QL" : "STRATEGY & MGMT";
    const operTitle = isVi ? "VẬN HÀNH CX" : "CS OPERATIONS";
    const techTitle = isVi ? "CÔNG NGHỆ & DATA" : "CS TECH & DATA";

    // References mapping
    const refItem1 = {
        name: "LISA TURNER",
        title: isVi ? "Giám đốc CS, Tập đoàn TBG Inc." : "CS Director, TBG Inc.",
        contact: "lisa.turner@tbg.com"
    };
    const refItem2 = {
        name: "ANTON BENA",
        title: isVi ? "Giám đốc Công nghệ, Innovatech" : "Chief Technology Officer, Innovatech",
        contact: "a.bena@innovatech.com"
    };

    // Helper for rendering horizontal dots level metrics
    const renderDots = (level: number) => {
        const dotsCount = Math.round(level / 20); // 0-100% mapped to 0-5 dots
        return (
            <div className="p-foot-metric-dots">
                {[...Array(5)].map((_, idx) => (
                    <span 
                        key={idx} 
                        className={`p-foot-metric-dot ${idx < dotsCount ? 'filled' : 'empty'}`}
                    ></span>
                ))}
            </div>
        );
    };

    // Filter achievements for dots columns
    const stratAchievements = achievements.filter(a => a.id.startsWith("1.")).slice(0, 3);
    const operAchievements = achievements.filter(a => a.id.startsWith("2.")).slice(0, 3);
    const techAchievements = achievements.filter(a => a.id.startsWith("3.")).slice(0, 3);

    return (
        <div id="printable-content">

            {/* PAGE 1: Hồ sơ tuyển dụng Premium (Header, Skills, Education, Work Experience 1, References & Metrics) */}
            <div className="print-page">
                <div className="p-container">
                    
                    {/* Header Block with absolute background decorative strip */}
                    <div className="p-header-new-grid">
                        <div className="p-header-decor-sidebar">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '70px', pointerEvents: 'none' }}>
                                <polygon points="0,100 0,60 40,100" fill="#f1b512" />
                                <polygon points="0,100 0,80 20,100" fill="#2d3748" />
                            </svg>
                        </div>
                        
                        <div className="p-header-main-content">
                            <div className="p-header-name-section">
                                <div className="p-name-row">
                                    <span className="p-yellow-slash">/</span>
                                    <span className="p-first-name">{first}</span>
                                </div>
                                <h1 className="p-last-name">{last}</h1>
                                
                                <div className="p-job-title-block">
                                    <div className="p-job-title-bar"></div>
                                    <span className="p-job-title-text">{t.sidebar.jobTitle}</span>
                                </div>
                            </div>
                            
                            <div className="p-header-contact-section">
                                <div className="p-contact-list-new">
                                    {contactInfo.map(item => {
                                        const label = item.key === 'phone' ? 'P' : 
                                                      item.key === 'email' ? 'E' : 
                                                      item.key === 'website' ? 'S' : 'A';
                                        return (
                                            <div key={item.key} className="p-contact-row-new">
                                                <span className="p-contact-label-new">{label}:</span>
                                                <span className="p-contact-value-new">{item.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About me Summary */}
                    <div className="p-summary-paragraph-new">
                        <span dangerouslySetInnerHTML={{ __html: t.aboutPage.paragraphs[0] }} />
                    </div>

                    {/* Main Columns layout Grid */}
                    <div className="p-main-grid-new">
                        
                        {/* LEFT COLUMN: Skills & Education */}
                        <div className="p-left-column">
                            <h3 className="p-section-heading-new">{t.skillsPage.title}</h3>
                            
                            <h4 className="p-skills-subheading-new">// {t.skillsPage.categories[0].title}</h4>
                            <ul className="p-skills-ul-new">
                                {professionalSkills.slice(0, 5).map(s => <li key={s.name}>{s.name}</li>)}
                            </ul>

                            <h4 className="p-skills-subheading-new">// {t.skillsPage.categories[1].title}</h4>
                            <ul className="p-skills-ul-new">
                                {softSkills.slice(0, 5).map(s => <li key={s.name}>{s.name}</li>)}
                            </ul>

                            <h3 className="p-section-heading-new" style={{ marginTop: '1.2rem' }}>{t.educationPage.title}</h3>
                            {education.slice(0, 2).map(e => (
                                <div key={e.title} className="p-edu-item-new">
                                    <div className="p-edu-degree-new">{e.title}</div>
                                    <div className="p-edu-institution-new">{e.institution}</div>
                                    <div className="p-edu-year-new">{e.year}</div>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT COLUMN: Work Experience Timeline */}
                        <div className="p-right-column">
                            <h3 className="p-section-heading-new">{t.workExperiencePage.title}</h3>
                            
                            <div className="p-timeline-container-new">
                                {jobs.slice(0, 2).map(job => (
                                    <div key={job.key} className="p-exp-item-new">
                                        <div className="p-timeline-dot-new"></div>
                                        <h4 className="p-exp-title-new">{job.title}</h4>
                                        <div className="p-exp-meta-new">
                                            <span>{job.company}</span>
                                            <span>|</span>
                                            <span>{job.date}</span>
                                        </div>
                                        <p className="p-exp-summary-new">{job.responsibilities[0]}</p>
                                        <ul className="p-exp-bullets-new">
                                            {job.responsibilities.slice(1, 4).map((r, i) => (
                                                <li key={i}>{r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Footer Row: 4 Columns containing References & Skill rating dots */}
                    <div className="p-footer-row-new">
                        
                        {/* References Col */}
                        <div className="p-foot-col">
                            <h4 className="p-footer-heading-new">{refTitle}</h4>
                            <div className="p-foot-ref-item">
                                <span className="p-foot-ref-name">{refItem1.name}</span>
                                <span className="p-foot-ref-title">{refItem1.title}</span>
                                <span className="p-foot-ref-contact">{refItem1.contact}</span>
                            </div>
                            <div className="p-foot-ref-item" style={{ marginTop: '0.4rem' }}>
                                <span className="p-foot-ref-name">{refItem2.name}</span>
                                <span className="p-foot-ref-title">{refItem2.title}</span>
                                <span className="p-foot-ref-contact">{refItem2.contact}</span>
                            </div>
                        </div>

                        {/* Metric dots col 1: Strategy */}
                        <div className="p-foot-col">
                            <h4 className="p-footer-heading-new">{stratTitle}</h4>
                            {stratAchievements.map(a => (
                                <div key={a.id} className="p-foot-metric-row">
                                    <span className="p-foot-metric-name" title={a.title}>{a.title}</span>
                                    {renderDots(a.rate)}
                                </div>
                            ))}
                        </div>

                        {/* Metric dots col 2: Operations */}
                        <div className="p-foot-col">
                            <h4 className="p-footer-heading-new">{operTitle}</h4>
                            {operAchievements.map(a => (
                                <div key={a.id} className="p-foot-metric-row">
                                    <span className="p-foot-metric-name" title={a.title}>{a.title}</span>
                                    {renderDots(a.rate)}
                                </div>
                            ))}
                        </div>

                        {/* Metric dots col 3: Data & Tech */}
                        <div className="p-foot-col">
                            <h4 className="p-footer-heading-new">{techTitle}</h4>
                            {techAchievements.map(a => (
                                <div key={a.id} className="p-foot-metric-row">
                                    <span className="p-foot-metric-name" title={a.title}>{a.title}</span>
                                    {renderDots(a.rate)}
                                </div>
                            ))}
                        </div>

                    </div>

                </div>
            </div>

            {/* PAGE 2: Experience Continued, Projects & Services */}
            <div className="print-page">
                <div className="p-container">
                    
                    {/* Consistent branding compact header */}
                    <div className="p-header-new-grid" style={{ minHeight: '3.0cm', marginBottom: '0.4cm' }}>
                        <div className="p-header-decor-sidebar" style={{ height: '4.5cm' }}>
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40px', pointerEvents: 'none' }}>
                                <polygon points="0,100 0,60 40,100" fill="#f1b512" />
                            </svg>
                        </div>
                        <div className="p-header-main-content">
                            <div>
                                <div className="p-name-row" style={{ marginTop: '0.1cm' }}>
                                    <span className="p-yellow-slash" style={{ fontSize: '1.6rem' }}>/</span>
                                    <span className="p-first-name" style={{ fontSize: '1.6rem' }}>{first}</span>
                                    <span className="p-last-name" style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, marginLeft: '0.3rem' }}>{last}</span>
                                </div>
                                <div className="p-job-title-block" style={{ marginTop: '0.2rem' }}>
                                    <div className="p-job-title-bar" style={{ height: '0.8rem' }}></div>
                                    <span style={{ fontSize: '7.5pt', letterSpacing: '0.1em', fontWeight: 600, color: '#555' }}>
                                        {t.sidebar.jobTitle}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-main-grid-new" style={{ flex: 1 }}>
                        
                        {/* Left column: Services */}
                        <div className="p-left-column">
                            <h3 className="p-section-heading-new">{t.servicesPage.badge}</h3>
                            {services.slice(0, 4).map(s => (
                                <div key={s.key} className="p-edu-item-new">
                                    <div className="p-edu-degree-new" style={{ fontSize: '8.5pt' }}>{s.title}</div>
                                    <div style={{ fontSize: '8pt', color: '#555', marginTop: '0.1rem', lineHeight: 1.35 }}>{s.description}</div>
                                </div>
                            ))}
                        </div>

                        {/* Right column: Subsequent Jobs & Projects */}
                        <div className="p-right-column">
                            {jobs.length > 2 && (
                                <>
                                    <h3 className="p-section-heading-new">{t.workExperiencePage.title} (Continued)</h3>
                                    <div className="p-timeline-container-new" style={{ marginBottom: '1.2rem' }}>
                                        {jobs.slice(2).map(job => (
                                            <div key={job.key} className="p-exp-item-new">
                                                <div className="p-timeline-dot-new"></div>
                                                <h4 className="p-exp-title-new">{job.title}</h4>
                                                <div className="p-exp-meta-new">
                                                    <span>{job.company}</span>
                                                    <span>|</span>
                                                    <span>{job.date}</span>
                                                </div>
                                                <p className="p-exp-summary-new">{job.responsibilities[0]}</p>
                                                <ul className="p-exp-bullets-new">
                                                    {job.responsibilities.slice(1, 3).map((r, i) => (
                                                        <li key={i}>{r}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <h3 className="p-section-heading-new">{t.projectsPage.badge}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4cm' }}>
                                {projects.slice(0, 4).map(p => (
                                    <div key={p.id} style={{ marginBottom: '0.3rem' }}>
                                        <div className="p-edu-degree-new" style={{ fontSize: '8.5pt' }}>{p.title}</div>
                                        <div style={{ fontSize: '8pt', color: '#555', marginTop: '0.1rem', lineHeight: 1.35 }}>
                                            {p.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* PAGE 3: Thư ứng tuyển (Cover Letter) */}
            <div className="print-page">
                <div className="p-container p-cover-letter">
                    
                    {/* Consistent branding compact header for letter */}
                    <div className="p-header-new-grid" style={{ minHeight: '3.0cm', marginBottom: '0.8cm' }}>
                        <div className="p-header-decor-sidebar" style={{ height: '4.5cm' }}>
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40px', pointerEvents: 'none' }}>
                                <polygon points="0,100 0,60 40,100" fill="#f1b512" />
                            </svg>
                        </div>
                        <div className="p-header-main-content">
                            <div>
                                <div className="p-name-row" style={{ marginTop: '0.1cm' }}>
                                    <span className="p-yellow-slash" style={{ fontSize: '1.6rem' }}>/</span>
                                    <span className="p-first-name" style={{ fontSize: '1.6rem' }}>{first}</span>
                                    <span className="p-last-name" style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, marginLeft: '0.3rem' }}>{last}</span>
                                </div>
                                <div className="p-job-title-block" style={{ marginTop: '0.2rem' }}>
                                    <div className="p-job-title-bar" style={{ height: '0.8rem' }}></div>
                                    <span style={{ fontSize: '7.5pt', letterSpacing: '0.1em', fontWeight: 600, color: '#555' }}>
                                        {t.sidebar.jobTitle}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ paddingLeft: '1.0cm', paddingRight: '1.0cm', flex: 1, marginTop: '0.5cm' }}>
                        <h3 className="p-section-heading-new" style={{ fontSize: '12pt', marginBottom: '1.0rem' }}>
                            {t.coverLetterPage.badge}
                        </h3>
                        
                        <p style={{ fontWeight: 650, marginBottom: '1.2rem' }}>{t.coverLetterPage.greeting}</p>
                        
                        {t.coverLetterPage.paragraphs.map((para, i) => (
                            <p key={i} dangerouslySetInnerHTML={{ __html: para.replace(/\n/g, '<br/>') }} />
                        ))}
                        
                        <div className="p-signature" style={{ marginTop: '1.5cm' }}>
                            <p style={{ marginBottom: '1.0rem' }}>{t.coverLetterPage.closing}</p>
                            {t.coverLetterPage.signatureImage && (
                                <img 
                                    src={t.coverLetterPage.signatureImage} 
                                    alt="Client Signature" 
                                    style={{ display: 'inline-block', maxWidth: '120px', mixBlendMode: 'multiply' }} 
                                />
                            )}
                            <p style={{ fontWeight: 650, marginTop: '0.5rem', fontSize: '10pt', color: '#111' }}>
                                {t.coverLetterPage.signature}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default PrintableView;
