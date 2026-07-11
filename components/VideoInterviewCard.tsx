import React, { useRef } from 'react';
import * as Icons from './Icons';
import CardTitle from './CardTitle';

interface VideoInterviewCardProps {
    videoUrl: string;
    isPlaying: boolean;
    onPlay: () => void;
    onCancel: () => void;
    pageData: any;
}

const VideoInterviewCard: React.FC<VideoInterviewCardProps> = ({ videoUrl, isPlaying, onPlay, onCancel, pageData }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <div className="info-card" style={{ position: 'relative', height: '100%', width: '100%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}>
            {/* Floating InfoBadge */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 20 }}>
                <CardTitle
                    icon={<Icons.PresentationIcon />}
                    text={pageData.badge}
                    tooltipTitle={pageData.tooltipTitle}
                    tooltipText={pageData.tooltipText}
                />
            </div>

            {/* Full-bleed Video Container */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%', height: '100%' }}>
                <video
                    key={videoUrl}
                    ref={videoRef}
                    src={videoUrl}
                    playsInline
                    autoPlay
                    loop={!isPlaying}
                    muted={!isPlaying}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onEnded={() => {
                        if (isPlaying) {
                            onCancel();
                        }
                    }}
                />

                {isPlaying && (
                    <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 30 }}>
                            <button onClick={onCancel} className="magic-btn-main magic-btn-cancel" style={{ height: '40px', minWidth: '100px', fontSize: '1rem', padding: '0 20px' }}>
                                <div className="magic-btn-glass" style={{ width: '60px', left: '-15px' }}></div>
                                <div className="magic-btn-content">
                                    <span>Hủy</span>
                                    <Icons.XMarkIcon size={20} />
                                </div>
                            </button>
                    </div>
                )}

                {!isPlaying && (
                    <div style={{ position: 'absolute', bottom: '150px', right: '20px', zIndex: 30 }}>
                            <button onClick={onPlay} className="magic-btn-main" style={{ height: '50px', fontSize: '1rem' }}>
                                <div className="magic-btn-glass"></div>
                                <div className="magic-btn-content">
                                    <span>Nghe trao đổi</span>
                                    <Icons.MicrophoneIcon size={20} />
                                </div>
                            </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoInterviewCard;
