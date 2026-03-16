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

  return (
    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-200">
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

      <CardContent>
        {isAll ? (
          /* ── Global view ── */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Saldo atual */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.currentBalance")}
                </p>
                <PrivacyBlur className="text-xl font-bold text-foreground">
                  {formatCurrency(stats.balance)}
                </PrivacyBlur>
              </div>
            </div>

            {/* Você já gastou */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.alreadySpent")}
                </p>
                <PrivacyBlur className="text-xl font-bold text-red-600">
                  {formatCurrency(stats.expense)}
                </PrivacyBlur>
              </div>
            </div>

            {/* Ainda pode gastar */}
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                  stats.income - stats.expense >= 0
                    ? "bg-green-100"
                    : "bg-orange-100",
                )}
              >
                {stats.income - stats.expense >= 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.canStillSpend")}
                </p>
                <PrivacyBlur
                  className={cn(
                    "text-xl font-bold",
                    stats.income - stats.expense >= 0
                      ? "text-green-600"
                      : "text-orange-600",
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
                className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${categoryData.color}22`,
                }}
              >
                <Target
                  className="h-4 w-4"
                  style={{ color: categoryData.color }}
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.categoryBudget")}
                </p>
                {categoryData.effectiveBudget > 0 ? (
                  <PrivacyBlur className="text-xl font-bold text-foreground">
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
              <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {t("financialMonth.alreadySpent")}
                </p>
                <PrivacyBlur className="text-xl font-bold text-red-600">
                  {formatCurrency(categoryData.spent)}
                </PrivacyBlur>
              </div>
            </div>

            {/* Ainda pode gastar (categoria) */}
            {categoryData.effectiveBudget > 0 && (
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                    !categoryData.isOver ? "bg-green-100" : "bg-orange-100",
                  )}
                >
                  {!categoryData.isOver ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {t("financialMonth.canStillSpend")}
                  </p>
                  <PrivacyBlur
                    className={cn(
                      "text-xl font-bold",
                      !categoryData.isOver
                        ? "text-green-600"
                        : "text-orange-600",
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
