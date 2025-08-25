import React, { useState, useEffect } from 'react';
import * as Icons from './Icons';

interface ProgressButtonProps {
    onClick: () => void;
    progress: number;
    children: React.ReactNode;
    ariaLabel: string;
}

const ProgressButton: React.FC<ProgressButtonProps> = ({ onClick, progress, children, ariaLabel }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    // Clamp progress between 0 and 1
    const clampedProgress = Math.max(0, Math.min(1, progress));
    const offset = circumference - clampedProgress * circumference;

    return (
        <div className="progress-nav-btn-wrapper">
            <button className="progress-nav-btn" onClick={onClick} aria-label={ariaLabel}>
                {children}
            </button>
            <svg className="progress-ring" width="56" height="56" viewBox="0 0 56 56">
                <circle
                    className="progress-ring__circle_bg"
                    strokeWidth="4"
                    fill="transparent"
                    r={radius}
                    cx="28"
                    cy="28"
                />
                <circle
                    className="progress-ring__circle"
                    strokeWidth="4"
                    fill="transparent"
                    r={radius}
                    cx="28"
                    cy="28"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                    }}
                />
            </svg>
        </div>
    );
};

interface ScrollProgressNavProps {
    onPrev: () => void;
    onNext: () => void;
    onGoToTop: () => void;
    showPrev: boolean;
    isLastPage: boolean;
    scrollContainerRef: React.RefObject<HTMLDivElement>;
    activeIndex: number;
}

const ScrollProgressNav: React.FC<ScrollProgressNavProps> = ({ onPrev, onNext, onGoToTop, showPrev, isLastPage, scrollContainerRef, activeIndex }) => {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollHeight <= clientHeight) {
                setScrollProgress(1); // Content is not scrollable, show as complete
                return;
            }
            const progress = scrollTop / (scrollHeight - clientHeight);
            setScrollProgress(progress);
        };
        
        // Reset progress on page change and check initial state
        setScrollProgress(0);
        // We don't scroll to top here, App.tsx handles that.
        // We just need to recalculate progress after a short delay.
        const timer = setTimeout(() => {
            handleScroll();
        }, 150); // allow content to render

        container.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [scrollContainerRef, activeIndex]);


    return (
        <div className="scroll-progress-nav-container">
             <div className={`progress-nav-btn-container ${!showPrev ? 'hidden' : ''}`}>
                 <ProgressButton
                    onClick={onPrev}
                    progress={scrollProgress}
                    ariaLabel="Previous Page"
                >
                    <Icons.ChevronUpIcon />
                </ProgressButton>
            </div>
            <div className="progress-nav-btn-container">
            {isLastPage ? (
                <ProgressButton
                    onClick={onGoToTop}
                    progress={scrollProgress}
                    ariaLabel="Back to Top"
                >
                    <Icons.ArrowUpIcon />
                </ProgressButton>
            ) : (
                <ProgressButton
                    onClick={onNext}
                    progress={scrollProgress}
                    ariaLabel="Next Page"
                >
                    <Icons.ChevronDownIcon />
                </ProgressButton>
            )}
            </div>
        </div>
    );
};

export default ScrollProgressNav;
