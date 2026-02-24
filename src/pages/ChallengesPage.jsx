import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { motion as Motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useChallenges } from "@/hooks/useChallenges";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  Plus,
  Trophy,
  Flame,
  Target,
  Ban,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHALLENGE_TEMPLATES = [
  {
    key: "no_delivery",
    type: "no_spend",
    titleKey: "challenges.template.noDelivery",
    descKey: "challenges.template.noDeliveryDesc",
    category: "Alimentação",
    days: 7,
    icon: "🍔",
    color: "#f97316",
  },
  {
    key: "no_clothes",
    type: "no_spend",
    titleKey: "challenges.template.noClothes",
    descKey: "challenges.template.noClothesDesc",
    category: "Roupas",
    days: 30,
    icon: "👕",
    color: "#8b5cf6",
  },
  {
    key: "no_leisure",
    type: "no_spend",
    titleKey: "challenges.template.noLeisure",
    descKey: "challenges.template.noLeisureDesc",
    category: "Lazer",
    days: 14,
    icon: "🎮",
    color: "#ec4899",
  },
  {
    key: "save_500",
    type: "save_amount",
    titleKey: "challenges.template.save500",
    descKey: "challenges.template.save500Desc",
    targetAmount: 500,
    days: 30,
    icon: "💰",
    color: "#22c55e",
  },
];

const parseDate = (d) => {
  if (!d) return null;
  if (typeof d === "string") {
    if (d.includes("-")) {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day);
    }
    return new Date(d);
  }
  if (d.toDate) return d.toDate();
  return new Date(d);
};

const computeProgress = (challenge, transactions) => {
  const start = parseDate(challenge.startDate);
  const end = parseDate(challenge.endDate);
  if (!start || !end) return { pct: 0, status: "active", spent: 0, saved: 0 };

  const now = new Date();
  const totalDays = Math.max(
    1,
    Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  );
  const daysPassed = Math.min(
    totalDays,
    Math.ceil((now - start) / (1000 * 60 * 60 * 24))
  );

  const periodTxns = transactions.filter((t) => {
    const d = parseDate(t.date);
    if (!d) return false;
    return d >= start && d <= end;
  });

  if (challenge.type === "no_spend") {
    const violations = periodTxns.filter(
      (t) =>
        t.type === "expense" &&
        t.category?.toLowerCase() === challenge.category?.toLowerCase()
    );
    if (violations.length > 0) {
      return { pct: 0, status: "failed", spent: violations.length, saved: 0 };
    }
    const pct = Math.round((daysPassed / totalDays) * 100);
    const status = now > end ? "completed" : "active";
    return { pct, status, spent: 0, saved: 0 };
  }

  if (challenge.type === "spend_limit") {
    const spent = periodTxns
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    if (spent >= challenge.targetAmount) {
      return { pct: 0, status: "failed", spent, saved: 0 };
    }
    const pct = Math.round(
      Math.max(0, (1 - spent / challenge.targetAmount) * 100)
    );
    const status = now > end ? "completed" : "active";
    return { pct, status, spent, saved: 0 };
  }

  if (challenge.type === "save_amount") {
    const income = periodTxns
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    const expense = periodTxns
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    const saved = income - expense;
    const pct = Math.round(
      Math.min(100, Math.max(0, (saved / challenge.targetAmount) * 100))
    );
    const status =
      saved >= challenge.targetAmount
        ? "completed"
        : now > end
          ? "failed"
          : "active";
    return { pct, status, spent: expense, saved };
  }

  return { pct: 0, status: "active", spent: 0, saved: 0 };
};

const StatusBadge = ({ status, t }) => {
  const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border";
  if (status === "completed")
    return (
      <span className={cn(base, "bg-green-500/10 text-green-600 border-green-500/20")}>
        <CheckCircle2 className="h-3 w-3" />
        {t("challenges.completed")}
      </span>
    );
  if (status === "failed")
    return (
      <span className={cn(base, "bg-red-500/10 text-red-600 border-red-500/20")}>
        <XCircle className="h-3 w-3" />
        {t("challenges.failed")}
      </span>
    );
  return (
    <span className={cn(base, "bg-blue-500/10 text-blue-600 border-blue-500/20")}>
      <Flame className="h-3 w-3" />
      {t("challenges.active")}
    </span>
  );
};

