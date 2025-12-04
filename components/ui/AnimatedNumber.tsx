'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedNumberProps {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export function AnimatedNumber({
    value,
    duration = 1000,
    decimals = 0,
    prefix = '',
    suffix = '',
    className = '',
}: AnimatedNumberProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number | null = null;
        const startValue = 0;
        const endValue = value;

        const animate = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (endValue - startValue) * easeOut;

            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValue);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration, isInView]);

    const formattedValue = displayValue.toFixed(decimals);

    return (
        <span ref={ref} className={className}>
            {prefix}{formattedValue}{suffix}
        </span>
    );
}

interface AnimatedCurrencyProps {
    value: number;
    currency?: string;
    duration?: number;
    className?: string;
}

export function AnimatedCurrency({
    value,
    currency = 'KES',
    duration = 1000,
    className = '',
}: AnimatedCurrencyProps) {
    return (
        <AnimatedNumber
            value={value}
            duration={duration}
            decimals={0}
            prefix={`${currency} `}
            className={className}
        />
    );
}

interface AnimatedPercentageProps {
    value: number;
    duration?: number;
    className?: string;
}

export function AnimatedPercentage({
    value,
    duration = 1000,
    className = '',
}: AnimatedPercentageProps) {
    return (
        <AnimatedNumber
            value={value}
            duration={duration}
            decimals={0}
            suffix="%"
            className={className}
        />
    );
}
