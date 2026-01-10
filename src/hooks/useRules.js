import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useRules = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      // Avoid synchronous state updates in effect
      const timer = setTimeout(() => {
        setRules([]);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const q = query(
      collection(db, "userRules"),
      where("allowedUsers", "array-contains", user.id)
      // orderBy("keyword") // Requires index, let's sort in client for now to avoid blocking
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rulesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort alphabetically by keyword
        rulesData.sort((a, b) => a.keyword.localeCompare(b.keyword));
        setRules(rulesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching rules:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const addRule = async (rule) => {
    try {
      if (!user?.id) return;

      // Check for duplicates
      const exists = rules.some(
        (r) => r.keyword.toLowerCase() === rule.keyword.toLowerCase()
      );
      if (exists) {
        toast.error(t("rules.exists"));
        return;
      }

      await addDoc(collection(db, "userRules"), {
        userId: user.id,
        allowedUsers: [user.id],
        keyword: rule.keyword.toLowerCase().trim(),
        category: rule.category,
        type: rule.type,
        createdAt: new Date().toISOString(),
      });
      toast.success(t("rules.success"));
    } catch (error) {
      console.error("Error adding rule:", error);
      toast.error(t("rules.error"));
    }
  };

  const deleteRule = async (ruleId) => {
    try {
      await deleteDoc(doc(db, "userRules", ruleId));

      toast.success(t("rules.deleteSuccess"));
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast.error(t("rules.deleteError"));
    }
  };

  return {
    rules,
    loading,
    addRule,
    deleteRule,
  };
};
