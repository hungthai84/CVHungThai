
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { createPortal } from 'react-dom';
import Sidebar from './components/Sidebar';
import SkillsPage from './components/SkillsPage';
import CoverLetter from './components/CoverLetter';
import MemoriesPage from './components/MemoriesPage';
import { ProjectsPage } from './components/ProjectsPage';
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
import SchedulerPage from './components/SchedulerPage';
import PrintableView from './components/PrintableView';
import LanguageSwitcher from './components/LanguageSwitcher';
import ClockWeatherWidget from './components/ClockWeatherWidget';
import { AboutPage } from './components/AboutPage';
import WorkVideoPage from './components/WorkVideoPage';
import InterviewPage from './components/InterviewPage';
import PasswordPrompt from './components/PasswordPrompt';
import BlogPage from './components/BlogPage';
import HoroscopePage from './components/HoroscopePage';


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
    { key: 'horoscope', tKey: 'horoscope', icon: 'SparklesIcon', component: HoroscopePage },
    { key: 'memories', tKey: 'memories', icon: 'CameraIcon', component: MemoriesPage },
    { key: 'interview', tKey: 'interview', icon: 'PresentationIcon', component: InterviewPage },
    { key: 'blog', tKey: 'blog', icon: 'BookOpenIcon', component: BlogPage },
    { key: 'workVideo', tKey: 'experience', icon: 'BriefcaseIcon', component: WorkVideoPage, showInMenu: false },
    { key: 'scheduler', tKey: 'scheduler', icon: 'CalendarDaysIcon', component: SchedulerPage, showInMenu: false },
    { key: 'aiChat', tKey: 'aiChat', icon: 'BotIcon', component: AiChatPage, showInMenu: false },
    { key: 'settings', tKey: 'settings', icon: 'SettingsIcon', component: SettingsPage, showInMenu: false },
];

const App: React.FC = () => {
    const { t, language } = useI18n();
    const { isSoundOn, wallpaper, themeMode, setThemeMode } = useTheme();
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
    const backgroundRef = useRef<HTMLDivElement>(null);
    const [isSocialsOpen, setIsSocialsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
    const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
    const [isSidebarHidden, setIsSidebarHidden] = useState(() => {
        return localStorage.getItem('isSidebarHidden') === 'true';
    });


    const clickSound = useRef(new Audio('https://rainbowit.net/themes/inbio/wp-content/themes/inbio/template-parts/audio/link-hover-and-click.wav'));
    
    useEffect(() => {
        clickSound.current.volume = 0.3;
    }, []);

    // Parallax effect for the main background on scroll
    useEffect(() => {
        const container = pageContainerRef.current;
        const background = backgroundRef.current;
        if (!container || !background || isMobile) {
            if (background) background.style.transform = 'translateY(0px)';
            return;
        }

        let animationFrameId: number | null = null;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            // Apply parallax effect: move background at 20% of scroll speed
            background.style.transform = `translateY(-${scrollTop * 0.2}px)`;
            animationFrameId = null;
        };

        const onScroll = () => {
            if (animationFrameId === null) {
                animationFrameId = requestAnimationFrame(handleScroll);
            }
        };

        // Reset background position when active page changes
        background.style.transform = 'translateY(0px)';

        container.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            if (container) {
                container.removeEventListener('scroll', onScroll);
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [activeIndex, isMobile]); // Re-run when page changes or on mobile toggle

    const playClickSound = useCallback(() => {
        if (isSoundOn) {
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
    
    const navigateTo = (key: string) => {
        const newIndex = pageKeys.findIndex(pKey => pKey === key);
        if (newIndex !== -1) {
            if (isMobile) {
                const element = document.getElementById(key);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    setActiveIndex(newIndex);
                } else {
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    if ((document as any).startViewTransition) {
                        (document as any).startViewTransition(() => setActiveIndex(newIndex));
                    } else {
                        setActiveIndex(newIndex);
                    }
                }
            } else {
                if (newIndex !== activeIndex) {
                    pageContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
                    
                    if ((document as any).startViewTransition) {
                        (document as any).startViewTransition(() => setActiveIndex(newIndex));
                    } else {
                        setActiveIndex(newIndex);
                    }
                } else {
                    pageContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }
    };

    const handleSetPage = (key: string) => {
        navigateTo(key);
    };

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


    const handleSetPageAndCloseMenu = (key: string) => {
        handleSetPage(key);
        setIsMobileMenuOpen(false);
    };

    const sidebarProps = {
        navStructure: baseNavStructure,
        activeItemKey: pageKeys[activeIndex],
        setActiveItemKey: isMobile ? handleSetPageAndCloseMenu : handleSetPage,
        isMobile,
        isSidebarHidden,
        setIsSidebarHidden,
    };
    
    const ActivePageComponent = allPages[activeIndex]?.component;
    const componentProps: any = {
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

        const observers = mainPageKeys.map((key, index) => {
            const element = document.getElementById(key);
            if (!element) return null;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        const newActiveIndex = pageKeys.indexOf(key);
                        if (newActiveIndex !== -1 && newActiveIndex !== activeIndex) {
                            setActiveIndex(newActiveIndex);
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
    }, [isMobile, isOnMainPage, mainPageKeys, activeIndex, pageKeys]);

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
            
            <div className={`site-wrapper ${!isMobile && isSidebarHidden ? 'sidebar-hidden-desktop' : ''}`}>
                {!isMobile && isSidebarHidden && (
                    <button 
                        onClick={() => {
                            setIsSidebarHidden(false);
                            localStorage.setItem('isSidebarHidden', 'false');
                        }}
                        className="sidebar-floating-toggle-btn"
                        title={language === 'vi' ? 'Hiện sidebar' : 'Show sidebar'}
                        aria-label="Show sidebar"
                    >
                        <Icons.ChevronRightIcon size={16} />
                    </button>
                )}
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
                        {isMobile && isOnMainPage ? (
                            mainPages.map((page) => {
                                const PageComp = page.component;
                                return <PageComp key={page.key} id={page.key} onNavigate={handleSetPage} />;
                            })
                        ) : (
                            ActivePageComponent && <ActivePageComponent key={activePageKey} {...componentProps} />
                        )}
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
                        <PrintableView activePageKey={activePageKey} />
                    </div>
                </div>,
                document.getElementById('popup-root')!
            )}
        </>
    );
};

export default App;
