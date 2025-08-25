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
}

const Sidebar: React.FC<SidebarProps> = ({ 
    navStructure,
    activeItemKey, 
    setActiveItemKey, 
}) => {
    const { t } = useI18n();
    const navLabels = t.sidebar.nav;

    const handleNavClick = (pageKey: string) => {
        setActiveItemKey(pageKey);
    };

    return (
        <aside className={`left-sidebar no-scrollbar`}>
            <nav className="main-menu">
                <ul>
                    {navStructure.filter(item => item.showInMenu !== false).map((item) => {
                        const Icon = Icons[item.icon] || Icons.FolderIcon;
                        const label = navLabels[item.tKey as keyof typeof navLabels] || item.tKey;
                        
                        // Determine if the current item is the 'projects' page and if a project post is active
                        const isProjectsParent = item.key === 'projects';
                        const isProjectPostActive = activeItemKey.startsWith('project-');
                        const isActive = activeItemKey === item.key || (isProjectsParent && isProjectPostActive);
                        
                        return (
                            <li key={item.key}>
                                <a
                                    href={`#${item.key}`}
                                    className={isActive ? 'active' : ''}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick(item.key);
                                    }}
                                    aria-label={label}
                                >
                                    <Icon aria-hidden="true" />
                                    <span>{label}</span>
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