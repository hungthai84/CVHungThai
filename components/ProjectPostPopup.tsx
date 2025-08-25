import React, { useMemo, useEffect, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useTheme } from '../contexts/ThemeContext';
import PageLayout from './PageLayout';
import InfoBadge from './InfoBadge';

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
    const post = useMemo(() => (t.projectPosts as any)[projectId], [projectId, t]);
    const { isAiVoiceOn, selectedAiVoiceName } = useTheme();
    const { speak, cancel, isSpeaking } = useSpeechSynthesis();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [comments] = React.useState<Comment[]>([]);
    const [newComment] = React.useState({ name: '', email: '', text: '' });

    const allProjects = t.projectsPage.projects;
    const relatedPosts = useMemo(() => {
        if (!post) return [];
        const currentProject = allProjects.find(p => p.id === projectId);
        if (!currentProject) return [];
        return allProjects
            .filter(p => p.group === currentProject.group && p.id !== projectId)
            .slice(0, 4); 
    }, [projectId, post, allProjects]);

    const fullTextToRead = useMemo(() => {
        if (!post) return '';
        return [post.title, ...post.content.paragraphs].join('. ');
    }, [post]);

    useEffect(() => {
        // Cancel speech synthesis when component unmounts or projectId changes
        return () => {
            cancel(); 
        };
    }, [projectId, cancel]);

    // Scroll to top when the project ID changes
    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0);
    }, [projectId]);
    
    if (!post) {
        return <PageLayout id={id}><div className="info-card">Loading project...</div></PageLayout>;
    }

    const handleRelatedPostClick = (newProjectId: string) => {
        cancel();
        if (onNavigate) {
            onNavigate(`project-${newProjectId}`);
        }
    };

    const handleTogglePlayback = () => {
        if (isSpeaking) {
            cancel();
        } else {
            speak(fullTextToRead, { voiceName: selectedAiVoiceName, lang: language });
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
                        text={t.projectPostPopup.badge}
                        tooltipTitle={t.projectPostPopup.tooltipTitle}
                        tooltipText={t.projectPostPopup.tooltipText}
                    />
                    <button
                        onClick={() => onNavigate?.('projects')}
                        className="btn btn-secondary"
                    >
                        <Icons.ChevronLeftIcon size={18} />
                        <span>{t.projectPostPopup.backToProjects}</span>
                    </button>
                </div>

                 <div className="project-post-scroll-content no-scrollbar" ref={scrollRef}>
                    <main className="project-post-main">
                        <div className="project-post-content-wrapper">
                            <div className="project-hero-container">
                                {post.heroImage && <img src={post.heroImage} alt={post.title} className="project-post-hero-image-bg" />}
                                <div className="project-hero-container-inner">
                                    <h1 className="project-post-title on-banner">{post.title}</h1>
                                    {isAiVoiceOn && (
                                        <div className="project-post-voice-reader-container">
                                            <div className="audio-player-widget">
                                                <button 
                                                    className={`audio-player-button ${isSpeaking ? 'speaking' : 'idle-glow'}`}
                                                    onClick={handleTogglePlayback}
                                                    aria-label={isSpeaking ? t.projectPostPopup.pauseReading : t.projectPostPopup.readAloud}
                                                >
                                                    {isSpeaking ? <Icons.PauseIcon /> : <Icons.PlayIcon />}
                                                </button>
                                                <div className="audio-player-info">
                                                    <span className="audio-player-title">
                                                        {isSpeaking ? t.projectPostPopup.nowPlaying : t.projectPostPopup.listenToArticle}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="project-post-layout-grid">
                                <div className="project-post-main-content">
                                    <div className="project-article-card">
                                        <div className="project-post-meta">
                                            <span>{post.date}</span>
                                            <div className="project-post-tags">
                                                {post.tags.map((tag: string) => <span key={tag}>#{tag}</span>)}
                                            </div>
                                        </div>
                                        
                                        <div className="project-post-body">
                                            {post.content.paragraphs.map((p: string, index: number) => <p key={index}>{p}</p>)}
                                            {post.content.list && (
                                                <ul>
                                                    {post.content.list.map((item: string, index: number) => <li key={index}>{item}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                
                                    <div className="project-post-sidebar">
                                        {relatedPosts.length > 0 && (
                                            <div className="sidebar-widget">
                                                <h4 className="sidebar-widget-title">{t.projectPostPopup.relatedPosts}</h4>
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
                                        <div className="sidebar-widget">
                                            <h4 className="sidebar-widget-title">Sơ đồ tư duy</h4>
                                            <img src="https://i.postimg.cc/k47jVzZk/S-t-duy.png" alt="Sơ đồ tư duy" style={{width: '100%', borderRadius: '10px', border: 'var(--color-brand-glass-border)'}}/>
                                        </div>
                                        <div className="sidebar-widget">
                                            <h4 className="sidebar-widget-title">Tài liệu tham khảo</h4>
                                            <ul className="reference-links-list">
                                                <li><a href="https://www.atlassian.com/agile/kanban" target="_blank" rel="noopener noreferrer">Kanban Methodology Guide</a></li>
                                                <li><a href="https://www.atlassian.com/agile" target="_blank" rel="noopener noreferrer">Agile Project Management Basics</a></li>
                                                <li><a href="https://www.zendesk.com/blog/customer-service-best-practices/" target="_blank" rel="noopener noreferrer">Customer Service Best Practices</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="sidebar-widget comments-widget">
                                        <h4 className="sidebar-widget-title">{t.projectPostPopup.comments} ({comments.length})</h4>
                                        
                                        <form className="comment-form">
                                            <div className="comment-form-grid">
                                                <input 
                                                    type="text" 
                                                    name="name"
                                                    placeholder={t.projectPostPopup.namePlaceholder} 
                                                    value={newComment.name}
                                                    readOnly
                                                />
                                                <input 
                                                    type="email"
                                                    name="email" 
                                                    placeholder={t.projectPostPopup.emailPlaceholder}
                                                    value={newComment.email}
                                                    readOnly
                                                />
                                            </div>
                                            <textarea 
                                                name="text"
                                                placeholder={t.projectPostPopup.commentPlaceholder}
                                                value={newComment.text}
                                                readOnly
                                            ></textarea>
                                            <button type="submit" className="btn btn-primary" disabled>{t.projectPostPopup.submitComment}</button>
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
        </PageLayout>
    );
};

export default ProjectPostPage;