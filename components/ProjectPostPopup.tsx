
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { GoogleGenAI } from "@google/genai";
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useTheme } from '../contexts/ThemeContext';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';
import LinkEmbedPopup from './LinkEmbedPopup';
import Lightbox from './Lightbox';

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
    
    const [embeddingUrl, setEmbeddingUrl] = useState<string | null>(null);

    const { isAiVoiceOn, selectedAiVoiceName } = useTheme();
    const { speak, cancel, isSpeaking } = useSpeechSynthesis();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [comments] = React.useState<Comment[]>([]);
    const [newComment] = React.useState({ name: '', email: '', text: '' });
    const aiRef = useRef<GoogleGenAI | null>(null);
    
    const fullArticleText = useMemo(() => {
        if (!post || !post.content) return '';
        const textParts = [post.title];
        if (post.content.paragraphs) {
            textParts.push(...post.content.paragraphs);
        }
        if (post.content.list) {
            textParts.push(...post.content.list);
        }
        return textParts.join('\n\n');
    }, [post]);

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
        cancel();
    }, [projectId, cancel]);

    if (!post) {
        return <PageLayout id={id}><div className="info-card">Loading project...</div></PageLayout>;
    }

    const handleRelatedPostClick = (newProjectId: string) => {
        cancel();
        if (onNavigate) {
            onNavigate(`project-${newProjectId}`);
        }
    };

    const handleToggleReadAloud = () => {
        if (!fullArticleText.trim() || !isAiVoiceOn) return;

        if (isSpeaking) {
            cancel();
        } else {
            // Using the professional male voice as priority if available
            speak(fullArticleText, { voiceName: selectedAiVoiceName, lang: language });
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
                <div className="project-post-nav-header">
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
                                                {isAiVoiceOn && (
                                                    <div className="project-post-voice-reader-container">
                                                        <div className="audio-player-widget">
                                                             <button 
                                                                className={`audio-player-button ${isSpeaking ? 'speaking' : 'idle-glow'}`}
                                                                onClick={handleToggleReadAloud}
                                                                aria-label={isSpeaking ? pageData.pauseReading : pageData.readAloud}
                                                            >
                                                                {isSpeaking ? <Icons.PauseIcon /> : <Icons.PlayIcon />}
                                                             </button>
                                                             <div className="audio-player-info">
                                                                <span className="audio-player-title">
                                                                    {isSpeaking ? pageData.nowPlaying : pageData.listenToArticle}
                                                                </span>
                                                                {isSpeaking && (
                                                                    <div className="audio-visualizer">
                                                                        <span></span><span></span><span></span><span></span>
                                                                    </div>
                                                                )}
                                                             </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="project-post-body">
                                            {post.content.paragraphs.map((p: string, index: number) => <p key={index}>{p}</p>)}
                                            {post.content.list && (
                                                <ul>
                                                    {post.content.list.map((item: string, index: number) => <li key={index}>{item}</li>)}
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
                                            
                                            <form className="comment-form">
                                                <div className="comment-form-grid">
                                                    <input 
                                                        type="text" 
                                                        name="name"
                                                        placeholder={pageData.namePlaceholder} 
                                                        value={newComment.name}
                                                        readOnly
                                                    />
                                                    <input 
                                                        type="email"
                                                        name="email" 
                                                        placeholder={pageData.emailPlaceholder}
                                                        value={newComment.email}
                                                        readOnly
                                                    />
                                                </div>
                                                <textarea 
                                                    name="text"
                                                    placeholder={pageData.commentPlaceholder}
                                                    value={newComment.text}
                                                    readOnly
                                                ></textarea>
                                                <button type="submit" className="btn btn-primary" disabled>{pageData.submitComment}</button>
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
