import React from 'react';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';

interface PrintableViewProps {
    activePageKey?: string;
}

const PrintableView: React.FC<PrintableViewProps> = () => {
    const { t } = useI18n();

    // Ensure we retrieve consistent strings regardless of active page
    const contactInfo = t.aboutPage.infoItems;
    const professionalSkills = t.skillsPage.categories.find(c => c.key === 'professional')?.skills || [];
    const softSkills = t.skillsPage.categories.find(c => c.key === 'soft')?.skills || [];
    const allJobs = t.workExperiencePage.jobs.filter(job => job.key !== 'jobsearch');
    const projects = t.projectsPage.projects;
    const education = t.educationPage.items;
    const achievements = t.achievementsPage.achievements;
    const services = t.servicesPage.services;

    // Contact mapping helpers
    const phone = contactInfo.find(info => info.key === 'phone')?.value || '+84 0909097882';
    const email = contactInfo.find(info => info.key === 'email')?.value || 'hungthai84@gmail.com';
    const website = contactInfo.find(info => info.key === 'website')?.value || 'nguyenhungthai.powerservice.one';
    const residence = contactInfo.find(info => info.key === 'tempResidence')?.value || 'Q7, Hồ Chí Minh';
    const zalo = contactInfo.find(info => info.key === 'zalo')?.value || '0909097882';

    return (
        <div id="printable-content" className="cv-mode">

            {/* PAGE 1: Profile Summary, Contact Side Panel, Skills, and Recent Top-Tier Careers */}
            <div className="print-page">
                <header className="p-header" style={{ borderBottom: '2px solid rgba(var(--text-color-rgb), 0.15)', paddingBottom: '0.8rem', marginBottom: '1.2rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 style={{ fontSize: '22pt', fontWeight: 800, color: '#101733', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
                                {t.sidebar.name}
                            </h1>
                            <h2 style={{ fontSize: '13pt', fontWeight: 600, color: '#f97316', margin: '0.2rem 0 0 0', textTransform: 'uppercase' }}>
                                {t.sidebar.jobTitle}
                            </h2>
                        </div>
                        {/* Compact Contact block right side */}
                        <div style={{ textAlign: 'right', fontSize: '8.5pt', lineHeight: 1.4, color: '#4b5563' }}>
                            <div><strong>ĐT:</strong> {phone} | <strong>Zalo:</strong> {zalo}</div>
                            <div><strong>Email:</strong> {email}</div>
                            <div><strong>Địa chỉ:</strong> {residence}</div>
                            <div><strong>Web:</strong> {website}</div>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '1.5rem', height: '100%' }}>
                    {/* Main Main columns: Summary and top recent jobs */}
                    <div>
                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.aboutPage.badge}
                            </h3>
                            <p style={{ margin: '0 0 0.4rem 0', fontSize: '8.5pt', textAlign: 'justify', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: t.aboutPage.paragraphs[0] }} />
                            <p style={{ margin: 0, fontSize: '8.5pt', textAlign: 'justify', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: t.aboutPage.paragraphs[1] }} />
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.6rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.workExperiencePage.title} (Giai đoạn gần đây)
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {allJobs.slice(0, 4).map(job => (
                                    <div key={job.key} className="p-experience-item" style={{ marginBottom: 0 }}>
                                        <div className="p-experience-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <h4 style={{ fontSize: '9.5pt', fontWeight: 700, margin: 0, color: '#101733' }}>{job.company}</h4>
                                            <span style={{ fontSize: '8pt', color: '#6b7280', fontWeight: 600 }}>{job.date}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: '#4b5563', fontStyle: 'italic', margin: '0.1rem 0' }}>
                                            <span>{job.title}</span>
                                            {job.teamSize && <span>Quy mô: {job.teamSize}</span>}
                                        </div>
                                        <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.1rem', fontSize: '8pt', color: '#374151', listStyleType: 'square' }}>
                                            {job.responsibilities.slice(0, 4).map((res, idx) => (
                                                <li key={idx} style={{ marginBottom: '0.15rem' }}>{res}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar section */}
                    <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '1.2rem' }}>
                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                THÔNG TIN CÁ NHÂN
                            </h3>
                            <table style={{ width: '100%', fontSize: '8.5pt', borderCollapse: 'collapse', color: '#374151', lineHeight: '1.6' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: '#4b5563', padding: '1px 0' }}>Sinh nhật:</td>
                                        <td style={{ textAlign: 'right' }}>22/06/1984</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: '#4b5563', padding: '1px 0' }}>Giới tính:</td>
                                        <td style={{ textAlign: 'right' }}>Nam giới</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: '#4b5563', padding: '1px 0' }}>Tình trạng:</td>
                                        <td style={{ textAlign: 'right' }}>Độc thân</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: '#4b5563', padding: '1px 0' }}>Cư trú:</td>
                                        <td style={{ textAlign: 'right' }}>Hồ Chí Minh</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.skillsPage.title}
                            </h3>
                            <div style={{ marginBottom: '0.6rem' }}>
                                <h4 style={{ fontSize: '8pt', fontWeight: 700, margin: '0 0 0.3rem 0', color: '#4b5563' }}>KỸ NĂNG CHUYÊN MÔN</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    {professionalSkills.map(skill => (
                                        <span key={skill.name} style={{ backgroundColor: '#f3f4f6', color: '#1f2937', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '7.5pt', border: '1px solid #e5e7eb', fontWeight: 500 }}>
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '8pt', fontWeight: 700, margin: '0 0 0.3rem 0', color: '#4b5563' }}>KỸ NĂNG MỀM</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    {softSkills.map(skill => (
                                        <span key={skill.name} style={{ backgroundColor: '#fff7ed', color: '#c2410c', padding: '0.15rem 0.4rem', borderRadius: '3px', fontSize: '7.5pt', border: '1px solid #ffedd5', fontWeight: 500 }}>
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.educationPage.title}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {education.slice(0, 3).map((edu, index) => (
                                    <div key={index} style={{ fontSize: '8pt', lineHeight: 1.3 }}>
                                        <strong style={{ display: 'block', color: '#101733' }}>{edu.title}</strong>
                                        <span style={{ color: '#4b5563' }}>{edu.institution}</span>
                                        <span style={{ color: '#9ca3af', display: 'block', fontSize: '7.5pt' }}>Năm tốt nghiệp: {edu.year}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* PAGE 2: Advanced Experience History, Projects, Services, KPI Indicators, and Cover Seal */}
            <div className="print-page">
                <header className="p-header" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.4rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '9pt', fontWeight: 800, color: '#101733', textTransform: 'uppercase' }}>{t.sidebar.name}</span>
                    <span style={{ fontSize: '8pt', color: '#9ca3af' }}>Hồ sơ ứng tuyển chuyên nghiệp (Trang 2)</span>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '1.5rem', height: '100%' }}>
                    <div>
                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.6rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                LỊCH SỬ KINH NGHIỆM ĐỒNG HÀNH
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {allJobs.slice(4).map(job => (
                                    <div key={job.key} className="p-experience-item" style={{ marginBottom: 0 }}>
                                        <div className="p-experience-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <h4 style={{ fontSize: '9.5pt', fontWeight: 700, margin: 0, color: '#101733' }}>{job.company}</h4>
                                            <span style={{ fontSize: '8pt', color: '#6b7280', fontWeight: 600 }}>{job.date}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8.5pt', color: '#4b5563', fontStyle: 'italic', margin: '0.1rem 0' }}>
                                            <span>{job.title}</span>
                                        </div>
                                        <ul style={{ margin: '0.2rem 0 0 0', paddingLeft: '1.1rem', fontSize: '8pt', color: '#374151', listStyleType: 'square' }}>
                                            {job.responsibilities.slice(0, 3).map((res, idx) => (
                                                <li key={idx} style={{ marginBottom: '0.1rem' }}>{res}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.projectsPage.badge} (Dự án tiêu biểu)
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {(() => {
                                    const featuredIds = ['5.1', '6.1', '1.1'];
                                    const featuredProjects = projects.filter(p => featuredIds.includes(p.id))
                                        .sort((a, b) => featuredIds.indexOf(a.id) - featuredIds.indexOf(b.id));
                                    const displayedProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3);
                                    
                                    return displayedProjects.map(proj => (
                                        <div key={proj.id} style={{ fontSize: '8pt', lineHeight: 1.3 }}>
                                            <strong style={{ color: '#101733' }}>{proj.title}</strong>
                                            <p style={{ margin: '0.1rem 0 0 0', color: '#4b5563', textAlign: 'justify' }}>{proj.description}</p>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </section>
                    </div>

                    <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '1.2rem' }}>
                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.achievementsPage.badge} (KPI & CHỈ SỐ)
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {achievements.slice(0, 5).map(ach => (
                                    <div key={ach.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '8pt', padding: '0.25rem 0', borderBottom: '1px dashed #e5e7eb' }}>
                                        <span style={{ color: '#4b5563' }}>{ach.title}</span>
                                        <strong style={{ color: ach.color || '#f97316', fontWeight: 700 }}>{ach.rate}%</strong>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.servicesPage.badge}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {services.slice(0, 3).map(srv => (
                                    <div key={srv.key} style={{ fontSize: '8pt', lineHeight: 1.3 }}>
                                        <strong style={{ color: '#101733', display: 'block' }}>{srv.title}</strong>
                                        <span style={{ color: '#6b7280', fontSize: '7.5pt' }}>{srv.description}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                TRIẾT LÝ HÀNH ĐỘNG
                            </h3>
                            <div style={{ backgroundColor: '#f9fafb', borderLeft: '3px solid #f97316', padding: '0.5rem', borderRadius: '0 4px 4px 0' }}>
                                <blockquote style={{ margin: 0, fontSize: '7.5pt', fontStyle: 'italic', color: '#4b5563', lineHeight: 1.4 }}>
                                    "{t.aboutPage.concludingParagraph.replace(/<strong>/g, '').replace(/<\/strong>/g, '')}"
                                </blockquote>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableView;
