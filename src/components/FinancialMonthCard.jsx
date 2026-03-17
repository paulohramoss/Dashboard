import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { motion as Motion } from "framer-motion";

const FinancialMonthCard = ({ stats, categories, transactions }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Expense categories deduplicated
  const expenseCategories = useMemo(() => {
    return categories
      .filter((c) => c.type === "expense")
      .filter((c, i, self) => i === self.findIndex((x) => x.name === c.name));
  }, [categories]);

  const categoryData = useMemo(() => {
    if (selectedCategory === "all") return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === selectedCategory &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear,
      )
      .reduce((acc, t) => acc + parseFloat(t.amount), 0);

    const cat = expenseCategories.find((c) => c.name === selectedCategory);
    const baseBudget = cat?.budget || 0;
    const rollover = cat?.accumulatedRollover || 0;
    const effectiveBudget = baseBudget > 0 ? baseBudget + rollover : 0;
    const remaining =
      effectiveBudget > 0 ? Math.max(effectiveBudget - spent, 0) : null;
    const isOver = effectiveBudget > 0 && spent > effectiveBudget;
    const color = cat?.color || "#94a3b8";

    return { spent, effectiveBudget, remaining, isOver, color, cat };
  }, [selectedCategory, expenseCategories, transactions]);

  const isAll = selectedCategory === "all";

  // Overall spending ratio for the month (expense vs income)
  const spendingRatio = stats.income > 0
    ? Math.min((stats.expense / stats.income) * 100, 100)
    : 0;

  const getRatioColor = (ratio) => {
    if (ratio < 70) return "progress-gradient-green";
    if (ratio < 90) return "progress-gradient-yellow";
    return "progress-gradient-red";
  };

  const getRatioTextColor = (ratio) => {
    if (ratio < 70) return "text-emerald-600 dark:text-emerald-400";
    if (ratio < 90) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="h-full shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 gap-4">
        <CardTitle className="text-base font-semibold text-foreground shrink-0">
          {t("financialMonth.title")}
        </CardTitle>
        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-8 text-xs max-w-[180px] py-1"
        >
          <option value="all">{t("financialMonth.allCategories")}</option>
          {expenseCategories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.isDefault
                ? t(`categories.${cat.name.toLowerCase()}`)
                : cat.name}
            </option>
          ))}
        </Select>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Monthly spending progress bar */}
        {isAll && stats.income > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">
                Progresso do mês
              </span>
              <span className={cn("font-bold", getRatioTextColor(spendingRatio))}>
                {Math.round(spendingRatio)}% do orçamento usado
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
              <Motion.div
                className={cn("h-full rounded-full", getRatioColor(spendingRatio))}
                initial={{ width: 0 }}
                animate={{ width: `${spendingRatio}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {isAll ? (
          /* ── Global view ── */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Saldo atual */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.currentBalance")}
                </p>
                <PrivacyBlur className="text-xl font-bold text-foreground tracking-tight">
                  {formatCurrency(stats.balance)}
                </PrivacyBlur>
              </div>
            </div>

            {/* Você já gastou */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.alreadySpent")}
                </p>
                <PrivacyBlur className="text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                  {formatCurrency(stats.expense)}
                </PrivacyBlur>
              </div>
            </div>

            {/* Ainda pode gastar */}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  stats.income - stats.expense >= 0
                    ? "bg-emerald-100 dark:bg-emerald-950/40"
                    : "bg-orange-100 dark:bg-orange-950/40",
                )}
              >
                {stats.income - stats.expense >= 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.canStillSpend")}
                </p>
                <PrivacyBlur
                  className={cn(
                    "text-xl font-bold tracking-tight",
                    stats.income - stats.expense >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-orange-600 dark:text-orange-400",
                  )}
                >
                  {stats.income - stats.expense >= 0
                    ? formatCurrency(stats.income - stats.expense)
                    : t("financialMonth.budgetExhausted")}
                </PrivacyBlur>
              </div>
            </div>
          </div>
        ) : (
          /* ── Category view ── */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Budget / sem orçamento */}
            <div className="flex items-start gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${categoryData.color}22` }}
              >
                <Target className="h-5 w-5" style={{ color: categoryData.color }} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.categoryBudget")}
                </p>
                {categoryData.effectiveBudget > 0 ? (
                  <PrivacyBlur className="text-xl font-bold text-foreground tracking-tight">
                    {formatCurrency(categoryData.effectiveBudget)}
                  </PrivacyBlur>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    {t("financialMonth.noBudget")}
                  </span>
                )}
              </div>
            </div>

            {/* Você já gastou (categoria) */}
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.alreadySpent")}
                </p>
                <PrivacyBlur className="text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                  {formatCurrency(categoryData.spent)}
                </PrivacyBlur>
              </div>
            </div>

            {/* Ainda pode gastar (categoria) */}
            {categoryData.effectiveBudget > 0 && (
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                    !categoryData.isOver
                      ? "bg-emerald-100 dark:bg-emerald-950/40"
                      : "bg-orange-100 dark:bg-orange-950/40",
                  )}
                >
                  {!categoryData.isOver ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("financialMonth.canStillSpend")}
                  </p>
                  <PrivacyBlur
                    className={cn(
                      "text-xl font-bold tracking-tight",
                      !categoryData.isOver
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-orange-600 dark:text-orange-400",
                    )}
                  >
                    {!categoryData.isOver
                      ? formatCurrency(categoryData.remaining)
                      : t("financialMonth.budgetExhausted")}
                  </PrivacyBlur>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialMonthCard;
