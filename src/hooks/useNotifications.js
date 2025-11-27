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
      try {
        new Notification("FinanceDash", {
          body: "Notificações ativadas com sucesso!",
          icon: "/pwa-192x192.png",
        });
      } catch (e) {
        console.error("Error showing notification:", e);
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

  const sendNotification = useCallback(
    (title, body) => {
      if (!("Notification" in window)) return;

      if (enabled && permission === "granted") {
        try {
          new Notification(title, {
            body,
            icon: "/pwa-192x192.png",
          });
        } catch (e) {
          console.error("Error sending notification:", e);
        }
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
