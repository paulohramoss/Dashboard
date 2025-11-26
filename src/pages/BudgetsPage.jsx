import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import CurrencyInput from "@/components/ui/currency-input";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const BudgetsPage = () => {
  const { t } = useTranslation();
  const { categories, updateCategory } = useCategories();
  const { transactions } = useTransactions();
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({ categoryId: "", amount: "" });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);

  const activeBudgets = useMemo(() => {
    const budgets = categories.filter((c) => c.budget > 0);
    return budgets.filter(
      (budget, index, self) =>
        index === self.findIndex((b) => b.name === budget.name)
    );
  }, [categories]);

  const availableCategories = useMemo(() => {
    // Filter categories that don't have a budget set (or budget is 0)
    // Also deduplicate by name to avoid showing same category multiple times if it exists
    const uniqueCategories = categories.filter(
      (cat, index, self) => index === self.findIndex((c) => c.name === cat.name)
    );
    return uniqueCategories.filter((c) => !c.budget || c.budget <= 0);
  }, [categories]);

  const calculateProgress = (categoryName, budget) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const spent = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === categoryName &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear
      )
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    return {
      spent,
      percentage: Math.min((spent / budget) * 100, 100),
      remaining: Math.max(budget - spent, 0),
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
      });
      setIsAdding(false);
      setNewBudget({ categoryId: "", amount: "" });
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("budgets.title")}
          </h2>
          <p className="text-muted-foreground">{t("budgets.subtitle")}</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("budgets.addBudget")}
        </Button>
      </div>

      {isAdding && (
        <Card className="animate-in slide-in-from-top-5">
          <CardContent className="pt-6">
            <form onSubmit={handleAddBudget} className="flex gap-4 items-end">
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
              <div className="w-[200px] space-y-2">
                <label className="text-sm font-medium">
                  {t("transactions.form.amount")}
                </label>
                <CurrencyInput
                  value={newBudget.amount}
                  onChange={(val) =>
                    setNewBudget({ ...newBudget, amount: val })
                  }
                  placeholder="R$ 0,00"
                  required
                />
              </div>
              <Button type="submit">{t("common.save")}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {activeBudgets.map((category) => {
          const { spent, percentage, remaining } = calculateProgress(
            category.name,
            category.budget
          );

          return (
            <Card key={category.id}>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(spent)}{" "}
                      {t("budgets.spent")}
                    </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(remaining)}{" "}
                      {t("budgets.remaining")}
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className={percentage >= 100 ? "bg-destructive/20" : ""}
                    indicatorClassName={
                      percentage >= 100 ? "bg-destructive" : ""
                    }
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {t("budgets.total")}:{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(category.budget)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}

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
    </div>
  );
};

export default BudgetsPage;
