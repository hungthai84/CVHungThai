import React from 'react';
import { useI18n } from '../contexts/i18n';
import type { Project } from './ProjectsPage';
import OptimizedImage from './OptimizedImage';

interface ProjectCardProps {
    project: Project;
    hasPost: boolean;
    onClick: () => void;
    groupColor?: string;
}

const STAGE_COLORS: Record<string, string> = {
    '1': '#3b82f6', // Blue
    '2': '#10b981', // Green
    '3': '#f59e0b', // Orange
    '4': '#8b5cf6', // Purple
    '5': '#ef4444', // Red
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, hasPost, onClick }) => {
    const { t } = useI18n();
    const pageData = t.projectsPage;

    const stageColor = STAGE_COLORS[project.stage] || '#3b82f6';

    return (
        <div
            className={`project-card-new ${hasPost ? 'has-post' : ''}`}
            onClick={onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
            role={hasPost ? "button" : "article"}
            tabIndex={hasPost ? 0 : -1}
            aria-label={`Xem chi tiết dự án: ${project.title}`}
            style={{
                borderColor: stageColor,
                borderWidth: '1.5px',
                borderStyle: 'solid'
            }}
        >
            <div className="project-card-new-image">
                <OptimizedImage src={project.imageUrl} alt={project.title} optWidth={600} optQuality={70} hoverScale />
            </div>
            <div className="project-card-new-content relative flex flex-col flex-1 p-4">
                <div className="flex flex-col gap-1 mb-2">
                    <span 
                        className="project-card-new-hashtag whitespace-nowrap text-[10px] px-1.5 py-0.5 leading-none w-fit font-semibold"
                        style={{ backgroundColor: `${stageColor}15`, color: stageColor, borderColor: `${stageColor}40`, borderWidth: '1px', borderStyle: 'solid', borderRadius: '4px' }}
                    >
                        {pageData.stageLabel} {project.stage}
                    </span>
                    <h4 className="project-card-new-title mb-0 pr-8">
                        <span className="project-card-new-id">{project.id}</span>. {project.title}
                    </h4>
                </div>
                <p className="project-card-new-description mt-2">{project.description}</p>
                <div className="project-card-new-footer flex flex-nowrap overflow-hidden gap-1 mt-auto pt-2">
                    <span className="project-card-new-hashtag whitespace-nowrap text-[10px] px-1.5 py-0.5 leading-none">
                        {project.group}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
