import React from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionHistory from "@/components/TransactionHistory";
import TransactionForm from "@/components/TransactionForm";
import FileUploader from "@/components/FileUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TransactionsPage = () => {
  const { transactions, deleteTransaction, addTransaction, addTransactions } =
    useTransactions();
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {t("transactions.title")}
        </h2>
        <p className="text-muted-foreground">{t("transactions.subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("transactions.allTransactions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistory
                transactions={transactions}
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
