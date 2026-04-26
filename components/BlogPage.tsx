import React from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';

interface BlogPageProps {
    id?: string;
}

const BlogPage: React.FC<BlogPageProps> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.blogPage; 

    return (
        <PageLayout id={id}>
            <div className="info-card" style={{ padding: 0, overflow: 'hidden' }}>
                 <div className="about-header" style={{ padding: '1.5rem 1.5rem 0', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                    <InfoBadge
                        icon={<Icons.BookOpenIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>
                <iframe
                    src="https://power-service-one.blogspot.com"
                    title={pageData.tooltipTitle}
                    style={{ border: 0, width: '100%', height: '100%', borderRadius: '15px' }}
                    frameBorder="0"
                    allowFullScreen
                ></iframe>
            </div>
        </PageLayout>
    );
};

export default BlogPage;
