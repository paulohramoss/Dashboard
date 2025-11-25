import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const useTransactions = () => {
  const { user } = useAuth();

  // Lazy initialization of state
  const [transactions, setTransactions] = useState(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`transactions_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save transactions when they change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(
        `transactions_${user.id}`,
        JSON.stringify(transactions)
      );
    }
  }, [transactions, user?.id]);

  const addTransaction = (transaction) => {
    setTransactions((prev) => [
      {
        ...transaction,
        id: crypto.randomUUID(),
        date: transaction.date || new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const addTransactions = (newTransactions) => {
    const formatted = newTransactions.map((t) => ({
      ...t,
      id: crypto.randomUUID(),
      date: t.date || new Date().toISOString(),
    }));
    setTransactions((prev) => [...formatted, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  const stats = transactions.reduce(
    (acc, curr) => {
      const amount = parseFloat(curr.amount);
      if (curr.type === "income") {
        acc.income += amount;
        acc.balance += amount;
      } else {
        acc.expense += amount;
        acc.balance -= amount;
      }
      return acc;
    },
    { income: 0, expense: 0, balance: 0 }
  );

  return {
    transactions,
    addTransaction,
    addTransactions,
    deleteTransaction,
    clearTransactions,
    stats,
  };
};
