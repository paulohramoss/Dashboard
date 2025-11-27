import { useState, useEffect, useCallback } from "react";

export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("notificationsEnabled") === "true";
  });

  useEffect(() => {
    if (enabled && permission === "default") {
      Notification.requestPermission().then((perm) => {
        setPermission(perm);
      });
    }
  }, [enabled, permission]);

  const requestPermission = async () => {
    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm === "granted") {
      setEnabled(true);
      localStorage.setItem("notificationsEnabled", "true");
      new Notification("FinanceDash", {
        body: "Notificações ativadas com sucesso!",
        icon: "/pwa-192x192.png",
      });
    } else {
      setEnabled(false);
      localStorage.setItem("notificationsEnabled", "false");
    }
    return perm;
  };

  const toggleNotifications = async () => {
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
      if (enabled && permission === "granted") {
        new Notification(title, {
          body,
          icon: "/pwa-192x192.png",
        });
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
