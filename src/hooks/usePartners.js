import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

/**
 * Hook to manage partner relationships for shared finances.
 * Returns the list of partner UIDs for the current user.
 */
export const usePartners = () => {
  const { user } = useAuth();
  const [partners, setPartners] = useState([]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "partnerships", user.id),
      (snap) => {
        if (snap.exists()) {
          setPartners(snap.data()?.partners || []);
        } else {
          setPartners([]);
        }
      },
      (error) => {
        if (error.code !== "permission-denied") {
          console.error("Error fetching partnerships:", error);
        }
        setPartners([]);
      },
    );

    return () => unsubscribe();
  }, [user?.id]);

  return user?.id ? partners : [];
};
