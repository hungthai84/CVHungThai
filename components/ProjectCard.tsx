import React from 'react';
import { useI18n } from '../contexts/i18n';
import type { Project, ViewMode } from './ProjectsPage';
import OptimizedImage from './OptimizedImage';

interface ProjectCardProps {
    project: Project;
    viewMode: ViewMode;
    hasPost: boolean;
    onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, hasPost, onClick }) => {
    const { t } = useI18n();
    const pageData = t.projectsPage;

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
            <div className="project-card-new-content">
                <div className="project-card-new-header">
                    <span className="project-card-new-tag group-tag" title={project.group}>{project.group}</span>
                    <span className="project-card-new-tag">{pageData.stageLabel} {project.stage}</span>
                </div>
                <h4 className="project-card-new-title">
                    <span className="project-card-new-id">{project.id}</span>. {project.title}
                </h4>
                <p className="project-card-new-description">{project.description}</p>
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
