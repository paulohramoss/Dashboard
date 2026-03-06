import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { usePlanner } from "@/hooks/usePlanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { motion as Motion } from "framer-motion";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ListChecks,
  BookOpen,
  GraduationCap,
  Dumbbell,
  Sunrise,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Pencil,
  Heart,
  Star,
  Music,
  Coffee,
  Code,
  Briefcase,
  Home,
  Target,
  Zap,
  Trophy,
  Flame,
  Clock,
  Leaf,
  Globe,
  Palette,
  ShoppingCart,
  Plane,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const ICON_MAP = {
  ListChecks,
  Sunrise,
  GraduationCap,
  Dumbbell,
  BookOpen,
  Heart,
  Star,
  Music,
  Coffee,
  Code,
  Briefcase,
  Home,
  Target,
  Zap,
  Trophy,
  Flame,
  Clock,
  Leaf,
  Globe,
  Palette,
  ShoppingCart,
  Plane,
  Brain,
};

// Legacy string-name → hex (backward compat for users with older Firestore data)
const LEGACY_COLOR_MAP = {
  blue: "#3b82f6", yellow: "#eab308", purple: "#a855f7", green: "#22c55e",
  orange: "#f97316", red: "#ef4444", pink: "#ec4899", teal: "#14b2a6",
  indigo: "#6366f1", cyan: "#06b6d4",
};

const resolveColor = (color) => {
  if (!color) return "#3b82f6";
  if (color.startsWith("#")) return color;
  return LEGACY_COLOR_MAP[color] || "#3b82f6";
};

const getSectionStyles = (color) => {
  const hex = resolveColor(color);
  return {
    card:   { borderColor: `${hex}33` },
    iconBg: { backgroundColor: `${hex}1a` },
    icon:   { color: hex },
  };
};

