
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';
import LinkEmbedPopup from './LinkEmbedPopup';
import Lightbox from './Lightbox';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useSpeechSynthesis } from './useSpeechSynthesis';

const PROJECT_IMAGES: Record<string, string> = {
    "1.1": "https://i.postimg.cc/Y9ywtYwY/1-1-Xay-dung-Phong-Dich-vu-Khach-hang.png",
    "1.2": "https://i.postimg.cc/gjXbjjYH/1-2-Thiet-lap-muc-tieu-phong-ban.png",
    "1.3": "https://i.postimg.cc/mkzWkkbN/1-3-Nang-cao-trai-nghiem-khach-hang.png",
    "1.4": "https://i.postimg.cc/vTgwTTQ7/1-4-Quan-ly-du-an-CSKH.png",
    "1.5": "https://i.postimg.cc/G2pHMFQk/1-5-Thuc-day-cai-tien-san-pham.png",
    "2.1": "https://i.postimg.cc/Rh6xhhMw/2-1-Chuan-hoa-quy-trinh-CSKH.png",
    "2.2": "https://i.postimg.cc/qRZdpyd3/2-2-Toi-uu-hoa-kenh-ho-tro.png",
    "2.3": "https://i.postimg.cc/gJBPG8PR/2-3-Trien-khai-tu-dong-hoa.png",
    "2.4": "https://i.postimg.cc/gjXbjjY8/2-4-Quan-ly-chien-dich-Outbound.png",
    "3.1": "https://i.postimg.cc/VvrPvvYt/3-1-Xay-dung-he-thong-CRM.png",
    "3.2": "https://i.postimg.cc/D0J3002X/3-2-Phan-tich-Bao-cao.png",
    "3.3": "https://i.postimg.cc/fytQyyw0/3-3-Khao-sat-Danh-gia-khach-hang.png",
    "3.4": "https://i.postimg.cc/gjXbjjYX/3-4-Xay-dung-AI-Bot.png",
    "4.1": "https://i.postimg.cc/bJFjqkjH/4-1-Phat-trien-dao-tao-truc-tuyen.png",
    "5.1": "https://i.postimg.cc/631NBnNV/5-1-Thanh-lap-trung-tam-ho-tro.png",
    "6.1": "https://i.postimg.cc/FRnQh3QS/6-1-Khach-hang-la-trung-tam.png",
};

interface ProjectPostPageProps {
    id: string; // The full page key, e.g., "project-1.1"
    projectId: string; // Just the ID, e.g., "1.1"
    onNavigate?: (key: string) => void;
}

interface Comment {
    id?: string;
    author: string;
    date: string;
    text: string;
}

