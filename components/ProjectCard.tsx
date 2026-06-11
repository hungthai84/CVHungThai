import React from 'react';
import { useI18n } from '../contexts/i18n';
import type { Project, ViewMode } from './ProjectsPage';
import OptimizedImage from './OptimizedImage';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useTheme } from '../contexts/ThemeContext';
import * as Icons from './Icons';

interface ProjectCardProps {
    project: Project;
    viewMode: ViewMode;
    hasPost: boolean;
    onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, hasPost, onClick }) => {
    const { t, language } = useI18n();
    const pageData = t.projectsPage;
    const { speak, cancel, isSpeaking } = useSpeechSynthesis();
    const { isAiVoiceOn, selectedAiVoiceName, aiVoicePitch, aiVoiceRate } = useTheme();

    const achievement = React.useMemo(() => {
        const achs = t.achievementsPage?.achievements;
        if (!Array.isArray(achs)) return null;
        return achs.find((a: any) => a.id === project.id || a.title === project.title);
    }, [project.id, project.title, t]);

    const handleReadAloud = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent clicking the card
        if (isSpeaking) {
            cancel();
        } else {
            speak(project.description, { 
                voiceName: selectedAiVoiceName, 
                lang: language,
                pitch: aiVoicePitch,
                rate: aiVoiceRate
            });
        }
    };

    return (
        <div
            className={`project-card-new ${hasPost ? 'has-post' : ''}`}
            onClick={onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
            role={hasPost ? "button" : "article"}
            tabIndex={hasPost ? 0 : -1}
            aria-label={`Xem chi tiết dự án: ${project.title}`}
        >
            <div className="project-card-new-image">
                <OptimizedImage src={project.imageUrl} alt={project.title} optWidth={600} optQuality={70} hoverScale />
            </div>
            <div className="project-card-new-content relative">
                <div className="project-card-new-header flex justify-between items-start">
                    <div className="flex gap-2 flex-wrap">
                        <span className="project-card-new-tag group-tag" title={project.group}>{project.group}</span>
                        <span className="project-card-new-tag">{pageData.stageLabel} {project.stage}</span>
                        {achievement && (
                            <span 
                                className="project-card-new-tag font-semibold flex items-center gap-1 border"
                                style={{ 
                                    color: achievement.color, 
                                    borderColor: achievement.color, 
                                    backgroundColor: `${achievement.color}15`
                                }}
                            >
                                <Icons.TrophyIcon size={11} style={{ color: achievement.color }} />
                                <span>{achievement.rate}%</span>
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex justify-between items-start mt-2">
                    <h4 className="project-card-new-title mb-0 pr-8">
                        <span className="project-card-new-id">{project.id}</span>. {project.title}
                    </h4>
                    {isAiVoiceOn && (
                        <button
                            onClick={handleReadAloud}
                            className={`p-2 rounded-full absolute right-5 top-12 transition-colors ${isSpeaking ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary'}`}
                            aria-label="Read description"
                        >
                            {isSpeaking ? <Icons.PauseIcon size={16} /> : <Icons.PlayIcon size={16} />}
                        </button>
                    )}
                </div>
                <p className="project-card-new-description mt-3">{project.description}</p>
                {hasPost && (
                    <div className="project-card-action">
                        <span className="view-details-btn">
                            {(t as any).detailsButton || "Xem chi tiết"} 
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </span>
                    </div>
                )}
                <div className="project-card-new-footer">
                    {project.hashtags.map(tag => <span key={tag} className="project-card-new-hashtag">{tag}</span>)}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
