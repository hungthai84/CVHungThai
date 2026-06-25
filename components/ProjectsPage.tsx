import React, { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';
import { useTheme } from '../contexts/ThemeContext';
import ProjectCard from './ProjectCard';
import ProjectFilters from './ProjectFilters';

// --- Type definitions ---
export interface Project {
    id: string;
    title: string;
    description: string;
    group: string;
    stage: string;
    hashtags: string[];
    imageUrl: string;
}

interface ProjectsPageProps {
    id?: string;
    onNavigate?: (key: string) => void;
}

export type ViewMode = 'grid' | 'list' | 'masonry';

// Helper to safely parse JSON from localStorage
function safeJSONParse<T>(item: string | null, fallback: T): T {
    if (!item) return fallback;
    try {
        const parsed = JSON.parse(item);
        if (Array.isArray(fallback) && Array.isArray(parsed)) {
            return parsed as T;
        }
        if (typeof parsed === typeof fallback) {
            return parsed as T;
        }
        return fallback;
    } catch (e) {
        return fallback;
    }
}


// --- Main Page Component ---
export const ProjectsPage: React.FC<ProjectsPageProps> = ({ id, onNavigate }) => {
    const { t } = useI18n();
    const { projectFilter, setProjectFilter } = useTheme();
    const pageData = t.projectsPage;
    const allProjects: Project[] = pageData.projects || [];

    // --- State Management ---
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    
    // --- Data processing for filters ---
    const allGroups = useMemo(() => Array.from(new Set(allProjects.map(p => p.group))), [allProjects]);
    const allStages = useMemo(() => Array.from(new Set(allProjects.map(p => p.stage))).sort((a, b) => parseInt(a) - parseInt(b)), [allProjects]);
    const allHashtags = useMemo(() => Array.from(new Set(allProjects.flatMap(p => p.hashtags))).sort(), [allProjects]);

    // --- Load state from localStorage on mount ---
    useEffect(() => {
        const savedViewMode = localStorage.getItem('projectsViewMode') as ViewMode | null;
        if (savedViewMode && ['grid', 'list', 'masonry'].includes(savedViewMode)) {
            setViewMode(savedViewMode);
        }
        
        const savedGroups = safeJSONParse<string[]>(localStorage.getItem('projectsSelectedGroups'), []);
        const savedStages = safeJSONParse<string[]>(localStorage.getItem('projectsSelectedStages'), []);
        if (Array.isArray(savedGroups)) setSelectedGroups(savedGroups);
        if (Array.isArray(savedStages)) setSelectedStages(savedStages);
    }, []);

    // --- Save state to localStorage on change ---
    useEffect(() => { localStorage.setItem('projectsViewMode', viewMode); }, [viewMode]);
    useEffect(() => { localStorage.setItem('projectsSelectedGroups', JSON.stringify(selectedGroups)); }, [selectedGroups]);
    useEffect(() => { localStorage.setItem('projectsSelectedStages', JSON.stringify(selectedStages)); }, [selectedStages]);

    // --- Filtering logic ---
    const filteredProjects = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return allProjects.filter(project => {
            const groupMatch = selectedGroups.length === 0 || selectedGroups.includes(project.group);
            const stageMatch = selectedStages.length === 0 || selectedStages.includes(project.stage);
            const hashtagMatch = projectFilter.length === 0 || project.hashtags.some(tag => projectFilter.includes(tag));
            const searchMatch = searchTerm.trim() === '' ||
                project.title.toLowerCase().includes(lowercasedSearchTerm) ||
                project.description.toLowerCase().includes(lowercasedSearchTerm);
            return groupMatch && stageMatch && hashtagMatch && searchMatch;
        });
    }, [allProjects, selectedGroups, selectedStages, projectFilter, searchTerm]);
    
    const handleCardClick = (projectId: string) => {
        if (onNavigate && (t.projectPosts as any)[projectId]) {
            onNavigate(`project-${projectId}`);
        }
    };

    // --- Render ---
    return (
        <PageLayout id={id}>
            <div className="info-card projects-page-container">
                <InfoBadge
                    icon={<Icons.CubeIcon />}
                    text={pageData.badge}
                    tooltipTitle={pageData.tooltipTitle}
                    tooltipText={pageData.tooltipText}
                    style={{ marginBottom: '1.5rem' }}
                />
                
                <ProjectFilters
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    allGroups={allGroups}
                    selectedGroups={selectedGroups}
                    setSelectedGroups={setSelectedGroups}
                    allStages={allStages}
                    selectedStages={selectedStages}
                    setSelectedStages={setSelectedStages}
                    allHashtags={allHashtags}
                    projectFilter={projectFilter}
                    setProjectFilter={setProjectFilter}
                />

                <div className="projects-grid-wrapper no-scrollbar">
                    {filteredProjects.length > 0 ? (
                        <div className={`projects-grid view-${viewMode}`}>
                            {filteredProjects.map((project) => (
                                <div
                                    key={project.id}
                                    style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}
                                >
                                    <ProjectCard
                                        project={project}
                                        viewMode={viewMode}
                                        hasPost={!!(t.projectPosts as any)[project.id]}
                                        onClick={() => handleCardClick(project.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-brand-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                            <Icons.CubeIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }}/>
                            <p>Không có dự án nào khớp với bộ lọc của bạn.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
};