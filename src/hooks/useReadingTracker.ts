import { useEffect, useRef, useState } from 'react';
import { useGamificationStore } from './useGamificationStore';

const IDLE_TIMEOUT = 60000; // 60 seconds

export function useReadingTracker(bookId: string | null) {
    const [isIdle, setIsIdle] = useState(false);
    const lastActivityRef = useRef<number>(Date.now());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const { addReadingTime } = useGamificationStore();

    // Idle Detection
    useEffect(() => {
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
            if (isIdle) setIsIdle(false);
        };

        const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
        events.forEach((e) => window.addEventListener(e, handleActivity));

        const idleCheck = setInterval(() => {
            if (Date.now() - lastActivityRef.current > IDLE_TIMEOUT) {
                setIsIdle(true);
            }
        }, 5000);

        return () => {
            events.forEach((e) => window.removeEventListener(e, handleActivity));
            clearInterval(idleCheck);
        };
    }, [isIdle]);

    // Timer Logic
    useEffect(() => {
        if (!bookId || isIdle || document.hidden) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            // Persist every 5 seconds to avoid spamming storage
            // Simplified: we rely on the component being mounted.
            saveProgress(0); // Calling with 0 as we removed the counter state usage here
        }, 5000); // Ticking every 5 seconds instead of 1 to reduce state updates if we aren't showing seconds

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [bookId, isIdle]);

    // Save Daily Progress
    const saveProgress = (_seconds: number) => {
        const today = new Date().toISOString().split('T')[0];
        const key = `reading_log_${today}`;

        try {
            const stored = localStorage.getItem(key);
            const data = stored ? JSON.parse(stored) : {};

            // We want to ADD the delta, but safely. 
            // Simplified: we rely on the component being mounted.
            // A more robust way is to store 'session start' and diff.
            // For this MVP, we will just increment the log by 5s chunks in React 
            // calling store action. A better way for the hook is to just notify the store.

            // Let's refactor: The hook just ticks. The STORE handles the aggregation.
            addReadingTime(5); // Notify store of 5 seconds of reading

            // Also local daily log for the graph
            const currentTotal = data[bookId || 'unknown'] || 0;
            data[bookId || 'unknown'] = currentTotal + 5;
            localStorage.setItem(key, JSON.stringify(data));

        } catch (e) {
            console.error("Failed to save reading log", e);
        }
    };

    return { isIdle };
}
