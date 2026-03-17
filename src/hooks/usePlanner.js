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
  writeBatch,
} from "firebase/firestore";
import { format } from "date-fns";

const DEFAULT_SECTIONS = [
  { id: "routine",    name: "Rotina",     icon: "ListChecks",    color: "#0F4D3F", order: 0 },
  { id: "devotional", name: "Devocional", icon: "Sunrise",       color: "#eab308", order: 1 },
  { id: "study",      name: "Estudos",    icon: "GraduationCap", color: "#a855f7", order: 2 },
  { id: "workout",    name: "Treinos",    icon: "Dumbbell",      color: "#22c55e", order: 3 },
  { id: "reading",    name: "Leitura",    icon: "BookOpen",      color: "#f97316", order: 4, type: "books" },
];

export const usePlanner = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [books, setBooks] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user?.id) return;

    let habitsDone = false;
    let completionsDone = false;
    let booksDone = false;
    let sectionsDone = false;
    let isMounted = true;

    const checkDone = () => {
      if (habitsDone && completionsDone && booksDone && sectionsDone) {
        if (isMounted) setLoading(false);
      }
    };

    const habitsQ = query(
      collection(db, "plannerHabits"),
      where("userId", "==", user.id)
    );
    const unsub1 = onSnapshot(
      habitsQ,
      (snap) => {
        if (!isMounted) return;
        setHabits(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        habitsDone = true;
        checkDone();
      },
      () => { habitsDone = true; checkDone(); }
    );

    const completionsQ = query(
      collection(db, "plannerCompletions"),
      where("userId", "==", user.id),
      where("date", "==", today)
    );
    const unsub2 = onSnapshot(
      completionsQ,
      (snap) => {
        if (!isMounted) return;
        setCompletions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        completionsDone = true;
        checkDone();
      },
      () => { completionsDone = true; checkDone(); }
    );

    const booksQ = query(
      collection(db, "plannerBooks"),
      where("userId", "==", user.id)
    );
    const unsub3 = onSnapshot(
      booksQ,
      (snap) => {
        if (!isMounted) return;
        setBooks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        booksDone = true;
        checkDone();
      },
      () => { booksDone = true; checkDone(); }
    );

    const sectionsQ = query(
      collection(db, "plannerSections"),
      where("userId", "==", user.id)
    );
    const unsub4 = onSnapshot(
      sectionsQ,
      async (snap) => {
        if (!isMounted) return;
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSections([...docs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        sectionsDone = true;
        checkDone();
      },
      () => { sectionsDone = true; checkDone(); }
    );

    return () => {
      isMounted = false;
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [user?.id, today]);

  const addHabit = async (habit) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "plannerHabits"), {
        ...habit,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding habit:", error);
      throw error;
    }
  };

  const deleteHabit = async (id) => {
    if (!user?.id) return;
    try {
      await deleteDoc(doc(db, "plannerHabits", id));
    } catch (error) {
      console.error("Error deleting habit:", error);
      throw error;
    }
  };

  const updateHabit = async (id, data) => {
    if (!user?.id) return;
    try {
      await updateDoc(doc(db, "plannerHabits", id), data);
    } catch (error) {
      console.error("Error updating habit:", error);
      throw error;
    }
  };

  const toggleCompletion = async (habitId) => {
    if (!user?.id) return;
    try {
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
    } catch (error) {
      console.error("Error toggling completion:", error);
      throw error;
    }
  };

  const addBook = async (book) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "plannerBooks"), {
        ...book,
        userId: user.id,
        currentPage: 0,
        status: "reading",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding book:", error);
      throw error;
    }
  };

  const updateBook = async (id, data) => {
    if (!user?.id) return;
    try {
      await updateDoc(doc(db, "plannerBooks", id), data);
    } catch (error) {
      console.error("Error updating book:", error);
      throw error;
    }
  };

  const deleteBook = async (id) => {
    if (!user?.id) return;
    try {
      await deleteDoc(doc(db, "plannerBooks", id));
    } catch (error) {
      console.error("Error deleting book:", error);
      throw error;
    }
  };

  const addSection = async (section) => {
    if (!user?.id) return;
    try {
      await addDoc(collection(db, "plannerSections"), {
        ...section,
        userId: user.id,
        order: sections.length,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding section:", error);
      throw error;
    }
  };

  const updateSection = async (id, data) => {
    if (!user?.id) return;
    try {
      await updateDoc(doc(db, "plannerSections", id), data);
    } catch (error) {
      console.error("Error updating section:", error);
      throw error;
    }
  };

  const deleteSection = async (id) => {
    if (!user?.id) return;
    try {
      const habitsToDelete = habits.filter((h) => h.category === id);
      const batch = writeBatch(db);
      habitsToDelete.forEach((h) => batch.delete(doc(db, "plannerHabits", h.id)));
      batch.delete(doc(db, "plannerSections", id));
      await batch.commit();
    } catch (error) {
      console.error("Error deleting section:", error);
      throw error;
    }
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
    sections,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    addBook,
    updateBook,
    deleteBook,
    addSection,
    updateSection,
    deleteSection,
    isCompleted,
    getHabitsByCategory,
    getTodayProgress,
    today,
  };
};
