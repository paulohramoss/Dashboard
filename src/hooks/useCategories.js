import { useState, useEffect } from "react";
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

  const initializeDefaultCategories = async (userId) => {
    try {
      const batch = writeBatch(db);
      DEFAULT_CATEGORIES.forEach((cat) => {
        const docRef = doc(collection(db, "categories"));
        batch.set(docRef, {
          ...cat,
          userId,
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
      setCategories([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "categories"),
      where("userId", "==", user.id)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (docs.length === 0 && !snapshot.metadata.fromCache) {
        // Initialize default categories if none exist
        await initializeDefaultCategories(user.id);
      } else {
        setCategories(docs);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  const addCategory = async (category) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "categories"), {
        ...category,
        userId: user.id,
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
