import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share, PlusSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const IOSInstallPrompt = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);

    // Detect standalone mode (PWA installed)
    const isStandaloneMode =
      window.navigator.standalone ||
      window.matchMedia("(display-mode: standalone)").matches;

    // Check if prompt was previously dismissed
    const isDismissed = localStorage.getItem("iosInstallPromptDismissed");

    return isIosDevice && !isStandaloneMode && !isDismissed;
  });

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("iosInstallPromptDismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg animate-in slide-in-from-bottom duration-500 md:hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{t("install.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("install.description")}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDismiss}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <span className="font-bold">1</span>
          </div>
          <span>
            {t("install.step1")}{" "}
            <Share className="inline-block h-4 w-4 mx-1 text-blue-500" />
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <span className="font-bold">2</span>
          </div>
          <span>
            {t("install.step2")}{" "}
            <PlusSquare className="inline-block h-4 w-4 mx-1" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;
