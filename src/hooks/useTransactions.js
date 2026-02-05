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
  updateDoc,
} from "firebase/firestore";
import { getCurrentLocalDate } from "@/lib/utils";

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 [useTransactions] User ID:", user?.id);

    if (!user?.id) {
      // eslint-disable-next-line
      console.log("⚠️ [useTransactions] No user authenticated");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTransactions([]);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const q1 = query(
      collection(db, "transactions"),
      where("userId", "==", user.id),
    );

    const q2 = query(
      collection(db, "transactions"),
      where("allowedUsers", "array-contains", user.id),
    );

    let results1 = [];
    let results2 = [];

    const handleUpdate = () => {
      const allDocs = [...results1, ...results2];
      const uniqueDocs = Array.from(
        new Map(allDocs.map((item) => [item.id, item])).values(),
      );

      uniqueDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log("✅ [useTransactions] Loaded transactions:", uniqueDocs.length);
      console.log("📊 [useTransactions] Owned:", results1.length, "| Shared:", results2.length);

      setTransactions(uniqueDocs);
      setLoading(false);
      setLoading(false);
      checkRecurringTransactions(uniqueDocs, user.id);
    };

    const unsub1 = onSnapshot(
      q1,
      (snapshot) => {
        results1 = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        handleUpdate();
      },
      (error) => {
        console.error("❌ [useTransactions] Error fetching owned transactions:", error);
      },
    );

    const unsub2 = onSnapshot(
      q2,
      (snapshot) => {
        results2 = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        handleUpdate();
      },
      (error) => {
        console.error("❌ [useTransactions] Error fetching shared transactions:", error);
      },
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [user?.id]);

  const addTransaction = async (transaction) => {
    if (!user?.id) return;
    try {
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
            description: `${transaction.description} (${i + 1
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

  console.log("🎭 [useTransactions] Shadow mode:", isShadowMode);
  console.log("👻 [useTransactions] Shadow transactions:", shadowTransactions.length);
  console.log("📦 [useTransactions] All transactions (returned):", allTransactions.length);

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
