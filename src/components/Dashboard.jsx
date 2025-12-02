import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import {
  BalanceCard,
  IncomeCard,
  ExpenseCard,
} from "@/components/SummaryCards";
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
  TrendingUp,
  Layout,
  Save,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = () => {
  const { transactions, deleteTransaction, clearTransactions, stats } =
    useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { t, i18n } = useTranslation();
  const [isDraggable, setIsDraggable] = useState(false);

  // Default Layouts
  const defaultLayouts = {
    lg: [
      { i: "balance", x: 0, y: 0, w: 4, h: 2 },
      { i: "income", x: 4, y: 0, w: 4, h: 2 },
      { i: "expense", x: 8, y: 0, w: 4, h: 2 },
      { i: "accounts", x: 0, y: 2, w: 12, h: 2 },
      { i: "overview", x: 0, y: 4, w: 8, h: 4 },
      { i: "category", x: 8, y: 4, w: 4, h: 4 },
      { i: "history", x: 0, y: 8, w: 12, h: 6 },
    ],
    md: [
      { i: "balance", x: 0, y: 0, w: 4, h: 2 },
      { i: "income", x: 4, y: 0, w: 4, h: 2 },
      { i: "expense", x: 8, y: 0, w: 4, h: 2 },
      { i: "accounts", x: 0, y: 2, w: 12, h: 2 },
      { i: "overview", x: 0, y: 4, w: 12, h: 4 },
      { i: "category", x: 0, y: 8, w: 12, h: 4 },
      { i: "history", x: 0, y: 12, w: 12, h: 6 },
    ],
    sm: [
      { i: "balance", x: 0, y: 0, w: 12, h: 2 },
      { i: "income", x: 0, y: 2, w: 12, h: 2 },
      { i: "expense", x: 0, y: 4, w: 12, h: 2 },
      { i: "accounts", x: 0, y: 6, w: 12, h: 2 },
      { i: "overview", x: 0, y: 8, w: 12, h: 4 },
      { i: "category", x: 0, y: 12, w: 12, h: 4 },
      { i: "history", x: 0, y: 16, w: 12, h: 6 },
    ],
  };

  const [layouts, setLayouts] = useState(() => {
    const saved = localStorage.getItem("dashboardLayout");
    return saved ? JSON.parse(saved) : defaultLayouts;
  });

  const onLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem("dashboardLayout", JSON.stringify(allLayouts));
  };

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

      // Calculate transfers
      const transfersOut = transactions
        .filter((t) => t.type === "transfer" && t.accountId === account.id)
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      const transfersIn = transactions
        .filter(
          (t) => t.type === "transfer" && t.destinationAccountId === account.id
        )
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      return {
        ...account,
        currentBalance:
          (account.initialBalance || 0) +
          income -
          expense -
          transfersOut +
          transfersIn,
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
      case "investment":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (categoryName) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.isDefault
      ? t(`categories.${categoryName.toLowerCase()}`)
      : categoryName;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const handleExportExcel = () => {
    const isPt = i18n.language === "pt";
    const currency = isPt ? "BRL" : "USD";
    const locale = isPt ? "pt-BR" : "en-US";

    const exportData = transactions.map((transaction) => ({
      [t("transactions.table.date")]: new Date(
        transaction.date
      ).toLocaleDateString(locale),
      [t("transactions.table.description")]: transaction.description,
      [t("transactions.table.category")]: getCategoryLabel(
        transaction.category
      ),
      [t("transactions.table.type")]: t(
        `transactions.form.${transaction.type}`
      ),
      [t("transactions.table.amount")]: new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
      }).format(transaction.amount),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "financial-dashboard-export.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const isPt = i18n.language === "pt";
    const currency = isPt ? "BRL" : "USD";
    const locale = isPt ? "pt-BR" : "en-US";

    doc.setFontSize(18);
    doc.text(t("reports.title"), 14, 22);

    doc.setFontSize(11);
    doc.text(
      `${t("legal.lastUpdated")}: ${new Date().toLocaleDateString(locale)}`,
      14,
      30
    );

    const tableColumn = [
      t("transactions.table.date"),
      t("transactions.table.description"),
      t("transactions.table.category"),
      t("transactions.table.type"),
      t("transactions.table.amount"),
    ];

    const tableRows = [];

    transactions.forEach((transaction) => {
      const transactionData = [
        new Date(transaction.date).toLocaleDateString(locale),
        transaction.description,
        getCategoryLabel(transaction.category),
        t(`transactions.form.${transaction.type}`),
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency: currency,
        }).format(transaction.amount),
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2
            id="dashboard-title"
            className="text-3xl font-bold tracking-tight"
          >
            {t("dashboard.title")}
          </h2>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={isDraggable ? "default" : "outline"}
            onClick={() => setIsDraggable(!isDraggable)}
          >
            {isDraggable ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t("common.done") || "Done"}
              </>
            ) : (
              <>
                <Layout className="mr-2 h-4 w-4" />
                {t("dashboard.customize") || "Customize Layout"}
              </>
            )}
          </Button>
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

      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={100}
        isDraggable={isDraggable}
        isResizable={isDraggable}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
      >
        <div
          key="balance"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <div className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            <BalanceCard amount={stats.balance} />
          </div>
        </div>
        <div
          key="income"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <div className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            <IncomeCard amount={stats.income} />
          </div>
        </div>
        <div
          key="expense"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <div className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            <ExpenseCard amount={stats.expense} />
          </div>
        </div>

        <div
          key="accounts"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <div className="h-full relative overflow-y-auto">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 h-full p-1">
              {accountBalances.map((account) => (
                <Card
                  key={account.id}
                  className="relative overflow-hidden h-full"
                >
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
          </div>
        </div>

        <div
          key="overview"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <div className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            <OverviewChart transactions={transactions} />
          </div>
        </div>
        <div
          key="category"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <div className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            <CategoryChart transactions={transactions} />
          </div>
        </div>

        <div
          key="history"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <div className="h-full relative overflow-y-auto">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            <TransactionHistory
              transactions={transactions}
              onDelete={deleteTransaction}
            />
          </div>
        </div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default Dashboard;
