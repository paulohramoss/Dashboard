import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionHistory from "@/components/TransactionHistory";
import TransactionForm from "@/components/TransactionForm";
import TransactionFilters from "@/components/TransactionFilters";
import FileUploader from "@/components/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TransactionsPage = () => {
  const {
    transactions,
    deleteTransaction,
    addTransaction,
    addTransactions,
    updateTransaction,
  } = useTransactions();
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    accountId: "all",
    startDate: "",
    endDate: "",
  });
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesType = filters.type === "all" || t.type === filters.type;
      const matchesCategory =
        filters.category === "all" || t.category === filters.category;
      const matchesAccount =
        !filters.accountId ||
        filters.accountId === "all" ||
        t.accountId === filters.accountId;

      let matchesDate = true;
      if (filters.startDate && filters.endDate) {
        matchesDate = t.date >= filters.startDate && t.date <= filters.endDate;
      } else if (filters.startDate) {
        matchesDate = t.date >= filters.startDate;
      } else if (filters.endDate) {
        matchesDate = t.date <= filters.endDate;
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesAccount &&
        matchesDate
      );
    });
  }, [transactions, filters]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t("transactions.title")}
        </h2>
        <p className="text-muted-foreground">{t("transactions.subtitle")}</p>
      </div>

      <TransactionFilters onFilterChange={setFilters} />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
          <TransactionHistory
            transactions={filteredTransactions}
            onDelete={deleteTransaction}
            onEdit={handleEdit}
            className="h-full"
          />
        </div>
        <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
          <TransactionForm onAddTransaction={addTransaction} />
          <FileUploader onUpload={addTransactions} />
        </div>
      </div>

      <Dialog
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
      >
        <DialogContent className="max-w-3xl">
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
    </div>
  );
};

export default TransactionsPage;
