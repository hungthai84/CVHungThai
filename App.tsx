import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import Sidebar from './components/Sidebar';
import SkillsPage from './components/SkillsPage';
import CoverLetter from './components/CoverLetter';
import MemoriesPage from './components/MemoriesPage';
import { ProjectsPage } from './components/ProjectsPage';
import CursorEffect from './components/CursorEffect';
import MainContent from './components/MainContent';
import AiChatPage from './components/AiChatPage';
import * as Icons from './components/Icons';
import { useTheme } from './contexts/ThemeContext';
import { useI18n } from './contexts/i18n';
import EducationPage from './components/EducationPage';
import ServicesPage from './components/ServicesPage';
import ProjectPostPopup from './components/ProjectPostPopup';
import AchievementsPage from './components/AchievementsPage';
import SettingsPage from './components/SettingsPanel';
import WorkExperiencePage from './components/WorkExperiencePage';
import MobileHeader from './components/MobileHeader';
import PermissionNotice from './components/PermissionNotice';
import SchedulerPage from './components/SchedulerPage';
import PrintableView from './components/PrintableView';
import LanguageSwitcher from './components/LanguageSwitcher';
import ClockWeatherWidget from './components/ClockWeatherWidget';
import { AboutPage } from './components/AboutPage';


const baseNavStructure: {
    key: string;
    tKey: string;
    icon: keyof typeof Icons;
    component: React.FC<any>;
    showInMenu?: boolean;
}[] = [
    { key: 'home', tKey: 'home', icon: 'HomeIcon', component: MainContent },
    { key: 'coverLetter', tKey: 'coverLetter', icon: 'DocumentTextIcon', component: CoverLetter },
    { key: 'about', tKey: 'about', icon: 'UserIcon', component: AboutPage },
    { key: 'experience', tKey: 'experience', icon: 'BriefcaseIcon', component: WorkExperiencePage },
    { key: 'education', tKey: 'education', icon: 'AcademicCapIcon', component: EducationPage },
    { key: 'services', tKey: 'services', icon: 'LayersIcon', component: ServicesPage },
    { key: 'skills', tKey: 'skills', icon: 'WrenchScrewdriverIcon', component: SkillsPage },
    { 
        key: 'projects', 
        tKey: 'projects', 
        icon: 'CubeIcon', 
        component: ProjectsPage,
    },
    { key: 'achievements', tKey: 'achievements', icon: 'TrophyIcon', component: AchievementsPage },
    { key: 'memories', tKey: 'memories', icon: 'CameraIcon', component: MemoriesPage },
    { key: 'scheduler', tKey: 'scheduler', icon: 'CalendarDaysIcon', component: SchedulerPage, showInMenu: false },
    { key: 'aiChat', tKey: 'aiChat', icon: 'BotIcon', component: AiChatPage, showInMenu: false },
    { key: 'settings', tKey: 'settings', icon: 'SettingsIcon', component: SettingsPage, showInMenu: false },
];

