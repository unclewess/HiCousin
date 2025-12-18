'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseVisibilityPollingOptions {
    /** Polling interval in milliseconds */
    interval: number;
    /** Whether polling is enabled */
    enabled?: boolean;
    /** Whether to fetch immediately when the page becomes visible */
    fetchOnFocus?: boolean;
}

/**
 * A custom hook that polls a function at a specified interval,
 * but only when the browser tab is visible.
 * 
 * This prevents unnecessary API calls and re-renders when the user
 * is not actively viewing the page.
 * 
 * @param callback - The function to call at each interval
 * @param options - Configuration options
 */
export function useVisibilityPolling(
    callback: () => void | Promise<void>,
    options: UseVisibilityPollingOptions
) {
    const { interval, enabled = true, fetchOnFocus = true } = options;
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Keep callback ref up to date
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const startPolling = useCallback(() => {
        if (intervalRef.current) return; // Already polling

        intervalRef.current = setInterval(() => {
            callbackRef.current();
        }, interval);
    }, [interval]);

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!enabled) {
            stopPolling();
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                stopPolling();
            } else {
                if (fetchOnFocus) {
                    callbackRef.current();
                }
                startPolling();
            }
        };

        // Start polling if page is currently visible
        if (!document.hidden) {
            startPolling();
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [enabled, startPolling, stopPolling, fetchOnFocus]);

    return { startPolling, stopPolling };
}
