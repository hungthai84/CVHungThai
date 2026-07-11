import React, { useState, useRef } from 'react';
import { useI18n } from '../contexts/i18n';
import PageLayout from './PageLayout';
import VideoInterviewCard from './VideoInterviewCard';

const DEFAULT_VIDEO_URL = " https://cdn.scena.ai/project/9741/6add28d1439e654c67a3b293b98c88cc3b251be53cd4e58bac4cceb1798aca8d.mp4";
const INTERVIEW_VIDEO_URL = "  https://cdn.scena.ai/project/9741/021c21b2f677c4341e06c62c9432d06d251e22c83716e55b927633e254a67730.mp4";

const InterviewPage: React.FC<{ id?: string }> = ({ id }) => {
    const { t } = useI18n();
    const pageData = t.interviewPage;
    
    const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
    const [isPlayingInterview, setIsPlayingInterview] = useState(false);

    const playInterview = () => {
        setVideoUrl(INTERVIEW_VIDEO_URL);
        setIsPlayingInterview(true);
    };

    const cancelInterview = () => {
        setVideoUrl(DEFAULT_VIDEO_URL);
        setIsPlayingInterview(false);
    };

    return (
        <PageLayout id={id}>
            <style>{`
                .magic-btn-main {
                    position: relative;
                    background: linear-gradient(90deg, #4361ff, #a541ff, #ff4aff);
                    border-radius: 40px;
                    height: 58px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                    font-weight: 300;
                    letter-spacing: 0.5px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
                    box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
                    padding-left: 60px;
                    padding-right: 32px;
                    min-width: 200px;
                }
                .magic-btn-main:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 12px 30px rgba(168, 85, 247, 0.6);
                }
                .magic-btn-cancel {
                    background: linear-gradient(90deg, #64748b, #334155, #0f172a);
                    box-shadow: 0 8px 25px rgba(51, 65, 85, 0.3);
                }
                .magic-btn-glass {
                    position: absolute;
                    left: -25px;
                    top: -5px;
                    bottom: -5px;
                    width: 105px;
                    border-radius: 40px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.02) 100%);
                    backdrop-filter: blur(12px);
                    border: 1.5px solid rgba(255, 255, 255, 0.4);
                    z-index: 2;
                    pointer-events: none;
                }
                .magic-btn-content {
                    position: relative;
                    z-index: 3;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 14px;
                    width: 100%;
                }
            `}</style>
            <VideoInterviewCard 
                videoUrl={videoUrl}
                isPlaying={isPlayingInterview}
                onPlay={playInterview}
                onCancel={cancelInterview}
                pageData={pageData}
            />
        </PageLayout>
    );
};

export default InterviewPage;
