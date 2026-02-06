import { useState, useEffect } from "react";

/**
 * Hook to detect user inactivity
 * @param {number} timeoutMs - Time in milliseconds before considering user idle (default: 5 minutes)
 * @returns {boolean} isIdle - Whether the user is currently idle
 */
export function useUserActivity(timeoutMs = 5 * 60 * 1000) {
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        let timeoutId;

        const resetTimer = () => {
            setIsIdle(false);
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsIdle(true);
                console.log("👤 User is now idle");
            }, timeoutMs);
        };

        // Events that indicate user activity
        const events = [
            "mousedown",
            "mousemove",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];

        // Add event listeners
        events.forEach((event) => {
            document.addEventListener(event, resetTimer, { passive: true });
        });

        // Start timer
        resetTimer();

        // Cleanup
        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, resetTimer);
            });
            clearTimeout(timeoutId);
        };
    }, [timeoutMs]);

    return isIdle;
}
