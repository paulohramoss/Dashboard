import React, { useEffect } from "react";

const VersionChecker = () => {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Append timestamp to avoid caching of the version file itself
        const response = await fetch(
          `/version.json?t=${new Date().getTime()}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();
        const serverVersion = data.version;
        const localVersion = localStorage.getItem("app_version");

        if (localVersion && localVersion !== serverVersion) {
          console.log("New version detected. Clearing cache and reloading...");

          // Clear local storage version to ensure we update it after reload
          // We don't clear ALL local storage to preserve user session/preferences if possible
          // But if "clearing cache" is strict requirement, we might need to be more aggressive.
          // For now, let's just reload. The browser should fetch new assets.

          // Optional: Clear caches if using Service Worker
          if ("caches" in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
          }

          // Update local version
          localStorage.setItem("app_version", serverVersion);

          // Force reload ignoring cache
          window.location.reload(true);
        } else if (!localVersion) {
          // First load, set version
          localStorage.setItem("app_version", serverVersion);
        }
      } catch (error) {
        console.error("Failed to check version:", error);
      }
    };

    // Check on mount
    checkVersion();

    // Optional: Check periodically (e.g., every hour)
    const interval = setInterval(checkVersion, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
};

export default VersionChecker;
