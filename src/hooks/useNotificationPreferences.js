import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "notificationPreferences";
const SYNC_EVENT = "notification-preferences-changed";

const DEFAULT_PREFERENCES = {
  lowBalance: { inApp: true, email: false, push: false },
  expenseReminder: { inApp: true, email: false, push: false },
  financialGoals: { inApp: true, email: false, push: false },
  weeklySummary: { inApp: false, email: true, push: false },
  financialInsights: { inApp: true, email: false, push: false },
  recurringSubscriptions: { inApp: true, email: false, push: false },
};

const readPreferences = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new keys added in future
    const merged = { ...DEFAULT_PREFERENCES };
    for (const key of Object.keys(DEFAULT_PREFERENCES)) {
      if (parsed[key]) {
        merged[key] = { ...DEFAULT_PREFERENCES[key], ...parsed[key] };
      }
    }
    return merged;
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState(readPreferences);

  useEffect(() => {
    const handleSync = () => setPreferences(readPreferences());
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, []);

  const updatePreference = useCallback((notificationType, channel, value) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        [notificationType]: {
          ...prev[notificationType],
          [channel]: value,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      return updated;
    });
  }, []);

  const toggleAll = useCallback((notificationType, enabled) => {
    setPreferences((prev) => {
      const current = prev[notificationType];
      const updated = {
        ...prev,
        [notificationType]: Object.fromEntries(
          Object.keys(current).map((ch) => [ch, enabled])
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      return updated;
    });
  }, []);

  const isAnyEnabled = useCallback(
    (notificationType) =>
      Object.values(preferences[notificationType] || {}).some(Boolean),
    [preferences]
  );

  return { preferences, updatePreference, toggleAll, isAnyEnabled };
};
