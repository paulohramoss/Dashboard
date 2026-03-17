import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { usePremium, FREE_LIMITS } from "@/hooks/usePremium";
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
  const { isPremium } = usePremium();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setTimeout(() => {
        setGoals([]);
        setLoading(false);
      }, 0);
      return;
    }

    const q1 = query(collection(db, "goals"), where("userId", "==", user.id));
    const q2 = query(
      collection(db, "goals"),
      where("allowedUsers", "array-contains", user.id),
    );

    let results1 = [];
    let results2 = [];

    const handleUpdate = () => {
      const allDocs = [...results1, ...results2];
      const uniqueDocs = Array.from(
        new Map(allDocs.map((item) => [item.id, item])).values(),
      );
      setGoals(uniqueDocs);
      setLoading(false);
    };

    const unsub1 = onSnapshot(
      q1,
      (snap) => {
        results1 = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        handleUpdate();
      },
      (err) => console.error("Error fetching owned goals:", err),
    );

    const unsub2 = onSnapshot(
      q2,
      (snap) => {
        results2 = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        handleUpdate();
      },
      (err) => {
        if (err.code !== "permission-denied") {
          console.error("Error fetching shared goals:", err);
        }
        setLoading(false);
      },
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [user?.id]);

  const addGoal = async (goal) => {
    if (!user?.id) return;
    try {
      if (!isPremium) {
        const ownedGoals = goals.filter((g) => g.userId === user.id);
        if (ownedGoals.length >= FREE_LIMITS.goals) {
          const err = new Error("LIMIT_REACHED");
          err.limitKey = "goals";
          err.limit = FREE_LIMITS.goals;
          throw err;
        }
      }

      await addDoc(collection(db, "goals"), {
        ...goal,
        userId: user.id,
        allowedUsers: [user.id],
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
    if (!user?.id) {
      console.error("User ID missing in allocateFunds");
      return;
    }

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
        allowedUsers: [user.id], // Required for Firestore security rules
        description: `Transfer to Goal: ${goalName}`,
        amount: parseFloat(amount),
        type: "expense",
        category: "Savings", // Or a specific category for goals
        accountId: accountId,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isSystem: true, // Flag to identify system generated transactions
      });

      // 3. Commit the batch
      await batch.commit();
    } catch (error) {
      console.error("Error allocation funds:", error);
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
