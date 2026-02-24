import { useState, useEffect, useCallback } from "react";

export const useNotifications = () => {
  const [permission, setPermission] = useState(() => {
    if ("Notification" in window) {
      return Notification.permission;
    }
    return "default";
  });

  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("notificationsEnabled") === "true";
  });

  useEffect(() => {
    if (!("Notification" in window)) return;

    if (enabled && permission === "default") {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
      });
    }
  }, [enabled, permission]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported in this browser");
      return "denied";
    }

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm === "granted") {
      setEnabled(true);
      localStorage.setItem("notificationsEnabled", "true");
      // Show confirmation via SW if available, otherwise fallback
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification("FinanceDash", {
            body: "Notificações ativadas com sucesso!",
            icon: "/pwa-192x192.png",
            badge: "/pwa-192x192.png",
          });
        } catch {
          try {
            new Notification("FinanceDash", {
              body: "Notificações ativadas com sucesso!",
              icon: "/pwa-192x192.png",
            });
          } catch (e) {
            console.error("Error showing notification:", e);
          }
        }
      } else {
        try {
          new Notification("FinanceDash", {
            body: "Notificações ativadas com sucesso!",
            icon: "/pwa-192x192.png",
          });
        } catch (e) {
          console.error("Error showing notification:", e);
        }
      }
    } else {
      setEnabled(false);
      localStorage.setItem("notificationsEnabled", "false");
    }
    return perm;
  };

  const toggleNotifications = async () => {
    if (!("Notification" in window)) return;

    if (enabled) {
      setEnabled(false);
      localStorage.setItem("notificationsEnabled", "false");
    } else {
      if (permission === "granted") {
        setEnabled(true);
        localStorage.setItem("notificationsEnabled", "true");
      } else {
        await requestPermission();
      }
    }
  };

  /**
   * Sends a notification, preferring the Service Worker's showNotification()
   * for proper PWA behavior (works in background, appears in system tray).
   * Falls back to the Notification constructor if SW is unavailable.
   *
   * @param {string} title
   * @param {string} body
   * @param {object} options  Extra NotificationOptions (tag, data, actions…)
   */
  const sendNotification = useCallback(
    async (title, body, options = {}) => {
      if (!("Notification" in window)) return;
      if (!enabled || permission !== "granted") return;

      const notifOptions = {
        body,
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        ...options,
      };

      // Prefer SW showNotification: survives background tabs and integrates
      // with the OS notification centre properly as a PWA push alert.
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, notifOptions);
          return;
        } catch {
          // SW not active yet – fall through to inline notification
        }
      }

      try {
        new Notification(title, notifOptions);
      } catch (e) {
        console.error("Error sending notification:", e);
      }
    },
    [enabled, permission]
  );

  return {
    permission,
    enabled,
    requestPermission,
    toggleNotifications,
    sendNotification,
  };
};
