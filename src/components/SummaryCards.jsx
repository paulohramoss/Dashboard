import React from "react";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { useCurrency, formatCompactAmount } from "@/hooks/useCurrency";

export const BalanceCard = ({ amount }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <Card className="relative overflow-hidden h-full border-0 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-primary via-primary to-[hsl(167,60%,14%)]">
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute top-6 -right-4 h-16 w-16 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-6 -right-2 h-24 w-24 rounded-full bg-white/5 pointer-events-none" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-widest">
            {t("dashboard.totalBalance")}
          </CardTitle>
          <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Wallet className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-0 overflow-hidden">
        <PrivacyBlur
          className="block truncate text-4xl font-bold text-white tracking-tight leading-none"
          title={formatCurrency(amount)}
        >
          {formatCompactAmount(amount)}
        </PrivacyBlur>
        <p className="text-primary-foreground/50 text-xs mt-2 font-medium">
          {t("dashboard.totalBalance")}
        </p>
      </CardContent>
    </Card>
  );
};

export const IncomeCard = ({ amount }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <Card className="relative overflow-hidden h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/60 dark:to-green-950/50 border-emerald-100 dark:border-emerald-900/50">
      <div className="absolute -top-5 -right-5 h-24 w-24 rounded-full bg-emerald-100/70 dark:bg-emerald-900/30 pointer-events-none" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-emerald-800/70 dark:text-emerald-200/70 uppercase tracking-widest">
            {t("dashboard.income")}
          </CardTitle>
          <div className="h-10 w-10 rounded-2xl bg-emerald-500 shadow-md shadow-emerald-200/60 dark:shadow-emerald-900/60 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-0 overflow-hidden">
        <PrivacyBlur
          className="block truncate text-3xl font-bold text-emerald-800 dark:text-emerald-100 tracking-tight"
          title={formatCurrency(amount)}
        >
          {formatCompactAmount(amount)}
        </PrivacyBlur>
        <div className="flex items-center gap-1 mt-1.5">
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs text-emerald-700/60 dark:text-emerald-300/60 font-medium">
            este mês
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const ExpenseCard = ({ amount }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <Card className="relative overflow-hidden h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/60 dark:to-red-950/50 border-rose-100 dark:border-rose-900/50">
      <div className="absolute -top-5 -right-5 h-24 w-24 rounded-full bg-rose-100/70 dark:bg-rose-900/30 pointer-events-none" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-rose-800/70 dark:text-rose-200/70 uppercase tracking-widest">
            {t("dashboard.expenses")}
          </CardTitle>
          <div className="h-10 w-10 rounded-2xl bg-rose-500 shadow-md shadow-rose-200/60 dark:shadow-rose-900/60 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-0 overflow-hidden">
        <PrivacyBlur
          className="block truncate text-3xl font-bold text-rose-800 dark:text-rose-100 tracking-tight"
          title={formatCurrency(amount)}
        >
          {formatCompactAmount(amount)}
        </PrivacyBlur>
        <div className="flex items-center gap-1 mt-1.5">
          <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          <span className="text-xs text-rose-700/60 dark:text-rose-300/60 font-medium">
            este mês
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const SummaryCards = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <BalanceCard amount={stats.balance} />
      <IncomeCard amount={stats.income} />
      <ExpenseCard amount={stats.expense} />
    </div>
  );
};

export default SummaryCards;
