import React from 'react';

export interface CardTitleProps {
    icon: React.ReactNode;
    text: string;
    tooltipTitle: string;
    tooltipText: string;
    style?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
    onClick?: () => void;
    active?: boolean;
}

export const CardTitle: React.FC<CardTitleProps> = ({ 
    icon, 
    text, 
    tooltipTitle, 
    tooltipText, 
    style, 
    containerStyle,
    onClick,
    active
}) => {
    return (
        <div 
            className={`about-badge-container ${onClick ? 'cursor-pointer select-none' : ''}`} 
            style={containerStyle}
            onClick={onClick}
        >
            <div 
                className={`info-badge ${active ? 'active-badge' : ''}`} 
                style={{
                    ...style,
                    border: active ? '1.5px solid var(--accent-color)' : undefined,
                    boxShadow: active ? '0 0 15px rgba(var(--accent-color-rgb), 0.5)' : undefined
                }}
            >
                <div className="badge-glow"></div>
                <span className="badge-content">
                    {icon}
                    <span>{text}</span>
                </span>
            </div>
            {tooltipTitle && tooltipText && (
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
            )}
        </div>
    );
};

export default CardTitle;
