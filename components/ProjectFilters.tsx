import React, { useState, useEffect, useRef } from 'react';
import * as Icons from './Icons';
import type { ViewMode } from './project-types';

interface ProjectFiltersProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    allGroups: string[];
    selectedGroups: string[];
    setSelectedGroups: (groups: string[]) => void;
    allStages: string[];
    selectedStages: string[];
    setSelectedStages: (stages: string[]) => void;
    allHashtags: string[];
    projectFilter: string[];
    setProjectFilter: (hashtags: string[]) => void;
}

const FilterDropdown: React.FC<{
    title: string;
    options: string[];
    selectedOptions: string[];
    onSelectionChange: (value: string) => void;
    icon: React.ReactNode;
    itemPrefix?: string;
}> = ({ title, options, selectedOptions, onSelectionChange, icon, itemPrefix = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="filter-dropdown" ref={dropdownRef}>
            <button className="filter-dropdown-button" onClick={() => setIsOpen(!isOpen)}>
                {icon}
                <span>{title} {selectedOptions.length > 0 ? `(${selectedOptions.length})` : ''}</span>
                <Icons.ChevronDownIcon size={16} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
            </button>
            {isOpen && (
                <div className="filter-dropdown-panel no-scrollbar">
                    {options.map(option => (
                        <label key={option} className="filter-dropdown-item">
                            <input
                                type="checkbox"
                                checked={selectedOptions.includes(option)}
                                onChange={() => onSelectionChange(option)}
                            />
                            <span>{itemPrefix}{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};


const ProjectFilters: React.FC<ProjectFiltersProps> = ({
    viewMode,
    setViewMode,
    allGroups,
    selectedGroups,
    setSelectedGroups,
    allStages,
    selectedStages,
    setSelectedStages,
    allHashtags,
    projectFilter,
    setProjectFilter
}) => {
    
    const handleFilterChange = (
        value: string,
        list: string[],
        setter: (newList: string[]) => void
    ) => {
        const newList = list.includes(value)
            ? list.filter(item => item !== value)
            : [...list, value];
        setter(newList);
    };

    return (
        <div className="projects-controls-wrapper">
            <div className="projects-main-controls">
                <div className="project-filters-group">
                    <FilterDropdown
                        title="Phân nhánh"
                        options={allGroups}
                        selectedOptions={selectedGroups}
                        onSelectionChange={(group) => handleFilterChange(group, selectedGroups, setSelectedGroups)}
                        icon={<Icons.FilterIcon size={18} />}
                    />
                     <FilterDropdown
                        title="Giai đoạn"
                        options={allStages}
                        selectedOptions={selectedStages}
                        onSelectionChange={(stage) => handleFilterChange(stage, selectedStages, setSelectedStages)}
                        icon={<Icons.LayersIcon size={18} />}
                        itemPrefix="Giai đoạn "
                    />
                    <FilterDropdown
                        title="Hashtag"
                        options={allHashtags}
                        selectedOptions={projectFilter}
                        onSelectionChange={(tag) => handleFilterChange(tag, projectFilter, setProjectFilter)}
                        icon={<Icons.PencilIcon size={18} />}
                    />
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
        </div>
    );
};

export default ProjectFilters;