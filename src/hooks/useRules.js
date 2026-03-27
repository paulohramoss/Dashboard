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

    const q1 = query(
      collection(db, "userRules"),
      where("userId", "==", user.id),
    );

    const q2 = query(
      collection(db, "userRules"),
      where("allowedUsers", "array-contains", user.id),
    );

    let results1 = [];
    let results2 = [];

    const handleUpdate = () => {
      const allDocs = [...results1, ...results2];
      const uniqueDocs = Array.from(
        new Map(allDocs.map((item) => [item.id, item])).values(),
      );
      uniqueDocs.sort((a, b) => a.keyword.localeCompare(b.keyword));
      setRules(uniqueDocs);
      setLoading(false);
    };

    const unsub1 = onSnapshot(
      q1,
      (snapshot) => {
        results1 = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        handleUpdate();
      },
      (err) => console.error("Error fetching owned rules:", err),
    );

    const unsub2 = onSnapshot(
      q2,
      (snapshot) => {
        results2 = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        handleUpdate();
      },
      (err) => {
        if (err.code !== "permission-denied") {
          console.error("Error fetching shared rules:", err);
        }
        setLoading(false);
      },
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [user?.id]);

  const addRule = async (rule) => {
    if (!user?.id) return;

    const exists = rules.some(
      (r) => r.keyword.toLowerCase() === rule.keyword.toLowerCase(),
    );
    if (exists) {
      toast.error(t("rules.exists"));
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newRule = {
      id: tempId,
      userId: user.id,
      allowedUsers: [user.id],
      keyword: rule.keyword.toLowerCase().trim(),
      category: rule.category,
      type: rule.type,
      createdAt: new Date().toISOString(),
    };
    setRules((prev) => [...prev, newRule]);
    try {
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
      setRules((prev) => prev.filter((r) => r.id !== tempId));
      toast.error(t("rules.error"));
    }
  };

  const deleteRule = async (ruleId) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
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
