import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/hooks/useAuth";
import SummaryCards from "@/components/SummaryCards";
import OverviewChart from "@/components/Charts/OverviewChart";
import CategoryChart from "@/components/Charts/CategoryChart";
import MonthlyEvolutionChart from "@/components/Charts/MonthlyEvolutionChart";
import FinancialFlowChart from "@/components/Charts/FinancialFlowChart";
import MonthComparison from "@/components/MonthComparison";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

import { FileText, Mail } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MonthlyReportPDF from "@/components/MonthlyReportPDF";
import { Button } from "@/components/ui/button";

const ReportsPage = () => {
  const { transactions, stats, loading } = useTransactions();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [sendingEmail, setSendingEmail] = useState(false);
  // const { isPrivacyMode } = useLayout(); // Removed

  // Prepare Report Data
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString("pt-BR", { month: "long" });

  const monthTransactions = transactions.filter((t) => {
    let d;
    // Robust Date Parsing
    if (typeof t.date === "string") {
      if (t.date.includes("-")) {
        const [y, m, day] = t.date.split("-").map(Number);
        d = new Date(y, m - 1, day);
      } else {
        d = new Date(t.date);
      }
    } else if (t.date && t.date.toDate) {
      d = t.date.toDate();
    } else {
      d = new Date(t.date);
    }

    if (isNaN(d.getTime())) return false;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const income = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const expense = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = income - expense;

  // Find Villain
  const expensesByCategory = {};
  monthTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expensesByCategory[t.category] =
        (expensesByCategory[t.category] || 0) + Number(t.amount);
    });

  let villainCategory = "N/A";
  let villainAmount = 0;
  Object.entries(expensesByCategory).forEach(([cat, amount]) => {
    if (amount > villainAmount) {
      villainAmount = amount;
      villainCategory = cat;
    }
  });

  const villainCategoryKey = `categories.${villainCategory.toLowerCase()}`;
  const translatedVillain =
    t(villainCategoryKey) !== villainCategoryKey
      ? t(villainCategoryKey)
      : villainCategory;

  const handleSendEmailReport = async () => {
    if (!user?.email) return;
    setSendingEmail(true);
    const fmt = (v) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);
    const message = `${t("reports.emailReport.body", {
      month: monthName,
      year: currentYear,
      income: fmt(income),
      expense: fmt(expense),
      balance: fmt(balance),
      villain: translatedVillain,
      villainAmount: fmt(villainAmount),
      total: monthTransactions.length,
    })}`;

    try {
      await emailjs.send(
        "service_8vcx7bq",
        "template_qamjc3i",
        {
          user_name: user?.name || "Usuário",
          user_email: user?.email,
          feedback_type: t("reports.emailReport.subject", { month: monthName, year: currentYear }),
          message,
          to_email: user?.email,
          from_name: "FinanceDash",
          reply_to: user?.email,
        },
        "lMkgyQ1ZogoJ0ZqwC"
      );
      toast.success(t("reports.emailReport.sent"));
    } catch {
      toast.error(t("reports.emailReport.error"));
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("reports.title")}
          </h2>
          <p className="text-muted-foreground">{t("reports.subtitle")}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <PDFDownloadLink
            document={
              <MonthlyReportPDF
                monthName={monthName}
                year={currentYear}
                income={income}
                expense={expense}
                balance={balance}
                villainCategory={translatedVillain}
                villainAmount={villainAmount}
                transactions={monthTransactions}
              />
            }
            fileName={`relatorio-${monthName}-${currentYear}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <Button disabled={pdfLoading} variant="outline" className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                {pdfLoading ? "Gerando..." : t("reports.button")}
              </Button>
            )}
          </PDFDownloadLink>
          <Button
            onClick={handleSendEmailReport}
            disabled={sendingEmail || loading}
            className="w-full sm:w-auto"
          >
            <Mail className="mr-2 h-4 w-4" />
            {sendingEmail ? t("reports.emailReport.sending") : t("reports.emailReport.button")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <SummaryCards stats={stats} />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <>
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full col-span-2" />
          </>
        ) : (
          <>
            <OverviewChart transactions={transactions} />
            <FinancialFlowChart transactions={transactions} />
            <CategoryChart transactions={transactions} />
            <MonthlyEvolutionChart transactions={transactions} />
          </>
        )}
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
            <PrivacyBlur
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
            </PrivacyBlur>
            .
          </div>
        </CardContent>
      </Card>

      <MonthComparison transactions={transactions} />
    </div>
  );
};

export default ReportsPage;
