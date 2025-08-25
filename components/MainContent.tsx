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
    const { t } = useI18n();
    const heroData = t.hero;
    const typedEl = useRef(null);
    const typedInstance = useRef<any>(null);

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
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    className="home-hero-card-bg-video"
                    src="https://cdn.scena.ai/project/9626/3831bf105bab4a399b35e79c5a8b4f1d3cfc4fe5ea48812f948fa55c90792dc4.mp4"
                />
                <div className="home-hero-card-overlay"></div>
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
                        <p className="hero-intro-text">{heroData.intro}</p>
                        <h1 className="hero-name-text">{heroData.name}</h1>
                        <h2 className="hero-typed-text-container">
                            <span ref={typedEl}></span>
                        </h2>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default MainContent;