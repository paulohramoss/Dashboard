import { useState } from "react";

const STORAGE_KEY = "pwa-update-preferences";

const DEFAULT_PREFS = {
    frequency: "immediate", // 'immediate' | 'daily' | 'weekly'
    autoUpdateWhenIdle: true,
    lastNotificationDate: null,
};

/**
 * Hook to manage PWA update preferences
 * @returns {object} Preferences and methods to update them
 */
export function useUpdatePreferences() {
    const [prefs, setPrefs] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
        } catch (error) {
            console.error("Error loading update preferences:", error);
            return DEFAULT_PREFS;
        }
    });

    const updatePreferences = (newPrefs) => {
        const updated = { ...prefs, ...newPrefs };
        setPrefs(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error("Error saving update preferences:", error);
        }
    };

    const shouldShowNotification = () => {
        if (prefs.frequency === "immediate") return true;

        if (!prefs.lastNotificationDate) return true;

        const lastDate = new Date(prefs.lastNotificationDate);
        const now = new Date();
        const diffMs = now - lastDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (prefs.frequency === "daily") return diffDays >= 1;
        if (prefs.frequency === "weekly") return diffDays >= 7;

        return true;
    };

    const markNotificationShown = () => {
        updatePreferences({ lastNotificationDate: new Date().toISOString() });
    };

    return {
        ...prefs,
        updatePreferences,
        shouldShowNotification,
        markNotificationShown,
    };
}
