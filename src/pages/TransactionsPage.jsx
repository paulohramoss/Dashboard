import React from "react";
import { useTransactions } from "@/hooks/useTransactions";
import TransactionHistory from "@/components/TransactionHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TransactionsPage = () => {
  const { transactions, deleteTransaction } = useTransactions();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">
          View and manage your transaction history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionHistory
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
