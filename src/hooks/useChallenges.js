import { useState, useEffect } from "react";
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

    const q = query(
      collection(db, "challenges"),
      where("userId", "==", user.id)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setChallenges(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching challenges:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.id]);

  const addChallenge = async (challenge) => {
    if (!user?.id) return;
    await addDoc(collection(db, "challenges"), {
      ...challenge,
      userId: user.id,
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
