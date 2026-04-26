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
                    {/* Render the normal AboutPage; CSS will handle the styling */}
                    <AboutPage />
                </div>
            </div>
        );
    }
    
    // Specific page printing for 'Work Experience'
    if (activePageKey === 'experience') {
        return (
            <div id="printable-content">
                {/* WorkExperiencePage has special rendering logic for print */}
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

    // --- Default CV Generation (for all other pages) ---
    return (
        <div id="printable-content">

            {/* Page 1: Profile Summary, Skills & Domains */}
            <div className="print-page">
                <div className="p-container">
                    <header className="p-header">
                        <h1>{t.sidebar.name}</h1>
                        <h2>{t.sidebar.jobTitle}</h2>
                        <div className="p-contact-info">
                            {contactInfo.map(item => {
                                const Icon = item.key === 'phone' ? Icons.PhoneIcon : 
                                             item.key === 'email' ? Icons.MailIcon : 
                                             item.key === 'website' ? Icons.GlobeAltIcon : 
                                             Icons.MapPinIcon;
                                return (
                                    <div key={item.key} className="p-contact-item">
                                        <Icon style={{width: '13px', height: '13px'}}/>
                                        <span>{item.value}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </header>

                    <section className="p-section">
                        <h3 className="p-section-title">{t.aboutPage.badge}</h3>
                        <p dangerouslySetInnerHTML={{ __html: t.aboutPage.paragraphs[0] }} />
                        <p dangerouslySetInnerHTML={{ __html: t.aboutPage.paragraphs[1] }} />
                    </section>

                    <section className="p-section">
                        <h3 className="p-section-title">{t.skillsPage.title}</h3>
                        <div className="p-grid-2">
                            <div>
                                <h4 style={{fontSize: '10pt', margin: '0 0 0.5rem 0'}}>{t.skillsPage.categories[0].title}</h4>
                                <ul className="p-skill-list">
                                    {professionalSkills.map(s => <li key={s.name}>{s.name}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{fontSize: '10pt', margin: '0 0 0.5rem 0'}}>{t.skillsPage.categories[1].title}</h4>
                                <ul className="p-skill-list">
                                    {softSkills.map(s => <li key={s.name}>{s.name}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>
                    
                     <section className="p-section">
                        <h3 className="p-section-title">{t.servicesPage.badge}</h3>
                        <ul className="p-skill-list">
                            {services.map(s => <li key={s.key}><strong>{s.title}:</strong> {s.description}</li>)}
                        </ul>
                    </section>
                </div>
            </div>

            {/* Page 2 & onwards: Work Experience (will auto-break) */}
            <div className="print-page">
                <div className="p-container">
                    <h3 className="p-section-title" style={{ marginTop: 0 }}>{t.workExperiencePage.title}</h3>
                    {jobs.map(job => (
                        <div key={job.key} className="p-experience-item">
                            <div className="p-experience-header">
                                <h3>{job.company}</h3>
                                <span>{job.date}</span>
                            </div>
                            <em>{job.title}</em>
                            <ul>
                                {job.responsibilities.slice(0, 4).map((r, i) => <li key={i}>{r}</li>)}
                                {job.responsibilities.length > 4 && <li>... và các trách nhiệm khác.</li>}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Page 3: Projects */}
             <div className="print-page">
                 <div className="p-container">
                    <section className="p-section" style={{height: '100%'}}>
                        <h3 className="p-section-title">{t.projectsPage.badge}</h3>
                        <div className="p-grid-2">
                            {projects.map(p => (
                                <div key={p.id} className="p-project-item">
                                    <strong>{p.id}. {p.title}</strong>
                                    <p>{p.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Page 4: Education & Achievements */}
            <div className="print-page">
                <div className="p-container">
                    <div className="p-grid-2" style={{height: '100%'}}>
                        <section className="p-section">
                            <h3 className="p-section-title">{t.educationPage.title}</h3>
                             {education.slice(0, 8).map(e => (
                                <div key={e.title} className="p-education-item">
                                    <div>
                                        <strong>{e.title}</strong><br/>
                                        <em>{e.institution}</em>
                                    </div>
                                    <span>{e.year}</span>
                                </div>
                             ))}
                        </section>
                        <section className="p-section">
                            <h3 className="p-section-title">{t.achievementsPage.badge}</h3>
                             {achievements.map(a => (
                                <div key={a.id} className="p-achievement-item">
                                    <span>{a.title}</span>
                                    <strong style={{color: a.color}}>{a.rate}%</strong>
                                </div>
                             ))}
                        </section>
                    </div>
                </div>
            </div>

            {/* Page 5: Cover Letter */}
            <div className="print-page">
                <div className="p-container p-cover-letter">
                    <h3 className="p-section-title">{t.coverLetterPage.badge}</h3>
                    <p>{t.coverLetterPage.greeting}</p>
                    {t.coverLetterPage.paragraphs.map((p, i) => <p key={i} dangerouslySetInnerHTML={{__html: p.replace(/\n/g, '<br/>')}}/>)}
                     <div className="p-signature">
                        <p>{t.coverLetterPage.closing}</p>
                        {t.coverLetterPage.signatureImage && <img src={t.coverLetterPage.signatureImage} alt="Signature" />}
                        <p>{t.coverLetterPage.signature}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableView;