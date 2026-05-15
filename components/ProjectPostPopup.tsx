
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
    
    const [mindMapUrl, setMindMapUrl] = useState(post.mindMapUrl); // Start with fallback
    const [isGeneratingMap, setIsGeneratingMap] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [embeddingUrl, setEmbeddingUrl] = useState<string | null>(null);

    const { isAiVoiceOn, selectedAiVoiceName } = useTheme();
    const { speak, cancel, isSpeaking } = useSpeechSynthesis();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [comments] = React.useState<Comment[]>([]);
    const [newComment] = React.useState({ name: '', email: '', text: '' });
    const aiRef = useRef<GoogleGenAI | null>(null);
    
    const fullArticleText = useMemo(() => {
        if (!post || !post.content) return '';
        const textParts = [post.title];
        if (post.content.paragraphs) {
            textParts.push(...post.content.paragraphs);
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
        const generateMindMap = async () => {
            const cacheKey = `mindMap_${projectId}_${language}`;
            const cachedUrl = sessionStorage.getItem(cacheKey);
            if (cachedUrl) {
                setMindMapUrl(cachedUrl);
                return;
            }

            setIsGeneratingMap(true);
            setGenerationError(null);

            try {
                if (!process.env.GEMINI_API_KEY) {
                    throw new Error("API key is not configured.");
                }
                if (!aiRef.current) {
                     aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                }

                const summary = post.content.paragraphs.join(' ').substring(0, 800);
                const prompt = `Create a visually appealing and professional mind map in ${language === 'vi' ? 'Vietnamese' : 'English'} summarizing the project: "${post.title}". The central theme should be the project title. Derive the main branches from these key points: "${summary}...". Use a clean, modern aesthetic with relevant icons for clarity. The layout should be balanced and easy to read.`;
                
                const response: any = await aiRef.current.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: prompt }] },
                    config: {
                      imageConfig: {
                        aspectRatio: '16:9',
                      },
                    },
                });

                let imageUrl = '';
                if (response.candidates?.[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                            break;
                        }
                    }
                }

                if (imageUrl) {
                    setMindMapUrl(imageUrl);
                    sessionStorage.setItem(cacheKey, imageUrl);
                } else {
                    throw new Error("No image was generated.");
                }
            } catch (error) {
                console.error("Error generating mind map:", error);
                setGenerationError(pageData.mindMapError);
            } finally {
                setIsGeneratingMap(false);
            }
        };

        if (projectId && post && post.title !== "Thông tin dự án chưa được cập nhật") {
            generateMindMap();
        } else {
            setMindMapUrl(post.mindMapUrl);
            setIsGeneratingMap(false);
            setGenerationError(null);
        }

    }, [projectId, post, language]);

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
                        className="btn btn-secondary"
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
                                        </div>
                                    </div>
                                
                                    <div className="project-post-sidebar">
                                        {relatedPosts.length > 0 && (
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
                                        )}
                                        <div className="sidebar-widget">
                                            <h4 className="sidebar-widget-title">{pageData.sidebarWidgetTitle}</h4>
                                            {isGeneratingMap ? (
                                                <div className="mind-map-loader">
                                                    <Icons.CpuIcon className="animate-spin" size={40} />
                                                    <p>{pageData.generatingMindMap}</p>
                                                </div>
                                            ) : generationError ? (
                                                <div className="mind-map-error">
                                                    <Icons.XMarkIcon size={40} />
                                                    <p>{generationError}</p>
                                                    <img src={post.mindMapUrl} alt={`${pageData.sidebarWidgetTitle} (Fallback)`} style={{width: '100%', borderRadius: '10px'}}/>
                                                </div>
                                            ) : (
                                                <img src={mindMapUrl} alt={pageData.sidebarWidgetTitle} style={{width: '100%', borderRadius: '10px', border: 'var(--color-brand-glass-border)'}}/>
                                            )}
                                        </div>

                                        <div className="sidebar-widget">
                                            <h4 className="sidebar-widget-title">Tài liệu tham khảo</h4>
                                            <ul className="reference-links-list">
                                                {(pageData.referenceLinks || []).map((link: {title: string, url: string}) => (
                                                    <li key={link.title}>
                                                        <a onClick={(e) => { e.preventDefault(); setEmbeddingUrl(link.url); }}>{link.title}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

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
        </PageLayout>
    );
};

export default ProjectPostPage;
