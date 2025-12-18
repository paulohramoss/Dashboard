import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useLayout } from "@/context/LayoutContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";
import { useAccounts } from "@/hooks/useAccounts";

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
import { cn } from "@/lib/utils";
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
  Ghost,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown";
import { Download, MoreVertical } from "lucide-react";
import TransactionForm from "@/components/TransactionForm";
import * as XLSX from "xlsx";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

import { motion as Motion } from "framer-motion";

const Dashboard = () => {
  const {
    transactions,
    deleteTransaction,
    clearTransactions,
    stats,
    loading,
    isShadowMode,
    toggleShadowMode,
    addShadowTransaction,
  } = useTransactions();
  const { accounts } = useAccounts();
  const { t } = useTranslation();
  const formatCurrency = useCurrency();
  const { isPrivacyMode, isSidebarCollapsed } = useLayout();

  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [layouts, setLayouts] = useState(() => {
    const savedLayout = localStorage.getItem("dashboardLayout");
    return savedLayout
      ? JSON.parse(savedLayout)
      : {
          lg: [
            { i: "balance", x: 0, y: 0, w: 4, h: 2, minH: 2 },
            { i: "income", x: 4, y: 0, w: 4, h: 2, minH: 2 },
            { i: "expense", x: 8, y: 0, w: 4, h: 2, minH: 2 },
            { i: "overview", x: 0, y: 2, w: 8, h: 4, minH: 4 },
            { i: "category", x: 8, y: 2, w: 4, h: 4, minH: 4 },
            { i: "history", x: 0, y: 6, w: 9, h: 5, minH: 5 },
            { i: "accounts", x: 9, y: 6, w: 3, h: 5, minH: 5 },
          ],
          md: [
            { i: "balance", x: 0, y: 0, w: 4, h: 2 },
            { i: "income", x: 4, y: 0, w: 4, h: 2 },
            { i: "expense", x: 8, y: 0, w: 4, h: 2 },
            { i: "overview", x: 0, y: 2, w: 8, h: 4 },
            { i: "category", x: 8, y: 2, w: 4, h: 4 },
            { i: "history", x: 0, y: 6, w: 8, h: 5 },
            { i: "accounts", x: 8, y: 6, w: 4, h: 5 },
          ],
          sm: [
            { i: "balance", x: 0, y: 0, w: 12, h: 2 },
            { i: "income", x: 0, y: 2, w: 6, h: 2 },
            { i: "expense", x: 6, y: 2, w: 6, h: 2 },
            { i: "overview", x: 0, y: 4, w: 12, h: 4 },
            { i: "category", x: 0, y: 8, w: 12, h: 4 },
            { i: "history", x: 0, y: 12, w: 12, h: 5 },
            { i: "accounts", x: 0, y: 17, w: 12, h: 5 },
          ],
          xs: [
            { i: "balance", x: 0, y: 0, w: 12, h: 2 },
            { i: "income", x: 0, y: 2, w: 12, h: 2 },
            { i: "expense", x: 0, y: 4, w: 12, h: 2 },
            { i: "overview", x: 0, y: 6, w: 12, h: 4 },
            { i: "category", x: 0, y: 10, w: 12, h: 4 },
            { i: "history", x: 0, y: 14, w: 12, h: 5 },
            { i: "accounts", x: 0, y: 19, w: 12, h: 5 },
          ],
          xxs: [
            { i: "balance", x: 0, y: 0, w: 12, h: 2 },
            { i: "income", x: 0, y: 2, w: 12, h: 2 },
            { i: "expense", x: 0, y: 4, w: 12, h: 2 },
            { i: "overview", x: 0, y: 6, w: 12, h: 4 },
            { i: "category", x: 0, y: 10, w: 12, h: 4 },
            { i: "history", x: 0, y: 14, w: 12, h: 5 },
            { i: "accounts", x: 0, y: 19, w: 12, h: 5 },
          ],
        };
  });

  const [isDraggable, setIsDraggable] = useState(false);

  const onLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem("dashboardLayout", JSON.stringify(allLayouts));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      transactions.map((t) => ({
        [t("export.date")]: new Date(`${t.date}T12:00:00`).toLocaleDateString(
          "pt-BR"
        ),
        [t("export.description")]: t.description,
        [t("export.category")]: t.category,
        [t("export.type")]:
          t.type === "income" ? t("export.income") : t("export.expense"),
        [t("export.value")]: t.amount,
        [t("export.account")]:
          accounts.find((a) => a.id === t.accountId)?.name || "N/A",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transações");
    XLSX.writeFile(wb, "transacoes.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(t("export.title"), 14, 22);

    const tableData = transactions.map((t) => [
      new Date(`${t.date}T12:00:00`).toLocaleDateString("pt-BR"),
      t.description,
      t.category,
      t.type === "income" ? t("export.income") : t("export.expense"),
      formatCurrency(t.amount),
    ]);

    autoTable(doc, {
      head: [
        [
          t("export.date"),
          t("export.description"),
          t("export.category"),
          t("export.type"),
          t("export.value"),
        ],
      ],
      body: tableData,
      startY: 30,
    });

    doc.save("relatorio.pdf");
  };

  // Accounts with balance calculation
  const accountsWithBalance = useMemo(() => {
    return accounts.map((account) => {
      const accountTransactions = transactions.filter(
        (t) => t.accountId === account.id
      );
      const balance = accountTransactions.reduce((acc, curr) => {
        return curr.type === "income"
          ? acc + parseFloat(curr.amount)
          : acc - parseFloat(curr.amount);
      }, parseFloat(account.initialBalance || 0));
      return { ...account, balance };
    });
  }, [accounts, transactions]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <Motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("dashboard.title")}
          </h2>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isSidebarCollapsed && (
            <>
              {isDraggable && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsDraggable(false)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {t("dashboard.saveLayout", "Salvar Layout")}
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsSimulateOpen(true)}
                className="hidden md:flex"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {t("dashboard.simulate", "Simular")}
              </Button>
              {/* Mobile simulate icon only */}
              <Button
                variant="default"
                size="icon"
                onClick={() => setIsSimulateOpen(true)}
                className="md:hidden"
              >
                <TrendingUp className="h-4 w-4" />
              </Button>

              <CustomDropdown
                align="start"
                trigger={
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    {t("common.export", "Export")}
                  </Button>
                }
              >
                <DropdownItem onClick={exportToExcel}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownItem>
                <DropdownItem onClick={exportToPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownItem>
              </CustomDropdown>

              <CustomDropdown
                trigger={
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              >
                <DropdownItem onClick={() => setIsDraggable(!isDraggable)}>
                  <Layout className="mr-2 h-4 w-4" />
                  {isDraggable
                    ? t("dashboard.saveLayout", "Salvar Layout")
                    : t("dashboard.editLayout", "Editar Layout")}
                </DropdownItem>
                <DropdownItem onClick={toggleShadowMode}>
                  <Ghost className="mr-2 h-4 w-4" />
                  {isShadowMode ? t("shadowMode.exit") : t("shadowMode.enter")}
                </DropdownItem>
                <div className="my-1 h-px bg-muted" />
                <DropdownItem
                  onClick={clearTransactions}
                  destructive
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("dashboard.clearData")}
                </DropdownItem>
              </CustomDropdown>
            </>
          )}
        </div>
      </div>

      <Dialog open={isSimulateOpen} onOpenChange={setIsSimulateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.simulate", "Simular")}</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onAddTransaction={(data) => {
              addShadowTransaction(data);
              if (!isShadowMode) toggleShadowMode();
              setIsSimulateOpen(false);
              toast.success(
                t(
                  "dashboard.simulationAdded",
                  "Simulação adicionada ao Modo Sombra"
                )
              );
            }}
          />
        </DialogContent>
      </Dialog>

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
          <Motion.div variants={item} className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <BalanceCard amount={stats.balance} />
            )}
          </Motion.div>
        </div>
        <div
          key="income"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <Motion.div variants={item} className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <IncomeCard amount={stats.income} />
            )}
          </Motion.div>
        </div>
        <div
          key="expense"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <Motion.div variants={item} className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ExpenseCard amount={stats.expense} />
            )}
          </Motion.div>
        </div>

        <div
          key="accounts"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <Motion.div
            variants={item}
            className="h-full relative overflow-y-auto"
          >
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            {loading ? (
              <div className="grid gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <div className="grid gap-4">
                {accountsWithBalance.map((account) => (
                  <Card key={account.id} className="min-h-[100px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {account.name}
                      </CardTitle>
                      {account.type === "wallet" ? (
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                      ) : account.type === "investment" ? (
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        <span className={cn(isPrivacyMode && "privacy-blur")}>
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t(`accounts.${account.type}`)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Motion.div>
        </div>

        <div
          key="overview"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <Motion.div variants={item} className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <OverviewChart transactions={transactions} />
            )}
          </Motion.div>
        </div>
        <div
          key="category"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <Motion.div variants={item} className="h-full relative">
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <CategoryChart transactions={transactions} />
            )}
          </Motion.div>
        </div>

        <div
          key="history"
          className={
            isDraggable
              ? "border-2 border-dashed border-primary/50 rounded-lg"
              : ""
          }
        >
          <Motion.div
            variants={item}
            className="h-full relative overflow-y-auto"
          >
            {isDraggable && (
              <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-10 rounded-t-lg flex justify-center items-center">
                <Layout className="h-3 w-3 opacity-50" />
              </div>
            )}
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <TransactionHistory
                transactions={transactions}
                onDelete={deleteTransaction}
              />
            )}
          </Motion.div>
        </div>
      </ResponsiveGridLayout>
    </Motion.div>
  );
};

export default Dashboard;
