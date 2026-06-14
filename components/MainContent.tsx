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
                    poster="https://i.postimg.cc/kX4B2FAS/hero-bg-fallback.jpg"
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
                    <div className="about-header">
                        <InfoBadge
                            icon={<Icons.HomeIcon />}
                            text={heroData.badge || t.sidebar.nav.home}
                            tooltipTitle={heroData.tooltipTitle || "Chào mừng"}
                            tooltipText={heroData.tooltipText || "Chào mừng đến với hồ sơ cá nhân của tôi."}
                        />
                    </div>
                    
                    <div className="home-hero-content">
                        {welcomeMessage && (
                            <div className="text-xl md:text-2xl font-medium text-white/90 mb-3 drop-shadow-md tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                                {welcomeMessage}
                            </div>
                        )}
                        <p className="hero-intro-text">{heroData.intro}</p>
                        <h1 className="hero-name-text">{heroData.name}</h1>
                        <h2 className="hero-typed-text-container">
                            <span ref={typedEl}></span>
                        </h2>
                    </div>

                    <button 
                        onClick={handleToggleIntro}
                        className="intro-play-button"
                        title={isIntroPlaying ? "Bỏ qua video giới thiệu" : "Xem video giới thiệu"}
                    >
                        {isIntroPlaying ? <Icons.XMarkIcon size={20} /> : <Icons.PlayIcon size={20} />}
                        <span>{isIntroPlaying ? "Bỏ qua" : "Giới thiệu"}</span>
                    </button>
                </div>
            </div>
        </PageLayout>
    );
};

export default MainContent;