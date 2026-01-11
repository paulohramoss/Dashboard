import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

const DEFAULT_CATEGORIES = [
  { name: "General", type: "expense", color: "#94a3b8", isDefault: true },
  { name: "Food", type: "expense", color: "#ef4444", isDefault: true },
  { name: "Transport", type: "expense", color: "#f97316", isDefault: true },
  { name: "Utilities", type: "expense", color: "#eab308", isDefault: true },
  { name: "Entertainment", type: "expense", color: "#8b5cf6", isDefault: true },
  { name: "Salary", type: "income", color: "#22c55e", isDefault: true },
  { name: "Freelance", type: "income", color: "#10b981", isDefault: true },
  { name: "Other", type: "expense", color: "#64748b", isDefault: true },
];

export const useCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const initAttempted = useRef(false);

  const initializeDefaultCategories = async (userId) => {
    try {
      const batch = writeBatch(db);
      DEFAULT_CATEGORIES.forEach((cat) => {
        const docRef = doc(collection(db, "categories"));
        batch.set(docRef, {
          ...cat,
          userId,
          allowedUsers: [userId],
          createdAt: new Date().toISOString(),
          budget: 0, // Default budget
        });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error initializing categories:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      // Avoid synchronous state updates in effect
      const timer = setTimeout(() => {
        setCategories([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const q1 = query(
      collection(db, "categories"),
      where("userId", "==", user.id)
    );

    const q2 = query(
      collection(db, "categories"),
      where("allowedUsers", "array-contains", user.id)
    );

    let results1 = [];
    let results2 = [];

    const handleUpdate = async () => {
      const allDocs = [...results1, ...results2];
      const uniqueDocs = Array.from(
        new Map(allDocs.map((item) => [item.id, item])).values()
      );

      // Only init defaults if we have loaded both and list is empty,
      // AND specifically if we found no owned categories (to avoid loop).
      // For simplicity/safety in this refactor, we check if distinct results1 is empty after load.
      if (
        results1.length === 0 &&
        results2.length === 0 &&
        uniqueDocs.length === 0
      ) {
        // It's hard to know perfectly when "both" have finished first load without complex state.
        // But usually if uniqueDocs is empty, we might need defaults.
        // Let's rely on a simpler check: if q1 returns empty, we might need defaults.
      }

      // Better approach for dual subs init:
      // We'll leave the init check for a separate effect or just check if results1 (owned) is empty.

      setCategories(uniqueDocs);
      setLoading(false);
    };

    // We need to track if we've attempted init to avoid spam

    const unsub1 = onSnapshot(
      q1,
      async (snapshot) => {
        results1 = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Only initialize if:
        // 1. We have 0 owned categories
        // 2. We haven't tried yet in this session
        // 3. The snapshot is NOT from cache (meaning we have confirmed with server that it is empty)
        if (
          results1.length === 0 &&
          !initAttempted.current &&
          !snapshot.metadata.fromCache
        ) {
          initAttempted.current = true;
          // Double check with a one-time fetch to be absolutely sure before writing?
          // For now, the snapshot check + ref should be enough to stop the "strict mode" double-tap.
          await initializeDefaultCategories(user.id);
        }

        handleUpdate();
      },
      (error) => console.error("Error fetching owned categories:", error)
    );

    const unsub2 = onSnapshot(
      q2,
      (snapshot) => {
        results2 = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        handleUpdate();
      },
      (error) => console.error("Error fetching shared categories:", error)
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [user?.id]);

  const addCategory = async (category) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "categories"), {
        ...category,
        userId: user.id,
        allowedUsers: [user.id],
        createdAt: new Date().toISOString(),
        budget: parseFloat(category.budget) || 0,
      });
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const updateCategory = async (id, updates) => {
    if (!user?.id) return;
    try {
      const docRef = doc(db, "categories", id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const deleteCategory = async (id) => {
    if (!user?.id) return;
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    loading,
  };
};
