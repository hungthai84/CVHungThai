import React, { useEffect, useRef } from 'react';
// Note: 'typed.js' is loaded globally from a <script> tag in index.html
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

declare var Typed: any; // Let TypeScript know Typed exists on the global scope

interface MainContentProps {
    id?: string;
}

const getRandomVibrantColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 20); // 70-90%
    const lightness = 65 + Math.floor(Math.random() * 10); // 65-75% for good visibility
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const MainContent: React.FC<MainContentProps> = ({ id }) => {
    const { t, language } = useI18n();
    const heroData = t.hero;
    const typedEl = useRef(null);
    const typedInstance = useRef<any>(null);
    const DEFAULT_VIDEO = "https://cdn.scena.ai/project/8606/95727de5df7ead1b58f6438ffcd683078804d9f125467ad97c7ae3c6a581512e.mp4";
    const INTRO_VIDEO = "https://cdn.scena.ai/project/8606/1dc04314870ccd1da345b28cb9a539bdb8af303524e169e67691ae3ac5b6e654.mp4";

    const [videoUrl, setVideoUrl] = React.useState(DEFAULT_VIDEO);
    const [isMuted, setIsMuted] = React.useState(true);
    const [welcomeMessage, setWelcomeMessage] = React.useState('');

    const isIntroPlaying = videoUrl === INTRO_VIDEO;

    useEffect(() => {
        const hour = new Date().getHours();
        let timeGreeting = language === 'en' ? "Good morning" : "Chào buổi sáng";
        if (hour >= 12 && hour < 18) {
            timeGreeting = language === 'en' ? "Good afternoon" : "Chào buổi chiều";
        } else if (hour >= 18) {
            timeGreeting = language === 'en' ? "Good evening" : "Chào buổi tối";
        }

        const savedName = localStorage.getItem('userName');
        if (savedName) {
            setWelcomeMessage(`${timeGreeting}, ${savedName}!`);
        } else {
            setWelcomeMessage(`${timeGreeting}!`);
        }
    }, [language]);

    const handleToggleIntro = () => {
        if (isIntroPlaying) {
            setVideoUrl(DEFAULT_VIDEO);
            setIsMuted(true);
        } else {
            setVideoUrl(INTRO_VIDEO);
            setIsMuted(false);
        }
    };

    useEffect(() => {
        // Strings for the typing animation from translations
        const strings = heroData.taglines.map(
            (line: string) => `<span style="color: ${getRandomVibrantColor()};">${line}</span>`
        );

        const options = {
            strings: strings,
            typeSpeed: 50,
            backSpeed: 25,
            backDelay: 2000,
            loop: true,
            smartBackspace: true,
            showCursor: true,
            cursorChar: '_',
        };

        if (typedEl.current) {
            // Ensure typed.js is loaded from the script tag
            if (typeof Typed !== 'undefined') {
                // Destroy previous instance if it exists to prevent conflicts on language change
                if (typedInstance.current) {
                    typedInstance.current.destroy();
                }
                typedInstance.current = new Typed(typedEl.current, options);
            } else {
                console.error("Typed.js not found. Make sure it's loaded.");
            }
        }

        return () => {
            // Destroy Typed instance on unmount to prevent memory leaks
            if (typedInstance.current) {
                typedInstance.current.destroy();
            }
        };
    }, [heroData.taglines]); // Re-run when language (and thus taglines) changes

    return (
        <PageLayout id={id}>
            <div className="info-card home-hero-card">
                 <video 
                    key={videoUrl}
                    autoPlay 
                    muted={isMuted} 
                    loop={!isIntroPlaying} 
                    playsInline 
                    className="home-hero-card-bg-video"
                    src={videoUrl}
                    
                    style={{ opacity: 1 }}
                    onEnded={() => {
                        if (isIntroPlaying) {
                            setVideoUrl(DEFAULT_VIDEO);
                            setIsMuted(true);
                        }
                    }}
                />
                <div className="home-hero-card-overlay" style={{ opacity: 0 }}></div>
                <div className="home-hero-card-content-wrapper">
                    <InfoBadge
                        icon={<Icons.HomeIcon />}
                        text={heroData.badge || t.sidebar.nav.home}
                        tooltipTitle={heroData.tooltipTitle || "Chào mừng"}
                        tooltipText={heroData.tooltipText || "Chào mừng đến với hồ sơ cá nhân của tôi."}
                        style={{ marginBottom: '1.5rem' }}
                    />
                    
                    <div className="home-hero-content">
                        {welcomeMessage && (
                            <div 
                                className="text-xl md:text-2xl font-medium text-white/90 mb-3 drop-shadow-md tracking-wide" 
                                style={{ 
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                    color: '#f9f9f9',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    borderColor: '#000000'
                                }}
                            >
                                {welcomeMessage}
                            </div>
                        )}
                        <p className="hero-intro-text">{heroData.intro}</p>
                        <h1 className="hero-name-text">{heroData.name}</h1>
                        <h2 className="hero-typed-text-container">
                            <span ref={typedEl}></span>
                        </h2>
                    </div>

                    <div className="home-hero-buttons-container" style={{ position: 'absolute', bottom: '30px', right: '30px', zIndex: 10 }}>
                        <style>{`
                            .magic-btn-wrapper {
                                display: flex;
                                margin-left: 25px; /* for the glass overflow */
                            }
                            .magic-btn-main {
                                position: relative;
                                background: linear-gradient(90deg, #4361ff, #a541ff, #ff4aff);
                                border-radius: 40px;
                                height: 58px;
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-size: 1.25rem;
                                font-weight: 300;
                                letter-spacing: 0.5px;
                                border: none;
                                cursor: pointer;
                                transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
                                box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
                                padding-left: 60px; 
                                padding-right: 32px;
                                min-width: 200px;
                            }
                            .magic-btn-main:hover {
                                transform: translateY(-3px) scale(1.02);
                                box-shadow: 0 12px 30px rgba(168, 85, 247, 0.6);
                            }
                            .magic-btn-main:active {
                                transform: translateY(1px) scale(0.98);
                            }
                            .magic-btn-cancel {
                                background: linear-gradient(90deg, #64748b, #334155, #0f172a);
                                box-shadow: 0 8px 25px rgba(51, 65, 85, 0.3);
                            }
                            .magic-btn-cancel:hover {
                                box-shadow: 0 12px 30px rgba(51, 65, 85, 0.5);
                            }
                            .magic-btn-glass {
                                position: absolute;
                                left: -25px;
                                top: -5px;
                                bottom: -5px;
                                width: 105px;
                                border-radius: 40px;
                                background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.02) 100%);
                                backdrop-filter: blur(12px);
                                -webkit-backdrop-filter: blur(12px);
                                border: 1.5px solid rgba(255, 255, 255, 0.4);
                                box-shadow: inset 0 0 20px rgba(255,255,255,0.15), 0 4px 15px rgba(0,0,0,0.1);
                                z-index: 2;
                                pointer-events: none;
                            }
                            .magic-btn-glass-cancel {
                                background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.01) 100%);
                                border: 1px solid rgba(255, 255, 255, 0.15);
                            }
                            .magic-btn-content {
                                position: relative;
                                z-index: 3;
                                display: flex;
                                align-items: center;
                                justify-content: flex-end;
                                gap: 14px;
                                width: 100%;
                            }
                            .magic-icon {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            }
                            @media (max-width: 768px) {
                                .home-hero-buttons-container {
                                    bottom: 20px;
                                    right: 50%;
                                    transform: translateX(50%);
                                    width: max-content;
                                }
                            }
                        `}</style>
                        <div className="magic-btn-wrapper">
                            {!isIntroPlaying ? (
                                <button 
                                    onClick={() => handleToggleIntro()}
                                    className="magic-btn-main"
                                    title="Xem video giới thiệu"
                                >
                                    <div className="magic-btn-glass"></div>
                                    <div className="magic-btn-content">
                                        <span>Giới thiệu</span>
                                        <div className="magic-icon"><Icons.SparklesIcon size={24} /></div>
                                    </div>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleToggleIntro()}
                                    className="magic-btn-main magic-btn-cancel"
                                    title="Hủy bỏ video giới thiệu"
                                >
                                    <div className="magic-btn-glass magic-btn-glass-cancel"></div>
                                    <div className="magic-btn-content">
                                        <span>Hủy bỏ</span>
                                        <div className="magic-icon"><Icons.XMarkIcon size={24} /></div>
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default MainContent;