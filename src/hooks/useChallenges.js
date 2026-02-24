import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setTimeout(() => {
        setChallenges([]);
        setLoading(false);
      }, 0);
      return;
    }

    let isMounted = true;
    const resultsRef = { r1: [], r2: [], loaded: { q1: false, q2: false } };

    const handleUpdate = () => {
      if (!isMounted) return;
      if (resultsRef.loaded.q1 && resultsRef.loaded.q2) {
        const seen = new Set();
        const merged = [...resultsRef.r1, ...resultsRef.r2].filter((d) => {
          if (seen.has(d.id)) return false;
          seen.add(d.id);
          return true;
        });
        setChallenges(merged);
        setLoading(false);
      }
    };

    const q1 = query(
      collection(db, "challenges"),
      where("userId", "==", user.id)
    );

    const q2 = query(
      collection(db, "challenges"),
      where("allowedUsers", "array-contains", user.id)
    );

    const unsub1 = onSnapshot(
      q1,
      (snap) => {
        if (!isMounted) return;
        resultsRef.r1 = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        resultsRef.loaded.q1 = true;
        handleUpdate();
      },
      (err) => {
        console.error("Error fetching challenges:", err);
        resultsRef.loaded.q1 = true;
        if (isMounted) handleUpdate();
      }
    );

    const unsub2 = onSnapshot(
      q2,
      (snap) => {
        if (!isMounted) return;
        resultsRef.r2 = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        resultsRef.loaded.q2 = true;
        handleUpdate();
      },
      (err) => {
        console.error("Error fetching shared challenges:", err);
        resultsRef.loaded.q2 = true;
        if (isMounted) handleUpdate();
      }
    );

    return () => {
      isMounted = false;
      unsub1();
      unsub2();
    };
  }, [user?.id]);

  const addChallenge = async (challenge) => {
    if (!user?.id) return;
    await addDoc(collection(db, "challenges"), {
      ...challenge,
      userId: user.id,
      allowedUsers: [user.id],
      status: "active",
      createdAt: new Date().toISOString(),
    });
  };

  const updateChallenge = async (id, data) => {
    if (!user?.id) return;
    await updateDoc(doc(db, "challenges", id), data);
  };

  const deleteChallenge = async (id) => {
    if (!user?.id) return;
    await deleteDoc(doc(db, "challenges", id));
  };

  return { challenges, loading, addChallenge, updateChallenge, deleteChallenge };
};
