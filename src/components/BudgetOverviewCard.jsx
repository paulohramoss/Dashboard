import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { motion as Motion } from "framer-motion";

const calculateProgress = (categoryName, budget, category, transactions) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const spent = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category === categoryName &&
        new Date(t.date).getMonth() === currentMonth &&
        new Date(t.date).getFullYear() === currentYear,
    )
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  let effectiveBudget = budget;
  if (category.rollover && category.accumulatedRollover) {
    effectiveBudget += category.accumulatedRollover;
  }

  return {
    spent,
    percentage: Math.min((spent / effectiveBudget) * 100, 100),
    remaining: Math.max(effectiveBudget - spent, 0),
    effectiveBudget,
    isOver: spent > effectiveBudget,
  };
};

const getBarGradient = (percentage) => {
  if (percentage < 75) return "progress-gradient-green";
  if (percentage < 100) return "progress-gradient-yellow";
  return "progress-gradient-red";
};

const getTextColor = (percentage) => {
  if (percentage < 75) return "text-emerald-600 dark:text-emerald-400";
  if (percentage < 100) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

const BudgetOverviewCard = ({ categories, transactions }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  const activeBudgets = useMemo(() => {
    const withBudget = categories.filter((c) => c.budget > 0);
    return withBudget.filter(
      (c, idx, self) => idx === self.findIndex((b) => b.name === c.name),
    );
  }, [categories]);

  if (activeBudgets.length === 0) return null;

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold text-foreground">
          {t("budgetOverview.title")}
        </CardTitle>
        <Link
          to="/budgets"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          {t("budgetOverview.manage")}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          {activeBudgets.map((category) => {
            const { spent, percentage, remaining, effectiveBudget, isOver } =
              calculateProgress(
                category.name,
                category.budget,
                category,
                transactions,
              );

            const categoryLabel = category.isDefault
              ? t(`categories.${category.name.toLowerCase()}`)
              : category.name;

            return (
              <div key={category.id} className="space-y-2">
                {/* Name + percentage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.color || "#94a3b8" }}
                    />
                    <span className="text-sm font-semibold truncate text-foreground">
                      {categoryLabel}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold shrink-0 ml-2",
                      getTextColor(percentage),
                    )}
                  >
                    {Math.round(percentage)}%
                  </span>
                </div>

                {/* Progress bar — thicker, gradient */}
                <div
                  className={cn(
                    "h-2.5 w-full rounded-full overflow-hidden",
                    isOver
                      ? "bg-red-100 dark:bg-red-950/40"
                      : "bg-muted dark:bg-muted/50",
                  )}
                >
                  <Motion.div
                    className={cn("h-full rounded-full", getBarGradient(percentage))}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>

                {/* Spent / Budget */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <PrivacyBlur className="font-medium">
                    {formatCurrency(spent)} gastos
                  </PrivacyBlur>
                  <PrivacyBlur>
                    de {formatCurrency(effectiveBudget)}
                  </PrivacyBlur>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetOverviewCard;
