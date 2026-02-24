import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "notificationsEnabled";
const SYNC_EVENT = "notifications-state-changed";

// Always read live values – avoids cross-instance stale React state
const readEnabled = () => localStorage.getItem(STORAGE_KEY) === "true";
const readPermission = () =>
  "Notification" in window ? Notification.permission : "default";

/**
 * Shows a notification via Service Worker when available (proper PWA push –
 * survives background tabs and integrates with the OS notification centre),
 * falling back to the inline Notification constructor.
 * A 2-second timeout guards against a SW that hasn't activated yet.
 */
const dispatchNotification = async (title, body, options = {}) => {
  const notifOptions = {
    body,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    ...options,
  };

  if ("serviceWorker" in navigator) {
    try {
      const swReady = Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("SW timeout")), 2000)
        ),
      ]);
      const registration = await swReady;
      await registration.showNotification(title, notifOptions);
      return;
    } catch {
      // SW not ready – fall through to inline notification
    }
  }

  try {
    new Notification(title, notifOptions);
  } catch (e) {
    console.error("Error sending notification:", e);
  }
};

export const useNotifications = () => {
  const [permission, setPermission] = useState(readPermission);
  const [enabled, setEnabled] = useState(readEnabled);

  // Sync this instance whenever another instance (e.g. SettingsPage) updates
  // the shared state in localStorage.
  useEffect(() => {
    const handleSync = () => {
      setEnabled(readEnabled());
      setPermission(readPermission());
    };
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, []);

  // If the user enabled notifications but permission was default, request it.
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (enabled && readPermission() === "default") {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      });
    }
  }, [enabled]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported in this browser");
      return "denied";
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === "granted") {
      setEnabled(true);
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, "false");
    }

    // Notify all other hook instances (e.g. NotificationManager)
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));

    if (perm === "granted") {
      await dispatchNotification(
        "FinanceDash",
        "Notificações ativadas com sucesso!"
      );
    }

    return perm;
  };

  const toggleNotifications = async () => {
    if (!("Notification" in window)) return;

    if (enabled) {
      setEnabled(false);
      localStorage.setItem(STORAGE_KEY, "false");
      window.dispatchEvent(new CustomEvent(SYNC_EVENT));
    } else {
      if (readPermission() === "granted") {
        setEnabled(true);
        localStorage.setItem(STORAGE_KEY, "true");
        window.dispatchEvent(new CustomEvent(SYNC_EVENT));
      } else {
        await requestPermission();
      }
    }
  };

  /**
   * Reads live state from localStorage / Notification.permission on every
   * call, so it's never blocked by stale React state from another instance.
   */
  const sendNotification = useCallback(async (title, body, options = {}) => {
    if (!("Notification" in window)) return;
    if (!readEnabled() || readPermission() !== "granted") return;
    await dispatchNotification(title, body, options);
  }, []); // intentionally no deps – reads live values each call

  return {
    permission,
    enabled,
    requestPermission,
    toggleNotifications,
    sendNotification,
  };
};
