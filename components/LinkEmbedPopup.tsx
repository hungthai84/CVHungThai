import React from 'react';
import * as Icons from './Icons';

interface LinkEmbedPopupProps {
  url: string;
  onClose: () => void;
}

const LinkEmbedPopup: React.FC<LinkEmbedPopupProps> = ({ url, onClose }) => {
  return (
    <div className="video-popup-overlay" onClick={onClose}>
      <div className="video-popup-content" onClick={(e) => e.stopPropagation()}>
        <iframe 
            src={url} 
            title="Embedded Content" 
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin"
        ></iframe>
        <button className="video-popup-close-btn" onClick={onClose} aria-label="Close">
          <Icons.XMarkIcon />
        </button>
      </div>
    </div>
  );
};

export default LinkEmbedPopup;
