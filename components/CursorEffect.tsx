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
            
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        const loop = () => {
            if (!innerCursor || !outerCursor) return;
            
            const { x, y } = mousePos.current;
            innerCursor.style.left = `${x}px`;
            innerCursor.style.top = `${y}px`;
            
            const { x: lastX, y: lastY } = outerPos.current;
            const newX = lastX + (x - lastX) * 0.2;
            const newY = lastY + (y - lastY) * 0.2;
            
            outerPos.current = { x: newX, y: newY };

            outerCursor.style.left = `${newX}px`;
            outerCursor.style.top = `${newY}px`;
            
            animationFrameId.current = requestAnimationFrame(loop);
        };

        const interactiveSelector = 'a, button, [role="button"], input[type="submit"], .timeline-milestone, .memories-grid-item, .project-card-new.has-post, .achievement-card, .social-icon-link, .filter-btn, .project-branch-title, .toggle-switch, .color-dot, .wallpaper-thumbnail';

        const handleMouseOver = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest(interactiveSelector)) {
                innerCursor?.classList.add('mmc-hover');
                outerCursor?.classList.add('mmc-hover');
            }
        };
        
        const handleMouseOut = (e: MouseEvent) => {
            if ((e.target as HTMLElement).closest(interactiveSelector)) {
                innerCursor?.classList.remove('mmc-hover');
                outerCursor?.classList.remove('mmc-hover');
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
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mouseout', handleMouseOut);
        
        if (!animationFrameId.current) {
            loop();
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = undefined;
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mouseout', handleMouseOut);
            document.removeEventListener('mousemove', onFirstMove, true);
            body.style.cursor = 'auto';
            if (innerCursor) innerCursor.style.visibility = 'hidden';
            if (outerCursor) outerCursor.style.visibility = 'hidden';
        };
    }, [isCursorEffectOn]);

    return null;
};

export default CursorEffect;