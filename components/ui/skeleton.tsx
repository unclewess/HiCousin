import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
    animation?: 'pulse' | 'wave' | 'none'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'rectangular', width, height, animation = 'pulse', ...props }, ref) => {
        const variantClasses = {
            text: 'h-4 rounded',
            circular: 'rounded-full',
            rectangular: 'rounded-md',
        }

        const animationClasses = {
            pulse: 'animate-pulse',
            wave: 'animate-shimmer',
            none: '',
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "bg-gray-200 dark:bg-gray-800",
                    variantClasses[variant],
                    animationClasses[animation],
                    className
                )}
                style={{
                    width: width || '100%',
                    height: height || (variant === 'text' ? '1rem' : '100%'),
                }}
                {...props}
            />
        )
    }
)
Skeleton.displayName = "Skeleton"

// Preset skeleton components for common use cases
const SkeletonCard = () => (
    <div className="space-y-3 p-4 border rounded-lg">
        <Skeleton variant="rectangular" height={120} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="80%" />
    </div>
)

const SkeletonAvatar = ({ size = 40 }: { size?: number }) => (
    <Skeleton variant="circular" width={size} height={size} />
)

const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
    <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                variant="text"
                width={i === lines - 1 ? '60%' : '100%'}
            />
        ))}
    </div>
)

export { Skeleton, SkeletonCard, SkeletonAvatar, SkeletonText }
