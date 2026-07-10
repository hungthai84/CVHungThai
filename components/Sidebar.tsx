import React from 'react';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';

interface NavItem {
    key: string;
    tKey: string;
    icon: keyof typeof Icons;
    component: React.FC<any>;
    showInMenu?: boolean;
}

interface SidebarProps {
    navStructure: NavItem[];
    activeItemKey: string;
    setActiveItemKey: (key: string) => void;
    isMobile?: boolean;
    isCollapsed: boolean;
    toggleSidebar: () => void;
}

const itemColors: Record<string, string> = {
    home: '#22c55e',
    coverLetter: '#06b6d4',
    about: '#f59e0b',
    experience: '#ef4444',
    education: '#8b5cf6',
    services: '#14b8a6',
    skills: '#f97316',
    projects: '#ec4899',
    systems: '#06b6d4',
    interview: '#3b82f6',
    horoscope: '#d946ef',
    memories: '#f43f5e',
    achievements: '#eab308',
    blog: '#a855f7',
    scheduler: '#10b981',
    aiChat: '#6366f1',
    settings: '#64748b',
    print: '#0284c7'
};

const Sidebar: React.FC<SidebarProps> = ({ 
    navStructure,
    activeItemKey, 
    setActiveItemKey,
    isCollapsed,
    toggleSidebar
}) => {
    const { t } = useI18n();
    const navLabels = t.sidebar.nav;
    const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

    const handleNavClick = (pageKey: string) => {
        setActiveItemKey(pageKey);
    };

    return (
        <aside 
            className={`left-sidebar no-scrollbar ${isCollapsed ? '' : 'is-expanded'}`}
            style={{ zIndex: 99999 }}
        >
            <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                {isCollapsed ? <Icons.ChevronRightIcon size={16} /> : <Icons.ChevronLeftIcon size={16} />}
            </button>
            <nav className="main-menu" style={{ overflow: isCollapsed ? 'visible' : 'auto' }}>
                <ul>
                    {navStructure
                        .filter(item => item.showInMenu !== false)
                        .map((item) => {
                            const Icon = Icons[item.icon] || Icons.FolderIcon;
                            const label = navLabels[item.tKey as keyof typeof navLabels] || item.tKey;
                            
                            // Determine if the current item is the 'projects' page and if a project post is active
                            const isProjectsParent = item.key === 'projects';
                            const isProjectPostActive = activeItemKey.startsWith('project-');
                            const isActive = activeItemKey === item.key || (isProjectsParent && isProjectPostActive);
                            
                            const itemColor = itemColors[item.key] || '#ef4444';
                            const isHovered = hoveredKey === item.key;
                            const activeOrHovered = isActive || isHovered;
                            
                            return (
                                <li 
                                    key={item.key} 
                                    className="relative group"
                                    onMouseEnter={() => setHoveredKey(item.key)}
                                    onMouseLeave={() => setHoveredKey(null)}
                                >
                                    <a
                                        href={`#${item.key}`}
                                        className={isActive ? 'active' : ''}
                                        data-key={item.key}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleNavClick(item.key);
                                        }}
                                        aria-label={label}
                                        style={{
                                            color: activeOrHovered ? itemColor : 'var(--color-brand-text-secondary)',
                                            transition: 'color 0.2s ease'
                                        }}
                                    >
                                        <Icon 
                                            aria-hidden="true" 
                                            style={{
                                                color: activeOrHovered ? itemColor : 'var(--color-brand-text-secondary)',
                                                transition: 'color 0.2s ease'
                                            }} 
                                        />
                                        <span 
                                            style={{
                                                color: activeOrHovered ? itemColor : 'var(--color-brand-text-secondary)',
                                                transition: 'color 0.2s ease'
                                            }}
                                        >
                                            {label}
                                        </span>
                                    </a>
                                </li>
                            );
                        })}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;