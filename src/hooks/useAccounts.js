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
} from "firebase/firestore";

export const useAccounts = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      // eslint-disable-next-line
      setAccounts([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, "accounts"), where("userId", "==", user.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by order field, ascending
        docs.sort((a, b) => (a.order || 0) - (b.order || 0));
        setAccounts(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching accounts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const addAccount = async (account) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "accounts"), {
        ...account,
        userId: user.id,
        order: accounts.length, // Add at the end
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  const updateAccount = async (id, updates) => {
    if (!user?.id) return;
    try {
      const docRef = doc(db, "accounts", id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  const reorderAccounts = async (newOrderAccounts) => {
    if (!user?.id) return;
    try {
      // Create a batch update or individual updates
      // Since Firestore doesn't support batch update for different docs easily without writeBatch
      // We will loop and update. For a small number of accounts, this is fine.
      const updatePromises = newOrderAccounts.map((account, index) => {
        const docRef = doc(db, "accounts", account.id);
        return updateDoc(docRef, { order: index });
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error reordering accounts:", error);
    }
  };

  const deleteAccount = async (id) => {
    if (!user?.id) return;
    try {
      await deleteDoc(doc(db, "accounts", id));
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    reorderAccounts,
    loading,
  };
};