const ProjectPostPage: React.FC<ProjectPostPageProps> = ({ id, projectId, onNavigate }) => {
    const { t, language } = useI18n();
    const pageData = t.projectPostPopup;
    const post = useMemo(() => (t.projectPosts as any)[projectId] || (t.projectPosts as any).default, [projectId, t]);
    
    const [fromExperience, setFromExperience] = useState(false);

    useEffect(() => {
        const isFromExp = sessionStorage.getItem('referrer_experience') === 'true';
        setFromExperience(isFromExp);
    }, []);

    const achievement = useMemo(() => {
        const achList = t.achievementsPage?.achievements;
        if (!Array.isArray(achList)) return null;
        return achList.find((a: any) => a.id === projectId || a.title === post?.title);
    }, [projectId, post, t]);
    
    const [embeddingUrl, setEmbeddingUrl] = useState<string | null>(null);

    const { selectedAiVoiceName, aiVoicePitch, aiVoiceRate } = useTheme();
    const { isSpeaking, speak, cancel } = useSpeechSynthesis();

    useEffect(() => {
        return () => {
            cancel();
        };
    }, [projectId, cancel]);

    const handleToggleSpeech = () => {
        if (isSpeaking) {
            cancel();
        } else {
            const getPlainText = (htmlOrMarkdown: string) => {
                return htmlOrMarkdown
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\*\*|__/g, '')
                    .replace(/&bull;/g, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
            };

            const plainParagraphs = post.content.paragraphs
                .filter((p: string) => !p.trim().startsWith('**Vai trò:**') && !p.trim().startsWith('**Role:**'))
                .map((p: string) => getPlainText(p));
            const plainList = post.content.list ? post.content.list.map((item: string) => getPlainText(item)) : [];
            
            const intro = language === 'vi' 
                ? `Sau đây là nội dung chi tiết bài viết dự án mang tên: ${post.title}.`
                : `The following is the detailed article for the project of: ${post.title}.`;
                
            const phaseText = language === 'vi'
                ? `Giai đoạn hành động: ${post.date}`
                : `Action Phase: ${post.date}`;
                
            const fullSpeechText = [
                intro,
                phaseText,
                ...plainParagraphs,
                ...plainList
            ].join('. ');

            const defaultAiVoiceName = language === 'vi' ? 'Nam Minh' : 'Google US English';
            const voiceToUse = selectedAiVoiceName || defaultAiVoiceName;

            speak(fullSpeechText, {
                voiceName: voiceToUse,
                lang: language,
                pitch: aiVoicePitch,
                rate: aiVoiceRate
            });
        }
    };

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState(() => {
        const savedName = localStorage.getItem('comment_author_name') || '';
        const savedEmail = localStorage.getItem('comment_author_email') || '';
        return { name: savedName, email: savedEmail, text: '' };
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const allProjects = t.projectsPage.projects;
    const relatedPosts = useMemo(() => {
        if (!post) return [];
        const currentProject = allProjects.find(p => p.id === projectId);
        if (!currentProject) return [];
        return allProjects
            .filter(p => p.group === currentProject.group && p.id !== projectId)
            .slice(0, 4); 
    }, [projectId, post, allProjects]);

    const handleRelatedPostClick = (newProjectId: string) => {
        if (onNavigate) {
            onNavigate(`project-${newProjectId}`);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0);
    }, [projectId]);

    if (!post) {
        return <PageLayout id={id}><div className="info-card">Loading project...</div></PageLayout>;
    }


    // Subscribing to feedback comments for the specific project post
    useEffect(() => {
        const commentsRef = collection(db, 'comments');
        const q = query(
            commentsRef,
            where('projectId', '==', projectId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedComments: any[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                fetchedComments.push({
                    id: doc.id,
                    author: data.author || 'Anonymous',
                    email: data.email || '',
                    text: data.text || '',
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date()
                });
            });

            // Standardize sorting on clientside in memory - is resilient to complex indexing requirements
            fetchedComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            const formattedComments: Comment[] = fetchedComments.map(c => {
                const dateStr = c.createdAt.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                return {
                    id: c.id,
                    author: c.author,
                    date: dateStr,
                    text: c.text
                };
            });

            setComments(formattedComments);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, 'comments');
        });

        return () => unsubscribe();
    }, [projectId, language]);

    // Submission handler with transactional validations and local persistence
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.name.trim() || !newComment.email.trim() || !newComment.text.trim()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const commentsRef = collection(db, 'comments');
            await addDoc(commentsRef, {
                projectId,
                author: newComment.name.trim(),
                email: newComment.email.trim(),
                text: newComment.text.trim(),
                createdAt: serverTimestamp()
            });

            // Save user profile state inside local storage
            localStorage.setItem('comment_author_name', newComment.name.trim());
            localStorage.setItem('comment_author_email', newComment.email.trim());

            // Clear text input while persisting user details
            setNewComment(prev => ({ ...prev, text: '' }));
        } catch (error) {
            console.error('Error adding comment: ', error);
            setSubmitError(language === 'vi' ? 'Lỗi gửi bình luận. Vui lòng thử lại sau.' : 'Failed to submit comment. Please try again.');
            handleFirestoreError(error, OperationType.CREATE, 'comments');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!commentId || deletingCommentId) return;

        setDeletingCommentId(commentId);
        try {
            const commentRef = doc(db, 'comments', commentId);
            await deleteDoc(commentRef);
        } catch (error) {
            console.error('Error deleting comment: ', error);
            handleFirestoreError(error, OperationType.DELETE, 'comments');
        } finally {
            setDeletingCommentId(null);
        }
    };

    const getInitials = (name: string) => {
        const nameParts = name.trim().split(' ');
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const parsedContent = useMemo(() => {
        if (!post || !post.content) return { role: '', goal: '', otherParagraphs: [], steps: [], achievements: null };
        
        let role = '';
        let goal = '';
        const otherParagraphs: string[] = [];
        
        const paragraphs: string[] = post.content.paragraphs || [];
        paragraphs.forEach((p: string) => {
            const cleanP = p.trim();
            if (cleanP.startsWith('**Vai trò:**') || cleanP.startsWith('**Role:**')) {
                role = cleanP.replace(/^\*\*Vai trò:\*\*\s*/i, '').replace(/^\*\*Role:\*\*\s*/i, '').trim();
            } else if (cleanP.startsWith('**Mục tiêu dự án:**') || cleanP.startsWith('**Project Goal:**')) {
                goal = cleanP.replace(/^\*\*Mục tiêu dự án:\*\*\s*/i, '').replace(/^\*\*Project Goal:\*\*\s*/i, '').trim();
            } else if (
                cleanP.toLowerCase().includes('nội dung triển khai') || 
                cleanP.toLowerCase().includes('implementation scope') || 
                cleanP.toLowerCase().includes('implementation:') ||
                cleanP.replace(/\*/g, '').trim() === 'Nội dung triển khai:' ||
                cleanP.replace(/\*/g, '').trim() === 'Implementation Scope:'
            ) {
                // Skip these section headers since we'll render a custom section header
            } else {
                otherParagraphs.push(p);
            }
        });
        
        const rawList = post.content.list || [];
        const lastItem = rawList.length > 0 ? rawList[rawList.length - 1] : null;
        const lastItemIsAchievements = lastItem && (
            lastItem.toLowerCase().includes('kết quả đạt được') || 
            lastItem.toLowerCase().includes('key achievements') || 
            lastItem.toLowerCase().includes('achievements') ||
            lastItem.toLowerCase().includes('kết quả')
        );
        
        const stepsRaw = lastItemIsAchievements ? rawList.slice(0, -1) : rawList;
        const achievementsRaw = lastItemIsAchievements ? lastItem : null;
        
        const brRegex = /<br\s*\/?>/i;
        
        const parseItem = (item: string) => {
            const match = item.match(brRegex);
            if (!match || match.index === undefined) {
                return {
                    title: item.replace(/\*/g, '').trim(),
                    bullets: []
                };
            }
            const rawTitle = item.substring(0, match.index);
            const rawBody = item.substring(match.index + match[0].length);
            
            const title = rawTitle.replace(/\*\*/g, '').trim();
            const subItems = rawBody.split(brRegex)
                .map(b => b.trim())
                .filter(b => b.length > 0);
                
            const bullets = subItems.map(b => {
                const isNested = b.includes('&nbsp;&nbsp;&nbsp;&nbsp;-') || b.trim().startsWith('-') || b.startsWith('&nbsp;');
                const cleaned = b
                    .replace(/&bull;/g, '')
                    .replace(/&nbsp;/g, '')
                    .replace(/^-\s*/, '')
                    .replace(/^\*\s*/, '')
                    .trim();
                return {
                    text: cleaned,
                    isNested
                };
            });
            
            return { title, bullets };
        };
        
        const steps = stepsRaw.map((item: string) => parseItem(item));
        const achievements = achievementsRaw ? parseItem(achievementsRaw) : null;
        
        return { role, goal, otherParagraphs, steps, achievements };
    }, [post]);
    
    const projectClass = `project-post-specific-${projectId.replace(/\./g, '-')}`;

    return (
        <PageLayout id={id}>
            <div className={`info-card project-post-page-card ${projectClass}`}> 
                <div className="project-post-nav-header flex items-center justify-between">
                    <div>
                        <InfoBadge
                            icon={<Icons.PencilIcon />}
                            text={pageData.badge}
                            tooltipTitle={pageData.tooltipTitle}
                            tooltipText={pageData.tooltipText}
                            style={{ 
                                height: '42px', 
                                padding: '0px 1.25rem', 
                                boxSizing: 'border-box', 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: '#ffffff', 
                                color: '#101733', 
                                borderColor: 'rgba(0, 0, 0, 0.1)', 
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        {fromExperience ? (
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('referrer_experience');
                                    // Keep referrer_job_index so WorkExperiencePage knows which job to show
                                    onNavigate?.('experience');
                                }}
                                className="btn btn-secondary z-10 flex items-center gap-1.5"
                                style={{ 
                                    borderColor: 'var(--color-brand-accent, #3b82f6)', 
                                    color: 'var(--color-brand-accent, #3b82f6)',
                                    fontWeight: '600',
                                    borderRadius: '999px',
                                    height: '42px'
                                }}
                            >
                                <Icons.ChevronLeftIcon size={18} />
                                <span style={{ fontWeight: 'bold', lineHeight: '24.6598px', fontSize: '14.5057px' }}>{language === 'vi' ? 'Quay lại thẻ Công ty' : 'Back to Company'}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('referrer_experience');
                                    sessionStorage.removeItem('referrer_job_index');
                                    onNavigate?.('projects');
                                }}
                                className="btn btn-secondary z-10"
                                style={{
                                    borderRadius: '999px',
                                    height: '42px'
                                }}
                            >
                                <Icons.ChevronLeftIcon size={18} />
                                <span style={{ fontWeight: 'bold', lineHeight: '24.6598px', fontSize: '14.5057px' }}>{pageData.backToProjects}</span>
                            </button>
                        )}
                    </div>
                </div>

                 <div className="project-post-scroll-content no-scrollbar" ref={scrollRef}>

                    <main className="project-post-main">
                        <div className="project-post-content-wrapper">
                            <div className="project-post-layout-grid">
                                <div className="project-article-card">
                                        <div className="project-hero-container">
                                            {post.heroImage && <img src={post.heroImage} alt={post.title} className="project-post-hero-image-bg" />}
                                            <div className="project-hero-container-inner">
                                                <h1 className="project-post-title on-banner">{post.title}</h1>
                                                <div className="project-hero-meta">
                                                    <span className="project-post-date">{post.date}</span>
                                                    <div className="project-post-tags">
                                                        {post.tags.map((tag: string) => <span key={tag}>#{tag}</span>)}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleToggleSpeech}
                                                type="button"
                                                className="info-badge banner-audio-button-glowing flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300"
                                                title={isSpeaking ? (language === 'vi' ? 'Dừng đọc' : 'Stop reading') : (language === 'vi' ? 'Đọc thông tin' : 'Read Aloud')}
                                                style={{ 
                                                    position: 'absolute',
                                                    left: '1.25rem',
                                                    bottom: '1.25rem',
                                                    zIndex: 10,
                                                    height: '38px', 
                                                    padding: '0px 1.25rem', 
                                                    boxSizing: 'border-box',
                                                    borderRadius: '20px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.825rem'
                                                }}
                                            >
                                                <span className="badge-content relative flex items-center justify-center gap-2">
                                                    {isSpeaking ? (
                                                        <Icons.PauseIcon size={13} className="animate-pulse" />
                                                    ) : (
                                                        <Icons.PlayIcon size={13} />
                                                    )}
                                                    <span>
                                                        {isSpeaking ? (language === 'vi' ? 'Dừng đọc' : 'Stop audio') : (language === 'vi' ? 'Trình đọc tin' : 'AI Reader')}
                                                    </span>
                                                </span>
                                            </button>
                                         </div>
                                         
                                         <div className="project-post-body">
                                             {achievement && (
                                                 <div className="project-kpi-card-container animate-fadeIn">
                                                     <div className="kpi-card-section-label">
                                                         <Icons.TrophyIcon size={14} className="kpi-label-icon" />
                                                         <span>{language === 'vi' ? 'Chỉ số hiệu quả đạt được:' : 'Key Achievement / KPI Rating:'}</span>
                                                     </div>
                                                     <div 
                                                         className="achievement-card" 
                                                         style={{ '--item-color': achievement.color, border: '1.5px solid var(--item-color)' } as React.CSSProperties}
                                                     >
                                                         <div className="achievement-card-main-content">
                                                              <div className="achievement-card-title-group">
                                                                  {(() => {
                                                                      const IconComp = Icons[achievement.icon as keyof typeof Icons] || Icons.TrophyIcon;
                                                                      return <IconComp />;
                                                                  })()}
                                                                  <h4 className="font-semibold text-lg" style={{ color: achievement.color, fontSize: '1rem', margin: 0 }} title={achievement.title}>
                                                                      {achievement.id}. {achievement.title}
                                                                  </h4>
                                                              </div>
                                                              <div className="achievement-card-tags">
                                                                  <button style={{ cursor: 'default' }} onClick={(e) => e.stopPropagation()}>{achievement.hashtag}</button>
                                                              </div>
                                                         </div>
                                                         <div className="achievement-card-rate transition-transform duration-300 hover:scale-105" style={{ color: achievement.color }}>
                                                              {achievement.rate}
                                                              <span className="achievement-card-percent-sign">%</span>
                                                         </div>
                                                     </div>
                                                 </div>
                                             )}
                                         
                                             {/* Phase & Goal Summary Box */}
                                             {(parsedContent.goal || post.date) && (
                                                 <div className="project-post-meta-summary-grid mb-6 animate-fadeIn">
                                                     {post.date && (
                                                         <div className="meta-summary-card role-card">
                                                             <div className="meta-summary-header">
                                                                 <Icons.CalendarDaysIcon className="meta-summary-icon" />
                                                                 <span>{language === 'vi' ? 'Giai đoạn hành động' : 'Action Phase'}</span>
                                                             </div>
                                                             <div className="meta-summary-body">{post.date}</div>
                                                         </div>
                                                     )}
                                                     {parsedContent.goal && (
                                                         <div className="meta-summary-card goal-card">
                                                             <div className="meta-summary-header">
                                                                 <Icons.LightBulbIcon className="meta-summary-icon" />
                                                                 <span>{language === 'vi' ? 'Mục tiêu dự án' : 'Project Goal'}</span>
                                                             </div>
                                                             <div className="meta-summary-body">{parsedContent.goal}</div>
                                                         </div>
                                                     )}
                                                 </div>
                                             )}

                                             {/* Other introductory text */}
                                             {parsedContent.otherParagraphs.map((p, index) => {
                                                 const formattedText = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                                 return <p key={index} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formattedText }} />;
                                             })}

                                             {/* Section Title for Steps */}
                                             {parsedContent.steps.length > 0 && (
                                                 <div className="project-section-title">
                                                     <Icons.LayersIcon size={18} className="shrink-0 text-[var(--accent-color)]" />
                                                     <span>{language === 'vi' ? 'Nội dung triển khai' : 'Implementation Scope'}</span>
                                                 </div>
                                             )}

                                             {/* Steps list with sequential numbers */}
                                             {parsedContent.steps.map((step, index) => (
                                                 <div key={index} className="project-step-card animate-fadeIn">
                                                     <div className="project-step-header">
                                                         <div className="project-step-number">{String(index + 1).padStart(2, '0')}</div>
                                                         <h3 className="project-step-title">{step.title}</h3>
                                                     </div>
                                                     
                                                     {step.bullets.length > 0 && (
                                                         <div className="project-step-bullets">
                                                             {step.bullets.map((bullet, bIdx) => {
                                                                 const formattedText = bullet.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                                                 return (
                                                                     <div 
                                                                         key={bIdx} 
                                                                         className={`project-step-bullet-item ${bullet.isNested ? 'is-nested' : ''}`}
                                                                     >
                                                                         {!bullet.isNested && <Icons.ChevronRightIcon className="bullet-icon-main" size={14} />}
                                                                         {bullet.isNested && <span className="bullet-icon-nested">◆</span>}
                                                                         <span dangerouslySetInnerHTML={{ __html: formattedText }} className="bullet-text" />
                                                                     </div>
                                                                 );
                                                             })}
                                                         </div>
                                                     )}
                                                 </div>
                                             ))}

                                             {/* Achievements / Kết quả đạt được card */}
                                             {parsedContent.achievements && (
                                                 <div className="project-achievements-showcase animate-fadeIn">
                                                     <div className="achievements-showcase-header">
                                                         <Icons.TrophyIcon className="achievements-showcase-icon" />
                                                         <h3>{parsedContent.achievements.title}</h3>
                                                     </div>
                                                     
                                                     {parsedContent.achievements.bullets.length > 0 && (
                                                         <div className="achievements-showcase-list">
                                                             {parsedContent.achievements.bullets.map((bullet, bIdx) => {
                                                                 const formattedText = bullet.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                                                 return (
                                                                     <div key={bIdx} className="achievements-showcase-item">
                                                                         <Icons.SparklesIcon className="showcase-spark-icon" size={14} />
                                                                         <span dangerouslySetInnerHTML={{ __html: formattedText }} />
                                                                     </div>
                                                                 );
                                                             })}
                                                         </div>
                                                     )}
                                                 </div>
                                             )}
                                         
                                         {PROJECT_IMAGES[projectId] && (
                                                <div className="project-detail-image-wrapper mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center">
                                                    <img
                                                        src={PROJECT_IMAGES[projectId]}
                                                        alt={post.title}
                                                        className="case-study-image cursor-pointer hover:scale-[1.01] transition-all duration-300 object-contain max-h-[600px]"
                                                        referrerPolicy="no-referrer"
                                                        onClick={() => setIsLightboxOpen(true)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                
                                    <div className="project-post-sidebar animate-fadeIn">
                                        {relatedPosts.length > 0 && (
                                            <div className="sidebar-widget related-posts-widget">
                                                <h4 className="sidebar-widget-title">{pageData.relatedPosts}</h4>
                                                <div className="related-posts-list">
                                                    {relatedPosts.map(related => (
                                                        <div 
                                                            key={related.id} 
                                                            className="related-post-item" 
                                                            onClick={() => handleRelatedPostClick(related.id)}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRelatedPostClick(related.id)}}
                                                        >
                                                            <img src={related.imageUrl} alt={related.title} className="related-post-image" />
                                                            <div className="related-post-info">
                                                                <h5 className="related-post-title">{related.title}</h5>
                                                                <p className="related-post-group">{related.group}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {pageData.referenceLinks && pageData.referenceLinks.length > 0 && (
                                            <div className="sidebar-widget reference-links-widget">
                                                <h4 className="sidebar-widget-title">{pageData.referenceLinksTitle || 'Tài liệu tham khảo'}</h4>
                                                <ul className="reference-links-list">
                                                    {pageData.referenceLinks.map((link: any, index: number) => (
                                                        <li key={index}>
                                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                                <Icons.DocumentTextIcon size={14} className="shrink-0 text-[var(--accent-color)]" />
                                                                <span>{link.title}</span>
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="sidebar-widget comments-widget">
                                            <h4 className="sidebar-widget-title">{pageData.comments} ({comments.length})</h4>
                                            
                                            <form className="comment-form" onSubmit={handleSubmitComment}>
                                                <div className="comment-form-grid">
                                                    <input 
                                                        type="text" 
                                                        name="name"
                                                        placeholder={pageData.namePlaceholder} 
                                                        value={newComment.name}
                                                        onChange={(e) => setNewComment(prev => ({ ...prev, name: e.target.value }))}
                                                        required
                                                        disabled={isSubmitting}
                                                    />
                                                    <input 
                                                        type="email"
                                                        name="email" 
                                                        placeholder={pageData.emailPlaceholder}
                                                        value={newComment.email}
                                                        onChange={(e) => setNewComment(prev => ({ ...prev, email: e.target.value }))}
                                                        required
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                                <textarea 
                                                    name="text"
                                                    placeholder={pageData.commentPlaceholder}
                                                    value={newComment.text}
                                                    onChange={(e) => setNewComment(prev => ({ ...prev, text: e.target.value }))}
                                                    required
                                                    disabled={isSubmitting}
                                                ></textarea>
                                                {submitError && (
                                                    <div className="text-red-500 text-xs mb-3 font-medium">
                                                        {submitError}
                                                    </div>
                                                )}
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary flex justify-center items-center gap-2" 
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <span>{language === 'vi' ? 'Đang gửi...' : 'Sending...'}</span>
                                                    ) : (
                                                        <span>{pageData.submitComment}</span>
                                                    )}
                                                </button>
                                            </form>
                                            
                                            <div className="comments-list">
                                                {comments.map((comment, index) => (
                                                    <div key={index} className="comment-item">
                                                        <div className="comment-avatar">
                                                            {getInitials(comment.author)}
                                                        </div>
                                                        <div className="comment-content">
                                                            <div className="comment-header">
                                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                                    <span className="comment-author">{comment.author}</span>
                                                                    <span className="comment-date">{comment.date}</span>
                                                                </div>
                                                                {comment.id && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteComment(comment.id!)}
                                                                        disabled={deletingCommentId !== null}
                                                                        className="p-1.5 rounded-full hover:bg-red-50/20 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                                                                        style={{ cursor: 'pointer' }}
                                                                        title={language === 'vi' ? 'Xóa bình luận' : 'Delete comment'}
                                                                    >
                                                                        {deletingCommentId === comment.id ? (
                                                                            <span className="text-[10px] uppercase font-bold text-red-500 animate-pulse">...</span>
                                                                        ) : (
                                                                            <Icons.TrashIcon size={14} />
                                                                        )}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="comment-text">{comment.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </main>
                    </div>
                </div>
            {embeddingUrl && document.getElementById('popup-root') && createPortal(
                <LinkEmbedPopup url={embeddingUrl} onClose={() => setEmbeddingUrl(null)} />,
                document.getElementById('popup-root')!
            )}
            {isLightboxOpen && PROJECT_IMAGES[projectId] && (
                <Lightbox
                    images={[{ src: PROJECT_IMAGES[projectId], alt: post.title }]}
                    currentIndex={0}
                    onClose={() => setIsLightboxOpen(false)}
                    onNext={() => {}}
                    onPrev={() => {}}
                />
            )}
        </PageLayout>
    );
};

export default ProjectPostPage;
