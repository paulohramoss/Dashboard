import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePremium, FREE_LIMITS } from "@/hooks/usePremium";
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
  updateDoc,
} from "firebase/firestore";
import { getCurrentLocalDate } from "@/lib/utils";

export const useTransactions = () => {
  const { user } = useAuth();
  const { isPremium } = usePremium();
  // Derive initial state from user
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't subscribe if no user - component will naturally show empty state
    if (!user?.id) {
      // Defer state updates to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setTransactions([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    setLoading(true);

    // Track if component is still mounted to prevent state updates after unmount
    let isMounted = true;

    // Use object refs to store results to avoid stale closures
    const resultsRef = {
      results1: [],
      results2: [],
      bothLoaded: { q1: false, q2: false },
    };

    const handleUpdate = () => {
      // Prevent state updates if component unmounted
      if (!isMounted) return;

      const allDocs = [...resultsRef.results1, ...resultsRef.results2];
      const uniqueDocs = Array.from(
        new Map(allDocs.map((item) => [item.id, item])).values(),
      );

      uniqueDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(uniqueDocs);

      // Only set loading to false when both queries have loaded at least once
      if (resultsRef.bothLoaded.q1 && resultsRef.bothLoaded.q2) {
        setLoading(false);
        checkRecurringTransactions(uniqueDocs, user.id);
      }
    };

    const q1 = query(
      collection(db, "transactions"),
      where("userId", "==", user.id),
    );

    const q2 = query(
      collection(db, "transactions"),
      where("allowedUsers", "array-contains", user.id),
    );

    const unsub1 = onSnapshot(
      q1,
      (snapshot) => {
        if (!isMounted) return;
        resultsRef.results1 = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        resultsRef.bothLoaded.q1 = true;
        handleUpdate();
      },
      (error) => {
        console.error("Error fetching owned transactions:", error);
        if (isMounted) {
          setLoading(false);
        }
      },
    );

    const unsub2 = onSnapshot(
      q2,
      (snapshot) => {
        if (!isMounted) return;
        resultsRef.results2 = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        resultsRef.bothLoaded.q2 = true;
        handleUpdate();
      },
      (error) => {
        console.error("Error fetching shared transactions:", error);
        if (isMounted) {
          setLoading(false);
        }
      },
    );

    return () => {
      // Mark component as unmounted FIRST
      isMounted = false;
      // Then unsubscribe to prevent any new callbacks
      unsub1();
      unsub2();
    };
  }, [user?.id]);

  const addTransaction = async (transaction) => {
    if (!user?.id) return;
    try {
      // Free tier limit: max transactions per month (non-system, non-shadow)
      if (!isPremium && !transaction.isSystem) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const thisMonthCount = transactions.filter((t) => {
          if (t.isSystem || t.isShadow) return false;
          const d = new Date(t.date);
          return (
            d.getMonth() === currentMonth && d.getFullYear() === currentYear
          );
        }).length;
        if (thisMonthCount >= FREE_LIMITS.transactionsPerMonth) {
          const error = new Error("LIMIT_REACHED");
          error.limitKey = "transactions";
          error.limit = FREE_LIMITS.transactionsPerMonth;
          throw error;
        }
      }

      // Handle Installments
      if (transaction.isInstallment && transaction.installmentsCount > 1) {
        const batch = writeBatch(db);
        const totalAmount = parseFloat(transaction.amount);
        const installmentsCount = parseInt(transaction.installmentsCount);

        // Calculate base amount rounded down to 2 decimal places
        const baseAmount =
          Math.floor((totalAmount / installmentsCount) * 100) / 100;

        // Calculate the remainder
        const remainder = parseFloat(
          (totalAmount - baseAmount * installmentsCount).toFixed(2),
        );

        const startDate = new Date(transaction.date);

        for (let i = 0; i < installmentsCount; i++) {
          const docRef = doc(collection(db, "transactions"));
          const installmentDate = new Date(startDate);
          installmentDate.setMonth(startDate.getMonth() + i);

          // Add remainder to the last installment
          const installmentAmount =
            i === installmentsCount - 1
              ? parseFloat((baseAmount + remainder).toFixed(2))
              : baseAmount;

          batch.set(docRef, {
            ...transaction,
            userId: user.id,
            allowedUsers: [user.id],
            description: `${transaction.description} (${
              i + 1
            }/${installmentsCount})`,
            amount: installmentAmount,
            date: installmentDate.toISOString().split("T")[0],
            createdAt: new Date().toISOString(),
            accountId: transaction.accountId || null,
            isInstallment: true,
            installmentNumber: i + 1,
            totalInstallments: installmentsCount,
          });
        }
        await batch.commit();
        return;
      }

      // Free tier limit: max recurring transactions
      if (!isPremium && transaction.isRecurring) {
        const recurringCount = transactions.filter((t) => t.isRecurring).length;
        if (recurringCount >= FREE_LIMITS.recurringTransactions) {
          const error = new Error("LIMIT_REACHED");
          error.limitKey = "recurring";
          error.limit = FREE_LIMITS.recurringTransactions;
          throw error;
        }
      }

      // Normal Transaction
      const transactionData = {
        ...transaction,
        userId: user.id,
        allowedUsers: [user.id],
        date: transaction.date || getCurrentLocalDate(),
        createdAt: new Date().toISOString(),
        accountId: transaction.accountId || null,
      };

      if (transaction.isRecurring) {
        transactionData.nextDueDate = calculateNextDueDate(
          transactionData.date,
          transaction.frequency,
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
          allowedUsers: [user.id],
          date: t.date || getCurrentLocalDate(),
          createdAt: new Date().toISOString(),
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error adding transactions:", error);
    }
  };

  const updateTransaction = async (id, updatedData) => {
    if (!user?.id) return;
    try {
      const transactionRef = doc(db, "transactions", id);
      await updateDoc(transactionRef, updatedData);
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
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

  const [shadowTransactions, setShadowTransactions] = useState([]);
  const [isShadowMode, setIsShadowMode] = useState(false);

  const toggleShadowMode = () => setIsShadowMode(!isShadowMode);

  const addShadowTransaction = (transaction) => {
    const newShadow = {
      ...transaction,
      id: `shadow-${Date.now()}`,
      allowedUsers: [user?.id],
      isShadow: true,
      date: transaction.date || getCurrentLocalDate(),
      createdAt: new Date().toISOString(),
    };
    setShadowTransactions((prev) => [...prev, newShadow]);
  };

  const clearShadowTransactions = () => setShadowTransactions([]);

  const allTransactions = isShadowMode
    ? [...transactions, ...shadowTransactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      )
    : transactions;

  const stats = allTransactions.reduce(
    (acc, curr) => {
      const amount = parseFloat(curr.amount);
      const outputAmount = isNaN(amount) ? 0 : amount;

      if (curr.type === "income") {
        acc.income += outputAmount;
        acc.balance += outputAmount;
      } else if (curr.type === "expense") {
        acc.expense += outputAmount;
        acc.balance -= outputAmount;
      }
      return acc;
    },
    { income: 0, expense: 0, balance: 0 },
  );

  return {
    transactions: allTransactions, // Return merged transactions
    realTransactions: transactions, // Access to real only if needed
    addTransaction,
    addTransactions,
    updateTransaction,
    deleteTransaction,
    clearTransactions,
    stats,
    loading,
    isShadowMode,
    toggleShadowMode,
    addShadowTransaction,
    clearShadowTransactions,
    shadowTransactions,
  };
};

const calculateNextDueDate = (date, frequency) => {
  const d = new Date(date);
  switch (frequency) {
    case "daily":
      d.setUTCDate(d.getUTCDate() + 1);
      break;
    case "weekly":
      d.setUTCDate(d.getUTCDate() + 7);
      break;
    case "monthly":
      d.setUTCMonth(d.getUTCMonth() + 1);
      break;
    case "yearly":
      d.setUTCFullYear(d.getUTCFullYear() + 1);
      break;
    default:
      break;
  }
  return d.toISOString().split("T")[0];
};

const checkRecurringTransactions = async (
  currentTransactions,
  currentUserId,
) => {
  if (!currentUserId) return;
  const today = new Date().toISOString().split("T")[0];
  const batch = writeBatch(db);
  let hasUpdates = false;

  currentTransactions.forEach((t) => {
    // Only the owner should generate the next recurring transaction
    if (t.userId !== currentUserId) return;

    if (t.isRecurring && t.nextDueDate && t.nextDueDate <= today) {
      // Create new transaction
      const newTransactionRef = doc(collection(db, "transactions"));
      batch.set(newTransactionRef, {
        ...t,
        date: t.nextDueDate,
        isRecurring: false, // Generated transaction is not recurring itself
        createdAt: new Date().toISOString(),
        originalTransactionId: t.id,
        allowedUsers: t.allowedUsers || [currentUserId], // Ensure permissions
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
    } catch (error) {
      console.error("Error processing recurring transactions:", error);
    }
  }
};
