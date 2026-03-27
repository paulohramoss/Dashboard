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
    const tempId = `temp-${Date.now()}`;
    const newGoal = {
      ...goal,
      id: tempId,
      userId: user.id,
      allowedUsers: [user.id],
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    try {
      await addDoc(collection(db, "goals"), {
        ...goal,
        userId: user.id,
        allowedUsers: [user.id],
        currentAmount: 0,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding goal:", error);
      setGoals((prev) => prev.filter((g) => g.id !== tempId));
      throw error;
    }
  };

  const updateGoal = async (id, data) => {
    if (!user?.id) return;
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...data } : g)),
    );
    try {
      await updateDoc(doc(db, "goals", id), data);
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  };

  const deleteGoal = async (id) => {
    if (!user?.id) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
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
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, currentAmount: (g.currentAmount || 0) + parseFloat(amount) }
          : g,
      ),
    );
    try {
      const batch = writeBatch(db);

      const goalRef = doc(db, "goals", goalId);
      batch.update(goalRef, { currentAmount: increment(amount) });

      const transactionRef = doc(collection(db, "transactions"));
      batch.set(transactionRef, {
        userId: user.id,
        allowedUsers: [user.id],
        description: `Transfer to Goal: ${goalName}`,
        amount: parseFloat(amount),
        type: "expense",
        category: "Savings",
        accountId: accountId,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isSystem: true,
      });

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
