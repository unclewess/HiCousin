"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressBarProps {
    progress: number; // 0 to 100
    targetAmount?: number;
    currentAmount?: number;
    className?: string;
    showMascot?: boolean;
    mascotState?: 'idle' | 'react' | 'complete';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    targetAmount,
    currentAmount,
    className,
    showMascot = true,
    mascotState = 'idle',
}) => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    const isComplete = clampedProgress >= 100;

    // Dynamic color state rules
    const getColor = (p: number) => {
        if (p >= 100) return 'bg-cousin-green';
        if (p >= 67) return 'bg-cousin-purple';
        if (p >= 34) return 'bg-cousin-yellow';
        return 'bg-cousin-blue';
    };

    const currentColorClass = getColor(clampedProgress);

    // Microcopy messages based on progress
    const getMessage = (p: number) => {
        if (p >= 100) return "You smashed it cousin 🎉";
        if (p >= 67) return "Almost there! 👏";
        if (p >= 34) return "You’re cooking 🔥";
        return "Keep going cousin 👀";
    };

    return (
        <div className={cn("w-full relative pt-8 pb-4", className)}>
            {/* Data Display - Outside Top Right */}
            {targetAmount !== undefined && (
                <div className="absolute top-0 right-0 text-xs font-semibold text-gray-mid mb-1">
                    Target: ${targetAmount.toLocaleString()}
                </div>
            )}

            {/* Mascot Positioning */}
            {showMascot && (
                <motion.div
                    className="absolute -top-6 left-0 z-10"
                    initial={{ x: 0, y: 0 }}
                    animate={{
                        x: `${clampedProgress}%`,
                        y: isComplete ? -10 : 0,
                        rotate: isComplete ? [0, -10, 10, 0] : 0,
                    }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                >
                    {/* Placeholder for Mascot Image - Replace src with actual asset path */}
                    <div className="w-12 h-12 bg-white rounded-full shadow-soft-drop flex items-center justify-center border-2 border-white overflow-hidden">
                        <img
                            src="/assets/lil-cousin.png"
                            alt="Lil Cousin"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback if image missing
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerText = '👻';
                            }}
                        />
                    </div>

                    {/* Speech Bubble / Microcopy */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded-soft shadow-sm text-[10px] font-bold text-gray-dark"
                    >
                        {getMessage(clampedProgress)}
                    </motion.div>
                </motion.div>
            )}

            {/* Progress Bar Track */}
            <div className="h-7 w-full bg-gray-light rounded-pill overflow-hidden relative shadow-inner">
                <motion.div
                    className={cn(
                        "h-full relative rounded-pill flex items-center justify-end px-3 transition-colors duration-500",
                        currentColorClass
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Fill Shimmer Effect */}
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(255,255,255,.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.25)_50%,rgba(255,255,255,.25)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]" />

                    {/* Data Display - Inside Bar */}
                    {clampedProgress > 15 && (
                        <span className="relative z-10 text-xs font-bold text-white drop-shadow-sm">
                            {clampedProgress.toFixed(0)}%
                        </span>
                    )}
                </motion.div>
            </div>

            {/* Data Display - Outside Bottom Right */}
            {targetAmount !== undefined && currentAmount !== undefined && (
                <div className="absolute -bottom-1 right-0 text-xs font-medium text-gray-mid mt-1">
                    Remaining: ${(targetAmount - currentAmount).toLocaleString()}
                </div>
            )}

            {/* Completion Effects */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    >
                        <div className="text-4xl">🎉</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { ProgressBar };
