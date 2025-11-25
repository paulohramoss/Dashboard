import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionHistory from "@/components/TransactionHistory";
import TransactionForm from "@/components/TransactionForm";
import TransactionFilters from "@/components/TransactionFilters";
import FileUploader from "@/components/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TransactionsPage = () => {
  const { transactions, deleteTransaction, addTransaction, addTransactions } =
    useTransactions();
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    startDate: "",
    endDate: "",
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesType = filters.type === "all" || t.type === filters.type;
      const matchesCategory =
        filters.category === "all" || t.category === filters.category;

      let matchesDate = true;
      if (filters.startDate && filters.endDate) {
        matchesDate = t.date >= filters.startDate && t.date <= filters.endDate;
      } else if (filters.startDate) {
        matchesDate = t.date >= filters.startDate;
      } else if (filters.endDate) {
        matchesDate = t.date <= filters.endDate;
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, filters]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("transactions.title")}
        </h2>
        <p className="text-muted-foreground">{t("transactions.subtitle")}</p>
      </div>

      <TransactionFilters onFilterChange={setFilters} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("transactions.allTransactions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistory
                transactions={filteredTransactions}
                onDelete={deleteTransaction}
              />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-4 lg:col-span-3 space-y-4">
          <TransactionForm onAddTransaction={addTransaction} />
          <FileUploader onUpload={addTransactions} />
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
