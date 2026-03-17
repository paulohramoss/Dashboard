import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CurrencyInput from "@/components/ui/currency-input";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";

const SpendingSimulatorCard = ({ stats }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();
  const [amount, setAmount] = useState("");

  const result = useMemo(() => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return null;

    const monthlyAvailable = stats.income - stats.expense;
    const remaining = monthlyAvailable - value;

    return {
      canSpend: remaining >= 0,
      remaining: Math.abs(remaining),
    };
  }, [amount, stats.income, stats.expense]);

  return (
    <Card className="h-full flex flex-col shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          {t("spendingSimulator.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center space-y-4">
        <CurrencyInput
          value={amount}
          onChange={setAmount}
          placeholder={t("spendingSimulator.placeholder")}
          className="text-base"
        />

        {result && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg p-3 transition-all",
              result.canSpend
                ? "bg-green-50 dark:bg-green-950/30"
                : "bg-red-50 dark:bg-red-950/30",
            )}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                result.canSpend ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50",
              )}
            >
              {result.canSpend ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p
              className={cn(
                "text-sm font-medium leading-relaxed",
                result.canSpend ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400",
              )}
            >
              {result.canSpend
                ? t("spendingSimulator.canSpend", {
                    amount: formatCurrency(result.remaining),
                  })
                : t("spendingSimulator.cannotSpend", {
                    amount: formatCurrency(result.remaining),
                  })}
            </p>
          </div>
        )}

        {!result && (
          <p className="text-xs text-muted-foreground">
            {t("spendingSimulator.hint", {
              available: formatCurrency(Math.max(stats.income - stats.expense, 0)),
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SpendingSimulatorCard;
