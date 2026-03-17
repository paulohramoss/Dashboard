import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useLayout } from "@/context/LayoutContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";
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
import ForecastCard from "@/components/ForecastCard";
import FinScoreCard from "@/components/FinScoreCard";
import FinancialMonthCard from "@/components/FinancialMonthCard";
import BudgetOverviewCard from "@/components/BudgetOverviewCard";
import SmartAlerts from "@/components/SmartAlerts";
import SpendingSimulatorCard from "@/components/SpendingSimulatorCard";
import { calculatePredictiveForecast } from "@/utils/forecast";
import { endOfMonth, differenceInDays, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import { cn } from "@/lib/utils"; // Removed as unused
import PrivacyBlur from "@/components/ui/PrivacyBlur";
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
    updateTransaction,
    stats,
    loading,
    isShadowMode,
    toggleShadowMode,
    addShadowTransaction,
  } = useTransactions();
  const { accounts } = useAccounts();
  const { categories } = useCategories();
  const { t } = useTranslation();
  const formatCurrency = useCurrency();
  const { isSidebarCollapsed } = useLayout();

  /* New Hook for Mobile Detection */
  const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    React.useEffect(() => {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
  };

  const isMobile = useMediaQuery("(max-width: 768px)");

  const renderCardContent = (key) => {
    switch (key) {
      case "financialmonth":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <FinancialMonthCard
            stats={stats}
            categories={categories}
            transactions={transactions}
          />
        );
      case "budgetoverview":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <BudgetOverviewCard
            categories={categories}
            transactions={transactions}
          />
        );
      case "balance":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <BalanceCard amount={stats.balance} />
        );
      case "forecast":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <ForecastCard forecast={forecastData} amount={projectedBalance} confidence={forecastConfidence} monthsAnalyzed={forecastMonths} />
        );
      case "finscore":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <FinScoreCard />
        );
      case "income":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <IncomeCard amount={stats.income} />
        );
      case "expense":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <ExpenseCard amount={stats.expense} />
        );
      case "spendingsimulator":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <SpendingSimulatorCard stats={stats} />
        );
      case "insights":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <SmartAlerts transactions={transactions} />
        );
      case "overview":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <OverviewChart transactions={transactions} />
        );
      case "category":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <CategoryChart transactions={transactions} />
        );
      case "history":
        return loading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <TransactionHistory
            transactions={transactions}
            onDelete={deleteTransaction}
            onEdit={handleEdit}
            limit={10}
          />
        );
      case "accounts":
        return loading ? (
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
                    <PrivacyBlur>{formatCurrency(account.balance)}</PrivacyBlur>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(`accounts.${account.type}`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const activeBudgets = useMemo(() => {
    const withBudget = categories.filter((c) => c.budget > 0);
    return withBudget.filter(
      (c, idx, self) => idx === self.findIndex((b) => b.name === c.name),
    );
  }, [categories]);

  const mobileOrder = [
    "financialmonth",
    ...(activeBudgets.length > 0 ? ["budgetoverview"] : []),
    "spendingsimulator",
    "balance",
    "forecast",
    "insights",
    "finscore",
    "income",
    "expense",
    "overview",
    "category",
    "history",
    "accounts",
  ];

  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleUpdate = async (updatedData) => {
    if (editingTransaction) {
      try {
        await updateTransaction(editingTransaction.id, updatedData);
        setEditingTransaction(null);
      } catch (error) {
        console.error("Error updating transaction:", error);
      }
    }
  };
  const [layouts, setLayouts] = useState(() => {
    const savedLayout = localStorage.getItem("dashboardLayout_v5");
    return savedLayout
      ? JSON.parse(savedLayout)
      : {
          lg: [
            { i: "financialmonth", x: 0, y: 0, w: 12, h: 2, minH: 2 },
            { i: "budgetoverview", x: 0, y: 2, w: 8, h: 2, minH: 2 },
            { i: "spendingsimulator", x: 8, y: 2, w: 4, h: 2, minH: 2 },
            { i: "balance", x: 0, y: 4, w: 6, h: 2, minH: 2 },
            { i: "forecast", x: 6, y: 4, w: 3, h: 2, minH: 2 },
            { i: "finscore", x: 9, y: 4, w: 3, h: 2, minH: 2 },
            { i: "income", x: 0, y: 6, w: 6, h: 2, minH: 2 },
            { i: "expense", x: 6, y: 6, w: 6, h: 2, minH: 2 },
            { i: "insights", x: 0, y: 8, w: 12, h: 2, minH: 2 },
            { i: "overview", x: 0, y: 10, w: 8, h: 4, minH: 4 },
            { i: "category", x: 8, y: 10, w: 4, h: 4, minH: 4 },
            { i: "history", x: 0, y: 14, w: 9, h: 5, minH: 5 },
            { i: "accounts", x: 9, y: 14, w: 3, h: 5, minH: 5 },
          ],
          md: [
            { i: "financialmonth", x: 0, y: 0, w: 12, h: 2 },
            { i: "budgetoverview", x: 0, y: 2, w: 8, h: 2 },
            { i: "spendingsimulator", x: 8, y: 2, w: 4, h: 2 },
            { i: "balance", x: 0, y: 4, w: 6, h: 2 },
            { i: "forecast", x: 6, y: 4, w: 3, h: 2 },
            { i: "finscore", x: 9, y: 4, w: 3, h: 2 },
            { i: "income", x: 0, y: 6, w: 6, h: 2 },
            { i: "expense", x: 6, y: 6, w: 6, h: 2 },
            { i: "insights", x: 0, y: 8, w: 12, h: 2 },
            { i: "overview", x: 0, y: 10, w: 8, h: 4 },
            { i: "category", x: 8, y: 10, w: 4, h: 4 },
            { i: "history", x: 0, y: 14, w: 8, h: 5 },
            { i: "accounts", x: 8, y: 14, w: 4, h: 5 },
          ],
          sm: [
            { i: "financialmonth", x: 0, y: 0, w: 12, h: 2 },
            { i: "budgetoverview", x: 0, y: 2, w: 12, h: 2 },
            { i: "spendingsimulator", x: 0, y: 4, w: 12, h: 2 },
            { i: "balance", x: 0, y: 6, w: 12, h: 2 },
            { i: "forecast", x: 0, y: 8, w: 12, h: 2 },
            { i: "finscore", x: 0, y: 10, w: 12, h: 2 },
            { i: "income", x: 0, y: 12, w: 12, h: 2 },
            { i: "expense", x: 0, y: 14, w: 12, h: 2 },
            { i: "insights", x: 0, y: 16, w: 12, h: 2 },
            { i: "overview", x: 0, y: 18, w: 12, h: 4 },
            { i: "category", x: 0, y: 22, w: 12, h: 4 },
            { i: "history", x: 0, y: 26, w: 12, h: 5 },
            { i: "accounts", x: 0, y: 31, w: 12, h: 5 },
          ],
          xs: [
            { i: "financialmonth", x: 0, y: 0, w: 12, h: 2 },
            { i: "budgetoverview", x: 0, y: 2, w: 12, h: 2 },
            { i: "spendingsimulator", x: 0, y: 4, w: 12, h: 2 },
            { i: "balance", x: 0, y: 6, w: 12, h: 2 },
            { i: "forecast", x: 0, y: 8, w: 12, h: 2 },
            { i: "finscore", x: 0, y: 10, w: 12, h: 2 },
            { i: "income", x: 0, y: 12, w: 12, h: 2 },
            { i: "expense", x: 0, y: 14, w: 12, h: 2 },
            { i: "insights", x: 0, y: 16, w: 12, h: 2 },
            { i: "overview", x: 0, y: 18, w: 12, h: 4 },
            { i: "category", x: 0, y: 22, w: 12, h: 4 },
            { i: "history", x: 0, y: 26, w: 12, h: 5 },
            { i: "accounts", x: 0, y: 31, w: 12, h: 5 },
          ],
          xxs: [
            { i: "financialmonth", x: 0, y: 0, w: 12, h: 2 },
            { i: "budgetoverview", x: 0, y: 2, w: 12, h: 2 },
            { i: "spendingsimulator", x: 0, y: 4, w: 12, h: 2 },
            { i: "balance", x: 0, y: 6, w: 12, h: 2 },
            { i: "forecast", x: 0, y: 8, w: 12, h: 2 },
            { i: "finscore", x: 0, y: 10, w: 12, h: 2 },
            { i: "income", x: 0, y: 12, w: 12, h: 2 },
            { i: "expense", x: 0, y: 14, w: 12, h: 2 },
            { i: "insights", x: 0, y: 16, w: 12, h: 2 },
            { i: "overview", x: 0, y: 18, w: 12, h: 4 },
            { i: "category", x: 0, y: 22, w: 12, h: 4 },
            { i: "history", x: 0, y: 26, w: 12, h: 5 },
            { i: "accounts", x: 0, y: 31, w: 12, h: 5 },
          ],
        };
  });

  const [isDraggable, setIsDraggable] = useState(false);

  const onLayoutChange = (layout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem("dashboardLayout_v5", JSON.stringify(allLayouts));
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      transactions.map((transaction) => {
        // Safe Date Parsing
        let dateStr = transaction.date;
        try {
          if (!dateStr) throw new Error("No date");
          // Ensure YYYY-MM-DD
          const [year, month, day] = dateStr.split("-");
          const dateObj = new Date(year, month - 1, day);
          if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");
          dateStr = dateObj.toLocaleDateString("pt-BR");
        } catch {
          dateStr = transaction.date || "N/A";
        }

        // Localized Category
        const categoryKey = `categories.${transaction.category.toLowerCase()}`;
        const translatedCategory =
          t(categoryKey) !== categoryKey
            ? t(categoryKey)
            : transaction.category;

        return {
          [t("export.date")]: dateStr,
          [t("export.description")]: transaction.description,
          [t("export.category")]: translatedCategory,
          [t("export.type")]:
            transaction.type === "income"
              ? t("export.income")
              : t("export.expense"),
          [t("export.value")]: transaction.amount,
          [t("export.account")]:
            accounts.find((a) => a.id === transaction.accountId)?.name || "N/A",
        };
      }),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transações");
    XLSX.writeFile(wb, "transacoes.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(t("export.title"), 14, 22);

    const tableData = transactions.map((transaction) => {
      // Safe Date Parsing
      let dateStr = transaction.date;
      try {
        if (!dateStr) throw new Error("No date");
        const [year, month, day] = dateStr.split("-");
        const dateObj = new Date(year, month - 1, day);
        if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");
        dateStr = dateObj.toLocaleDateString("pt-BR");
      } catch {
        dateStr = transaction.date || "N/A";
      }

      // Localized Category
      const categoryKey = `categories.${transaction.category.toLowerCase()}`;
      const translatedCategory =
        t(categoryKey) !== categoryKey ? t(categoryKey) : transaction.category;

      return [
        dateStr,
        transaction.description,
        translatedCategory,
        transaction.type === "income"
          ? t("export.income")
          : t("export.expense"),
        formatCurrency(transaction.amount),
      ];
    });

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
        (t) => t.accountId === account.id,
      );
      const balance = accountTransactions.reduce(
        (acc, curr) => {
          return curr.type === "income"
            ? acc + parseFloat(curr.amount)
            : acc - parseFloat(curr.amount);
        },
        parseFloat(account.initialBalance || 0),
      );
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

  const { forecast: forecastData, projectedBalance, confidence: forecastConfidence, monthsAnalyzed: forecastMonths } = useMemo(() => {
    const today = startOfDay(new Date());
    const endOfMonthDate = endOfMonth(today);
    const daysRemaining = differenceInDays(endOfMonthDate, today);
    const daysToProject = Math.max(daysRemaining, 1);

    return calculatePredictiveForecast(
      stats.balance,
      transactions,
      daysToProject,
    );
  }, [stats.balance, transactions]);

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
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("dashboard.title")}
          </h2>
          <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {!isSidebarCollapsed && (
            <>
              {isDraggable && !isMobile && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsDraggable(false)}
                  className="bg-green-600 hover:bg-green-700 h-10 touch-target"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {t("dashboard.saveLayout", "Salvar Layout")}
                </Button>
              )}

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsSimulateOpen(true)}
                className="hidden md:flex h-10 touch-target"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {t("dashboard.simulate", "Simular")}
              </Button>
              {/* Mobile simulate icon only */}
              <Button
                variant="default"
                size="icon"
                onClick={() => setIsSimulateOpen(true)}
                className="md:hidden h-10 w-10 touch-target"
                aria-label={t("dashboard.simulate", "Simular")}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>

              <CustomDropdown
                align="start"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 touch-target"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("common.export", "Export")}
                    </span>
                    <span className="sm:hidden">
                      {t("common.export", "Export")}
                    </span>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("common.options", "Opções")}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              >
                {!isMobile && (
                  <DropdownItem onClick={() => setIsDraggable(!isDraggable)}>
                    <Layout className="mr-2 h-4 w-4" />
                    {isDraggable
                      ? t("dashboard.saveLayout", "Salvar Layout")
                      : t("dashboard.editLayout", "Editar Layout")}
                  </DropdownItem>
                )}
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
        <DialogContent className="w-[95vw] md:w-[600px] max-w-3xl max-h-[90vh] overflow-y-auto">
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
                  "Simulação adicionada ao Modo Sombra",
                ),
              );
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
      >
        <DialogContent className="w-[95vw] md:w-[600px] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("transactions.editTransaction", "Editar Transação")}
            </DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm
              initialData={editingTransaction}
              isEditing={true}
              onAddTransaction={handleUpdate}
              variant="clean"
            />
          )}
        </DialogContent>
      </Dialog>

      {isMobile ? (
        <div className="flex flex-col gap-4">
          {mobileOrder.map((key) => (
            <Motion.div key={key} variants={item} className="w-full">
              {renderCardContent(key)}
            </Motion.div>
          ))}
        </div>
      ) : (
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
          {[
            "financialmonth",
            ...(activeBudgets.length > 0 ? ["budgetoverview"] : []),
            "spendingsimulator",
            "balance",
            "forecast",
            "finscore",
            "income",
            "expense",
            "insights",
            "accounts",
            "overview",
            "category",
            "history",
          ].map((key) => (
            <div
              key={key}
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
                  <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-200/50 cursor-move z-50 rounded-t-lg flex justify-center items-center">
                    <Layout className="h-3 w-3 opacity-50" />
                  </div>
                )}
                {renderCardContent(key)}
              </Motion.div>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </Motion.div>
  );
};

export default Dashboard;
