import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Edit2, Save, X, Plus, Trash2 } from "lucide-react";

import CurrencyInput from "@/components/ui/currency-input";

const BudgetsPage = () => {
  const { t } = useTranslation();
  const { categories, updateCategory } = useCategories();
  const { transactions } = useTransactions();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({ categoryId: "", amount: "" });

  // Only show expense categories
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Active budgets are those with budget defined (not null/undefined)
  const activeBudgets = expenseCategories.filter(
    (c) => c.budget !== null && c.budget !== undefined
  );

  // Available categories for new budget are those with no budget defined
  const availableCategories = expenseCategories.filter(
    (c) => c.budget === null || c.budget === undefined
  );

  // Deduplicate available categories by name to prevent duplicates in dropdown
  const uniqueAvailableCategories = availableCategories.filter(
    (cat, index, self) => index === self.findIndex((t) => t.name === cat.name)
  );

  const getSpentAmount = (categoryName) => {
    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === categoryName &&
          new Date(t.date).getMonth() === new Date().getMonth() &&
          new Date(t.date).getFullYear() === new Date().getFullYear()
      )
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditValue(category.budget || 0);
  };

  const handleSave = async (id) => {
    await updateCategory(id, { budget: parseFloat(editValue) });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("budgets.confirmDelete"))) {
      await updateCategory(id, { budget: null });
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!newBudget.categoryId || newBudget.amount === "") return;

    await updateCategory(newBudget.categoryId, {
      budget: parseFloat(newBudget.amount),
    });

    setNewBudget({ categoryId: "", amount: "" });
    setIsAdding(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("budgets.title")}
          </h2>
          <p className="text-muted-foreground">{t("budgets.subtitle")}</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" /> {t("budgets.addBudget")}
        </Button>
      </div>

      {isAdding && (
        <Card className="max-w-md mx-auto animate-in slide-in-from-top-5">
          <CardHeader>
            <CardTitle>{t("budgets.newBudget")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("budgets.category")}
                </label>
                <Select
                  value={newBudget.categoryId}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, categoryId: e.target.value })
                  }
                  required
                >
                  <option value="">{t("budgets.selectCategory")}</option>
                  {uniqueAvailableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.isDefault
                        ? t(`categories.${cat.name.toLowerCase()}`)
                        : cat.name}
                    </option>
                  ))}
                </Select>
                {uniqueAvailableCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("budgets.noBudgetableCategories")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("budgets.amount")}
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
              <Button
                type="submit"
                className="w-full"
                disabled={uniqueAvailableCategories.length === 0}
              >
                {t("common.save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeBudgets.map((category) => {
          const spent = getSpentAmount(category.name);
          const budget = category.budget || 0;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const isOverBudget = spent > budget && budget > 0;

          return (
            <Card
              key={category.id}
              className={isOverBudget ? "border-red-500" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    {category.isDefault
                      ? t(`categories.${category.name.toLowerCase()}`)
                      : category.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {editingId === category.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600"
                          onClick={() => handleSave(category.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {formatCurrency(spent)} / {formatCurrency(budget)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingId === category.id ? (
                  <CurrencyInput
                    className="mb-4"
                    value={editValue}
                    onChange={(val) => setEditValue(val)}
                  />
                ) : (
                  <>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={`h-2 ${
                        isOverBudget ? "bg-red-100" : "bg-secondary"
                      }`}
                      indicatorClassName={
                        isOverBudget
                          ? "bg-red-500"
                          : percentage > 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                      {percentage.toFixed(0)}%
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetsPage;
