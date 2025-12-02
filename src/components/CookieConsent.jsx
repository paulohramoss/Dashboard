import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { X, Cookie } from "lucide-react";

import CookiePreferencesDialog from "./CookiePreferencesDialog";

const CookieConsent = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show after a small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-full duration-500">
        <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border shadow-lg rounded-lg p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-2 bg-primary/10 rounded-full hidden md:block">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm flex items-center gap-2 md:hidden">
                <Cookie className="h-4 w-4 text-primary" />
                Cookies
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("cookies.message")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 md:flex-none"
              onClick={() => setShowPreferences(true)}
            >
              {t("cookies.settings")}
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="flex-1 md:flex-none"
            >
              {t("cookies.accept")}
            </Button>
          </div>
        </div>
      </div>
      <CookiePreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </>
  );
};

export default CookieConsent;
