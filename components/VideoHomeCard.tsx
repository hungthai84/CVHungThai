import React from 'react';

interface VideoHomeCardProps {
    videoUrl: string;
    isMuted: boolean;
    isIntroPlaying: boolean;
    onEnded: () => void;
    children?: React.ReactNode; // For the content on top
}

const VideoHomeCard: React.FC<VideoHomeCardProps> = ({ videoUrl, isMuted, isIntroPlaying, onEnded, children }) => {
    return (
        <div className="info-card home-hero-card overflow-hidden" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <video 
                key={videoUrl}
                autoPlay 
                muted={isMuted} 
                loop={!isIntroPlaying} 
                playsInline 
                className="home-hero-card-bg-video"
                src={videoUrl}
                
                style={{ opacity: 1, objectFit: 'cover', width: '100%', height: '100%', borderRadius: '16px' }}
                onEnded={onEnded}
            />
            {children}
        </div>
    );
};

export default VideoHomeCard;
