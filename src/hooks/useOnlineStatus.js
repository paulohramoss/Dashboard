import { useState, useEffect } from "react";

/**
 * Tracks the browser's network connectivity.
 * `isOnline` updates in real-time via the window online/offline events.
 * `wasOffline` flips to true the first time offline and stays true, so
 * callers can detect a reconnection moment even after `isOnline` is true again.
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
};
