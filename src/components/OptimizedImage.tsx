import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  optWidth?: number;
  optQuality?: number;
  hoverScale?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  optWidth, 
  optQuality, 
  hoverScale, 
  className, 
  style, 
  ...rest 
}) => {
  // Simple fallback since image optimization would require a next/image equivalent or external service
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${hoverScale ? 'hover-scale' : ''} ${className || ''}`}
      style={style}
      {...rest} 
    />
  );
};

export default OptimizedImage;
