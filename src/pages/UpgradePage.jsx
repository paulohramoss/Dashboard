import React from "react";
import { useTranslation } from "react-i18next";
import { usePremium, FREE_LIMITS } from "@/hooks/usePremium";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  Bot,
  BarChart3,
  FileUp,
  FileDown,
  Repeat,
  Target,
  TrendingDown,
  Swords,
  Users,
  Shield,
  Mail,
  ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PREMIUM_FEATURES = [
  { icon: Bot, key: "ai" },
  { icon: BarChart3, key: "advancedReports" },
  { icon: FileUp, key: "import" },
  { icon: FileDown, key: "export" },
  { icon: Repeat, key: "unlimitedRecurring" },
  { icon: Target, key: "unlimitedGoals" },
  { icon: TrendingDown, key: "debt" },
  { icon: Swords, key: "challenges" },
  { icon: Users, key: "sharedFinance" },
  { icon: Shield, key: "autoCateg" },
  { icon: Mail, key: "emailReports" },
  { icon: ScanLine, key: "ocr" },
  { icon: Zap, key: "forecast" },
];

const PlanCard = ({ plan, isCurrentPlan, isRecommended }) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 gap-6 transition-all duration-200",
        isRecommended
          ? "border-primary shadow-lg shadow-primary/10 scale-105"
          : "border-border hover:border-primary/40",
      )}
    >
      {isRecommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Crown className="h-3 w-3" />
            {t("upgrade.recommended")}
          </span>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold">{plan.name}</h3>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-4xl font-extrabold">{plan.price}</span>
          {plan.period && (
            <span className="text-muted-foreground mb-1">{plan.period}</span>
          )}
        </div>
        {plan.yearlyNote && (
          <p className="text-xs text-muted-foreground mt-1">
            {plan.yearlyNote}
          </p>
        )}
        {plan.discount && (
          <span className="inline-block mt-2 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            {plan.discount}
          </span>
        )}
      </div>

      <ul className="flex-1 space-y-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {f.included ? (
              <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
            )}
            <span className={!f.included ? "text-muted-foreground/50" : ""}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      <Button
        variant={isCurrentPlan ? "outline" : "default"}
        disabled={isCurrentPlan}
        className="w-full"
        onClick={() => {
          if (!isCurrentPlan) {
            const msg = encodeURIComponent(
              `Olá! Tenho interesse em assinar o plano ${plan.name} do FinanceDash. 😊`,
            );
            window.open(`https://wa.me/5549989011318?text=${msg}`, "_blank");
          }
        }}
      >
        {isCurrentPlan ? (
          t("upgrade.currentPlan")
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            {t("upgrade.choosePlan")}
          </>
        )}
      </Button>
    </div>
  );
};

const UpgradePage = () => {
  const { t } = useTranslation();
  const { isPremium } = usePremium();

  const freeFeatures = [
    {
      label: t("upgrade.features.transactions", {
        count: FREE_LIMITS.transactionsPerMonth,
      }),
      included: true,
    },
    {
      label: t("upgrade.features.accounts", { count: FREE_LIMITS.accounts }),
      included: true,
    },
    {
      label: t("upgrade.features.goals", { count: FREE_LIMITS.goals }),
      included: true,
    },
    {
      label: t("upgrade.features.categories", {
        count: FREE_LIMITS.customCategories,
      }),
      included: true,
    },
    { label: t("upgrade.features.basicReports"), included: true },
    { label: t("upgrade.features.calendar"), included: true },
    { label: t("upgrade.features.pwa"), included: true },
    { label: t("upgrade.features.ai"), included: false },
    { label: t("upgrade.features.import"), included: false },
    { label: t("upgrade.features.export"), included: false },
    { label: t("upgrade.features.debt"), included: false },
    { label: t("upgrade.features.challenges"), included: false },
    { label: t("upgrade.features.sharedFinance"), included: false },
    { label: t("upgrade.features.unlimitedAll"), included: false },
  ];

  const premiumFeatures = [
    { label: t("upgrade.features.unlimitedTransactions"), included: true },
    { label: t("upgrade.features.unlimitedAccounts"), included: true },
    { label: t("upgrade.features.unlimitedGoals"), included: true },
    { label: t("upgrade.features.unlimitedCategories"), included: true },
    { label: t("upgrade.features.advancedReports"), included: true },
    { label: t("upgrade.features.calendar"), included: true },
    { label: t("upgrade.features.pwa"), included: true },
    { label: t("upgrade.features.ai"), included: true },
    { label: t("upgrade.features.import"), included: true },
    { label: t("upgrade.features.export"), included: true },
    { label: t("upgrade.features.debt"), included: true },
    { label: t("upgrade.features.challenges"), included: true },
    { label: t("upgrade.features.sharedFinance"), included: true },
    { label: t("upgrade.features.emailReports"), included: true },
  ];

  const plans = [
    {
      name: t("upgrade.plans.free", "Free"),
      price: "R$ 0",
      period: null,
      features: freeFeatures,
      isFree: true,
    },
    {
      name: t("upgrade.plans.premiumMonthly", "Premium Mensal"),
      price: "R$ 10,00",
      period: `/${t("upgrade.month", "mês")}`,
      features: premiumFeatures,
      isFree: false,
      billing: "monthly",
    },
    {
      name: t("upgrade.plans.premiumYearly", "Premium Anual"),
      price: "R$ 80,00",
      period: `/${t("upgrade.year", "ano")}`,
      yearlyNote: t("upgrade.perMonth", {
        defaultValue: "Equivalente a {{value}}/mês",
        value: "R$ 6,60",
      }),
      discount: t("upgrade.discount", {
        defaultValue: "Economize {{pct}}%",
        pct: 33,
      }),
      features: premiumFeatures,
      isFree: false,
      billing: "yearly",
      recommended: true,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          <Crown className="h-4 w-4" />
          {t("upgrade.badge", "Planos FinanceDash")}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold">
          {t("upgrade.title", "Assuma o controle total")}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {t("upgrade.subtitle")}
        </p>
        {isPremium && (
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full font-semibold">
            <Check className="h-4 w-4" />
            {t("upgrade.alreadyPremium")}
          </div>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {plans.map((plan, i) => (
          <PlanCard
            key={i}
            plan={plan}
            isCurrentPlan={isPremium ? !plan.isFree : plan.isFree}
            isRecommended={plan.recommended}
          />
        ))}
      </div>

      {/* Premium feature highlights */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-center">
          {t("upgrade.featuresTitle", "Tudo incluído no Premium")}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PREMIUM_FEATURES.map((feature) => {
            const FeatIcon = feature.icon;
            return (
              <div
                key={feature.key}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border hover:border-primary/40 transition-colors text-center"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <FeatIcon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium">
                  {t(`upgrade.highlight.${feature.key}`)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-center">
          {t("upgrade.faqTitle")}
        </h2>
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-xl border bg-card p-4 space-y-1">
            <p className="font-semibold text-sm">{t(`upgrade.faq.q${n}`)}</p>
            <p className="text-sm text-muted-foreground">
              {t(`upgrade.faq.a${n}`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpgradePage;
