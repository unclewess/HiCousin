'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { Sparkles, TrendingUp, Award, Zap } from 'lucide-react';

interface ConfettiProps {
    show: boolean;
    duration?: number;
}

export function Confetti({ show, duration = 2000 }: ConfettiProps) {
    const confettiPieces = Array.from({ length: 20 }, (_, i) => i);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {confettiPieces.map((i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                backgroundColor: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'][
                                    Math.floor(Math.random() * 5)
                                ],
                            }}
                            initial={{ y: 0, opacity: 1, rotate: 0 }}
                            animate={{
                                y: window.innerHeight + 100,
                                opacity: 0,
                                rotate: Math.random() * 720,
                                x: (Math.random() - 0.5) * 200,
                            }}
                            transition={{
                                duration: duration / 1000,
                                ease: 'easeOut',
                                delay: Math.random() * 0.5,
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}

interface CelebrationBadgeProps {
    type: 'milestone' | 'achievement' | 'rank' | 'streak';
    title: string;
    description: string;
    show: boolean;
    onClose?: () => void;
}

export function CelebrationBadge({ type, title, description, show, onClose }: CelebrationBadgeProps) {
    const icons = {
        milestone: <Award className="w-8 h-8" />,
        achievement: <Sparkles className="w-8 h-8" />,
        rank: <TrendingUp className="w-8 h-8" />,
        streak: <Zap className="w-8 h-8" />,
    };

    const gradients = {
        milestone: 'from-yellow-400 to-orange-500',
        achievement: 'from-purple-400 to-pink-500',
        rank: 'from-blue-400 to-cyan-500',
        streak: 'from-orange-400 to-red-500',
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    >
                        {/* Badge Card */}
                        <motion.div
                            className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.5, opacity: 0, y: 50 }}
                            transition={{
                                type: 'spring',
                                damping: 20,
                                stiffness: 300,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <motion.div
                                className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${gradients[type]} flex items-center justify-center text-white shadow-lg`}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                            >
                                {icons[type]}
                            </motion.div>

                            {/* Content */}
                            <motion.div
                                className="text-center space-y-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className="text-2xl font-bold font-outfit text-gray-900">{title}</h3>
                                <p className="text-gray-600">{description}</p>
                            </motion.div>

                            {/* Sparkles */}
                            <motion.div
                                className="absolute -top-4 -right-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                                <Sparkles className="w-8 h-8 text-yellow-400" />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Confetti */}
                    <Confetti show={show} />
                </>
            )}
        </AnimatePresence>
    );
}

interface PulseIndicatorProps {
    show: boolean;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function PulseIndicator({ show, color = 'bg-cousin-green', size = 'md' }: PulseIndicatorProps) {
    const sizes = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
    };

    if (!show) return null;

    return (
        <span className="relative flex">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`} />
            <span className={`relative inline-flex rounded-full ${sizes[size]} ${color}`} />
        </span>
    );
}
