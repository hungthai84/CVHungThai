import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface PageLayoutProps {
    children: ReactNode;
    id?: string;
    className?: string;
    innerStyle?: React.CSSProperties;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, id, className, innerStyle }) => {

    return (
        <motion.section 
            id={id} 
            className={className}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
        >
            <div className="section-inner" style={innerStyle}>
                {children}
            </div>
        </motion.section>
    );
};

export default PageLayout;