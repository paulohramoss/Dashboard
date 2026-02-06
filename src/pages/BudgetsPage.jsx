import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgetRollover } from "@/hooks/useBudgetRollover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CurrencyInput from "@/components/ui/currency-input";
import ConfirmDialog from "@/components/ui/confirm-dialog";
// import { useLayout } from "@/context/LayoutContext";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { cn } from "@/lib/utils";

import { motion as Motion } from "framer-motion";

const BudgetsPage = () => {
  const { t } = useTranslation();
  const { categories, updateCategory, loading } = useCategories();
  const { transactions } = useTransactions();

  // Run rollover logic
  useBudgetRollover(categories, transactions);

  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({
    categoryId: "",
    amount: "",
    rollover: false,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const activeBudgets = useMemo(() => {
    const budgets = categories.filter((c) => c.budget > 0);
    return budgets.filter(
      (budget, index, self) =>
        index === self.findIndex((b) => b.name === budget.name),
    );
  }, [categories]);

  const availableCategories = useMemo(() => {
    // Filter categories that don't have a budget set (or budget is 0)
    // Also deduplicate by name to avoid showing same category multiple times if it exists
    const uniqueCategories = categories.filter(
      (cat, index, self) =>
        index === self.findIndex((c) => c.name === cat.name),
    );
    return uniqueCategories.filter((c) => !c.budget || c.budget <= 0);
  }, [categories]);

  const calculateProgress = (categoryName, budget, isRollover, category) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate current month spent
    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === categoryName &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear,
      )
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    let effectiveBudget = budget;

    // Add accumulated rollover from previous months
    if (isRollover && category.accumulatedRollover) {
      effectiveBudget += category.accumulatedRollover;
    }

    return {
      spent,
      percentage: Math.min((spent / effectiveBudget) * 100, 100),
      remaining: Math.max(effectiveBudget - spent, 0),
      effectiveBudget,
    };
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudget.categoryId || !newBudget.amount) return;

    const category = categories.find((c) => c.id === newBudget.categoryId);
    if (category) {
      await updateCategory(category.id, {
        ...category,
        budget: parseFloat(newBudget.amount),
        rollover: newBudget.rollover,
      });
      setIsAdding(false);
      setNewBudget({ categoryId: "", amount: "", rollover: false });
    }
  };

  const confirmDelete = (category) => {
    setBudgetToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (budgetToDelete) {
      await updateCategory(budgetToDelete.id, {
        ...budgetToDelete,
        budget: 0, // Set to 0 to "remove" the budget but keep category
      });
      setBudgetToDelete(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("budgets.title")}
          </h2>
          <p className="text-muted-foreground">{t("budgets.subtitle")}</p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("budgets.addBudget")}
        </Button>
      </div>

      {isAdding && (
        <Card className="animate-in slide-in-from-top-5">
          <CardContent className="pt-6">
            <form
              onSubmit={handleAddBudget}
              className="flex flex-col md:flex-row gap-4 md:items-end"
            >
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">
                  {t("transactions.form.category")}
                </label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newBudget.categoryId}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="">
                    {t("transactions.form.selectCategory")}
                  </option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.isDefault
                        ? t(`categories.${cat.name.toLowerCase()}`)
                        : cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-[200px] space-y-2">
                <label className="text-sm font-medium">
                  {t("transactions.form.amount")}
                </label>
                <CurrencyInput
                  value={newBudget.amount}
                  onChange={(val) =>
                    setNewBudget({ ...newBudget, amount: val })
                  }
                  required
                />
              </div>
              <div className="flex items-center space-x-2 md:pb-2">
                <input
                  type="checkbox"
                  id="rollover"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={newBudget.rollover}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, rollover: e.target.checked })
                  }
                />
                <label
                  htmlFor="rollover"
                  className="text-sm font-medium cursor-pointer"
                >
                  {t("budgets.rollover")}
                </label>
              </div>
              <Button type="submit" className="w-full md:w-auto">
                {t("common.save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-32 ml-auto" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          activeBudgets.map((category) => {
            const { percentage, remaining, effectiveBudget } =
              calculateProgress(
                category.name,
                category.budget,
                category.rollover,
                category,
              );

            const getProgressColor = () => {
              if (percentage < 75) return "bg-green-500";
              if (percentage < 100) return "bg-yellow-500";
              return "bg-destructive";
            };

            return (
              <Motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">
                      {category.isDefault
                        ? t(`categories.${category.name.toLowerCase()}`)
                        : category.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => confirmDelete(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">
                          <PrivacyBlur>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(remaining)}
                          </PrivacyBlur>{" "}
                          {t("budgets.remainingOf")}{" "}
                          <PrivacyBlur>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(effectiveBudget)}
                          </PrivacyBlur>
                        </span>
                      </div>

                      {/* Custom Animated Progress Bar */}
                      <div
                        className={cn(
                          "h-2 w-full bg-secondary rounded-full overflow-hidden",
                          percentage >= 100 && "bg-destructive/20",
                        )}
                      >
                        <Motion.div
                          className={cn(
                            "h-full rounded-full",
                            getProgressColor(),
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>
                          {Math.round(percentage)}% {t("budgets.spent")}
                        </span>
                        {effectiveBudget > category.budget && (
                          <span className="text-green-500 ml-1 text-[10px]">
                            (+
                            <PrivacyBlur>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(effectiveBudget - category.budget)}
                            </PrivacyBlur>{" "}
                            rollover)
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Motion.div>
            );
          })
        )}

        {activeBudgets.length === 0 && !isAdding && (
          <div className="text-center py-10 text-muted-foreground">
            {t("budgets.noBudgets")}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t("budgets.deleteTitle")}
        description={t("budgets.deleteDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />
    </Motion.div>
  );
};

export default BudgetsPage;
