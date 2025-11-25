import React from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import SummaryCards from "@/components/SummaryCards";
import OverviewChart from "@/components/Charts/OverviewChart";
import CategoryChart from "@/components/Charts/CategoryChart";
import MonthlyEvolutionChart from "@/components/Charts/MonthlyEvolutionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ReportsPage = () => {
  const { transactions, stats } = useTransactions();
  const { t } = useTranslation();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("reports.title")}
        </h2>
        <p className="text-muted-foreground">{t("reports.subtitle")}</p>
      </div>

      <SummaryCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <OverviewChart transactions={transactions} />
        <CategoryChart transactions={transactions} />
        <MonthlyEvolutionChart transactions={transactions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("reports.transactionSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {t("reports.totalTransactionsPart1")}{" "}
            <span className="font-bold text-foreground">
              {transactions.length}
            </span>{" "}
            {t("reports.totalTransactionsPart2")}{" "}
            <span
              className={
                stats.balance >= 0
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.balance)}
            </span>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
