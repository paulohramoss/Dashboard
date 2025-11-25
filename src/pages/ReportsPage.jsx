import React from "react";
import { useTransactions } from "@/hooks/useTransactions";
import SummaryCards from "@/components/SummaryCards";
import OverviewChart from "@/components/Charts/OverviewChart";
import CategoryChart from "@/components/Charts/CategoryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ReportsPage = () => {
  const { transactions, stats } = useTransactions();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Detailed financial analysis and insights.
        </p>
      </div>

      <SummaryCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2">
        <OverviewChart transactions={transactions} />
        <CategoryChart transactions={transactions} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            You have a total of{" "}
            <span className="font-bold text-foreground">
              {transactions.length}
            </span>{" "}
            transactions recorded. Your current balance is{" "}
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
