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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const addAccount = async (account) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "accounts"), {
        ...account,
        userId: user.id,
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
    loading,
  };
};
