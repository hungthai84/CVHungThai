import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CursorEffect: React.FC = () => {
    const { isCursorEffectOn } = useTheme();
    const innerCursorRef = useRef<HTMLDivElement | null>(null);
    const outerCursorRef = useRef<HTMLDivElement | null>(null);
    
    const mousePos = useRef({ x: -100, y: -100 });
    const outerPos = useRef({ x: -100, y: -100 });
    const animationFrameId = useRef<number | undefined>(undefined);

    useEffect(() => {
        innerCursorRef.current = document.querySelector('.mmc-inner');
        outerCursorRef.current = document.querySelector('.mmc-outer');
    }, []);

    useEffect(() => {
        const body = document.body;
        const innerCursor = innerCursorRef.current;
        const outerCursor = outerCursorRef.current;
        
        if (!isCursorEffectOn || !innerCursor || !outerCursor) {
            body.style.cursor = 'auto';
            if (innerCursor) innerCursor.style.visibility = 'hidden';
            if (outerCursor) outerCursor.style.visibility = 'hidden';
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = undefined;
            }
            return;
        }
        
        body.style.cursor = 'none';
            
        const interactiveSelector = 'a, button, [role="button"], input[type="submit"], .timeline-milestone, .memories-grid-item, .project-card-new.has-post, .achievement-card, .social-icon-link, .filter-btn, .project-branch-title, .toggle-switch, .color-dot, .wallpaper-thumbnail';

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };

            const target = e.target as HTMLElement;
            if (target.closest(interactiveSelector)) {
                innerCursor?.classList.add('mmc-hover');
                outerCursor?.classList.add('mmc-hover');
            } else {
                innerCursor?.classList.remove('mmc-hover');
                outerCursor?.classList.remove('mmc-hover');
            }
        };

        const loop = () => {
            try {
                if (!innerCursor || !outerCursor) return;
                
                const { x, y } = mousePos.current;
                
                // Only update DOM if position changed
                if (outerPos.current.x !== x || outerPos.current.y !== y) {
                    innerCursor.style.transform = `translate(${x}px, ${y}px)`;
                    outerCursor.style.transform = `translate(${x}px, ${y}px)`;
                    outerPos.current = { x, y };
                }
            } finally {
                animationFrameId.current = requestAnimationFrame(loop);
            }
        };

        const onFirstMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            outerPos.current = { x: e.clientX, y: e.clientY };
            if (innerCursor) innerCursor.style.visibility = 'visible';
            if (outerCursor) outerCursor.style.visibility = 'visible';
            document.removeEventListener('mousemove', onFirstMove, true);
        };
        
        document.addEventListener('mousemove', onFirstMove, true);
        document.addEventListener('mousemove', handleMouseMove);
        
        if (!animationFrameId.current) {
            loop();
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = undefined;
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousemove', onFirstMove, true);
            body.style.cursor = 'auto';
            if (innerCursor) {
                innerCursor.style.visibility = 'hidden';
                innerCursor.classList.remove('mmc-hover');
            }
            if (outerCursor) {
                outerCursor.style.visibility = 'hidden';
                outerCursor.classList.remove('mmc-hover');
            }
        };
    }, [isCursorEffectOn]);

    return null;
};

export default CursorEffect;
