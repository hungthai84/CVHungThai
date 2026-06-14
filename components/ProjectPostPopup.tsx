
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';
import LinkEmbedPopup from './LinkEmbedPopup';
import Lightbox from './Lightbox';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
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
    author: string;
    date: string;
    text: string;
}

const ProjectPostPage: React.FC<ProjectPostPageProps> = ({ id, projectId, onNavigate }) => {
    const { t, language } = useI18n();
    const pageData = t.projectPostPopup;
    const post = useMemo(() => (t.projectPosts as any)[projectId] || (t.projectPosts as any).default, [projectId, t]);
    
    const achievement = useMemo(() => {
        const achList = t.achievementsPage?.achievements;
        if (!Array.isArray(achList)) return null;
        return achList.find((a: any) => a.id === projectId || a.title === post?.title);
    }, [projectId, post, t]);
    
    const [embeddingUrl, setEmbeddingUrl] = useState<string | null>(null);

    const { isAiVoiceOn, selectedAiVoiceName, aiVoicePitch, aiVoiceRate } = useTheme();
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

            const plainParagraphs = post.content.paragraphs.map((p: string) => getPlainText(p));
            const plainList = post.content.list ? post.content.list.map((item: string) => getPlainText(item)) : [];
            
            const intro = language === 'vi' 
                ? `Sau đây là nội dung chi tiết bài viết dự án mang tên: ${post.title}.`
                : `The following is the detailed article for the project of: ${post.title}.`;
                
            const fullSpeechText = [
                intro,
                ...plainParagraphs,
                ...plainList
            ].join('. ');

            const defaultAiVoiceName = 'Google Translate TTS (gTTS)';
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
    
    const allProjects = t.projectsPage.projects;
    const relatedPosts = useMemo(() => {
        if (!post) return [];
        const currentProject = allProjects.find(p => p.id === projectId);
        if (!currentProject) return [];
        return allProjects
            .filter(p => p.group === currentProject.group && p.id !== projectId)
            .slice(0, 4); 
    }, [projectId, post, allProjects]);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0);
    }, [projectId]);

    if (!post) {
        return <PageLayout id={id}><div className="info-card">Loading project...</div></PageLayout>;
    }

    const handleRelatedPostClick = (newProjectId: string) => {
        if (onNavigate) {
            onNavigate(`project-${newProjectId}`);
        }
    };

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

    const getInitials = (name: string) => {
        const nameParts = name.trim().split(' ');
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const projectClass = `project-post-specific-${projectId.replace(/\./g, '-')}`;

    return (
        <PageLayout id={id}>
            <div className={`info-card project-post-page-card ${projectClass}`}> 
                <div className="project-post-nav-header flex items-center justify-between">
                    <InfoBadge
                        icon={<Icons.PencilIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                    <button
                        onClick={() => onNavigate?.('projects')}
                        className="btn btn-secondary z-10"
                    >
                        <Icons.ChevronLeftIcon size={18} />
                        <span>{pageData.backToProjects}</span>
                    </button>
                </div>

                 <div className="project-post-scroll-content no-scrollbar" ref={scrollRef}>

                    <main className="project-post-main">
                        <div className="project-post-content-wrapper">
                            <div className="project-post-layout-grid">
                                <div className="project-post-main-content">
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

                                                <button
                                                    onClick={handleToggleSpeech}
                                                    type="button"
                                                    className="banner-speak-btn"
                                                    title={isSpeaking ? (language === 'vi' ? 'Dừng đọc' : 'Stop reading') : (language === 'vi' ? 'Đọc thông tin' : 'Read Aloud')}
                                                >
                                                    <div className={`banner-speak-glow-circle ${isSpeaking ? 'is-playing' : ''}`}>
                                                        {isSpeaking ? (
                                                            <Icons.PauseIcon size={12} className="relative z-10 fill-white text-white" />
                                                        ) : (
                                                            <Icons.PlayIcon size={12} className="relative z-10 fill-white text-white translate-x-[1px]" />
                                                        )}
                                                    </div>
                                                    <div className="banner-speak-text-group">
                                                        <span className="banner-speak-badge">
                                                            {language === 'vi' ? 'Trình đọc tin AI' : 'AI Reader'}
                                                        </span>
                                                        <span className="banner-speak-title">
                                                            {isSpeaking ? (language === 'vi' ? 'Dừng đọc' : 'Stop audio') : (language === 'vi' ? 'Đọc thông tin' : 'Read Aloud')}
                                                        </span>
                                                    </div>
                                                    {isSpeaking && (
                                                        <div className="banner-sound-wave">
                                                            <span></span>
                                                            <span></span>
                                                            <span></span>
                                                        </div>
                                                    )}
                                                </button>

                                            </div>
                                        </div>
                                        
                                        <div className="project-post-body">


                                            {achievement && (
                                                <div className="project-post-achievement-card-wrapper mb-6 animate-fadeIn" style={{ width: '50%', minWidth: '280px', maxWidth: '100%' }}>
                                                    <div className="text-xs uppercase tracking-wider font-semibold opacity-60 mb-2.5 flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                        <Icons.TrophyIcon size={14} className="text-amber-500" />
                                                        <span>{language === 'vi' ? 'Chỉ số hiệu quả đạt được:' : 'Key Achievement / KPI Rating:'}</span>
                                                    </div>
                                                    <div 
                                                        className="achievement-card" 
                                                        style={{ '--item-color': achievement.color, cursor: 'default', margin: 0, width: '100%', breakInside: 'avoid' } as React.CSSProperties}
                                                    >
                                                        <div className="achievement-card-main-content">
                                                             <div className="achievement-card-title-group">
                                                                 {(() => {
                                                                     const IconComp = Icons[achievement.icon as keyof typeof Icons] || Icons.TrophyIcon;
                                                                     return <IconComp />;
                                                                 })()}
                                                                 <h4 className="font-semibold text-lg" style={{ color: achievement.color, fontSize: '1.1rem', margin: 0 }} title={achievement.title}>
                                                                     {achievement.id}. {achievement.title}
                                                                 </h4>
                                                             </div>
                                                             <div className="achievement-card-tags">
                                                                 <button style={{ cursor: 'default' }} onClick={(e) => e.stopPropagation()}>{achievement.hashtag}</button>
                                                             </div>
                                                        </div>
                                                        <div className="achievement-card-rate transition-transform duration-300 hover:scale-105" style={{ color: achievement.color }}>
                                                             {achievement.rate}
                                                             <span className="achievement-card-percent-sign" style={{ color: achievement.color }}>%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {post.content.paragraphs.map((p: string, index: number) => {
                                                const formattedText = p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                                return <p key={index} dangerouslySetInnerHTML={{ __html: formattedText }} />;
                                            })}
                                            {post.content.list && (
                                                <ul>
                                                    {post.content.list.map((item: string, index: number) => {
                                                         const formattedText = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                                         return <li key={index} dangerouslySetInnerHTML={{ __html: formattedText }} />;
                                                    })}
                                                </ul>
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
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 italic flex items-center gap-1.5 justify-center">
                                                        <Icons.SparklesIcon size={12} />
                                                        <span>Thống kê quy trình / Hệ thống thực tiễn của dự án (Click để phóng to)</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                
                                    {relatedPosts.length > 0 && (
                                        <div className="project-post-sidebar">
                                            <div className="sidebar-widget">
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
                                            
                                            <div className="sidebar-widget">
                                                <h4 className="sidebar-widget-title">{pageData.referenceLinksTitle}</h4>
                                                <ul className="reference-links-list">
                                                    {(pageData.referenceLinks || []).map((link: {title: string, url: string}) => (
                                                        <li key={link.title}>
                                                            <a onClick={(e) => { e.preventDefault(); setEmbeddingUrl(link.url); }}>{link.title}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
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
                                                                <span className="comment-author">{comment.author}</span>
                                                                <span className="comment-date">{comment.date}</span>
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
