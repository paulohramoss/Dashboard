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

export const BalanceCard = ({ amount }) => {
  const { t } = useTranslation();
  return (
    <Card className="bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-primary-foreground/90">
          {t("dashboard.totalBalance")}
        </CardTitle>
        <Wallet className="h-4 w-4 text-primary-foreground/70" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
        </div>
      </CardContent>
    </Card>
  );
};

export const IncomeCard = ({ amount }) => {
  const { t } = useTranslation();
  return (
    <Card className="hover:shadow-md transition-all duration-200 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("dashboard.income")}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-green-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
};

export const ExpenseCard = ({ amount }) => {
  const { t } = useTranslation();
  return (
    <Card className="hover:shadow-md transition-all duration-200 h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t("dashboard.expenses")}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
          <TrendingDown className="h-4 w-4 text-red-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
          <ArrowDownRight className="h-4 w-4" />
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
