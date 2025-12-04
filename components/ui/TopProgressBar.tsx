'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

export function TopProgressBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Configure NProgress with slower, more visible settings
        NProgress.configure({
            showSpinner: false,
            trickleSpeed: 100, // Slower trickle for visibility
            minimum: 0.1,
            easing: 'ease',
            speed: 800, // Slower animation
        });
    }, []);

    useEffect(() => {
        // Start progress on route change
        NProgress.start();

        // Keep it visible for at least 300ms
        const timer = setTimeout(() => {
            NProgress.done();
        }, 300);

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [pathname, searchParams]);

    return null;
}
