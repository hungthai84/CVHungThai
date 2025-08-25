import React from 'react';

interface InfoBadgeProps {
    icon: React.ReactNode;
    text: string;
    tooltipTitle: string;
    tooltipText: string;
}

const InfoBadge: React.FC<InfoBadgeProps> = ({ icon, text, tooltipTitle, tooltipText }) => {
    return (
        <div className="about-badge-container">
            <div className="info-badge">
                <div className="badge-glow"></div>
                <span className="badge-content">
                    {icon}
                    <span>{text}</span>
                </span>
            </div>
            <div className="badge-tooltip">
                <div className="tooltip-inner">
                    <div className="tooltip-header">
                        <div className="tooltip-icon-wrapper">
                            {icon}
                        </div>
                        <h3>{tooltipTitle}</h3>
                    </div>
                    <p>{tooltipText}</p>
                    <div className="tooltip-arrow"></div>
                </div>
            </div>
        </div>
    );
};

export default InfoBadge;
