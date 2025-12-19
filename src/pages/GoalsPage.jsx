import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useGoals } from "@/hooks/useGoals";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Star, Wallet, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useLayout } from "@/context/LayoutContext";

import { motion as Motion } from "framer-motion";
import confetti from "canvas-confetti";

import { useCurrency } from "@/hooks/useCurrency";

const GoalsPage = () => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();
  const { goals, addGoal, deleteGoal, allocateFunds, loading } = useGoals();

  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { isPrivacyMode } = useLayout();

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

    const amount = parseFloat(allocation.amount);

    try {
      await allocateFunds(
        selectedGoal.id,
        amount,
        allocation.accountId,
        selectedGoal.name
      );

      // Check if goal reached
      if (selectedGoal.currentAmount + amount >= selectedGoal.targetAmount) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#ffd700", "#ffffff"],
        });
        toast.success(
          t("goals.goalReached", "Congratulations! Goal reached! 🎉")
        );
      } else {
        toast.success(
          t("goals.allocationSuccess", "Funds allocated successfully!")
        );
      }

      setIsAllocateOpen(false);
      setAllocation({ amount: "", accountId: "" });
    } catch (error) {
      console.error("Failed to allocate funds:", error);
      toast.error(
        t(
          "goals.allocationError",
          "Failed to allocate funds. Please try again."
        )
      );
    }
  };

  const confirmDelete = (goal) => {
    setGoalToDelete(goal);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (goalToDelete) {
      await deleteGoal(goalToDelete.id);
      setGoalToDelete(null);
    }
  };

  const calculateProgress = (current, target) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("goals.title")}
          </h1>
          <p className="text-muted-foreground">{t("goals.subtitle")}</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("goals.addGoal")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-5 rounded-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mt-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-2 mt-4">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : goals.map((goal) => {
              const progress = calculateProgress(
                goal.currentAmount,
                goal.targetAmount
              );
              return (
                <Motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xl font-bold">
                        {goal.name}
                      </CardTitle>
                      <Star className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 mt-4">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span>
                            <span
                              className={cn(isPrivacyMode && "privacy-blur")}
                            >
                              {formatCurrency(goal.currentAmount)}
                            </span>{" "}
                            <span className="text-muted-foreground font-normal">
                              {t("budgets.accumulatedOf")}
                            </span>{" "}
                            <span
                              className={cn(isPrivacyMode && "privacy-blur")}
                            >
                              {formatCurrency(goal.targetAmount)}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            ({Math.round(progress)}%)
                          </span>
                        </div>

                        {/* Custom Animated Progress Bar */}
                        <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                          <Motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: goal.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          {/* Placeholder for spacing or aux info if needed */}
                          <span></span>
                          {goal.targetDate && (
                            <span>
                              {new Date(goal.targetDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

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
                </Motion.div>
              );
            })}
        {!loading && goals.length === 0 && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            {t("goals.noGoals")}
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("goals.addGoal")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("transactions.form.description")}</Label>
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
                required
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
                <Input
                  type="color"
                  className="h-10 w-20 p-1 cursor-pointer"
                  value={newGoal.color}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, color: e.target.value })
                  }
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              {t("common.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAllocateOpen} onOpenChange={setIsAllocateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("goals.allocateFunds")}</DialogTitle>
            <DialogDescription>
              {selectedGoal?.name} - {t("goals.remaining")}:{" "}
              {formatCurrency(
                (selectedGoal?.targetAmount || 0) -
                  (selectedGoal?.currentAmount || 0)
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAllocate} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("goals.amountToAllocate")}</Label>
              <CurrencyInput
                value={allocation.amount}
                onChange={(val) =>
                  setAllocation({ ...allocation, amount: val })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("goals.sourceAccount")}</Label>
              <Select
                value={allocation.accountId}
                onChange={(e) =>
                  setAllocation({ ...allocation, accountId: e.target.value })
                }
              >
                <option value="">{t("transactions.form.selectAccount")}</option>
                {accountsWithBalance.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">{t("common.save")}</Button>
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
    </Motion.div>
  );
};

export default GoalsPage;
