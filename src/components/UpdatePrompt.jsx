import { useRegisterSW } from "virtual:pwa-register/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

export default function UpdatePrompt() {
    const { t } = useTranslation();

    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log("✅ Service Worker registered successfully");
            // Check for updates every hour
            if (r) {
                setInterval(() => {
                    r.update();
                }, 60 * 60 * 1000); // 1 hour
            }
        },
        onRegisterError(error) {
            console.error("❌ Service Worker registration error:", error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    const handleUpdate = () => {
        updateServiceWorker(true);
    };

    // Don't show anything if no update is needed
    if (!needRefresh && !offlineReady) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-2xl max-w-sm border border-white/20">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-base">
                            {needRefresh
                                ? t("pwa.updateAvailable", "Nova versão disponível!")
                                : t("pwa.offlineReady", "App pronto para uso offline!")}
                        </p>
                        <p className="text-sm opacity-90 mt-1">
                            {needRefresh
                                ? t(
                                    "pwa.updateDescription",
                                    "Clique para atualizar e ver as novidades"
                                )
                                : t(
                                    "pwa.offlineDescription",
                                    "Agora você pode usar o app sem internet"
                                )}
                        </p>
                    </div>
                    <button
                        onClick={close}
                        className="h-6 w-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                        aria-label="Fechar"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {needRefresh && (
                    <div className="flex gap-2 mt-4">
                        <Button
                            onClick={handleUpdate}
                            size="sm"
                            className="flex-1 bg-white text-purple-600 hover:bg-white/90 font-semibold"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("pwa.updateNow", "Atualizar Agora")}
                        </Button>
                        <Button
                            onClick={close}
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white/20 text-white"
                        >
                            {t("pwa.later", "Depois")}
                        </Button>
                    </div>
                )}

                {offlineReady && !needRefresh && (
                    <div className="mt-3">
                        <Button
                            onClick={close}
                            size="sm"
                            className="w-full bg-white text-purple-600 hover:bg-white/90 font-semibold"
                        >
                            {t("common.close", "Fechar")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
