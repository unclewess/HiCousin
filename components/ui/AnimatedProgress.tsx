'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Sparkles } from 'lucide-react';

interface AnimatedProgressBarProps {
    value: number; // 0-100
    max?: number;
    showLabel?: boolean;
    showPercentage?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'gradient';
    size?: 'sm' | 'md' | 'lg';
    animate?: boolean;
    celebrateOnComplete?: boolean;
}

export function AnimatedProgressBar({
    value,
    max = 100,
    showLabel = false,
    showPercentage = true,
    variant = 'gradient',
    size = 'md',
    animate = true,
    celebrateOnComplete = true,
}: AnimatedProgressBarProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });
    const [showCelebration, setShowCelebration] = useState(false);

    const percentage = Math.min((value / max) * 100, 100);
    const isComplete = percentage >= 100;

    useEffect(() => {
        if (isComplete && celebrateOnComplete && isInView) {
            setShowCelebration(true);
            const timer = setTimeout(() => setShowCelebration(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isComplete, celebrateOnComplete, isInView]);

    const variantStyles = {
        default: 'from-gray-400 to-gray-500',
        success: 'from-cousin-green to-emerald-500',
        warning: 'from-cousin-orange to-amber-500',
        gradient: 'from-cousin-purple via-cousin-blue to-cousin-pink',
    };

    const sizeStyles = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    return (
        <div ref={ref} className="w-full space-y-2">
            {/* Label and Percentage */}
            {(showLabel || showPercentage) && (
                <div className="flex items-center justify-between text-sm">
                    {showLabel && (
                        <span className="text-gray-600 font-medium">
                            {isComplete ? 'Complete!' : 'Progress'}
                        </span>
                    )}
                    {showPercentage && (
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                'font-bold font-outfit',
                                isComplete ? 'text-cousin-green' : 'text-gray-700'
                            )}>
                                {Math.round(percentage)}%
                            </span>
                            {isComplete && (
                                <CheckCircle className="w-4 h-4 text-cousin-green" />
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            <div className={cn(
                'relative w-full bg-gray-200 rounded-full overflow-hidden',
                sizeStyles[size]
            )}>
                <motion.div
                    className={cn(
                        'h-full bg-gradient-to-r rounded-full relative',
                        variantStyles[variant],
                        isComplete && 'animate-pulse'
                    )}
                    initial={animate ? { width: 0 } : { width: `${percentage}%` }}
                    animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
                    transition={{
                        duration: 1.5,
                        ease: [0.4, 0, 0.2, 1], // Ease-out cubic
                        delay: 0.2,
                    }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>

                {/* Celebration confetti */}
                {showCelebration && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
                    </motion.div>
                )}
            </div>

            {/* Milestone markers (optional) */}
            {max > 0 && (
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>{max}</span>
                </div>
            )}
        </div>
    );
}

interface CircularProgressProps {
    value: number; // 0-100
    size?: number;
    strokeWidth?: number;
    showPercentage?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'gradient';
}

export function CircularProgress({
    value,
    size = 120,
    strokeWidth = 8,
    showPercentage = true,
    variant = 'gradient',
}: CircularProgressProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    const percentage = Math.min(value, 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const gradientColors = {
        default: { start: '#9CA3AF', end: '#6B7280' },
        success: { start: '#10B981', end: '#059669' },
        warning: { start: '#F59E0B', end: '#D97706' },
        gradient: { start: '#8B5CF6', end: '#EC4899' },
    };

    const colors = gradientColors[variant];

    return (
        <div ref={ref} className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                    <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.start} />
                        <stop offset="100%" stopColor={colors.end} />
                    </linearGradient>
                </defs>

                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={`url(#gradient-${variant})`}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
                    transition={{
                        duration: 1.5,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>

            {/* Percentage text */}
            {showPercentage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold font-outfit text-gray-900">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
}
