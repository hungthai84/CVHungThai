import React, { ReactNode } from 'react';

interface PageLayoutProps {
    children: ReactNode;
    id?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, id }) => {

    return (
        <section id={id}>
            <div className="section-inner">
                {children}
            </div>
        </section>
    );
};

export default PageLayout;