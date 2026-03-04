import React from "react";
import { useTranslation } from "react-i18next";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * PremiumGate wraps content that requires a premium subscription.
 *
 * @param {React.ReactNode} children  - The premium content to render when user is premium.
 * @param {string}  feature           - Short label for the locked feature.
 * @param {string}  description       - Longer description shown in the full gate.
 * @param {boolean} inline            - Use a compact overlay instead of a full-page gate.
 * @param {React.ReactNode} fallback  - Custom fallback instead of the default gate UI.
 */
const PremiumGate = ({
  children,
  feature,
  description,
  inline = false,
  fallback,
}) => {
  const { isPremium, loading } = usePremium();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) return null;
  if (isPremium) return children;

  if (fallback) return fallback;

  if (inline) {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none opacity-20 blur-sm">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center p-4 bg-card/80 backdrop-blur-sm rounded-lg border shadow-lg">
            <Lock className="h-5 w-5 text-primary" />
            <p className="text-xs font-semibold text-foreground">
              {feature || t("premium.feature")}
            </p>
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => navigate("/upgrade")}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {t("premium.upgrade")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4">
      <div className="p-5 rounded-full bg-primary/10 ring-2 ring-primary/20">
        <Lock className="h-10 w-10 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">
          {feature || t("premium.feature")}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {description || t("premium.description")}
        </p>
      </div>
      <Button size="lg" onClick={() => navigate("/upgrade")}>
        <Sparkles className="h-4 w-4 mr-2" />
        {t("premium.viewPlans")}
      </Button>
    </div>
  );
};

export default PremiumGate;
