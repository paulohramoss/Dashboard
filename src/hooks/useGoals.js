import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  increment,
} from "firebase/firestore";

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const q = query(collection(db, "goals"), where("userId", "==", user.id));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGoals(docs);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Avoid synchronous state updates to prevent cascading renders
      const timer = setTimeout(() => {
        setGoals([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  const addGoal = async (goal) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "goals"), {
        ...goal,
        userId: user.id,
        currentAmount: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      throw error;
    }
  };

  const updateGoal = async (id, data) => {
    if (!user?.id) return;
    try {
      await updateDoc(doc(db, "goals", id), data);
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  };

  const deleteGoal = async (id) => {
    if (!user?.id) return;
    try {
      await deleteDoc(doc(db, "goals", id));
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    }
  };

  const allocateFunds = async (goalId, amount, accountId, goalName) => {
    if (!user?.id) return;
    try {
      const batch = writeBatch(db);

      // 1. Update Goal Amount
      const goalRef = doc(db, "goals", goalId);
      batch.update(goalRef, {
        currentAmount: increment(amount),
      });

      // 2. Create Expense Transaction
      const transactionRef = doc(collection(db, "transactions"));
      batch.set(transactionRef, {
        userId: user.id,
        description: `Transfer to Goal: ${goalName}`,
        amount: parseFloat(amount),
        type: "expense",
        category: "Savings", // Or a specific category for goals
        accountId: accountId,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isSystem: true, // Flag to identify system generated transactions
      });

      await batch.commit();
    } catch (error) {
      console.error("Error allocating funds:", error);
      throw error;
    }
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    allocateFunds,
  };
};
