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

const getBarColor = (percentage) => {
  if (percentage < 75) return "bg-green-500";
  if (percentage < 100) return "bg-yellow-500";
  return "bg-destructive";
};

const BudgetOverviewCard = ({ categories, transactions }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  const activeBudgets = useMemo(() => {
    const withBudget = categories.filter((c) => c.budget > 0);
    // deduplicate by name
    return withBudget.filter(
      (c, idx, self) => idx === self.findIndex((b) => b.name === c.name),
    );
  }, [categories]);

  if (activeBudgets.length === 0) return null;

  return (
    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold text-foreground">
          {t("budgetOverview.title")}
        </CardTitle>
        <Link
          to="/budgets"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {t("budgetOverview.manage")}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
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
              <div key={category.id} className="space-y-1">
                {/* Name + percentage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: category.color || "#94a3b8" }}
                    />
                    <span className="text-sm font-medium truncate">
                      {categoryLabel}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold shrink-0 ml-2",
                      percentage < 75
                        ? "text-green-600"
                        : percentage < 100
                          ? "text-yellow-600"
                          : "text-destructive",
                    )}
                  >
                    {Math.round(percentage)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className={cn(
                    "h-1.5 w-full bg-secondary rounded-full overflow-hidden",
                    isOver && "bg-destructive/20",
                  )}
                >
                  <Motion.div
                    className={cn("h-full rounded-full", getBarColor(percentage))}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                {/* Spent / Budget */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <PrivacyBlur>
                    {formatCurrency(spent)}
                  </PrivacyBlur>
                  <PrivacyBlur>
                    {formatCurrency(effectiveBudget)}
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
