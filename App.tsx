
import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import * as Icons from './components/Icons';
import { useTheme } from './contexts/ThemeContext';
import { useI18n } from './contexts/i18n';
import MobileHeader from './components/MobileHeader';
import LanguageSwitcher from './components/LanguageSwitcher';
import ClockWeatherWidget from './components/ClockWeatherWidget';

// Lazy load page components to minimize initial bundle size and optimize website load speeds
const SkillsPage = lazy(() => import('./components/SkillsPage'));
const CoverLetter = lazy(() => import('./components/CoverLetter'));
const AiChatPage = lazy(() => import('./components/AiChatPage'));
const EducationPage = lazy(() => import('./components/EducationPage'));
const ServicesPage = lazy(() => import('./components/ServicesPage'));
const ProjectPostPopup = lazy(() => import('./components/ProjectPostPopup'));
const SettingsPage = lazy(() => import('./components/SettingsPanel'));
const WorkExperiencePage = lazy(() => import('./components/WorkExperiencePage'));
const SchedulerPage = lazy(() => import('./components/SchedulerPage'));
const PrintableView = lazy(() => import('./components/PrintableView'));
const AboutPage = lazy(() => import('./components/AboutPage').then(module => ({ default: module.AboutPage })));
const WorkVideoPage = lazy(() => import('./components/WorkVideoPage'));
const InterviewPage = lazy(() => import('./components/InterviewPage'));
const HoroscopePage = lazy(() => import('./components/HoroscopePage'));

// Lazy load heavy components
const ProjectsPage = lazy(() => import('./components/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const MemoriesPage = lazy(() => import('./components/MemoriesPage'));

const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="w-8 h-8 rounded-full border-2 border-t-2 border-[var(--accent-color)] border-t-transparent animate-spin"></div>
    </div>
);


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
    { key: 'horoscope', tKey: 'horoscope', icon: 'SparklesIcon', component: HoroscopePage },
    { key: 'memories', tKey: 'memories', icon: 'CameraIcon', component: MemoriesPage },
    { key: 'interview', tKey: 'interview', icon: 'PresentationIcon', component: InterviewPage },
    { key: 'workVideo', tKey: 'experience', icon: 'BriefcaseIcon', component: WorkVideoPage, showInMenu: false },
    { key: 'scheduler', tKey: 'scheduler', icon: 'CalendarDaysIcon', component: SchedulerPage, showInMenu: false },
    { key: 'aiChat', tKey: 'aiChat', icon: 'BotIcon', component: AiChatPage, showInMenu: false },
    { key: 'settings', tKey: 'settings', icon: 'SettingsIcon', component: SettingsPage, showInMenu: false },
];

