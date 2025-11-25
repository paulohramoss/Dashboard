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
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X } from "lucide-react";

const BudgetsPage = () => {
  const { t } = useTranslation();
  const { categories, updateCategory } = useCategories();
  const { transactions } = useTransactions();
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "expense");

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("budgets.title")}
        </h2>
        <p className="text-muted-foreground">{t("budgets.subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {expenseCategories.map((category) => {
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
                  {editingId === category.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-24 h-8"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                      />
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
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardDescription>
                  {formatCurrency(spent)} / {formatCurrency(budget)}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetsPage;
