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
      // Defer state updates to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setCategories([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const loadingTimer = setTimeout(() => setLoading(true), 0);

    // Track if component is still mounted to prevent state updates after unmount
    let isMounted = true;

    // Use object refs to store results to avoid stale closures
    const resultsRef = {
      results1: [],
      results2: [],
      bothLoaded: { q1: false, q2: false },
    };

    const handleUpdate = async () => {
      // Prevent state updates if component unmounted
      if (!isMounted) return;

      const allDocs = [...resultsRef.results1, ...resultsRef.results2];
      const uniqueDocs = Array.from(
        new Map(allDocs.map((item) => [item.id, item])).values(),
      );

      setCategories(uniqueDocs);

      // Only set loading to false when both queries have loaded at least once
      if (resultsRef.bothLoaded.q1 && resultsRef.bothLoaded.q2) {
        setLoading(false);
      }
    };

    const q1 = query(
      collection(db, "categories"),
      where("userId", "==", user.id),
    );

    const q2 = query(
      collection(db, "categories"),
      where("allowedUsers", "array-contains", user.id),
    );

    const unsub1 = onSnapshot(
      q1,
      async (snapshot) => {
        if (!isMounted) return;
        resultsRef.results1 = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        // Only initialize if:
        // 1. We have 0 owned categories
        // 2. We haven't tried yet in this session
        // 3. The snapshot is NOT from cache (meaning we have confirmed with server that it is empty)
        if (
          resultsRef.results1.length === 0 &&
          !initAttempted.current &&
          !snapshot.metadata.fromCache
        ) {
          initAttempted.current = true;
          await initializeDefaultCategories(user.id);
        }

        resultsRef.bothLoaded.q1 = true;
        handleUpdate();
      },
      (error) => {
        console.error("Error fetching owned categories:", error);
        if (isMounted) {
          setLoading(false);
        }
      },
    );

    const unsub2 = onSnapshot(
      q2,
      (snapshot) => {
        if (!isMounted) return;
        resultsRef.results2 = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        resultsRef.bothLoaded.q2 = true;
        handleUpdate();
      },
      (error) => {
        // Silently ignore: new users without a partner always get permission denied here
        if (error.code !== "permission-denied") {
          console.error("Error fetching shared categories:", error);
        }
        if (isMounted) {
          resultsRef.bothLoaded.q2 = true;
          handleUpdate();
        }
      },
    );

    return () => {
      // Mark component as unmounted FIRST
      isMounted = false;
      clearTimeout(loadingTimer);
      // Then unsubscribe to prevent any new callbacks
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
      // Optimistically update local state so the UI reflects changes immediately
      // without waiting for the Firestore snapshot listener to fire
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)),
      );
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
