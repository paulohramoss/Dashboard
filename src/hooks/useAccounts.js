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
      // Defer state updates to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setAccounts([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    setLoading(true); // eslint-disable-line

    // Track if component is still mounted to prevent state updates after unmount
    let isMounted = true;

    // Use object refs to store results to avoid stale closures
    const resultsRef = {
      results1: [],
      results2: [],
      bothLoaded: { q1: false, q2: false },
    };

    const handleUpdate = () => {
      // Prevent state updates if component unmounted
      if (!isMounted) return;

      const allDocs = [...resultsRef.results1, ...resultsRef.results2];
      const uniqueDocs = Array.from(
        new Map(allDocs.map((item) => [item.id, item])).values(),
      );
      uniqueDocs.sort((a, b) => (a.order || 0) - (b.order || 0));
      setAccounts(uniqueDocs);

      // Only set loading to false when both queries have loaded at least once
      if (resultsRef.bothLoaded.q1 && resultsRef.bothLoaded.q2) {
        setLoading(false);
      }
    };

    const q1 = query(
      collection(db, "accounts"),
      where("userId", "==", user.id),
    );
    const q2 = query(
      collection(db, "accounts"),
      where("allowedUsers", "array-contains", user.id),
    );

    const unsub1 = onSnapshot(
      q1,
      (snap) => {
        if (!isMounted) return;
        resultsRef.results1 = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        resultsRef.bothLoaded.q1 = true;
        handleUpdate();
      },
      (err) => {
        console.error("Error fetching owned accounts:", err);
        if (isMounted) {
          setLoading(false);
        }
      },
    );

    const unsub2 = onSnapshot(
      q2,
      (snap) => {
        if (!isMounted) return;
        resultsRef.results2 = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        resultsRef.bothLoaded.q2 = true;
        handleUpdate();
      },
      (err) => {
        // Silently ignore: new users without a partner always get permission denied here
        if (err.code !== "permission-denied") {
          console.error("Error fetching shared accounts:", err);
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
      // Then unsubscribe to prevent any new callbacks
      unsub1();
      unsub2();
    };
  }, [user?.id]);

  const addAccount = async (account) => {
    if (!user?.id) return;
    const tempId = `temp-${Date.now()}`;
    const newAccount = {
      ...account,
      id: tempId,
      userId: user.id,
      allowedUsers: [user.id],
      order: accounts.length,
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) =>
      [...prev, newAccount].sort((a, b) => (a.order || 0) - (b.order || 0)),
    );
    try {
      await addDoc(collection(db, "accounts"), {
        ...account,
        userId: user.id,
        allowedUsers: [user.id],
        order: accounts.length,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding account:", error);
      setAccounts((prev) => prev.filter((a) => a.id !== tempId));
    }
  };

  const updateAccount = async (id, updates) => {
    if (!user?.id) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    );
    try {
      await updateDoc(doc(db, "accounts", id), updates);
    } catch (error) {
      console.error("Error updating account:", error);
    }
  };

  const reorderAccounts = async (newOrderAccounts) => {
    if (!user?.id) return;
    setAccounts(newOrderAccounts.map((a, i) => ({ ...a, order: i })));
    try {
      const updatePromises = newOrderAccounts.map((account, index) =>
        updateDoc(doc(db, "accounts", account.id), { order: index }),
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error reordering accounts:", error);
    }
  };

  const deleteAccount = async (id) => {
    if (!user?.id) return;
    setAccounts((prev) => prev.filter((a) => a.id !== id));
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
