import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { usePremium } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const ProGate = ({ children, fallback, className, fullWidth = false }) => {
  const { t } = useTranslation();
  const { isPremium, loading } = usePremium();

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed text-muted-foreground bg-muted/20">
        <span className="animate-pulse">Loading...</span>
      </div>
    );
  }

  if (isPremium) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br from-background to-muted p-8 text-center shadow-sm",
        fullWidth ? "w-full" : "max-w-md mx-auto",
        className,
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
          <Crown className="h-8 w-8 text-white" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">
            {t("proGate.title", "Recurso Premium")}
          </h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            {t(
              "proGate.description",
              "Faça o upgrade para o plano Premium e libere funcionalidades exclusivas para ter o controle total de suas finanças.",
            )}
          </p>
        </div>

        <Button
          asChild
          className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-0 text-white shadow-md"
        >
          <Link to="/upgrade">
            {t("proGate.button", "Fazer Upgrade Agora")}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProGate;
