import React, { useEffect } from 'react';
import * as Icons from './Icons';

interface MemoryImage {
  src: string;
  alt: string;
}

interface LightboxProps {
  images: MemoryImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  if (currentIndex < 0 || currentIndex >= images.length) {
    return null;
  }
  
  const currentImage = images[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close-btn" onClick={onClose} aria-label="Close image view">
          <Icons.XMarkIcon />
        </button>
        
        {images.length > 1 && (
            <button className="lightbox-nav-btn prev" onClick={onPrev} aria-label="Previous image">
                <Icons.ChevronLeftIcon />
            </button>
        )}
        
        <div className="lightbox-image-container">
            <img src={currentImage.src} alt={currentImage.alt} />
        </div>
        
        {images.length > 1 && (
            <button className="lightbox-nav-btn next" onClick={onNext} aria-label="Next image">
                <Icons.ChevronRightIcon />
            </button>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
