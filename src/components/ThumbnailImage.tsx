import React, { useState, useEffect } from 'react';
import { Film, Image as ImageIcon } from 'lucide-react';
import type { ProjectType } from '../types/portfolio';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  fallbackTitle: string;
  projectType?: ProjectType;
  className?: string;
  eager?: boolean;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  fallbackTitle,
  projectType = 'video',
  className = '',
  eager = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#181818] via-[#101010] to-[#080808] p-4 text-center ${className}`}
      >
        {projectType === 'design' ? (
          <ImageIcon className="mb-2 h-6 w-6 text-white/40" aria-hidden="true" />
        ) : (
          <Film className="mb-2 h-6 w-6 text-white/40" aria-hidden="true" />
        )}
        <span className="line-clamp-2 max-w-[24ch] text-xs font-medium text-white/65">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-[#121212]">
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#141414]"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};
