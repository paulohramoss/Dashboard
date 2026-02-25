import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import emailjs from "@emailjs/browser";

import { FileText, Mail, Filter, X } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import MonthlyReportPDF from "@/components/MonthlyReportPDF";

const parseDate = (dateVal) => {
  if (typeof dateVal === "string") {
    if (dateVal.includes("-")) {
      const [y, m, d] = dateVal.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(dateVal);
  } else if (dateVal && dateVal.toDate) {
    return dateVal.toDate();
  }
  return new Date(dateVal);
};

const ReportsPage = () => {
  const { transactions, stats, loading } = useTransactions();
  const { accounts } = useAccounts();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [sendingEmail, setSendingEmail] = useState(false);

  // Default filter: current month
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [filterStartDate, setFilterStartDate] = useState(defaultStart);
  const [filterEndDate, setFilterEndDate] = useState(defaultEnd);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");

  // Unique categories extracted from transactions
  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map((tx) => tx.category).filter(Boolean));
    return [...cats].sort();
  }, [transactions]);

  // Filtered transactions for the PDF and stats
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const d = parseDate(tx.date);
      if (isNaN(d.getTime())) return false;

      if (filterStartDate) {
        const [y, m, day] = filterStartDate.split("-").map(Number);
        const start = new Date(y, m - 1, day);
        if (d < start) return false;
      }
      if (filterEndDate) {
        const [y, m, day] = filterEndDate.split("-").map(Number);
        const end = new Date(y, m - 1, day, 23, 59, 59);
        if (d > end) return false;
      }
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (filterCategory !== "all" && tx.category !== filterCategory)
        return false;
      if (filterAccount !== "all" && tx.accountId !== filterAccount)
        return false;

      return true;
    });
  }, [
    transactions,
    filterStartDate,
    filterEndDate,
    filterType,
    filterCategory,
    filterAccount,
  ]);

  const income = filteredTransactions
    .filter((tx) => tx.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const expense = filteredTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = income - expense;

  // Find highest expense category
  const expensesByCategory = {};
  filteredTransactions
    .filter((tx) => tx.type === "expense")
    .forEach((tx) => {
      expensesByCategory[tx.category] =
        (expensesByCategory[tx.category] || 0) + Number(tx.amount);
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

  const resetFilters = () => {
    setFilterStartDate(defaultStart);
    setFilterEndDate(defaultEnd);
    setFilterType("all");
    setFilterCategory("all");
    setFilterAccount("all");
  };

  const handleSendEmailReport = async () => {
    if (!user?.email) return;
    setSendingEmail(true);
    const fmt = (v) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v);
    const period = `${filterStartDate} → ${filterEndDate}`;
    const message = `${t("reports.emailReport.body", {
      month: period,
      year: "",
      income: fmt(income),
      expense: fmt(expense),
      balance: fmt(balance),
      villain: translatedVillain,
      villainAmount: fmt(villainAmount),
      total: filteredTransactions.length,
    })}`;

    try {
      await emailjs.send(
        "service_8vcx7bq",
        "template_qamjc3i",
        {
          user_name: user?.name || "Usuário",
          user_email: user?.email,
          feedback_type: `Relatório Financeiro — ${period}`,
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

  const pdfFileName = `relatorio-${filterStartDate}-${filterEndDate}.pdf`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
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
                periodStart={filterStartDate}
                periodEnd={filterEndDate}
                filterType={filterType}
                filterCategory={filterCategory}
                filterAccount={filterAccount}
                income={income}
                expense={expense}
                balance={balance}
                villainCategory={translatedVillain}
                villainAmount={villainAmount}
                transactions={filteredTransactions}
              />
            }
            fileName={pdfFileName}
          >
            {({ loading: pdfLoading }) => (
              <Button
                disabled={pdfLoading}
                variant="outline"
                className="w-full sm:w-auto"
              >
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
            {sendingEmail
              ? t("reports.emailReport.sending")
              : t("reports.emailReport.button")}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t("reports.filters.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t("reports.filters.startDate")}</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t("reports.filters.endDate")}</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t("reports.filters.type")}</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("reports.filters.allTypes")}
                  </SelectItem>
                  <SelectItem value="income">{t("export.income")}</SelectItem>
                  <SelectItem value="expense">{t("export.expense")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs">
                {t("reports.filters.category")}
              </Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("reports.filters.allCategories")}
                  </SelectItem>
                  {uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account */}
            <div className="space-y-1.5">
              <Label className="text-xs">{t("reports.filters.account")}</Label>
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("reports.filters.allAccounts")}
                  </SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("reports.filters.count", {
                count: filteredTransactions.length,
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-7 text-xs gap-1"
            >
              <X className="h-3 w-3" />
              {t("reports.filters.reset")}
            </Button>
          </div>
        </CardContent>
      </Card>

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
