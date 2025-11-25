import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import SummaryCards from "@/components/SummaryCards";
import OverviewChart from "@/components/Charts/OverviewChart";
import CategoryChart from "@/components/Charts/CategoryChart";
import TransactionHistory from "@/components/TransactionHistory";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Trash2,
  FileSpreadsheet,
  FileText,
  Wallet,
  CreditCard,
  Banknote,
  Building2,
} from "lucide-react";
import * as XLSX from "xlsx";

const Dashboard = () => {
  const { transactions, deleteTransaction, clearTransactions, stats } =
    useTransactions();
  const { accounts } = useAccounts();
  const { t } = useTranslation();

  const accountBalances = useMemo(() => {
    return accounts.map((account) => {
      const accountTransactions = transactions.filter(
        (t) => t.accountId === account.id
      );
      const income = accountTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);
      const expense = accountTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      return {
        ...account,
        currentBalance: (account.initialBalance || 0) + income - expense,
      };
    });
  }, [accounts, transactions]);

  const getIcon = (type) => {
    switch (type) {
      case "checking":
        return <Building2 className="h-5 w-5" />;
      case "savings":
        return <Wallet className="h-5 w-5" />;
      case "credit":
        return <CreditCard className="h-5 w-5" />;
      case "cash":
        return <Banknote className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "financial-dashboard-export.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Financial Dashboard Report", 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Date", "Description", "Category", "Type", "Amount"];
    const tableRows = [];

    transactions.forEach((transaction) => {
      const transactionData = [
        new Date(transaction.date).toLocaleDateString(),
        transaction.description,
        transaction.category,
        transaction.type,
        `$${parseFloat(transaction.amount).toFixed(2)}`,
      ];
      tableRows.push(transactionData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] }, // Primary blue color
    });

    doc.save("financial-dashboard-report.pdf");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("dashboard.title")}
          </h2>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={clearTransactions}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("dashboard.clearData")}
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {t("dashboard.exportExcel")}
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            {t("dashboard.exportPDF")}
          </Button>
        </div>
      </div>

      <SummaryCards stats={stats} />

      {/* Accounts Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {accountBalances.map((account) => (
          <Card key={account.id} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: account.color }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.name}
              </CardTitle>
              <div className="text-muted-foreground">
                {getIcon(account.type)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(account.currentBalance)}
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                {t(`accounts.${account.type}`)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OverviewChart transactions={transactions} />
        <CategoryChart transactions={transactions} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-7 space-y-4">
          <TransactionHistory
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
