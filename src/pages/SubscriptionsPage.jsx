import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { detectSubscriptions } from "@/utils/subscriptionDetector";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  CreditCard,
  Plus,
  Trash2,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import { formatDateToLocal } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import TransactionForm from "@/components/TransactionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SubscriptionsPage = () => {
  const { t } = useTranslation();
  const { transactions, deleteTransaction, addTransaction } = useTransactions();
  // const { isPrivacyMode } = useLayout(); // Removed
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filter for active recurring expenses using auto-detector + manual flags
  const subscriptions = useMemo(() => {
    return detectSubscriptions(transactions);
  }, [transactions]);

  // Calculate total monthly and annual fixed costs
  const { totalMonthlyFixedCost, totalAnnualFixedCost } = useMemo(() => {
    let monthly = 0;
    subscriptions.forEach((curr) => {
      let amount = parseFloat(curr.amount);
      const freq = curr.frequency || "monthly"; // auto-detected default to monthly
      if (freq === "weekly") amount *= 4;
      if (freq === "daily") amount *= 30;
      if (freq === "yearly") amount /= 12;
      monthly += amount;
    });
    return {
      totalMonthlyFixedCost: monthly,
      totalAnnualFixedCost: monthly * 12,
    };
  }, [subscriptions]);

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteTransaction(deleteId);
      setDeleteId(null);
      setIsConfirmOpen(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const getFrequencyLabel = (freq) => {
    return t(`transactions.form.${freq}`) || freq;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("subscriptions.title")}
          </h1>
          <p className="text-muted-foreground">{t("subscriptions.subtitle")}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("subscriptions.add")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("transactions.form.title")}</DialogTitle>
            </DialogHeader>
            <TransactionForm
              onAddTransaction={async (data) => {
                await addTransaction({ ...data, isRecurring: true });
                setIsAddOpen(false);
              }}
              // You might want to pass initial values here to force recurring,
              // but TransactionForm might need a prop for "defaultRecurring" or similar to be cleaner.
              // For now, let's trust the user or the implementation Plan's simplicity.
              // Actually, I can wrap the form logic or rely on the user checking the box.
              // Better detailed: The user expects it to be a subscription.
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Hero Metric Card and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-l-4 border-l-indigo-500 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-lg text-foreground">
                  Você possui <span className="font-bold text-indigo-600 dark:text-indigo-400">{subscriptions.length}</span> assinaturas ativas.
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Custo Mensal
                  </p>
                  <h2 className="text-3xl font-extrabold text-foreground">
                    <PrivacyBlur>{formatCurrency(totalMonthlyFixedCost)}</PrivacyBlur>
                  </h2>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Custo Anual
                  </p>
                  <h2 className="text-3xl font-extrabold text-foreground">
                    <PrivacyBlur>{formatCurrency(totalAnnualFixedCost)}</PrivacyBlur>
                  </h2>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border border-amber-500/20 shadow-sm flex flex-col justify-center">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-foreground">Oportunidade de Economia</h3>
              <p className="text-sm text-muted-foreground">
                Revise suas assinaturas ativas. Cancelar serviços que você não usa mais pode gerar uma grande economia no seu ano!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t("subscriptions.activeSubscriptions")}
          </CardTitle>
          <CardDescription>
            {subscriptions.length === 0
              ? t("subscriptions.noSubscriptions")
              : t("subscriptions.listDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t("subscriptions.emptyState")}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("transactions.table.description")}</TableHead>
                    <TableHead>{t("transactions.form.category")}</TableHead>
                    <TableHead>{t("transactions.form.frequency")}</TableHead>
                    <TableHead>{t("transactions.form.date")}</TableHead>
                    <TableHead className="text-right">
                      {t("transactions.table.amount")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("transactions.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.description}
                      </TableCell>
                      <TableCell>
                        {t(`categories.${sub.category.toLowerCase()}`, sub.category)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          {getFrequencyLabel(sub.frequency || "monthly")}
                        </span>
                        {sub.detectedBy === "keyword" && (
                          <span className="ml-2 text-[10px] text-muted-foreground">(Auto-detectado)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Display Next Due Date if available, else Date */}
                        {formatDateToLocal(sub.nextDueDate || sub.date)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        <PrivacyBlur>{formatCurrency(sub.amount)}</PrivacyBlur>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteClick(sub.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("subscriptions.deleteTitle")}
        description={t("subscriptions.deleteDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />
    </div>
  );
};

export default SubscriptionsPage;