const HabitItem = ({ habit, isCompleted, onToggle, onDelete, onEdit }) => {
  return (
    <div className="flex items-center gap-3 py-2 group">
      <button
        onClick={() => onToggle(habit.id)}
        className={cn(
          "flex-shrink-0 transition-colors",
          isCompleted ? "text-primary" : "text-muted-foreground hover:text-primary"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      <span
        className={cn(
          "flex-1 text-sm",
          isCompleted && "line-through text-muted-foreground"
        )}
      >
        {habit.name}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(habit)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const CategoryCard = ({
  section,
  habits,
  isCompleted,
  onToggle,
  onDeleteHabit,
  onEditHabit,
  onAdd,
  onEditCard,
  onDeleteCard,
  t,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const styles = getSectionStyles(section.color);
  const Icon = ICON_MAP[section.icon] || ListChecks;
  const completed = habits.filter((h) => isCompleted(h.id)).length;

  return (
    <Card className="border" style={styles.card}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={styles.iconBg}>
              <Icon className="h-4 w-4" style={styles.icon} />
            </div>
            <CardTitle className="text-base">{section.name}</CardTitle>
            {habits.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {completed}/{habits.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onAdd(section.id)}
              title={t("planner.addHabit")}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEditCard(section)}
              title={t("planner.editSection")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-destructive"
              onClick={() => onDeleteCard(section.id)}
              title={t("planner.deleteSection")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {habits.length > 0 && (
          <Progress
            value={habits.length ? (completed / habits.length) * 100 : 0}
            className="h-1 mt-1"
          />
        )}
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-0">
          {habits.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              {t("planner.noItems")}
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {habits.map((habit) => (
                <HabitItem
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompleted(habit.id)}
                  onToggle={onToggle}
                  onDelete={onDeleteHabit}
                  onEdit={onEditHabit}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

const BookCard = ({ book, onUpdate, onDelete, t }) => {
  const [editingPages, setEditingPages] = useState(false);
  const [pageInput, setPageInput] = useState(String(book.currentPage));
  const progress = book.totalPages
    ? Math.round((book.currentPage / book.totalPages) * 100)
    : 0;

  const handleSavePages = async () => {
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 0) {
      const newPage = Math.min(val, book.totalPages || val);
      await onUpdate(book.id, {
        currentPage: newPage,
        status: newPage >= (book.totalPages || 0) ? "completed" : "reading",
      });
      if (newPage >= book.totalPages && book.totalPages > 0) {
        toast.success(t("planner.bookCompleted", { title: book.title }));
      }
    }
    setEditingPages(false);
  };

  return (
    <div className="flex items-start gap-3 py-3 group border-b border-border/50 last:border-0">
      <div className="flex-shrink-0 mt-0.5">
        <BookMarked
          className={cn(
            "h-5 w-5",
            book.status === "completed"
              ? "text-green-500"
              : "text-orange-500"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            book.status === "completed" && "text-muted-foreground line-through"
          )}
        >
          {book.title}
        </p>
        {book.author && (
          <p className="text-xs text-muted-foreground">{book.author}</p>
        )}
        {book.totalPages > 0 && (
          <div className="mt-1.5 space-y-1">
            <Progress value={progress} className="h-1.5" />
            <div className="flex items-center justify-between">
              {editingPages ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    className="h-6 w-20 text-xs px-1"
                    min={0}
                    max={book.totalPages}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePages();
                      if (e.key === "Escape") setEditingPages(false);
                    }}
                    autoFocus
                  />
                  <span className="text-xs text-muted-foreground">
                    / {book.totalPages}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={handleSavePages}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setPageInput(String(book.currentPage));
                    setEditingPages(true);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("planner.page")} {book.currentPage}/{book.totalPages}{" "}
                  ({progress}%)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(book.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0 mt-0.5"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

const ReadingCard = ({ section, books, onAddBook, onUpdateBook, onDeleteBook, onEditCard, onDeleteCard, t }) => {
  const [collapsed, setCollapsed] = useState(false);
  const styles = getSectionStyles(section.color);
  const Icon = ICON_MAP[section.icon] || BookOpen;

  return (
    <Card className="border" style={styles.card}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={styles.iconBg}>
              <Icon className="h-4 w-4" style={styles.icon} />
            </div>
            <CardTitle className="text-base">{section.name}</CardTitle>
            <span className="text-xs text-muted-foreground">
              {books.length} {t("planner.books")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onAddBook}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEditCard(section)}
              title={t("planner.editSection")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-destructive"
              onClick={() => onDeleteCard(section.id)}
              title={t("planner.deleteSection")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="pt-0">
          {books.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              {t("planner.noBooks")}
            </p>
          ) : (
            <div>
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onUpdate={onUpdateBook}
                  onDelete={onDeleteBook}
                  t={t}
                />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

const EMPTY_SECTION_FORM = { name: "", icon: "ListChecks", color: "#3b82f6" };

const PlannerPage = () => {
  const { t, i18n } = useTranslation();
  const {
    habits,
    books,
    sections,
    loading,
    addHabit,
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
  } = usePlanner();

  const [addHabitOpen, setAddHabitOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newHabitName, setNewHabitName] = useState("");
  const [newBook, setNewBook] = useState({ title: "", author: "", totalPages: "" });

  const [deleteHabitDialog, setDeleteHabitDialog] = useState({ open: false, id: null });
  const [deleteBookDialog, setDeleteBookDialog] = useState({ open: false, id: null });
  const [deleteSectionDialog, setDeleteSectionDialog] = useState({ open: false, id: null });

  const [sectionDialog, setSectionDialog] = useState({ open: false, mode: "add", data: null });
  const [sectionForm, setSectionForm] = useState(EMPTY_SECTION_FORM);

  const [editHabitDialog, setEditHabitDialog] = useState({ open: false, habit: null });
  const [editHabitName, setEditHabitName] = useState("");

  const progress = getTodayProgress();

  const todayFormatted = format(parseISO(today), "EEEE, d 'de' MMMM", {
    locale: i18n.language === "pt" ? ptBR : undefined,
  });

  const habitSections = sections.filter((s) => s.type !== "books");
  const bookSections = sections.filter((s) => s.type === "books");

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      await addHabit({ category: selectedCategory, name: newHabitName.trim() });
      toast.success(t("planner.habitAdded"));
      setNewHabitName("");
      setAddHabitOpen(false);
    } catch (error) {
      toast.error(t("common.genericError"));
      console.error("handleAddHabit:", error);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.title.trim()) return;
    try {
      await addBook({
        title: newBook.title.trim(),
        author: newBook.author.trim(),
        totalPages: parseInt(newBook.totalPages, 10) || 0,
      });
      toast.success(t("planner.bookAdded"));
      setNewBook({ title: "", author: "", totalPages: "" });
      setAddBookOpen(false);
    } catch (error) {
      toast.error(t("common.genericError"));
      console.error("handleAddBook:", error);
    }
  };

  const openAddHabit = (categoryId) => {
    setSelectedCategory(categoryId);
    setAddHabitOpen(true);
  };

  const handleDeleteHabit = async () => {
    if (deleteHabitDialog.id) {
      try {
        await deleteHabit(deleteHabitDialog.id);
        toast.success(t("planner.habitDeleted"));
      } catch {
        toast.error(t("common.genericError"));
      }
    }
    setDeleteHabitDialog({ open: false, id: null });
  };

  const handleDeleteBook = async () => {
    if (deleteBookDialog.id) {
      try {
        await deleteBook(deleteBookDialog.id);
        toast.success(t("planner.bookDeleted"));
      } catch {
        toast.error(t("common.genericError"));
      }
    }
    setDeleteBookDialog({ open: false, id: null });
  };

  const handleDeleteSection = async () => {
    if (deleteSectionDialog.id) {
      try {
        await deleteSection(deleteSectionDialog.id);
        toast.success(t("planner.sectionDeleted"));
      } catch {
        toast.error(t("common.genericError"));
      }
    }
    setDeleteSectionDialog({ open: false, id: null });
  };

  const openAddSection = () => {
    setSectionForm(EMPTY_SECTION_FORM);
    setSectionDialog({ open: true, mode: "add", data: null });
  };

  const openEditSection = (section) => {
    setSectionForm({ name: section.name, icon: section.icon || "ListChecks", color: resolveColor(section.color) });
    setSectionDialog({ open: true, mode: "edit", data: section });
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    if (!sectionForm.name.trim()) return;
    try {
      if (sectionDialog.mode === "add") {
        await addSection({ ...sectionForm, name: sectionForm.name.trim() });
        toast.success(t("planner.sectionAdded"));
      } else {
        await updateSection(sectionDialog.data.id, { ...sectionForm, name: sectionForm.name.trim() });
        toast.success(t("planner.sectionUpdated"));
      }
      setSectionDialog({ open: false, mode: "add", data: null });
    } catch {
      toast.error(t("common.genericError"));
    }
  };

  const openEditHabit = (habit) => {
    setEditHabitName(habit.name);
    setEditHabitDialog({ open: true, habit });
  };

  const handleEditHabitSubmit = async (e) => {
    e.preventDefault();
    if (!editHabitName.trim() || !editHabitDialog.habit) return;
    try {
      // We use updateHabit via a direct firestore call — but usePlanner doesn't expose updateHabit
      // We'll add the name update via a workaround: delete old + add new isn't ideal,
      // so let's check if we have updateHabit... we don't. Let's import directly.
      // For now call through the hook's updateSection pattern — actually we need updateHabit.
      // Since usePlanner doesn't have it, we'll handle it in the page directly.
      const { db } = await import("@/lib/firebase");
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "plannerHabits", editHabitDialog.habit.id), {
        name: editHabitName.trim(),
      });
      toast.success(t("planner.habitUpdated"));
      setEditHabitDialog({ open: false, habit: null });
    } catch {
      toast.error(t("common.genericError"));
    }
  };

  const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Motion.div {...fadeUp} className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("planner.title")}
          </h1>
          <p className="text-muted-foreground capitalize">{todayFormatted}</p>
        </div>
        {!loading && habits.length > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-primary">
              {progress.percentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {progress.done}/{progress.total} {t("planner.completed")}
            </p>
          </div>
        )}
      </Motion.div>

      {/* Overall progress bar */}
      {!loading && habits.length > 0 && (
        <Motion.div {...fadeUp}>
          <Progress value={progress.percentage} className="h-2" />
        </Motion.div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Habit Sections Grid */}
          {habitSections.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {habitSections.map((section) => (
                <Motion.div key={section.id} {...fadeUp}>
                  <CategoryCard
                    section={section}
                    habits={getHabitsByCategory(section.id)}
                    isCompleted={isCompleted}
                    onToggle={toggleCompletion}
                    onDeleteHabit={(id) => setDeleteHabitDialog({ open: true, id })}
                    onEditHabit={openEditHabit}
                    onAdd={openAddHabit}
                    onEditCard={openEditSection}
                    onDeleteCard={(id) => setDeleteSectionDialog({ open: true, id })}
                    t={t}
                  />
                </Motion.div>
              ))}
            </div>
          )}

          {/* Book Sections */}
          {bookSections.map((section) => (
            <Motion.div key={section.id} {...fadeUp}>
              <ReadingCard
                section={section}
                books={books}
                onAddBook={() => setAddBookOpen(true)}
                onUpdateBook={updateBook}
                onDeleteBook={(id) => setDeleteBookDialog({ open: true, id })}
                onEditCard={openEditSection}
                onDeleteCard={(id) => setDeleteSectionDialog({ open: true, id })}
                t={t}
              />
            </Motion.div>
          ))}

          {/* Add New Card Button */}
          <Motion.div {...fadeUp}>
            <button
              onClick={openAddSection}
              className="w-full min-h-[80px] rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">{t("planner.addSection")}</span>
            </button>
          </Motion.div>
        </>
      )}

      {/* Add Habit Dialog */}
      <Dialog open={addHabitOpen} onOpenChange={setAddHabitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("planner.addHabit")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("planner.category")}</Label>
              <div className="grid grid-cols-2 gap-2">
                {habitSections.map((section) => {
                  const Icon = ICON_MAP[section.icon] || ListChecks;
                  const hex = resolveColor(section.color);
                  const isSelected = selectedCategory === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setSelectedCategory(section.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all"
                      style={isSelected
                        ? { borderColor: `${hex}66`, backgroundColor: `${hex}1a`, color: hex }
                        : undefined
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {section.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("planner.habitName")}</Label>
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder={t("planner.habitNamePlaceholder")}
                autoFocus
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t("common.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Habit Dialog */}
      <Dialog open={editHabitDialog.open} onOpenChange={(open) => !open && setEditHabitDialog({ open: false, habit: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("planner.editHabit")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditHabitSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("planner.habitName")}</Label>
              <Input
                value={editHabitName}
                onChange={(e) => setEditHabitName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">
              {t("common.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Book Dialog */}
      <Dialog open={addBookOpen} onOpenChange={setAddBookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("planner.addBook")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("planner.bookTitle")}</Label>
              <Input
                value={newBook.title}
                onChange={(e) =>
                  setNewBook({ ...newBook, title: e.target.value })
                }
                placeholder={t("planner.bookTitlePlaceholder")}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>{t("planner.bookAuthor")}</Label>
              <Input
                value={newBook.author}
                onChange={(e) =>
                  setNewBook({ ...newBook, author: e.target.value })
                }
                placeholder={t("planner.bookAuthorPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("planner.bookPages")}</Label>
              <Input
                type="number"
                value={newBook.totalPages}
                onChange={(e) =>
                  setNewBook({ ...newBook, totalPages: e.target.value })
                }
                placeholder="0"
                min={0}
              />
            </div>
            <Button type="submit" className="w-full">
              {t("common.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Section Dialog */}
      <Dialog
        open={sectionDialog.open}
        onOpenChange={(open) => !open && setSectionDialog({ ...sectionDialog, open: false })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sectionDialog.mode === "add" ? t("planner.addSection") : t("planner.editSection")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSectionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("planner.sectionName")}</Label>
              <Input
                value={sectionForm.name}
                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                placeholder={t("planner.sectionNamePlaceholder")}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>{t("planner.sectionIcon")}</Label>
              <div className="grid grid-cols-8 gap-1">
                {Object.entries(ICON_MAP).map(([key]) => {
                  const Icon = ICON_MAP[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSectionForm({ ...sectionForm, icon: key })}
                      className={cn(
                        "p-2 rounded-lg border transition-all flex items-center justify-center",
                        sectionForm.icon === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-accent text-muted-foreground"
                      )}
                      title={key}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("planner.sectionColor")}</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  className="h-10 w-20 p-1 cursor-pointer"
                  value={sectionForm.color}
                  onChange={(e) => setSectionForm({ ...sectionForm, color: e.target.value })}
                />
                <span className="text-sm text-muted-foreground">{sectionForm.color}</span>
              </div>
            </div>
            <Button type="submit" className="w-full">
              {t("common.save")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Habit Confirm */}
      <ConfirmDialog
        isOpen={deleteHabitDialog.open}
        onClose={() => setDeleteHabitDialog({ open: false, id: null })}
        onConfirm={handleDeleteHabit}
        title={t("planner.deleteHabitTitle")}
        description={t("planner.deleteHabitDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />

      {/* Delete Book Confirm */}
      <ConfirmDialog
        isOpen={deleteBookDialog.open}
        onClose={() => setDeleteBookDialog({ open: false, id: null })}
        onConfirm={handleDeleteBook}
        title={t("planner.deleteBookTitle")}
        description={t("planner.deleteBookDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />

      {/* Delete Section Confirm */}
      <ConfirmDialog
        isOpen={deleteSectionDialog.open}
        onClose={() => setDeleteSectionDialog({ open: false, id: null })}
        onConfirm={handleDeleteSection}
        title={t("planner.deleteSectionTitle")}
        description={t("planner.deleteSectionDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />
    </div>
  );
};

export default PlannerPage;
