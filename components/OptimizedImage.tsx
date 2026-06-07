import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    optWidth?: number;
    optQuality?: number;
    hoverScale?: boolean; 
}

const getOptimizedUrl = (url: string, width: number = 400, quality: number = 80) => {
    // Only optimize http/https urls, skip data URIs or relative paths
    if (!url.startsWith('http')) return url;
    // Use wsrv.nl proxy for dynamic compression to WebP
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=${quality}`;
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
    src, 
    alt, 
    optWidth = 600, 
    optQuality = 80, 
    className = '', 
    style, 
    hoverScale = false,
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    
    const optimizedSrc = getOptimizedUrl(src, optWidth, optQuality);

    return (
        <img
            src={hasError ? src : optimizedSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={(e) => {
                setIsLoaded(true);
                if (props.onLoad) props.onLoad(e);
            }}
            onError={() => {
                if (!hasError) {
                    setHasError(true);
                    setIsLoaded(true);
                }
            }}
            className={`${className} ${isLoaded ? 'loaded' : 'loading'}`}
            style={{
                ...style,
                opacity: isLoaded ? 1 : 0,
                transition: hoverScale 
                    ? 'opacity 0.5s ease-in-out, transform 0.3s ease' 
                    : 'opacity 0.5s ease-in-out',
                backgroundColor: isLoaded ? 'transparent' : 'rgba(0,0,0,0.05)',
            }}
            {...props}
        />
    );
};

export default OptimizedImage;
