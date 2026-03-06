import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";

/**
 * Wraps premium-only UI. If the user is not premium, renders a locked overlay.
 *
 * Props:
 *   feature  – optional i18n key suffix for the feature name (e.g. "ai", "advancedReports")
 *   compact  – show a small inline badge instead of a full overlay
 *   children – the premium content to gate
 */
const PremiumGate = ({ children, feature, compact = false }) => {
  const { isPremium, loading } = usePremium();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) return null;

  if (isPremium) return children;

  const featureLabel = feature
    ? t(`upgrade.highlight.${feature}`, { defaultValue: t("premium.feature") })
    : t("premium.feature");

  if (compact) {
    return (
      <div className="relative inline-flex items-center gap-1.5 opacity-60 cursor-not-allowed select-none">
        {children}
        <span
          className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full cursor-pointer opacity-100"
          onClick={() => navigate("/upgrade")}
        >
          <Crown className="h-2.5 w-2.5" />
          Premium
        </span>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-border bg-card overflow-hidden">
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40 saturate-50">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-[2px] p-6 text-center">
        <div className="p-3 rounded-full bg-primary/10">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="font-bold text-sm">{featureLabel}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("premium.description")}
          </p>
        </div>
        <Button size="sm" onClick={() => navigate("/upgrade")}>
          <Crown className="h-3.5 w-3.5 mr-1.5" />
          {t("premium.upgrade")}
        </Button>
      </div>
    </div>
  );
};

export default PremiumGate;
