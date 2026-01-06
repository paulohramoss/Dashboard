import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
// import { useLayout } from "@/context/LayoutContext"; // Removed as it is not needed if PrivacyBlur handles it internally?
// Wait, PrivacyBlur handles useLayout internally. So I should remove the hook usage from here.
import PrivacyBlur from "@/components/ui/PrivacyBlur";
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

  // Filter for active recurring expenses
  const subscriptions = useMemo(() => {
    return transactions.filter((t) => t.isRecurring && t.type === "expense");
  }, [transactions]);

  // Calculate total monthly fixed cost
  const totalMonthlyFixedCost = useMemo(() => {
    return subscriptions.reduce((acc, curr) => {
      let amount = parseFloat(curr.amount);
      // Normalize to monthly
      if (curr.frequency === "weekly") amount *= 4;
      if (curr.frequency === "daily") amount *= 30;
      if (curr.frequency === "yearly") amount /= 12;
      return acc + amount;
    }, 0);
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

      {/* Hero Metric Card */}
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-l-4 border-l-red-500 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {t("subscriptions.fixedCostLabel")}
              </p>
              <h2 className="text-4xl font-extrabold text-foreground mt-1">
                <PrivacyBlur>
                  {formatCurrency(totalMonthlyFixedCost)}
                </PrivacyBlur>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("subscriptions.monthlyEstimate")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                      <TableCell>{sub.category}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {getFrequencyLabel(sub.frequency)}
                        </span>
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
