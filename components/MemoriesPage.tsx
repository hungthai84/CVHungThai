import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import PageLayout from './PageLayout';
import { useI18n } from '../contexts/i18n';
import * as Icons from './Icons';
import InfoBadge from './InfoBadge';
import Lightbox from './Lightbox';

import OptimizedImage from './OptimizedImage';

import { motion, AnimatePresence } from 'motion/react';

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
            <div className="info-card" style={{ borderRadius: '10px' }}>
                <InfoBadge
                    icon={<Icons.CameraIcon />}
                    text={pageData.badge}
                    tooltipTitle={pageData.tooltipTitle}
                    tooltipText={pageData.tooltipText}
                    style={{ marginBottom: '1.5rem' }}
                />
                
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
                            <motion.div 
                                layout
                                className="memories-grid"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredImages.map((image, index) => (
                                        <motion.button 
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: index * 0.03 }}
                                            key={image.src} 
                                            className="memories-grid-item" 
                                            onClick={() => handleOpenLightbox(index)}
                                        >
                                            <OptimizedImage src={image.src} alt={image.alt} optWidth={800} optQuality={70} />
                                            {image.company && (
                                                <div className="memory-item-label">
                                                    {pageData.companyLabels?.[image.company] || image.company}
                                                </div>
                                            )}
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
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