const ChallengeCard = ({ challenge, transactions, onDelete, t, formatCurrency }) => {
  const { pct, status, spent, saved } = useMemo(
    () => computeProgress(challenge, transactions),
    [challenge, transactions]
  );

  const [celebrated, setCelebrated] = useState(false);

  React.useEffect(() => {
    if (status === "completed" && !celebrated) {
      setCelebrated(true);
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#22c55e", "#ffd700", "#ffffff"],
      });
    }
  }, [status, celebrated]);

  const barColor =
    status === "completed"
      ? "#22c55e"
      : status === "failed"
        ? "#ef4444"
        : challenge.color || "#3b82f6";

  const start = parseDate(challenge.startDate);
  const end = parseDate(challenge.endDate);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{challenge.icon || "🎯"}</span>
            <div>
              <CardTitle className="text-base font-bold leading-tight">
                {challenge.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {challenge.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <StatusBadge status={status} t={t} />
              <span className="text-sm font-semibold">{pct}%</span>
            </div>

            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
              <Motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>

            {challenge.type === "no_spend" && (
              <p className="text-xs text-muted-foreground">
                {t("challenges.noSpendIn")}{" "}
                <span className="font-medium text-foreground">
                  {challenge.category}
                </span>
                {status === "failed" && (
                  <span className="text-red-500 ml-1">
                    — {t("challenges.violationFound")}
                  </span>
                )}
              </p>
            )}

            {challenge.type === "spend_limit" && (
              <p className="text-xs text-muted-foreground">
                {t("challenges.spent")}{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(spent)}
                </span>{" "}
                {t("challenges.of")}{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(challenge.targetAmount)}
                </span>
              </p>
            )}

            {challenge.type === "save_amount" && (
              <p className="text-xs text-muted-foreground">
                {t("challenges.saved")}{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(Math.max(0, saved))}
                </span>{" "}
                {t("challenges.of")}{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(challenge.targetAmount)}
                </span>
              </p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {start?.toLocaleDateString("pt-BR")} →{" "}
              {end?.toLocaleDateString("pt-BR")}
            </div>
          </div>
        </CardContent>
      </Card>
    </Motion.div>
  );
};

const ChallengesPage = () => {
  const { t } = useTranslation();
  const { challenges, loading, addChallenge, deleteChallenge } =
    useChallenges();
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [step, setStep] = useState("choose"); // 'choose' | 'custom'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState(null);

  const [customChallenge, setCustomChallenge] = useState({
    title: "",
    description: "",
    type: "no_spend",
    category: "",
    targetAmount: "",
    days: 30,
    icon: "🎯",
    color: "#3b82f6",
  });

  const categoriesWithExpense = useMemo(
    () => categories.filter((c) => c.type === "expense" || !c.type),
    [categories]
  );

  const challengesWithProgress = useMemo(
    () =>
      challenges.map((ch) => ({
        ...ch,
        computed: computeProgress(ch, transactions),
      })),
    [challenges, transactions]
  );

  const active = challengesWithProgress.filter(
    (c) => c.computed.status === "active"
  );
  const completed = challengesWithProgress.filter(
    (c) => c.computed.status === "completed"
  );
  const failed = challengesWithProgress.filter(
    (c) => c.computed.status === "failed"
  );

  const handleAddTemplate = async (template) => {
    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + template.days * 86400000)
      .toISOString()
      .split("T")[0];
    await addChallenge({
      title: t(template.titleKey),
      description: t(template.descKey),
      type: template.type,
      category: template.category || "",
      targetAmount: template.targetAmount || 0,
      startDate,
      endDate,
      icon: template.icon,
      color: template.color,
    });
    toast.success(t("challenges.challengeAdded"));
    setIsAddOpen(false);
    setStep("choose");
  };

  const handleAddCustom = async (e) => {
    e.preventDefault();
    if (!customChallenge.title) return;
    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(
      Date.now() + Number(customChallenge.days) * 86400000
    )
      .toISOString()
      .split("T")[0];
    await addChallenge({
      ...customChallenge,
      targetAmount: parseFloat(customChallenge.targetAmount) || 0,
      days: Number(customChallenge.days),
      startDate,
      endDate,
    });
    toast.success(t("challenges.challengeAdded"));
    setIsAddOpen(false);
    setStep("choose");
    setCustomChallenge({
      title: "",
      description: "",
      type: "no_spend",
      category: "",
      targetAmount: "",
      days: 30,
      icon: "🎯",
      color: "#3b82f6",
    });
  };

  const confirmDelete = (ch) => {
    setChallengeToDelete(ch);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (challengeToDelete) {
      await deleteChallenge(challengeToDelete.id);
      toast.success(t("challenges.challengeDeleted"));
      setChallengeToDelete(null);
    }
  };

  const formatCurrency = (v) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v || 0);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  return (
    <Motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("challenges.title")}
          </h1>
          <p className="text-muted-foreground">{t("challenges.subtitle")}</p>
        </div>
        <Button onClick={() => { setIsAddOpen(true); setStep("choose"); }}>
          <Plus className="mr-2 h-4 w-4" />
          {t("challenges.newChallenge")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{active.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Flame className="h-3 w-3" /> {t("challenges.active")}
          </div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">{completed.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <Trophy className="h-3 w-3" /> {t("challenges.completed")}
          </div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-red-500">{failed.length}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            <XCircle className="h-3 w-3" /> {t("challenges.failed")}
          </div>
        </Card>
      </div>

      {/* Active Challenges */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Flame className="h-4 w-4 text-blue-500" />
                {t("challenges.activeSection")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {active.map((ch) => (
                  <ChallengeCard
                    key={ch.id}
                    challenge={ch}
                    transactions={transactions}
                    onDelete={() => confirmDelete(ch)}
                    t={t}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-500" />
                {t("challenges.completedSection")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completed.map((ch) => (
                  <ChallengeCard
                    key={ch.id}
                    challenge={ch}
                    transactions={transactions}
                    onDelete={() => confirmDelete(ch)}
                    t={t}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}

          {failed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                {t("challenges.failedSection")}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {failed.map((ch) => (
                  <ChallengeCard
                    key={ch.id}
                    challenge={ch}
                    transactions={transactions}
                    onDelete={() => confirmDelete(ch)}
                    t={t}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>
          )}

          {challenges.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">{t("challenges.noChallenge")}</p>
              <p className="text-sm mt-1">{t("challenges.noChallengeDesc")}</p>
            </div>
          )}
        </>
      )}

      {/* Add Challenge Dialog */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(v) => {
          setIsAddOpen(v);
          if (!v) setStep("choose");
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {step === "choose"
                ? t("challenges.chooseTemplate")
                : t("challenges.customChallenge")}
            </DialogTitle>
            <DialogDescription>
              {step === "choose"
                ? t("challenges.chooseTemplateDesc")
                : t("challenges.customChallengeDesc")}
            </DialogDescription>
          </DialogHeader>

          {step === "choose" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {CHALLENGE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.key}
                    onClick={() => handleAddTemplate(tmpl)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-all text-center"
                  >
                    <span className="text-3xl">{tmpl.icon}</span>
                    <span className="text-sm font-medium">
                      {t(tmpl.titleKey)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tmpl.days} {t("challenges.days")}
                    </span>
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep("custom")}
              >
                <Zap className="mr-2 h-4 w-4" />
                {t("challenges.createCustom")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label>{t("challenges.challengeTitle")}</Label>
                  <Input
                    value={customChallenge.title}
                    onChange={(e) =>
                      setCustomChallenge({ ...customChallenge, title: e.target.value })
                    }
                    placeholder={t("challenges.titlePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>{t("challenges.challengeType")}</Label>
                  <Select
                    value={customChallenge.type}
                    onChange={(e) =>
                      setCustomChallenge({ ...customChallenge, type: e.target.value })
                    }
                  >
                    <option value="no_spend">{t("challenges.type.noSpend")}</option>
                    <option value="spend_limit">{t("challenges.type.spendLimit")}</option>
                    <option value="save_amount">{t("challenges.type.saveAmount")}</option>
                  </Select>
                </div>

                {customChallenge.type === "no_spend" && (
                  <div className="space-y-1.5 col-span-2">
                    <Label>{t("challenges.category")}</Label>
                    <Select
                      value={customChallenge.category}
                      onChange={(e) =>
                        setCustomChallenge({ ...customChallenge, category: e.target.value })
                      }
                    >
                      <option value="">{t("challenges.selectCategory")}</option>
                      {categoriesWithExpense.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                )}

                {(customChallenge.type === "spend_limit" ||
                  customChallenge.type === "save_amount") && (
                  <div className="space-y-1.5 col-span-2">
                    <Label>{t("challenges.targetAmount")}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customChallenge.targetAmount}
                      onChange={(e) =>
                        setCustomChallenge({ ...customChallenge, targetAmount: e.target.value })
                      }
                      placeholder="500"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>{t("challenges.duration")}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={customChallenge.days}
                    onChange={(e) =>
                      setCustomChallenge({ ...customChallenge, days: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("challenges.icon")}</Label>
                  <Input
                    value={customChallenge.icon}
                    onChange={(e) =>
                      setCustomChallenge({ ...customChallenge, icon: e.target.value })
                    }
                    placeholder="🎯"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("choose")}
                  className="flex-1"
                >
                  {t("common.back")}
                </Button>
                <Button type="submit" className="flex-1">
                  {t("challenges.startChallenge")}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t("challenges.deleteTitle")}
        description={t("challenges.deleteDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />
    </Motion.div>
  );
};

export default ChallengesPage;
