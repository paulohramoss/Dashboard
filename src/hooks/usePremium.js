import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

export const FREE_LIMITS = {
  transactionsPerMonth: 50,
  accounts: 2,
  goals: 2,
  customCategories: 5,
  recurringTransactions: 2,
};

export const usePremium = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      const timer = setTimeout(() => {
        setIsPremium(false);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const userRef = doc(db, "users", user.id);

    const unsub = onSnapshot(
      userRef,
      async (snap) => {
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: user.id,
            email: user.email,
            isPremium: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          setIsPremium(false);
        } else {
          setIsPremium(snap.data().isPremium === true);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching premium status:", error);
        setLoading(false);
      },
    );

    return () => unsub();
  }, [user?.id, user?.email]);

  return { isPremium, loading };
};
