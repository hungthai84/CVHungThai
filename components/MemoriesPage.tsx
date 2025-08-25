import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PageLayout from './PageLayout';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';
import Lightbox from './Lightbox';

interface MemoryImage {
  src: string;
  alt: string;
  company: string;
}

interface MemoriesPageProps {
  id?: string;
}

const MemoriesPage: React.FC<MemoriesPageProps> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.memoriesPage;
    const filters = pageData.filters || {};
    const allImages: MemoryImage[] = pageData.memories || [];
    const filterKeys = Object.keys(filters);

    const [activeFilter, setActiveFilter] = useState('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);


    const filteredImages = useMemo(() => {
        if (activeFilter === 'all') {
            return allImages;
        }
        return allImages.filter(img => img.company.toLowerCase() === activeFilter);
    }, [activeFilter, allImages]);
    
    const handleOpenLightbox = (index: number) => {
        setLightboxIndex(index);
    };
    
    const handleCloseLightbox = () => {
        setLightboxIndex(null);
    };

    const handleNextImage = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((prevIndex) => (prevIndex! + 1) % filteredImages.length);
        }
    };
    
    const handlePrevImage = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((prevIndex) => (prevIndex! - 1 + filteredImages.length) % filteredImages.length);
        }
    };


    return (
        <PageLayout id={id}>
            <div className="info-card">
                 <div className="about-header">
                    <InfoBadge
                        icon={<Icons.CameraIcon />}
                        text={pageData.badge}
                        tooltipTitle={pageData.tooltipTitle}
                        tooltipText={pageData.tooltipText}
                    />
                </div>
                
                <div className="memories-page-content">
                    <div className="memories-filters">
                        {filterKeys.map(key => (
                            <button
                                key={key}
                                className={`filter-btn ${activeFilter === key ? 'active' : ''}`}
                                onClick={() => setActiveFilter(key)}
                            >
                                {filters[key as keyof typeof filters]}
                            </button>
                        ))}
                    </div>
                    <div className="memories-grid-container no-scrollbar">
                        {filteredImages.length > 0 ? (
                            <div className="memories-grid">
                                {filteredImages.map((image, index) => (
                                    <button key={image.src} className="memories-grid-item" onClick={() => handleOpenLightbox(index)}>
                                        <img src={image.src} alt={image.alt} loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-brand-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Icons.CameraIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }}/>
                                <p>Không có kỷ niệm nào để hiển thị.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {lightboxIndex !== null && document.getElementById('popup-root') && createPortal(
                <Lightbox 
                    images={filteredImages}
                    currentIndex={lightboxIndex}
                    onClose={handleCloseLightbox}
                    onNext={handleNextImage}
                    onPrev={handlePrevImage}
                />,
                document.getElementById('popup-root')!
            )}
        </PageLayout>
    );
};

export default MemoriesPage;