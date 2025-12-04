import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGoals } from "@/hooks/useGoals";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Target, Wallet, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CurrencyInput from "@/components/ui/currency-input";
import { Select } from "@/components/ui/select";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const GoalsPage = () => {
  const { t } = useTranslation();
  const { goals, addGoal, deleteGoal, allocateFunds } = useGoals();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  const accountsWithBalance = React.useMemo(() => {
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

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    color: "#22c55e",
  });

  const [allocation, setAllocation] = useState({
    amount: "",
    accountId: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;

    await addGoal({
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
    });
    setIsAddOpen(false);
    setNewGoal({
      name: "",
      targetAmount: "",
      targetDate: "",
      color: "#22c55e",
    });
  };

  const openAllocate = (goal) => {
    setSelectedGoal(goal);
    setIsAllocateOpen(true);
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !allocation.amount || !allocation.accountId) return;

    await allocateFunds(
      selectedGoal.id,
      parseFloat(allocation.amount),
      allocation.accountId,
      selectedGoal.name
    );
    setIsAllocateOpen(false);
    setAllocation({ amount: "", accountId: "" });
  };

  const confirmDelete = (goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (goalToDelete) {
      await deleteGoal(goalToDelete.id);
      setDeleteDialogOpen(false);
      setGoalToDelete(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const calculateProgress = (current, target) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("goals.title")}
          </h1>
          <p className="text-muted-foreground">{t("goals.subtitle")}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("goals.addGoal")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = calculateProgress(
            goal.currentAmount,
            goal.targetAmount
          );
          return (
            <Card
              key={goal.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">{goal.name}</CardTitle>
                <Target className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("goals.saved")}
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className="h-3"
                    indicatorColor={goal.color}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}%</span>
                    <span>
                      {t("goals.target")}: {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  {goal.targetDate && (
                    <p className="text-xs text-center text-muted-foreground">
                      {t("goals.targetDate")}:{" "}
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => openAllocate(goal)}
                    >
                      <Wallet className="h-4 w-4" />
                      {t("goals.allocate")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => confirmDelete(goal)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-muted-foreground">
            <Target className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">{t("goals.noGoals")}</p>
            <p className="text-sm">{t("goals.startSaving")}</p>
          </div>
        )}
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("goals.newGoal")}</DialogTitle>
            <DialogDescription>
              {t("goals.newGoalDescription", "Create a new savings goal.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("goals.name")}</Label>
              <Input
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, name: e.target.value })
                }
                placeholder={t("goals.namePlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("goals.targetAmount")}</Label>
              <CurrencyInput
                value={newGoal.targetAmount}
                onChange={(val) =>
                  setNewGoal({ ...newGoal, targetAmount: val })
                }
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("goals.targetDate")}</Label>
              <Input
                type="date"
                value={newGoal.targetDate}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, targetDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("goals.color")}</Label>
              <div className="flex gap-2">
                {[
                  "#22c55e",
                  "#3b82f6",
                  "#f59e0b",
                  "#ef4444",
                  "#8b5cf6",
                  "#ec4899",
                ].map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newGoal.color === color
                        ? "border-primary scale-110"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewGoal({ ...newGoal, color })}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.save")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Allocate Funds Dialog */}
      <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("goals.allocateFunds")}</DialogTitle>
            <DialogDescription>
              {t("goals.allocateDescription", "Transfer funds to this goal.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocate} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("goals.sourceAccount")}</Label>
              <Select
                value={allocation.accountId}
                onChange={(e) =>
                  setAllocation({ ...allocation, accountId: e.target.value })
                }
              >
                <option value="" disabled>
                  {t("goals.selectAccount")}
                </option>
                {accountsWithBalance.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("goals.amount")}</Label>
              <CurrencyInput
                value={allocation.amount}
                onChange={(val) =>
                  setAllocation({ ...allocation, amount: val })
                }
                placeholder="0,00"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAllocateOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("goals.confirmAllocation")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t("goals.deleteTitle")}
        description={t("goals.deleteDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />
    </div>
  );
};

export default GoalsPage;
