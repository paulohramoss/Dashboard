import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { X, Shield, BarChart, Megaphone } from "lucide-react";

const CookiePreferencesDialog = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cookiePreferences");
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      essential: true,
      analytics: false,
      marketing: false,
    };
  });

  // No need for useEffect to load state anymore

  const handleSave = () => {
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    localStorage.setItem("cookieConsent", "true"); // Saving preferences implies consent
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background border rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {t("cookies.preferencesTitle")}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-muted-foreground">
            {t("cookies.preferencesDesc")}
          </p>

          <div className="space-y-4">
            {/* Essential */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-muted/50">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {t("cookies.essentialTitle")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("cookies.essentialDesc")}
                  </p>
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border">
              <div className="flex gap-3">
                <BarChart className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {t("cookies.analyticsTitle")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("cookies.analyticsDesc")}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, analytics: checked }))
                }
              />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border">
              <div className="flex gap-3">
                <Megaphone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {t("cookies.marketingTitle")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("cookies.marketingDesc")}
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, marketing: checked }))
                }
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-muted/10 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("cookies.savePreferences")}</Button>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferencesDialog;
