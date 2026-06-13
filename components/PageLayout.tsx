import React, { ReactNode, useEffect, useRef } from 'react';

interface PageLayoutProps {
    children: ReactNode;
    id?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, id }) => {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        // Find all info-card elements within this section layout
        const cards = section.querySelectorAll('.info-card');
        
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible-in-view');
                    }
                });
            },
            {
                root: null, // viewport or closest scroll container
                rootMargin: '0px 0px -20px 0px', // slight bottom offset to create parallax feel
                threshold: 0.05,
            }
        );

        cards.forEach((card) => {
            if (!card.classList.contains('visible-in-view')) {
                card.classList.add('info-card-scroll-animate');
                observer.observe(card);
            }
        });

        return () => {
            cards.forEach((card) => {
                observer.unobserve(card);
            });
        };
    }, [children, id]);

    return (
        <section id={id} ref={sectionRef}>
            <div className="section-inner">
                {children}
            </div>
        </section>
    );
};

export default PageLayout;