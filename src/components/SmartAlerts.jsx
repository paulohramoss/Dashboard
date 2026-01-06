import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { subMonths, format, parseISO } from "date-fns";

const SmartAlerts = ({ transactions }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const today = new Date();

    // Helper to get month key YYYY-MM
    const getMonthKey = (date) => format(date, "yyyy-MM");
    const currentMonthKey = getMonthKey(today);

    // 1. Group expenses by Month -> Category
    const expensesByMonth = {};

    transactions.forEach((tx) => {
      if (tx.type !== "expense") return;

      const date = parseISO(tx.date);
      const monthKey = getMonthKey(date);

      if (!expensesByMonth[monthKey]) {
        expensesByMonth[monthKey] = {};
      }

      if (!expensesByMonth[monthKey][tx.category]) {
        expensesByMonth[monthKey][tx.category] = 0;
      }

      expensesByMonth[monthKey][tx.category] += parseFloat(tx.amount);
    });

    const alerts = [];
    const categoriesInCurrentMonth = expensesByMonth[currentMonthKey] || {};

    // 2. Analyze each category in current month
    Object.entries(categoriesInCurrentMonth).forEach(
      ([category, currentAmount]) => {
        // Calculate average of previous 3 months
        let sumPrevious = 0;

        for (let i = 1; i <= 3; i++) {
          const prevMonthDate = subMonths(today, i);
          const prevMonthKey = getMonthKey(prevMonthDate);
          const amount = expensesByMonth[prevMonthKey]?.[category] || 0;

          // Only count if there was spending (or should we count 0? usually 0 lowers the average, making it easier to trigger alert. Let's count 0 if we assume the user tracks regularly.)
          // For accurate "spending habit" comparison, usually we average over time.
          sumPrevious += amount;
        }

        const average = sumPrevious / 3;

        // Threshold: 20% more than average
        // Also ensure average is significant (> 0) to avoid division by zero or alerting on small amounts (like 5 vs 2)
        if (average > 10 && currentAmount > average * 1.2) {
          const percentage = ((currentAmount - average) / average) * 100;

          // Translate category name
          const categoryKey = `categories.${category.toLowerCase()}`;
          const displayCategory =
            t(categoryKey) !== categoryKey ? t(categoryKey) : category;

          alerts.push({
            type: "spending_spike",
            category: displayCategory,
            percentage: Math.round(percentage),
            currentAmount,
            average,
            message: t("insights.spendingSpike", {
              category: displayCategory,
              percentage: Math.round(percentage),
              avg: formatCurrency(average),
            }),
          });
        }
      }
    );

    return alerts;
  }, [transactions, t, formatCurrency]);

  if (insights.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
            <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-base font-medium text-indigo-900 dark:text-indigo-100">
            Insights via IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 text-green-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 rotate-180" />
            </div>
            <p className="text-sm text-indigo-900 dark:text-indigo-200">
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
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
          <Lightbulb className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <CardTitle className="text-base font-medium text-indigo-900 dark:text-indigo-100">
          Insights via IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  {t("insights.spendingSpike", {
                    category: insight.category,
                    percentage: insight.percentage,
                  })}
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
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
