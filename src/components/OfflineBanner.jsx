import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

/**
 * Renders a sticky top banner when the user is offline.
 * When connectivity is restored it shows a toast and hides the banner.
 *
 * Because Firestore's offline persistence is enabled, writes made while
 * offline are queued and automatically synced on reconnection — the banner
 * reassures the user that this is happening.
 */
const OfflineBanner = () => {
  const { t } = useTranslation();
  const { isOnline, wasOffline } = useOnlineStatus();
  const reconnectedToastShown = useRef(false);

  useEffect(() => {
    if (isOnline && wasOffline && !reconnectedToastShown.current) {
      reconnectedToastShown.current = true;
      toast.success(t("offline.reconnected", "Conexão restaurada! Seus dados estão sendo sincronizados."));
    }

    // Reset the ref when going offline again so reconnection fires next time
    if (!isOnline) {
      reconnectedToastShown.current = false;
    }
  }, [isOnline, wasOffline, t]);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium shadow-md">
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        {t(
          "offline.banner",
          "Você está offline. As alterações serão salvas e sincronizadas ao reconectar."
        )}
      </span>
    </div>
  );
};

export default OfflineBanner;
