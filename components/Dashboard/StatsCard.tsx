'use client';

import React, { useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedNumber, AnimatedCurrency, AnimatedPercentage } from '@/components/ui/AnimatedNumber';

// Move constant objects outside component to prevent recreation on each render
const variantStyles = {
    default: 'from-gray-50 to-gray-100',
    gradient: 'from-cousin-purple/10 to-cousin-pink/10',
    success: 'from-cousin-green/10 to-emerald-100',
    warning: 'from-cousin-orange/10 to-amber-100',
} as const;

const iconBgStyles = {
    default: 'bg-gray-200',
    gradient: 'bg-gradient-to-br from-cousin-purple to-cousin-pink',
    success: 'bg-gradient-to-br from-cousin-green to-emerald-500',
    warning: 'bg-gradient-to-br from-cousin-orange to-amber-500',
} as const;

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
    };
    variant?: 'default' | 'gradient' | 'success' | 'warning';
    valueType?: 'number' | 'currency' | 'percentage' | 'text';
}

export const StatsCard = React.memo(function StatsCard({ title, value, subtitle, icon, trend, variant = 'default', valueType = 'text' }: StatsCardProps) {

    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend.value > 0) return <TrendingUp className="w-4 h-4" />;
        if (trend.value < 0) return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (!trend) return '';
        if (trend.value > 0) return 'text-cousin-green';
        if (trend.value < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const renderValue = () => {
        const className = "text-3xl font-bold font-outfit bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent";

        if (typeof value === 'number') {
            if (valueType === 'currency') {
                return <AnimatedCurrency value={value} className={className} />;
            } else if (valueType === 'percentage') {
                return <AnimatedPercentage value={value} className={className} />;
            } else if (valueType === 'number') {
                return <AnimatedNumber value={value} className={className} />;
            }
        }

        return <span className={className}>{value}</span>;
    };

    return (
        <Card variant="interactive" className={cn('bg-gradient-to-br', variantStyles[variant])}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className={cn(
                    'p-3 rounded-xl text-white shadow-md',
                    iconBgStyles[variant]
                )}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <p>
                        {renderValue()}
                    </p>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
                            {getTrendIcon()}
                            <span>{Math.abs(trend.value)}%</span>
                            <span className="text-gray-400 font-normal">{trend.label}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
