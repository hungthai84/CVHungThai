import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

// --- Type definitions ---
interface Project {
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

type ViewMode = 'grid' | 'list' | 'masonry';

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
    const pageData = t.projectsPage;
    const allProjects: Project[] = pageData.projects || [];

    // --- State Management ---
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedStages, setSelectedStages] = useState<string[]>([]);
    const [isGroupDropdownOpen, setGroupDropdownOpen] = useState(false);
    const [isStageDropdownOpen, setStageDropdownOpen] = useState(false);
    
    const groupDropdownRef = useRef<HTMLDivElement>(null);
    const stageDropdownRef = useRef<HTMLDivElement>(null);
    
    // --- Data processing for filters ---
    const allGroups = useMemo(() => Array.from(new Set(allProjects.map(p => p.group))), [allProjects]);
    const allStages = useMemo(() => Array.from(new Set(allProjects.map(p => p.stage))).sort((a, b) => parseInt(a) - parseInt(b)), [allProjects]);

    // --- Load state from localStorage on mount ---
    useEffect(() => {
        const savedViewMode = localStorage.getItem('projectsViewMode') as ViewMode | null;
        const savedGroups = safeJSONParse<string[]>(localStorage.getItem('projectsSelectedGroups'), []);
        const savedStages = safeJSONParse<string[]>(localStorage.getItem('projectsSelectedStages'), []);
        
        if (savedViewMode && ['grid', 'list', 'masonry'].includes(savedViewMode)) {
            setViewMode(savedViewMode);
        }
        if (Array.isArray(savedGroups)) setSelectedGroups(savedGroups);
        if (Array.isArray(savedStages)) setSelectedStages(savedStages);
    }, []);

    // --- Save state to localStorage on change ---
    useEffect(() => { localStorage.setItem('projectsViewMode', viewMode); }, [viewMode]);
    useEffect(() => { localStorage.setItem('projectsSelectedGroups', JSON.stringify(selectedGroups)); }, [selectedGroups]);
    useEffect(() => { localStorage.setItem('projectsSelectedStages', JSON.stringify(selectedStages)); }, [selectedStages]);

    // --- Filtering logic ---
    const filteredProjects = useMemo(() => {
        return allProjects.filter(project => {
            const groupMatch = selectedGroups.length === 0 || selectedGroups.includes(project.group);
            const stageMatch = selectedStages.length === 0 || selectedStages.includes(project.stage);
            return groupMatch && stageMatch;
        });
    }, [allProjects, selectedGroups, selectedStages]);

    // --- Dropdown handlers ---
    const handleCheckboxChange = (
        value: string,
        list: string[],
        setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        if (list.includes(value)) {
            setter(list.filter(item => item !== value));
        } else {
            setter([...list, value]);
        }
    };
    
    const useClickOutside = (ref: React.RefObject<HTMLDivElement>, handler: () => void) => {
        useEffect(() => {
            const listener = (event: MouseEvent | TouchEvent) => {
                if (!ref.current || ref.current.contains(event.target as Node)) {
                    return;
                }
                handler();
            };
            document.addEventListener("mousedown", listener);
            document.addEventListener("touchstart", listener);
            return () => {
                document.removeEventListener("mousedown", listener);
                document.removeEventListener("touchstart", listener);
            };
        }, [ref, handler]);
    };
    
    useClickOutside(groupDropdownRef, () => setGroupDropdownOpen(false));
    useClickOutside(stageDropdownRef, () => setStageDropdownOpen(false));

    const handleCardClick = (projectId: string) => {
        if (onNavigate && (t.projectPosts as any)[projectId]) {
            onNavigate(`project-${projectId}`);
        }
    };

    // --- Render ---
    return (
        <PageLayout id={id}>
            <div className="info-card">
                <div className="about-header">
                    <InfoBadge
                        icon={<Icons.CubeIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>
                
                <div className="projects-controls-wrapper">
                    <div className="projects-filters-container">
                        {/* Group Filter */}
                        <div ref={groupDropdownRef} className={`filter-dropdown ${isGroupDropdownOpen ? 'open' : ''}`}>
                            <button
                                className={`filter-dropdown-button ${selectedGroups.length > 0 ? 'active' : ''}`}
                                onClick={() => setGroupDropdownOpen(!isGroupDropdownOpen)}
                            >
                                Phân nhánh {selectedGroups.length > 0 && `(${selectedGroups.length})`}
                                <Icons.ChevronDownIcon size={16} />
                            </button>
                            <div className="filter-dropdown-panel">
                                <div className="panel-content no-scrollbar">
                                    {allGroups.map(group => (
                                        <div key={group} className="filter-checkbox-item">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGroups.includes(group)}
                                                    onChange={() => handleCheckboxChange(group, selectedGroups, setSelectedGroups)}
                                                />
                                                <span className="custom-checkbox"><Icons.CheckIcon size={14} /></span>
                                                {group}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Stage Filter */}
                        <div ref={stageDropdownRef} className={`filter-dropdown ${isStageDropdownOpen ? 'open' : ''}`}>
                            <button
                                className={`filter-dropdown-button ${selectedStages.length > 0 ? 'active' : ''}`}
                                onClick={() => setStageDropdownOpen(!isStageDropdownOpen)}
                            >
                                Giai đoạn {selectedStages.length > 0 && `(${selectedStages.length})`}
                                <Icons.ChevronDownIcon size={16} />
                            </button>
                            <div className="filter-dropdown-panel">
                                 <div className="panel-content no-scrollbar">
                                    {allStages.map(stage => (
                                        <div key={stage} className="filter-checkbox-item">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStages.includes(stage)}
                                                    onChange={() => handleCheckboxChange(stage, selectedStages, setSelectedStages)}
                                                />
                                                <span className="custom-checkbox"><Icons.CheckIcon size={14} /></span>
                                                Giai đoạn {stage}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="view-switcher">
                        <button
                            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Chế độ lưới"
                            aria-label="Grid view"
                        >
                            <Icons.LayoutGridIcon size={18} />
                        </button>
                        <button
                            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Chế độ danh sách"
                            aria-label="List view"
                        >
                            <Icons.ListIcon size={18} />
                        </button>
                        <button
                            className={`view-mode-btn ${viewMode === 'masonry' ? 'active' : ''}`}
                            onClick={() => setViewMode('masonry')}
                            title="Chế độ xếp chồng"
                            aria-label="Masonry view"
                        >
                            <Icons.ColumnsIcon size={18} />
                        </button>
                    </div>
                </div>

                <div className="projects-grid-wrapper no-scrollbar">
                    {filteredProjects.length > 0 ? (
                        <div className={`projects-grid view-${viewMode}`}>
                            {filteredProjects.map((project) => {
                                const hasPost = !!(t.projectPosts as any)[project.id];
                                return (
                                    <div
                                        key={project.id}
                                        className={`project-card-new ${hasPost ? 'has-post' : ''}`}
                                        onClick={() => handleCardClick(project.id)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(project.id); }}
                                        role={hasPost ? "button" : "article"}
                                        tabIndex={hasPost ? 0 : -1}
                                        aria-label={`Xem chi tiết dự án: ${project.title}`}
                                    >
                                        <div className="project-card-new-image">
                                            <img src={project.imageUrl} alt={project.title} loading="lazy" />
                                        </div>
                                        <div className="project-card-new-content">
                                            <div className="project-card-new-header">
                                                <span className="project-card-new-tag group-tag">{project.group}</span>
                                                <span className="project-card-new-tag">{pageData.stageLabel} {project.stage}</span>
                                            </div>
                                            <h4 className="project-card-new-title">
                                                <span className="project-card-new-id">{project.id}</span>. {project.title}
                                            </h4>
                                            <p className="project-card-new-description">{project.description}</p>
                                            <div className="project-card-new-footer">
                                                {project.hashtags.map(tag => <span key={tag} className="project-card-new-hashtag">{tag}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
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
