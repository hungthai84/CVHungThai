import React from 'react';
import { useI18n } from '../contexts/i18n';

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
    const phone = contactInfo.find(info => info.key === 'phoneZalo')?.value || '+84 0909097882';
    const email = contactInfo.find(info => info.key === 'email')?.value || 'hungthai84@gmail.com';
    const website = contactInfo.find(info => info.key === 'website')?.value || 'www.nguyenhungthai.powerservice.one';
    const tempResidence = contactInfo.find(info => info.key === 'tempResidence')?.value || 'Q7, Hồ Chí Minh';
    const permResidence = contactInfo.find(info => info.key === 'permResidence')?.value || 'Mỹ Tho, Tiền Giang';

    return (
        <div id="printable-content" className="cv-mode">

            {/* PAGE 1: Profile Summary, Contact Side Panel, Skills, and Recent Top-Tier Careers */}
            <div className="print-page">
                <header className="p-header" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.4rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '9pt', fontWeight: 800, color: '#101733', textTransform: 'uppercase' }}>{t.sidebar.name}</span>
                    <span style={{ fontSize: '8pt', color: '#9ca3af' }}>Hồ sơ ứng tuyển chuyên nghiệp (Trang 1)</span>
                </header>

                <div style={{ marginBottom: '1.5rem', textAlign: 'center', backgroundColor: '#fff7ed', padding: '0.6rem', borderRadius: '6px', border: '1px solid #ffedd5' }}>
                    <p style={{ margin: 0, fontSize: '9pt', color: '#c2410c', fontWeight: 600 }}>
                        Hãy truy cập Website để xem thông tin và click vào sẽ vào trang website: <a href="https://www.nguyenhungthai.powerservice.one/" target="_blank" rel="noopener noreferrer" style={{ color: '#ea580c', textDecoration: 'underline' }}>https://www.nguyenhungthai.powerservice.one/</a>
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '1.5rem', flex: 1 }}>
                    {/* Main Main columns: Summary and top recent jobs */}
                    <div>
                        <section className="p-section">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <img src="https://i.ibb.co/7tnk3NTY/H-ng-Th-i-Avata-Gif.gif" alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                                <div>
                                    <h3 className="p-section-title" style={{ fontSize: '12pt', color: '#101733', margin: 0, paddingBottom: '0.2rem', textTransform: 'uppercase', fontWeight: 800 }}>
                                        {t.aboutPage.badge}
                                    </h3>
                                    <h2 style={{ fontSize: '10pt', fontWeight: 600, color: '#f97316', margin: '0' }}>
                                        {t.sidebar.jobTitle}
                                    </h2>
                                </div>
                            </div>
                            <p style={{ margin: '0 0 0.4rem 0', fontSize: '8.5pt', textAlign: 'justify', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: t.aboutPage.paragraphs[0] }} />
                            <p style={{ margin: '0 0 1rem 0', fontSize: '8.5pt', textAlign: 'justify', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: t.aboutPage.paragraphs[1] }} />
                            
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                TRIẾT LÝ HÀNH ĐỘNG
                            </h3>
                            <div style={{ backgroundColor: '#f9fafb', borderLeft: '3px solid #f97316', padding: '0.5rem', borderRadius: '0 4px 4px 0' }}>
                                <blockquote style={{ margin: 0, fontSize: '7.5pt', fontStyle: 'italic', color: '#4b5563', lineHeight: 1.4 }}>
                                    "{t.aboutPage.concludingParagraph.replace(/<strong>/g, '').replace(/<\/strong>/g, '')}"
                                </blockquote>
                            </div>
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '1rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.workExperiencePage.title} (Giai đoạn gần đây)
                            </h3>
                            <div style={{ position: 'relative', borderLeft: '2px solid #e5e7eb', marginLeft: '4.5rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {allJobs.slice(0, 4).map(job => (
                                    <div key={job.key} className="p-experience-item" style={{ marginBottom: 0, position: 'relative' }}>
                                        {/* Timeline Dot */}
                                        <div style={{ position: 'absolute', left: '-1.55rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316', border: '2px solid #fff' }}></div>
                                        
                                        <div style={{ position: 'absolute', left: '-5.7rem', top: '0', width: '4rem', fontSize: '8pt', color: '#f97316', fontWeight: 700, textAlign: 'right', lineHeight: '1.3' }}>
                                            {job.date.includes('-') ? (
                                                <>
                                                    <div>{job.date.split('-')[0].trim()} -</div>
                                                    <div>{job.date.split('-')[1]?.trim()}</div>
                                                </>
                                            ) : (
                                                job.date
                                            )}
                                        </div>

                                        <div className="p-experience-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {job.logoUrl && <img src={job.logoUrl} alt={job.company} style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #e5e7eb', padding: '2px' }} />}
                                                <h4 style={{ fontSize: '10pt', fontWeight: 700, margin: 0, color: job.color || '#101733' }}>{job.company}</h4>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#4b5563', fontStyle: 'italic', margin: '0.1rem 0 0.3rem 0' }}>
                                            <span style={{ fontWeight: 600 }}>{job.title}</span>
                                            {job.teamSize && <span>Quản lý: {job.teamSize}</span>}
                                        </div>
                                        <ul style={{ margin: '0', paddingLeft: '1.1rem', fontSize: '8.5pt', color: '#374151', listStyleType: 'square' }}>
                                            {job.responsibilities.slice(0, 4).map((res, idx) => (
                                                <li key={idx} style={{ marginBottom: '0.15rem', lineHeight: '1.4' }}>{res}</li>
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
                                        <td style={{ fontWeight: 600, color: '#4b5563', padding: '1px 0' }}>Tạm trú:</td>
                                        <td style={{ textAlign: 'right' }}>{tempResidence}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: '#4b5563', padding: '1px 0' }}>Cư trú:</td>
                                        <td style={{ textAlign: 'right' }}>{permResidence}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: '#4b5563', padding: '1px 0' }}>Điện thoại:</td>
                                        <td style={{ textAlign: 'right' }}>{phone}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 600, color: '#4b5563', padding: '1px 0' }}>Email:</td>
                                        <td style={{ textAlign: 'right' }}>{email}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.8rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.skillsPage.title}
                            </h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '8.5pt', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#4b5563', textTransform: 'uppercase' }}>Kỹ năng chuyên môn</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {professionalSkills.map(skill => (
                                        <div key={skill.name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt', marginBottom: '0.2rem', color: '#374151', fontWeight: 500 }}>
                                                <span>{skill.name}</span>
                                                <span>{skill.level}%</span>
                                            </div>
                                            <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                                <div style={{ width: `${skill.level}%`, backgroundColor: '#f97316', height: '100%', borderRadius: '4px' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '8.5pt', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#4b5563', textTransform: 'uppercase' }}>Kỹ năng mềm</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {softSkills.map(skill => (
                                        <div key={skill.name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8pt', marginBottom: '0.2rem', color: '#374151', fontWeight: 500 }}>
                                                <span>{skill.name}</span>
                                                <span>{skill.level}%</span>
                                            </div>
                                            <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                                                <div style={{ width: `${skill.level}%`, backgroundColor: '#4f46e5', height: '100%', borderRadius: '4px' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '1.5rem', flex: 1 }}>
                    <div>
                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '1rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                LỊCH SỬ KINH NGHIỆM ĐỒNG HÀNH
                            </h3>
                            <div style={{ position: 'relative', borderLeft: '2px solid #e5e7eb', marginLeft: '4.5rem', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                {allJobs.slice(4).map(job => (
                                    <div key={job.key} className="p-experience-item" style={{ marginBottom: 0, position: 'relative' }}>
                                        {/* Timeline Dot */}
                                        <div style={{ position: 'absolute', left: '-1.55rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316', border: '2px solid #fff' }}></div>
                                        
                                        <div style={{ position: 'absolute', left: '-5.7rem', top: '0', width: '4rem', fontSize: '8pt', color: '#f97316', fontWeight: 700, textAlign: 'right', lineHeight: '1.3' }}>
                                            {job.date.includes('-') ? (
                                                <>
                                                    <div>{job.date.split('-')[0].trim()} -</div>
                                                    <div>{job.date.split('-')[1]?.trim()}</div>
                                                </>
                                            ) : (
                                                job.date
                                            )}
                                        </div>

                                        <div className="p-experience-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {job.logoUrl && <img src={job.logoUrl} alt={job.company} style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #e5e7eb', padding: '2px' }} />}
                                                <h4 style={{ fontSize: '10pt', fontWeight: 700, margin: 0, color: job.color || '#101733' }}>{job.company}</h4>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9pt', color: '#4b5563', fontStyle: 'italic', margin: '0.1rem 0 0.3rem 0' }}>
                                            <span style={{ fontWeight: 600 }}>{job.title}</span>
                                            {job.teamSize && <span>Quản lý: {job.teamSize}</span>}
                                        </div>
                                        <ul style={{ margin: '0', paddingLeft: '1.1rem', fontSize: '8.5pt', color: '#374151', listStyleType: 'square' }}>
                                            {job.responsibilities.slice(0, 3).map((res, idx) => (
                                                <li key={idx} style={{ marginBottom: '0.1rem', lineHeight: '1.4' }}>{res}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '1.2rem' }}>
                        <section className="p-section" style={{ marginBottom: '1.5rem' }}>
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.projectsPage.badge} (Dự án tiêu biểu)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.3rem', fontSize: '7.5pt', lineHeight: '1.2' }}>
                                {projects.map((proj, idx) => (
                                    <div key={proj.id} style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px dashed rgba(0,0,0,0.06)', paddingBottom: '0.15rem', alignItems: 'flex-start' }}>
                                        <span style={{ color: '#f97316', fontWeight: 700, minWidth: '1.4rem' }}>{idx + 1}.</span>
                                        <span style={{ color: '#101733', fontWeight: 500 }}>{proj.title}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="p-section">
                            <h3 className="p-section-title" style={{ fontSize: '10.5pt', borderBottom: '1px solid #f97316', color: '#101733', marginBottom: '0.5rem', paddingBottom: '0.2rem', textTransform: 'uppercase' }}>
                                {t.educationPage.title}
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 0.8rem' }}>
                                {education.map((edu, index) => (
                                    <div key={index} style={{ fontSize: '8pt', lineHeight: 1.3, borderBottom: '1px dashed rgba(0,0,0,0.06)', paddingBottom: '0.3rem' }}>
                                        <strong style={{ display: 'block', color: '#101733' }}>{edu.title}</strong>
                                        <span style={{ color: '#4b5563', display: 'block' }}>{edu.institution}</span>
                                        <span style={{ color: '#f97316', display: 'block', fontSize: '7.5pt', fontWeight: 700 }}>Năm: {edu.year}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintableView;
