import React, { useState } from 'react';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import { useTheme } from '../contexts/ThemeContext';

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
}

const Sidebar: React.FC<SidebarProps> = ({ 
    navStructure,
    activeItemKey, 
    setActiveItemKey,
    isMobile
}) => {
    const { t, language } = useI18n();
    const { themeMode, setThemeMode } = useTheme();
    const navLabels = t.sidebar.nav;
    const [searchQuery, setSearchQuery] = useState('');

    const handleNavClick = (pageKey: string) => {
        setActiveItemKey(pageKey);
    };

    // Filter navigation menu items based on search query
    const filteredNav = navStructure
        .filter(item => item.showInMenu !== false)
        .filter(item => {
            const label = navLabels[item.tKey as keyof typeof navLabels] || item.tKey;
            return label.toLowerCase().includes(searchQuery.toLowerCase());
        });

    return (
        <aside className="left-sidebar no-scrollbar">
            {/* Search Bar at the top of Sidebar */}
            <div className="sidebar-search-container">
                <div className="sidebar-search-inner" title={language === 'vi' ? 'Tìm kiếm danh mục' : 'Search categories'}>
                    <Icons.SearchIcon className="sidebar-search-icon" size={16} aria-hidden="true" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={language === 'vi' ? 'Tìm nhanh...' : 'Search...'}
                        className="sidebar-search-input"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')} 
                            className="sidebar-search-clear"
                            title={language === 'vi' ? 'Xóa nội dung' : 'Clear search'}
                        >
                            <Icons.XMarkIcon size={12} />
                        </button>
                    )}
                </div>
            </div>

            <nav className="main-menu">
                <ul>
                    {filteredNav.map((item) => {
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
                                    data-key={item.key}
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
                    {filteredNav.length === 0 && (
                        <li style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-brand-text-secondary)' }}>
                            {language === 'vi' ? 'Không tìm thấy trang' : 'No pages found'}
                        </li>
                    )}
                </ul>
            </nav>
            {isMobile && (
                <div className="mobile-theme-toggle" style={{ padding: '1rem', borderTop: '1px solid var(--color-brand-glass-border)' }}>
                     <button
                        onClick={() => {
                            setThemeMode(themeMode === 'light' ? 'dark' : 'light');
                        }}
                        className="flex items-center gap-2 text-sm w-full"
                        aria-label="Toggle theme"
                    >
                        {themeMode === 'light' ? <Icons.MoonIcon size={18} /> : <Icons.SunIcon size={18} />}
                        {themeMode === 'light' ? (language === 'vi' ? 'Chế độ tối' : 'Dark mode') : (language === 'vi' ? 'Chế độ sáng' : 'Light mode')}
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;