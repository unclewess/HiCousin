import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
    quality?: number;
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    fill = false,
    sizes,
    quality = 75,
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-gray-100 text-gray-400",
                    className
                )}
                style={{ width, height }}
            >
                <span className="text-sm">Failed to load</span>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <Image
                src={src}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                fill={fill}
                sizes={sizes}
                quality={quality}
                priority={priority}
                className={cn(
                    "duration-300 ease-in-out",
                    isLoading ? "scale-105 blur-sm" : "scale-100 blur-0"
                )}
                onLoadingComplete={() => setIsLoading(false)}
                onError={() => setHasError(true)}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    );
}
