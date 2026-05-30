
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

    // Modern Reading Optimization States
    const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
    const [fontStyle, setFontStyle] = useState<'sans' | 'serif' | 'mono'>('sans');
    const [readTheme, setReadTheme] = useState<'default' | 'sepia' | 'mint' | 'slate'>('default');
    const [focusMode, setFocusMode] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    
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

    const wordCount = useMemo(() => {
        if (!fullArticleText) return 0;
        return fullArticleText.trim().split(/\s+/).filter(Boolean).length;
    }, [fullArticleText]);

    const readingTime = useMemo(() => {
        return Math.max(1, Math.ceil(wordCount / 220)); // ~220 WPM standard
    }, [wordCount]);

    const readingLabels = useMemo(() => {
        return language === 'vi' ? {
            wordCount: 'từ',
            readingTime: 'phút đọc',
            fontSize: 'Cỡ chữ',
            bgColor: 'Màu nền đọc',
            focusMode: 'Chế độ tập trung',
            focusModeDesc: 'Ẩn các phần phụ và bốc cục khác, tập trung tối đa đọc báo cáo dự án với bản chiếu rạp rộng rãi.',
            fonts: {
                sans: 'Không chân (Trực quan)',
                serif: 'Có chân (Học thuật)',
                mono: 'Lập trình viên'
            },
            sizes: {
                sm: 'Nhỏ (A-)',
                md: 'Vừa (A)',
                lg: 'Lớn (A+)',
                xl: 'Rất lớn (A++)'
            },
            themes: {
                default: 'Mặc định hệ thống',
                sepia: 'Giấy cổ (Sepia) dịu mắt',
                mint: 'Xanh bạc hà (Bảo vệ mắt)',
                slate: 'Đêm tối dễ chịu'
            }
        } : {
            wordCount: 'words',
            readingTime: 'min read',
            fontSize: 'Font size',
            bgColor: 'Reading layout',
            focusMode: 'Focus Mode',
            focusModeDesc: 'Hide extra widgets, maximize presentation view for deep content reading.',
            fonts: {
                sans: 'Sans-serif (Clean)',
                serif: 'Serif (Academic)',
                mono: 'Monospace'
            },
            sizes: {
                sm: 'Small',
                md: 'Medium',
                lg: 'Large',
                xl: 'X-Large'
            },
            themes: {
                default: 'System theme',
                sepia: 'Classic Sepia',
                mint: 'Mint Cream (Cozy)',
                slate: 'Soft Slate (Dark)'
            }
        };
    }, [language]);

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
        setScrollPercent(0);
    }, [projectId, cancel]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const totalHeight = target.scrollHeight - target.clientHeight;
        if (totalHeight > 0) {
            setScrollPercent((target.scrollTop / totalHeight) * 100);
        }
    };
    
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
            {/* Scoped Dynamic Style Overrides for Advanced Reading Modes */}
            <style dangerouslySetInnerHTML={{ __html: `
                .${projectClass} .project-post-body p, 
                .${projectClass} .project-post-body li {
                    font-size: ${fontSize === 'sm' ? '0.95rem' : fontSize === 'lg' ? '1.18rem' : fontSize === 'xl' ? '1.32rem' : '1.05rem'} !important;
                    line-height: ${fontSize === 'sm' ? '1.75' : fontSize === 'lg' ? '1.9' : fontSize === 'xl' ? '2.05' : '1.82'} !important;
                    font-family: ${fontStyle === 'sans' ? 'inherit' : fontStyle === 'serif' ? 'Georgia, Cambria, "Times New Roman", Times, serif' : 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace'} !important;
                    ${readTheme !== 'default' ? `color: ${readTheme === 'sepia' ? '#3d2e1a' : readTheme === 'mint' ? '#142a1d' : readTheme === 'slate' ? '#e2e8f0' : 'inherit'} !important;` : ''}
                }
                .${projectClass} .project-post-body {
                    transition: all 0.3s ease;
                    ${readTheme !== 'default' ? `background-color: ${readTheme === 'sepia' ? '#faf5eb' : readTheme === 'mint' ? '#edf6f2' : readTheme === 'slate' ? '#0f172a' : 'transparent'} !important; border-bottom-left-radius: 12px !important; border-bottom-right-radius: 12px !important;` : ''}
                }
                .${projectClass} .reading-toolbar button {
                    outline: none;
                }
            `}} />

            <div className={`info-card project-post-page-card ${projectClass} relative overflow-hidden`}> 
                {/* Reading Progress Bar indicator */}
                <div 
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-teal-400 via-indigo-500 to-emerald-400 transition-all duration-100 z-50 shadow-[0_1px_5px_rgba(var(--accent-color-rgb),0.5)]" 
                    style={{ width: `${scrollPercent}%` }}
                />

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

                 <div className="project-post-scroll-content no-scrollbar" ref={scrollRef} onScroll={handleScroll}>
                    <main className="project-post-main">
                        <div className="project-post-content-wrapper">
                            <div className="project-post-layout-grid">
                                <div className={`project-post-main-content transition-all duration-300 ${focusMode ? 'max-w-4xl mx-auto w-full' : ''}`}>
                                    <div className="project-article-card overflow-hidden">
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

                                        {/* OPTIMIZED INDUSTRIAL READING TOOLBAR */}
                                        <div className="reading-toolbar border-b border-dashed border-gray-200 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 select-none transition-colors duration-200">
                                            {/* Article Metrics */}
                                            <div className="flex items-center gap-3 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <Icons.BookOpenIcon size={16} className="text-indigo-500 dark:text-indigo-400" />
                                                    <span>⏱️ ~{readingTime} {readingLabels.readingTime} ({wordCount} {readingLabels.wordCount})</span>
                                                </div>
                                            </div>

                                            {/* Reading Customization Controls */}
                                            <div className="flex items-center flex-wrap gap-4">
                                                {/* Font Size Button Selector */}
                                                <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 border border-gray-200/50 dark:border-gray-800/80">
                                                    {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                                                        <button
                                                            key={sz}
                                                            onClick={() => setFontSize(sz)}
                                                            className={`px-2.5 py-1 text-xs rounded-md transition-all font-semibold ${
                                                                fontSize === sz
                                                                    ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400 border border-gray-200/40 dark:border-gray-700/40'
                                                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                                            }`}
                                                            title={`${readingLabels.fontSize}: ${readingLabels.sizes[sz]}`}
                                                        >
                                                            {sz === 'sm' && 'A-'}
                                                            {sz === 'md' && 'A'}
                                                            {sz === 'lg' && 'A+'}
                                                            {sz === 'xl' && 'A++'}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Serif / Sans / Mono Typeface Selector */}
                                                <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-lg p-0.5 border border-gray-200/50 dark:border-gray-800/80">
                                                    {(['sans', 'serif', 'mono'] as const).map((f) => (
                                                        <button
                                                            key={f}
                                                            onClick={() => setFontStyle(f)}
                                                            className={`px-2.5 py-1 text-xs rounded-md transition-all font-semibold ${
                                                                fontStyle === f
                                                                    ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600 dark:text-indigo-400 border border-gray-200/45 dark:border-gray-700/45'
                                                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                                                            }`}
                                                            style={{ fontFamily: f === 'sans' ? 'sans-serif' : f === 'serif' ? 'Georgia, serif' : 'monospace' }}
                                                            title={readingLabels.fonts[f]}
                                                        >
                                                            {f === 'sans' ? 'Sans' : f === 'serif' ? 'Serif' : 'Mono'}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Dynamic Eyecare Palette */}
                                                <div className="flex items-center gap-1.5 border-l border-gray-200 dark:border-gray-700/60 pl-3">
                                                    {(['default', 'sepia', 'mint', 'slate'] as const).map((th) => {
                                                        let themeBg = '';
                                                        if (th === 'default') {
                                                            themeBg = 'bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700';
                                                        } else if (th === 'sepia') {
                                                            themeBg = 'bg-[#faf5eb] border-[#e4d8c1]';
                                                        } else if (th === 'mint') {
                                                            themeBg = 'bg-[#edf6f2] border-[#c9dfd3]';
                                                        } else if (th === 'slate') {
                                                            themeBg = 'bg-[#0f172a] border-[#1e293b]';
                                                        }

                                                        return (
                                                            <button
                                                                key={th}
                                                                onClick={() => setReadTheme(th)}
                                                                className={`w-6 h-6 rounded-full border cursor-pointer transition-all flex items-center justify-center relative ${
                                                                    readTheme === th ? 'scale-110 ring-2 ring-indigo-500/30' : 'hover:scale-105 opacity-80 hover:opacity-100'
                                                                } ${themeBg}`}
                                                                title={readingLabels.themes[th]}
                                                            >
                                                                {readTheme === th && (
                                                                    <Icons.CheckIcon 
                                                                        size={11} 
                                                                        className={th === 'slate' ? 'text-white' : th === 'sepia' ? 'text-[#3d2e1a]' : th === 'mint' ? 'text-[#142a1d]' : 'text-gray-800 dark:text-white'} 
                                                                    />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {/* Focus Mode Reading Button */}
                                                <button
                                                    onClick={() => setFocusMode(!focusMode)}
                                                    className={`ml-1 px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold overflow-hidden transition-all duration-300 ${
                                                        focusMode
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/45 border-emerald-300 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-400'
                                                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/80'
                                                    }`}
                                                    title={readingLabels.focusModeDesc}
                                                >
                                                    <Icons.SunIcon size={14} className={focusMode ? 'animate-spin scale-110 text-emerald-500 dark:text-emerald-400' : 'text-gray-400'} />
                                                    <span>{readingLabels.focusMode}</span>
                                                </button>
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
                                
                                    {!focusMode && relatedPosts.length > 0 && (
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

                                    {!focusMode && (
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
                                    )}
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
