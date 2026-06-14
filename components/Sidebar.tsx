import React, { useState } from 'react';
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
    isSidebarHidden?: boolean;
    setIsSidebarHidden?: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    navStructure,
    activeItemKey, 
    setActiveItemKey, 
    isMobile = false,
    isSidebarHidden = false,
    setIsSidebarHidden,
}) => {
    const { t, language } = useI18n();
    const navLabels = t.sidebar.nav;
    const [searchQuery, setSearchQuery] = useState('');

    const handleNavClick = (pageKey: string) => {
        setActiveItemKey(pageKey);
    };

    const handleHideSidebar = () => {
        if (setIsSidebarHidden) {
            setIsSidebarHidden(true);
            localStorage.setItem('isSidebarHidden', 'true');
        }
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

            {/* Sidebar Toggle Button - Vertically Centered */}
            {!isMobile && setIsSidebarHidden && (
                <button
                    onClick={handleHideSidebar}
                    className="sidebar-hide-btn-middle"
                    title={language === 'vi' ? 'Ẩn hoàn toàn sidebar' : 'Hide sidebar completely'}
                    aria-label="Hide sidebar"
                    style={{
                        position: 'absolute',
                        right: '-14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--card-border)',
                        color: 'var(--color-brand-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 100,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        transition: 'all 0.25s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-brand-active-menu-bg)';
                        e.currentTarget.style.color = 'var(--color-brand-orange)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                        e.currentTarget.style.color = 'var(--color-brand-text-secondary)';
                    }}
                >
                    <Icons.ChevronLeftIcon size={16} />
                </button>
            )}

        </aside>
    );
};

export default Sidebar;