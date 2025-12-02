import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      // eslint-disable-next-line
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort client-side to avoid needing a composite index in Firestore
      docs.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(docs);
      setLoading(false);

      // Check for recurring transactions
      checkRecurringTransactions(docs);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const addTransaction = async (transaction) => {
    if (!user?.id) return;
    try {
      // Handle Installments
      if (transaction.isInstallment && transaction.installmentsCount > 1) {
        const batch = writeBatch(db);
        const amountPerInstallment =
          parseFloat(transaction.amount) / transaction.installmentsCount;
        const startDate = new Date(transaction.date);

        for (let i = 0; i < transaction.installmentsCount; i++) {
          const docRef = doc(collection(db, "transactions"));
          const installmentDate = new Date(startDate);
          installmentDate.setMonth(startDate.getMonth() + i);

          batch.set(docRef, {
            ...transaction,
            userId: user.id,
            description: `${transaction.description} (${i + 1}/${
              transaction.installmentsCount
            })`,
            amount: amountPerInstallment,
            date: installmentDate.toISOString().split("T")[0],
            createdAt: new Date().toISOString(),
            accountId: transaction.accountId || null,
            isInstallment: true,
            installmentNumber: i + 1,
            totalInstallments: transaction.installmentsCount,
          });
        }
        await batch.commit();
        return;
      }

      // Normal Transaction
      const transactionData = {
        ...transaction,
        userId: user.id,
        date: transaction.date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        accountId: transaction.accountId || null,
      };

      if (transaction.isRecurring) {
        transactionData.nextDueDate = calculateNextDueDate(
          transactionData.date,
          transaction.frequency
        );
      }

      await addDoc(collection(db, "transactions"), transactionData);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const addTransactions = async (newTransactions) => {
    if (!user?.id) return;
    try {
      const batch = writeBatch(db);
      newTransactions.forEach((t) => {
        const docRef = doc(collection(db, "transactions"));
        batch.set(docRef, {
          ...t,
          userId: user.id,
          date: t.date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error adding transactions:", error);
    }
  };

  const deleteTransaction = async (id) => {
    if (!user?.id) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const clearTransactions = async () => {
    if (!user?.id) return;
    try {
      const batch = writeBatch(db);
      transactions.forEach((t) => {
        const docRef = doc(db, "transactions", t.id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing transactions:", error);
    }
  };

  const stats = transactions.reduce(
    (acc, curr) => {
      const amount = parseFloat(curr.amount);
      if (curr.type === "income") {
        acc.income += amount;
        acc.balance += amount;
      } else if (curr.type === "expense") {
        acc.expense += amount;
        acc.balance -= amount;
      }
      // Transfers don't affect overall income/expense stats
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
    loading,
  };
};

const calculateNextDueDate = (date, frequency) => {
  const d = new Date(date);
  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      break;
  }
  return d.toISOString().split("T")[0];
};

const checkRecurringTransactions = async (currentTransactions) => {
  const today = new Date().toISOString().split("T")[0];
  const batch = writeBatch(db);
  let hasUpdates = false;

  currentTransactions.forEach((t) => {
    if (t.isRecurring && t.nextDueDate && t.nextDueDate <= today) {
      // Create new transaction
      const newTransactionRef = doc(collection(db, "transactions"));
      batch.set(newTransactionRef, {
        ...t,
        date: t.nextDueDate,
        isRecurring: false, // Generated transaction is not recurring itself
        createdAt: new Date().toISOString(),
        originalTransactionId: t.id,
        nextDueDate: null,
      });

      // Update original transaction's next due date
      const originalTransactionRef = doc(db, "transactions", t.id);
      const nextDate = calculateNextDueDate(t.nextDueDate, t.frequency);
      batch.update(originalTransactionRef, {
        nextDueDate: nextDate,
      });

      hasUpdates = true;
    }
  });

  if (hasUpdates) {
    try {
      await batch.commit();
      console.log("Recurring transactions processed.");
    } catch (error) {
      console.error("Error processing recurring transactions:", error);
    }
  }
};
