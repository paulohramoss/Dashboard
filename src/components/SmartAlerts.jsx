import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { subMonths, format, parseISO } from "date-fns";

const SmartAlerts = ({ transactions }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const today = new Date();
    const getMonthKey = (date) => format(date, "yyyy-MM");
    const currentMonthKey = getMonthKey(today);

    const expensesByMonth = {};

    transactions.forEach((tx) => {
      if (tx.type !== "expense") return;
      const date = parseISO(tx.date);
      const monthKey = getMonthKey(date);
      if (!expensesByMonth[monthKey]) expensesByMonth[monthKey] = {};
      if (!expensesByMonth[monthKey][tx.category])
        expensesByMonth[monthKey][tx.category] = 0;
      expensesByMonth[monthKey][tx.category] += parseFloat(tx.amount);
    });

    const alerts = [];
    const categoriesInCurrentMonth = expensesByMonth[currentMonthKey] || {};

    Object.entries(categoriesInCurrentMonth).forEach(
      ([category, currentAmount]) => {
        let sumPrevious = 0;
        for (let i = 1; i <= 3; i++) {
          const prevMonthDate = subMonths(today, i);
          const prevMonthKey = getMonthKey(prevMonthDate);
          sumPrevious += expensesByMonth[prevMonthKey]?.[category] || 0;
        }

        const average = sumPrevious / 3;

        if (average > 10 && currentAmount > average * 1.2) {
          const percentage = ((currentAmount - average) / average) * 100;
          const categoryKey = `categories.${category.toLowerCase()}`;
          const displayCategory =
            t(categoryKey) !== categoryKey ? t(categoryKey) : category;

          alerts.push({
            type: "spending_spike",
            category: displayCategory,
            percentage: Math.round(percentage),
            currentAmount,
            average,
          });
        }
      }
    );

    return alerts;
  }, [transactions, t, formatCurrency]);

  if (insights.length === 0) {
    return (
      <Card className="h-full border-l-4 border-l-indigo-400 dark:border-l-indigo-500 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 dark:from-indigo-950/30 dark:to-violet-950/20 border-indigo-100 dark:border-indigo-900/40 shadow-sm">
        <CardHeader className="flex flex-row items-center space-y-0 pb-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center mr-3 shadow-sm">
            <Sparkles className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <CardTitle className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
            Insights via IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 bg-white/50 dark:bg-white/5 rounded-xl p-3">
            <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
              {t(
                "insights.noAnomalies",
                "Tudo certo! Seus gastos estão dentro do esperado."
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-l-4 border-l-amber-400 dark:border-l-amber-500 bg-gradient-to-br from-amber-50/70 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border-amber-100 dark:border-amber-900/40 shadow-sm">
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center mr-3 shadow-sm">
          <Lightbulb className="h-4.5 w-4.5 text-amber-600 dark:text-amber-300" />
        </div>
        <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">
          Insights via IA
        </CardTitle>
        <span className="ml-auto text-xs font-semibold bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
          {insights.length} alerta{insights.length > 1 ? "s" : ""}
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-white/60 dark:bg-white/5 rounded-xl p-3"
            >
              <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 leading-snug">
                  💡{" "}
                  {t("insights.spendingSpike", {
                    category: insight.category,
                    percentage: insight.percentage,
                  })}
                </p>
                <p className="text-xs text-amber-700/70 dark:text-amber-300/70 mt-0.5">
                  {t("insights.comparison", {
                    current: formatCurrency(insight.currentAmount),
                    average: formatCurrency(insight.average),
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartAlerts;