const App: React.FC = () => {
    const { t, language } = useI18n();
    const { isSoundOn, wallpaper, themeMode, setThemeMode } = useTheme();

    const { allPages, pageKeys, mainPages, mainPageKeys } = React.useMemo(() => {
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

        return { allPages, pageKeys, mainPages, mainPageKeys };
    }, [t.projectsPage.projects]);
    
    const [activeIndex, setActiveIndex] = useState(0);
    const pageContainerRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const [isSocialsOpen, setIsSocialsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
    const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);


    const clickSound = useRef<HTMLAudioElement | null>(null);
    
    // Parallax effect removed to prevent scroll lag and CPU usage on every render frame
    useEffect(() => {
        const background = backgroundRef.current;
        if (background) {
            background.style.transform = 'translateY(0px)';
        }
    }, [activeIndex]);

    const playClickSound = useCallback(() => {
        if (isSoundOn) {
            if (!clickSound.current) {
                clickSound.current = new Audio('https://rainbowit.net/themes/inbio/wp-content/themes/inbio/template-parts/audio/link-hover-and-click.wav');
                clickSound.current.volume = 0.3;
            }
            clickSound.current.currentTime = 0;
            clickSound.current.play().catch(() => {});
        }
        // Haptic feedback for a more tactile response on supported devices
        if (navigator.vibrate) {
            navigator.vibrate(10); // A short, subtle vibration
        }
    }, [isSoundOn]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 767);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const socialLinks = React.useMemo(() => [
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
    ], []);

    // Ensure the view starts at the top on initial load
    useEffect(() => {
        if (isMobile) {
            window.scrollTo(0, 0);
        } else {
            pageContainerRef.current?.scrollTo(0, 0);
        }
    }, [isMobile]);
    
    const navigateTo = useCallback((key: string) => {
        const newIndex = pageKeys.findIndex(pKey => pKey === key);
        if (newIndex !== -1) {
            if (isMobile) {
                const element = document.getElementById(key);
                if (element) {
                    element.scrollIntoView({ behavior: 'auto' });
                    setActiveIndex(newIndex);
                } else {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    setActiveIndex(newIndex);
                }
            } else {
                if (newIndex !== activeIndex) {
                    pageContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
                    setActiveIndex(newIndex);
                } else {
                    pageContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
                }
            }
        }
    }, [isMobile, pageKeys, activeIndex]);

    const handleSetPage = useCallback((key: string) => {
        navigateTo(key);
    }, [navigateTo]);

    useEffect(() => {
        const loader = document.getElementById('line-loader');
        if (loader) {
            const timer = setTimeout(() => {
                loader.classList.add('preloaded');
                setTimeout(() => loader.remove(), 1500); 
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        const handleInteraction = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const interactiveSelector = 'a, button, [role="button"], .toggle-slider, .timeline-milestone, .color-dot, .wallpaper-thumbnail, .achievement-card';

            if (target.closest(interactiveSelector)) {
                playClickSound();
            }
        };

        document.addEventListener('mousedown', handleInteraction);
        return () => document.removeEventListener('mousedown', handleInteraction);
    }, [playClickSound]);
    
    const activePageKey = pageKeys[activeIndex];
    
    useEffect(() => {
        const currentKey = activePageKey;
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

    }, [activeIndex, isPrintViewOpen, pageKeys, activePageKey]);
    
    const activePageItem = allPages[activeIndex] || allPages[0];
    const activePageTitle = t.sidebar.nav[activePageItem?.tKey as keyof typeof t.sidebar.nav] || activePageItem?.tKey || t.sidebar.nav.home;


    const handleSetPageAndCloseMenu = useCallback((key: string) => {
        handleSetPage(key);
        setIsMobileMenuOpen(false);
    }, [handleSetPage]);

    const sidebarProps = React.useMemo(() => ({
        navStructure: baseNavStructure,
        activeItemKey: pageKeys[activeIndex],
        setActiveItemKey: isMobile ? handleSetPageAndCloseMenu : handleSetPage,
        isMobile,
    }), [activeIndex, isMobile, handleSetPageAndCloseMenu, handleSetPage, pageKeys]);
    
    const ActivePageComponent = allPages[activeIndex]?.component;
    const componentProps = React.useMemo(() => {
        const props: any = {
            id: activePageKey,
            onNavigate: handleSetPage,
        };
        if (activePageKey && activePageKey.startsWith('project-')) {
            props.projectId = activePageKey.replace('project-', '');
        }
        return props;
    }, [activePageKey, handleSetPage]);

    const currentMainPageIndex = mainPageKeys.indexOf(activePageKey);
    const isOnMainPage = currentMainPageIndex !== -1;
    const isLastMainPage = isOnMainPage && currentMainPageIndex === mainPageKeys.length - 1;
    const canGoPrev = isOnMainPage && currentMainPageIndex > 0;
    
    const handleNextPage = useCallback(() => {
        if (!isLastMainPage && isOnMainPage) {
            handleSetPage(mainPageKeys[currentMainPageIndex + 1]);
        }
    }, [isLastMainPage, isOnMainPage, mainPageKeys, currentMainPageIndex]);

    const handlePrevPage = useCallback(() => {
        if (canGoPrev) {
            handleSetPage(mainPageKeys[currentMainPageIndex - 1]);
        }
    }, [canGoPrev, mainPageKeys, currentMainPageIndex]);
    
    // Swipe up on mobile to go to next page
    useEffect(() => {
        if (!isMobile || !isOnMainPage) return;
        
        let touchStartY = 0;
        let atBottom = false;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartY = e.touches[0].clientY;
            const scrollableHeight = document.documentElement.scrollHeight;
            const scrolledHeight = window.innerHeight + window.scrollY;
            atBottom = scrolledHeight >= scrollableHeight - 20;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!atBottom || isLastMainPage) return;
            const touchEndY = e.changedTouches[0].clientY;
            // Must swipe up at least 50px 
            if (touchStartY - touchEndY > 50) {
                handleNextPage();
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, isOnMainPage, isLastMainPage, handleNextPage]);

    // Track scrolling on mobile to update active index
    useEffect(() => {
        if (!isMobile || !isOnMainPage) return;

        const observers = mainPageKeys.map((key) => {
            const element = document.getElementById(key);
            if (!element) return null;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        const newActiveIndex = pageKeys.indexOf(key);
                        if (newActiveIndex !== -1) {
                            setActiveIndex(prev => prev !== newActiveIndex ? newActiveIndex : prev);
                        }
                    }
                },
                { threshold: 0.3, rootMargin: '-80px 0px -20% 0px' }
            );
            observer.observe(element);
            return observer;
        });

        return () => {
            observers.forEach(obs => obs?.disconnect());
        };
    }, [isMobile, isOnMainPage, mainPageKeys, pageKeys]);

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
            <div ref={backgroundRef} className={`app-background ${isCustomOrbiting ? 'wallpaper-orbiting-planets' : ''} ${isCustomDotted ? 'wallpaper-dotted-pattern' : ''} ${isCustomDarkDotted ? 'wallpaper-dark-dotted-pattern' : ''}`}>
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
            
            <div className={`site-wrapper`}>
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
                
                <main className={`content is-${isMobile && isOnMainPage ? 'mobile-all-pages' : activePageKey}`}>
                    {!isMobile && activePageKey === 'home' && (
                        <div className="top-right-actions">
                            <button
                                onClick={() => {
                                    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
                                }}
                                className="top-theme-toggle-btn"
                                title={themeMode === 'light' ? (language === 'vi' ? 'Chuyển sang chế độ tối' : 'Switch to dark mode') : (language === 'vi' ? 'Chuyển sang chế độ sáng' : 'Switch to light mode')}
                                aria-label="Toggle theme"
                            >
                                {themeMode === 'light' ? <Icons.MoonIcon size={18} /> : <Icons.SunIcon size={18} />}
                            </button>
                            <LanguageSwitcher />
                        </div>
                    )}
                    <div className="page-container no-scrollbar" ref={pageContainerRef}>
                        <Suspense fallback={<LoadingFallback />}>
                            {isMobile && isOnMainPage ? (
                                mainPages.map((page) => {
                                    const PageComp = page.component;
                                    return <PageComp key={page.key} id={page.key} onNavigate={handleSetPage} />;
                                })
                            ) : (
                                ActivePageComponent && <ActivePageComponent key={activePageKey} {...componentProps} />
                            )}
                        </Suspense>
                    </div>
                </main>

                {!isMobile && (
                    <div className="right-panel">
                        <div className="right-panel-top-content">
                            <div className={`avatar-social-container ${isSocialsOpen ? 'open' : ''}`}>
                                <button className="right-panel-avatar-button" onClick={() => setIsSocialsOpen(!isSocialsOpen)} title="Social Links">
                                    <img src="https://i.ibb.co/7tnk3NTY/H-ng-Th-i-Avata-Gif.gif" alt="Avatar" className="right-panel-avatar" />
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

            {isPrintViewOpen && document.getElementById('popup-root') && createPortal(
                <div className="print-preview-overlay">
                    <div className="print-preview-floating-controls">
                        <button onClick={handlePrint} className="header-icon-button" title="Tải file PDF">
                            <Icons.DownloadIcon />
                        </button>
                        <button onClick={() => setIsPrintViewOpen(false)} className="header-icon-button" title="Đóng">
                            <Icons.XMarkIcon />
                        </button>
                    </div>
                    <div className="print-preview-content">
                        <Suspense fallback={<LoadingFallback />}>
                            <PrintableView activePageKey={activePageKey} />
                        </Suspense>
                    </div>
                </div>,
                document.getElementById('popup-root')!
            )}
        </>
    );
};

export default App;
