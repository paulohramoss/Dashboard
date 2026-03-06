import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export const FREE_LIMITS = {
  transactionsPerMonth: 50,
  goals: 5,
  customCategories: 5,
  recurring: 2,
  budgets: 5,
  accounts: 3,
};

export const usePremium = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [prevUserId, setPrevUserId] = useState(user?.id);

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setIsPremium(false);
    setLoading(true);
  }

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const userRef = doc(db, "users", user.id);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setIsPremium(snapshot.data().isPremium === true);
        } else {
          setIsPremium(false);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching premium status:", error);
        setIsPremium(false);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.id]);

  if (!user?.id) {
    return { isPremium: false, loading: false };
  }

  return { isPremium, loading };
};
