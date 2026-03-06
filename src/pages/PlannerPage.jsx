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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORIES = [
  {
    id: "routine",
    icon: ListChecks,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    id: "devotional",
    icon: Sunrise,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    id: "study",
    icon: GraduationCap,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    id: "workout",
    icon: Dumbbell,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
];

const HabitItem = ({ habit, isCompleted, onToggle, onDelete }) => {
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
      <button
        onClick={() => onDelete(habit.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

const CategoryCard = ({
  category,
  habits,
  isCompleted,
  onToggle,
  onDelete,
  onAdd,
  t,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const Icon = category.icon;
  const completed = habits.filter((h) => isCompleted(h.id)).length;

  return (
    <Card className={cn("border", category.border)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", category.bg)}>
              <Icon className={cn("h-4 w-4", category.color)} />
            </div>
            <CardTitle className="text-base">
              {t(`planner.categories.${category.id}`)}
            </CardTitle>
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
              onClick={() => onAdd(category.id)}
            >
              <Plus className="h-4 w-4" />
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
                  onDelete={onDelete}
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

const PlannerPage = () => {
  const { t, i18n } = useTranslation();
  const {
    habits,
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
  } = usePlanner();

  const [addHabitOpen, setAddHabitOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("routine");
  const [newHabitName, setNewHabitName] = useState("");
  const [newBook, setNewBook] = useState({ title: "", author: "", totalPages: "" });
  const [deleteHabitDialog, setDeleteHabitDialog] = useState({ open: false, id: null });
  const [deleteBookDialog, setDeleteBookDialog] = useState({ open: false, id: null });

  const progress = getTodayProgress();

  const todayFormatted = format(parseISO(today), "EEEE, d 'de' MMMM", {
    locale: i18n.language === "pt" ? ptBR : undefined,
  });

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    await addHabit({ category: selectedCategory, name: newHabitName.trim() });
    toast.success(t("planner.habitAdded"));
    setNewHabitName("");
    setAddHabitOpen(false);
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.title.trim()) return;
    await addBook({
      title: newBook.title.trim(),
      author: newBook.author.trim(),
      totalPages: parseInt(newBook.totalPages, 10) || 0,
    });
    toast.success(t("planner.bookAdded"));
    setNewBook({ title: "", author: "", totalPages: "" });
    setAddBookOpen(false);
  };

  const openAddHabit = (categoryId) => {
    setSelectedCategory(categoryId);
    setAddHabitOpen(true);
  };

  const handleDeleteHabit = async () => {
    if (deleteHabitDialog.id) {
      await deleteHabit(deleteHabitDialog.id);
      toast.success(t("planner.habitDeleted"));
    }
    setDeleteHabitDialog({ open: false, id: null });
  };

  const handleDeleteBook = async () => {
    if (deleteBookDialog.id) {
      await deleteBook(deleteBookDialog.id);
      toast.success(t("planner.bookDeleted"));
    }
    setDeleteBookDialog({ open: false, id: null });
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
          {/* Habit Categories Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <Motion.div key={cat.id} {...fadeUp}>
                <CategoryCard
                  category={cat}
                  habits={getHabitsByCategory(cat.id)}
                  isCompleted={isCompleted}
                  onToggle={toggleCompletion}
                  onDelete={(id) => setDeleteHabitDialog({ open: true, id })}
                  onAdd={openAddHabit}
                  t={t}
                />
              </Motion.div>
            ))}
          </div>

          {/* Reading Section */}
          <Motion.div {...fadeUp}>
            <Card className="border border-orange-500/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <BookOpen className="h-4 w-4 text-orange-500" />
                    </div>
                    <CardTitle className="text-base">
                      {t("planner.categories.reading")}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {books.length} {t("planner.books")}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setAddBookOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
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
                        onUpdate={updateBook}
                        onDelete={(id) =>
                          setDeleteBookDialog({ open: true, id })
                        }
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
                        selectedCategory === cat.id
                          ? `${cat.bg} ${cat.border} ${cat.color} font-medium`
                          : "border-border text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {t(`planner.categories.${cat.id}`)}
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
    </div>
  );
};

export default PlannerPage;
