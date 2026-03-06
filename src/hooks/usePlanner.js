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
import { format } from "date-fns";

export const usePlanner = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user?.id) {
      setHabits([]);
      setCompletions([]);
      setBooks([]);
      setLoading(false);
      return;
    }

    let habitsDone = false;
    let completionsDone = false;
    let booksDone = false;

    const checkDone = () => {
      if (habitsDone && completionsDone && booksDone) setLoading(false);
    };

    const habitsQ = query(
      collection(db, "plannerHabits"),
      where("userId", "==", user.id)
    );
    const unsub1 = onSnapshot(
      habitsQ,
      (snap) => {
        setHabits(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        habitsDone = true;
        checkDone();
      },
      () => {
        habitsDone = true;
        checkDone();
      }
    );

    const completionsQ = query(
      collection(db, "plannerCompletions"),
      where("userId", "==", user.id),
      where("date", "==", today)
    );
    const unsub2 = onSnapshot(
      completionsQ,
      (snap) => {
        setCompletions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        completionsDone = true;
        checkDone();
      },
      () => {
        completionsDone = true;
        checkDone();
      }
    );

    const booksQ = query(
      collection(db, "plannerBooks"),
      where("userId", "==", user.id)
    );
    const unsub3 = onSnapshot(
      booksQ,
      (snap) => {
        setBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        booksDone = true;
        checkDone();
      },
      () => {
        booksDone = true;
        checkDone();
      }
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user?.id, today]);

  const addHabit = async (habit) => {
    if (!user?.id) return;
    await addDoc(collection(db, "plannerHabits"), {
      ...habit,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteHabit = async (id) => {
    if (!user?.id) return;
    await deleteDoc(doc(db, "plannerHabits", id));
  };

  const toggleCompletion = async (habitId) => {
    if (!user?.id) return;
    const existing = completions.find((c) => c.habitId === habitId);
    if (existing) {
      await deleteDoc(doc(db, "plannerCompletions", existing.id));
    } else {
      await addDoc(collection(db, "plannerCompletions"), {
        userId: user.id,
        habitId,
        date: today,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const addBook = async (book) => {
    if (!user?.id) return;
    await addDoc(collection(db, "plannerBooks"), {
      ...book,
      userId: user.id,
      currentPage: 0,
      status: "reading",
      createdAt: new Date().toISOString(),
    });
  };

  const updateBook = async (id, data) => {
    if (!user?.id) return;
    await updateDoc(doc(db, "plannerBooks", id), data);
  };

  const deleteBook = async (id) => {
    if (!user?.id) return;
    await deleteDoc(doc(db, "plannerBooks", id));
  };

  const isCompleted = (habitId) =>
    completions.some((c) => c.habitId === habitId);

  const getHabitsByCategory = (category) =>
    habits.filter((h) => h.category === category);

  const getTodayProgress = () => {
    const total = habits.length;
    const done = habits.filter((h) => isCompleted(h.id)).length;
    return {
      total,
      done,
      percentage: total ? Math.round((done / total) * 100) : 0,
    };
  };

  return {
    habits,
    completions,
    books,
    loading,
    addHabit,
    deleteHabit,
    toggleCompletion,
    addBook,
    updateBook,
    deleteBook,
    isCompleted,
    getHabitsByCategory,
    getTodayProgress,
    today,
  };
};
