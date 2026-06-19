import React, { ReactNode } from 'react';

interface PageLayoutProps {
    children: ReactNode;
    id?: string;
    className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, id, className }) => {

    return (
        <section id={id} className={className}>
            <div className="section-inner">
                {children}
            </div>
        </section>
    );
};

export default PageLayout;