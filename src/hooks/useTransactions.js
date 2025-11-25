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
  orderBy,
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
      where("userId", "==", user.id),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const addTransaction = async (transaction) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "transactions"), {
        ...transaction,
        userId: user.id,
        date: transaction.date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
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
    loading,
  };
};