const App: React.FC = () => {
    const { t } = useI18n();
    const { isSoundOn, wallpaper } = useTheme();
    const projectPostPages = t.projectsPage.projects.map(p => ({
        key: `project-${p.id}`,
        tKey: p.title,
        icon: 'DocumentTextIcon' as keyof typeof Icons,
        component: ProjectPostPopup,
        showInMenu: false,
    }));
    
    const allPages = [...baseNavStructure, ...projectPostPages];
    const pageKeys = allPages.map(p => p.key);
    const mainPages = baseNavStructure.filter(p => p.showInMenu !== false);
    const mainPageKeys = mainPages.map(p => p.key);
    
    const [activeIndex, setActiveIndex] = useState(0);
    const pageContainerRef = useRef<HTMLDivElement>(null);
    const [isSocialsOpen, setIsSocialsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
    const [showPermissionNotice, setShowPermissionNotice] = useState(false);
    const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);


    const clickSound = useRef(new Audio('https://rainbowit.net/themes/inbio/wp-content/themes/inbio/template-parts/audio/link-hover-and-click.wav'));
    
    useEffect(() => {
        clickSound.current.volume = 0.3;
    }, []);

    const playClickSound = () => {
        clickSound.current.currentTime = 0;
        clickSound.current.play().catch(() => {});
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 767);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const checkPermissions = async () => {
            if (!navigator.permissions) return;
            try {
                // Query for both microphone and geolocation permissions
                const microPromise = navigator.permissions.query({ name: 'microphone' as PermissionName });
                const geoPromise = navigator.permissions.query({ name: 'geolocation' as PermissionName });
                
                const [microStatus, geoStatus] = await Promise.all([microPromise, geoPromise]);

                // Show the notice if either permission is in the 'prompt' state
                if (microStatus.state === 'prompt' || geoStatus.state === 'prompt') {
                    setShowPermissionNotice(true);
                }
            } catch (error) {
                console.warn("Could not query permissions:", error);
            }
        };
        checkPermissions();
    }, []);
    
    const socialLinks = [
        { title: "Cá nhân", icon: 'UserIcon', url: "https://www.nguyenhungthai.powerservice.one/" },
        { title: "P.Dịch Vụ Khách Hàng", icon: 'LifebuoyIcon', url: "https://www.servicedesk.powerservice.one/" },
        { title: "Hỗ trợ nội bộ", icon: 'WrenchScrewdriverIcon', url: "https://www.supportcenter.powerservice.one/" },
        { title: "Hỗ trợ khách hàng", icon: 'UsersIcon', url: "https://www.helpcenter.powerservice.one/" },
        { title: "Quản lý file văn phòng", icon: 'FolderIcon', url: "https://powerservice.sg.larksuite.com/next/messenger/" },
        { title: "Hệ thống CRM Demo", icon: 'ServerIcon', url: "https://home.zoho.com/home#all" },
        { title: "Linkedin", icon: 'LinkedinIcon', url: "https://www.linkedin.com/in/hungthai.1984/" },
        { title: "Facebook", icon: 'FacebookIcon', url: "https://facebook.com/hungthai.1984" },
        { title: "Website", icon: 'GlobeAltIcon', url: "https://www.nguyenhungthai.powerservice.one/" },
        { title: "Blogspot", icon: 'BookOpenIcon', url: "https://chiasetrithucconhan.blogspot.com/" }
    ];

    // Ensure the view starts at the top on initial load
    useEffect(() => {
        if (isMobile) {
            window.scrollTo(0, 0);
        } else {
            pageContainerRef.current?.scrollTo(0, 0);
        }
    }, [isMobile]);
    
    const handleSetPage = (key: string) => {
        const newIndex = pageKeys.findIndex(pKey => pKey === key);
        if (newIndex !== -1 && newIndex !== activeIndex) {
            // Scroll to top before changing page content
            const scrollTarget = isMobile ? window : pageContainerRef.current;
            scrollTarget?.scrollTo({ top: 0, behavior: 'auto' });
            
            // Use view transitions if available
            if ((document as any).startViewTransition) {
                 (document as any).startViewTransition(() => setActiveIndex(newIndex));
            } else {
                setActiveIndex(newIndex);
            }
        } else if (newIndex !== -1 && newIndex === activeIndex) {
            // If clicking the same page, scroll to top
            const scrollTarget = isMobile ? window : pageContainerRef.current;
            scrollTarget?.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const loader = document.getElementById('line-loader');
        if (loader) {
            const timer = setTimeout(() => {
                loader.classList.add('preloaded');
                setTimeout(() => loader.remove(), 2000); 
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        const handleInteraction = (event: MouseEvent) => {
            if (!isSoundOn) return;
            
            const target = event.target as HTMLElement;
            if (target.closest('a, button, [role="button"], .toggle-slider, .timeline-milestone')) {
                playClickSound();
            }
        };

        document.addEventListener('mousedown', handleInteraction);
        return () => document.removeEventListener('mousedown', handleInteraction);
    }, [isSoundOn]);
    
    useEffect(() => {
        const currentKey = pageKeys[activeIndex];
        const prevKey = pageKeys.find(key => document.body.classList.contains(`on-page-${key}`));
        if (prevKey) {
            document.body.classList.remove(`on-page-${prevKey}`);
        }
        if (currentKey) {
            document.body.classList.add(`on-page-${currentKey}`);
        }

        if (isPrintViewOpen) {
            document.body.classList.add('popup-open');
        } else {
            document.body.classList.remove('popup-open');
        }

    }, [activeIndex, isPrintViewOpen, pageKeys]);
    
    const activePageItem = allPages[activeIndex] || allPages[0];
    const activePageTitle = t.sidebar.nav[activePageItem?.tKey as keyof typeof t.sidebar.nav] || activePageItem?.tKey || t.sidebar.nav.home;


    const handleSetPageAndCloseMenu = (key: string) => {
        handleSetPage(key);
        setIsMobileMenuOpen(false);
    };

    const sidebarProps = {
        navStructure: baseNavStructure,
        activeItemKey: pageKeys[activeIndex],
        setActiveItemKey: isMobile ? handleSetPageAndCloseMenu : handleSetPage,
    };
    
    const ActivePageComponent = allPages[activeIndex]?.component;
    const activePageKey = pageKeys[activeIndex];
    const componentProps: any = {
        key: activePageKey,
        id: activePageKey,
        onNavigate: handleSetPage,
    };
    if (activePageKey && activePageKey.startsWith('project-')) {
        componentProps.projectId = activePageKey.replace('project-', '');
    }

    const currentMainPageIndex = mainPageKeys.indexOf(activePageKey);
    const isOnMainPage = currentMainPageIndex !== -1;
    const isLastMainPage = isOnMainPage && currentMainPageIndex === mainPageKeys.length - 1;
    const canGoPrev = isOnMainPage && currentMainPageIndex > 0;
    
    const handleNextPage = () => {
        if (!isLastMainPage && isOnMainPage) {
            handleSetPage(mainPageKeys[currentMainPageIndex + 1]);
        }
    };

    const handlePrevPage = () => {
        if (canGoPrev) {
            handleSetPage(mainPageKeys[currentMainPageIndex - 1]);
        }
    };
    
    const handleGoToTop = () => {
        handleSetPage(mainPageKeys[0]);
    };

    const handlePrint = () => {
        window.print();
    };
    
    const PageNavButtons = () => (
        <>
            {canGoPrev && (
                <button onClick={handlePrevPage} className="header-icon-button page-nav-button" aria-label="Previous Page" title="Trang trước">
                    <Icons.ChevronUpIcon size={22} />
                </button>
            )}
            {isOnMainPage && (
                isLastMainPage ? (
                    <button onClick={handleGoToTop} className="header-icon-button page-nav-button" aria-label="Back to Top" title="Về đầu trang">
                        <Icons.ArrowUpIcon size={22} />
                    </button>
                ) : (
                    <button onClick={handleNextPage} className="header-icon-button page-nav-button" aria-label="Next Page" title="Trang sau">
                        <Icons.ChevronDownIcon size={22} />
                    </button>
                )
            )}
        </>
    );

    const isVideo = wallpaper.startsWith('https');
    const isCustomOrbiting = wallpaper === 'orbiting-planets';
    const isCustomDotted = wallpaper === 'dotted-pattern';
    const isCustomDarkDotted = wallpaper === 'dark-dotted-pattern';

    return (
        <>
            <div className={`app-background ${isCustomOrbiting ? 'wallpaper-orbiting-planets' : ''} ${isCustomDotted ? 'wallpaper-dotted-pattern' : ''} ${isCustomDarkDotted ? 'wallpaper-dark-dotted-pattern' : ''}`}>
                {isVideo ? (
                    <video 
                        key={wallpaper}
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        className="background-video"
                        src={wallpaper}
                    />
                ) : isCustomOrbiting ? (
                    <div className="holder"></div>
                ) : isCustomDotted || isCustomDarkDotted ? (
                    null
                ) : (
                     <div 
                        className="background-gradient"
                        style={wallpaper !== 'gradient' ? { background: wallpaper } : {}}
                    ></div>
                )}
            </div>
            <CursorEffect />
            
            <div className="site-wrapper">
                 {isMobile ? (
                    <>
                        <MobileHeader
                            title={activePageTitle}
                            onMenuClick={() => setIsMobileMenuOpen(true)}
                            onOpenSettings={() => handleSetPage('settings')}
                            onOpenAiChat={() => handleSetPage('aiChat')}
                            onPrintClick={() => setIsPrintViewOpen(true)}
                            onSchedulerClick={() => handleSetPage('scheduler')}
                        />
                        <div 
                            className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <div onClick={e => e.stopPropagation()}>
                                <Sidebar {...sidebarProps} />
                            </div>
                        </div>
                    </>
                ) : (
                    <Sidebar {...sidebarProps} />
                )}
                
                <main className={`content is-${activePageKey}`}>
                    {activePageKey === 'home' && <LanguageSwitcher />}
                    <div className="page-container no-scrollbar" ref={pageContainerRef}>
                        {ActivePageComponent && <ActivePageComponent {...componentProps} />}
                    </div>
                </main>

                {!isMobile && (
                    <div className="right-panel">
                        <div className="right-panel-top-content">
                            <div className={`avatar-social-container ${isSocialsOpen ? 'open' : ''}`}>
                                <button className="right-panel-avatar-button" onClick={() => setIsSocialsOpen(!isSocialsOpen)} title="Social Links">
                                    <img src="https://i.postimg.cc/0QyHjYN4/Avata-Gif.gif" alt="Avatar" className="right-panel-avatar" />
                                </button>
                                <div className="social-icons-ring" style={{ '--icon-count': socialLinks.length } as React.CSSProperties}>
                                    {socialLinks.map((link: any, index: number) => {
                                        const Icon = Icons[link.icon as keyof typeof Icons] || Icons.LinkIcon;
                                        return (
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" key={link.title} className="social-icon-link" style={{ '--index': index } as React.CSSProperties} title={link.title}>
                                                <Icon size={18}/>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                             <ClockWeatherWidget />
                        </div>

                        <div className="right-panel-middle-controls">
                            <button onClick={() => setIsPrintViewOpen(true)} className="header-icon-button control-printer" aria-label="Print or save as PDF" title="In hoặc lưu PDF">
                                <Icons.PrinterIcon size={22} />
                            </button>
                            <button onClick={() => handleSetPage('scheduler')} className={`header-icon-button control-scheduler ${pageKeys[activeIndex] === 'scheduler' ? 'active' : ''}`} aria-label="Lên lịch hẹn" title="Lên lịch hẹn">
                                <Icons.CalendarDaysIcon size={22} />
                            </button>
                            <button onClick={() => handleSetPage('settings')} className={`header-icon-button control-settings ${pageKeys[activeIndex] === 'settings' ? 'active' : ''}`} aria-label="Settings">
                                <Icons.SettingsIcon size={22} />
                            </button>
                            <button onClick={() => handleSetPage('aiChat')} className={`header-icon-button control-ai-chat ${pageKeys[activeIndex] === 'aiChat' ? 'active' : ''}`} aria-label={t.sidebar.nav.aiChat} title={t.sidebar.nav.aiChat}>
                                <Icons.BotIcon size={22} />
                            </button>
                        </div>
                        <div className="right-panel-bottom-controls">
                            <PageNavButtons />
                        </div>
                    </div>
                )}
            </div>

            {isMobile && isOnMainPage && (
                <div className="mobile-page-nav">
                    <PageNavButtons />
                </div>
            )}
            
            {showPermissionNotice && document.getElementById('popup-root') && createPortal(
                <PermissionNotice onAcknowledge={() => setShowPermissionNotice(false)} />,
                document.getElementById('popup-root')!
            )}

            {isPrintViewOpen && document.getElementById('popup-root') && createPortal(
                <div className="print-preview-overlay">
                    <header className="print-preview-header">
                        <h3 className="print-preview-title">Xem trước bản in</h3>
                        <div className="print-preview-controls">
                            <button onClick={handlePrint} className="header-icon-button" title="Tải file PDF">
                                <Icons.DownloadIcon />
                            </button>
                            <button onClick={() => setIsPrintViewOpen(false)} className="header-icon-button" title="Đóng">
                                <Icons.XMarkIcon />
                            </button>
                        </div>
                    </header>
                    <div className="print-preview-content no-scrollbar">
                        <PrintableView />
                    </div>
                </div>,
                document.getElementById('popup-root')!
            )}
        </>
    );
};

export default App;