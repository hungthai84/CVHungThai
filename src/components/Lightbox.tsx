import React, { useState, useEffect } from 'react';
import * as Icons from './Icons';

interface LightboxProps {
  images?: string[] | { src: string }[];
  initialIndex?: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const imgArray = images 
    ? (typeof images[0] === 'string' ? images as string[] : (images as {src: string}[]).map(i => i.src))
    : [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, imgArray.length]);

  const handleNext = () => {
    if (imgArray.length > 0) setCurrentIndex((currentIndex + 1) % imgArray.length);
  };

  const handlePrev = () => {
    if (imgArray.length > 0) setCurrentIndex((currentIndex - 1 + imgArray.length) % imgArray.length);
  };

  if (!imgArray || imgArray.length === 0) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
        <Icons.XIcon size={32} />
      </button>
      
      {imgArray.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} style={{ position: 'absolute', left: 20, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Icons.ChevronLeftIcon size={48} />
        </button>
      )}

      <img src={imgArray[currentIndex]} alt="Lightbox view" style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />

      {imgArray.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); handleNext(); }} style={{ position: 'absolute', right: 20, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <Icons.ChevronRightIcon size={48} />
        </button>
      )}
    </div>
  );
};

export default Lightbox;
