import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  LayoutDashboard,
  Wallet,
  Target,
  PieChart,
  CreditCard,
  ArrowRight,
  Star,
  Users,
  Zap,
  Trophy,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Play,
  Pause,
  Shield,
  TrendingUp,
  Upload,
  Bell,
  Link,
  Repeat,
  ScanLine,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// ─── Checklist Keys ────────────────────────────────────────────────────────────
const CHECKLIST_KEYS = [
  "account",
  "transaction",
  "category",
  "budget",
  "goal",
  "import",
  "report",
];

const STORAGE_KEY = "fd_tutorial_checklist";
const VISITED_KEY = "fd_tutorial_visited";

// ─── Section Configuration ────────────────────────────────────────────────────
const SECTION_COLORS = {
  intro: {
    bg: "from-violet-500/20 to-purple-500/10",
    icon: "text-violet-500",
    border: "border-violet-500/30",
  },
  dashboard: {
    bg: "from-blue-500/20 to-cyan-500/10",
    icon: "text-blue-500",
    border: "border-blue-500/30",
  },
  transactions: {
    bg: "from-emerald-500/20 to-green-500/10",
    icon: "text-emerald-500",
    border: "border-emerald-500/30",
  },
  planning: {
    bg: "from-amber-500/20 to-yellow-500/10",
    icon: "text-amber-500",
    border: "border-amber-500/30",
  },
  reports: {
    bg: "from-rose-500/20 to-pink-500/10",
    icon: "text-rose-500",
    border: "border-rose-500/30",
  },
  accounts: {
    bg: "from-sky-500/20 to-blue-500/10",
    icon: "text-sky-500",
    border: "border-sky-500/30",
  },
  goals: {
    bg: "from-orange-500/20 to-amber-500/10",
    icon: "text-orange-500",
    border: "border-orange-500/30",
  },
  shared: {
    bg: "from-teal-500/20 to-emerald-500/10",
    icon: "text-teal-500",
    border: "border-teal-500/30",
  },
  rules: {
    bg: "from-indigo-500/20 to-violet-500/10",
    icon: "text-indigo-500",
    border: "border-indigo-500/30",
  },
  challenges: {
    bg: "from-fuchsia-500/20 to-pink-500/10",
    icon: "text-fuchsia-500",
    border: "border-fuchsia-500/30",
  },
};

// ─── Point icons per position ─────────────────────────────────────────────────
const POINT_ICONS = [Star, Zap, Shield, Target, Trophy];

// ─── Tour Slides ─────────────────────────────────────────────────────────────
const TOUR_SLIDES = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    color: "from-blue-600 to-cyan-500",
    cardBg: "from-blue-500/15 to-cyan-500/10",
    textColor: "text-blue-400",
    highlights: ["TrendingUp", "PieChart", "Bell"],
  },
  {
    id: "transactions",
    icon: Wallet,
    color: "from-emerald-600 to-green-500",
    cardBg: "from-emerald-500/15 to-green-500/10",
    textColor: "text-emerald-400",
    highlights: ["Upload", "Repeat", "ScanLine"],
  },
  {
    id: "planning",
    icon: Target,
    color: "from-amber-600 to-yellow-500",
    cardBg: "from-amber-500/15 to-yellow-500/10",
    textColor: "text-amber-400",
    highlights: ["Star", "Trophy", "Zap"],
  },
  {
    id: "reports",
    icon: PieChart,
    color: "from-rose-600 to-pink-500",
    cardBg: "from-rose-500/15 to-pink-500/10",
    textColor: "text-rose-400",
    highlights: ["TrendingUp", "ExternalLink", "Bell"],
  },
  {
    id: "rules",
    icon: Zap,
    color: "from-indigo-600 to-violet-500",
    cardBg: "from-indigo-500/15 to-violet-500/10",
    textColor: "text-indigo-400",
    highlights: ["Brain", "Upload", "CheckCircle2"],
  },
  {
    id: "shared",
    icon: Users,
    color: "from-teal-600 to-emerald-500",
    cardBg: "from-teal-500/15 to-emerald-500/10",
    textColor: "text-teal-400",
    highlights: ["Link", "Repeat", "Shield"],
  },
];

const HIGHLIGHT_ICON_MAP = {
  TrendingUp,
  PieChart,
  Bell,
  Upload,
  Repeat,
  ScanLine,
  Star,
  Trophy,
  Zap,
  ExternalLink,
  Brain,
  Link,
  Shield,
  CheckCircle2,
};

// ─── OnboardingTour ───────────────────────────────────────────────────────────
const OnboardingTour = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const SLIDE_DURATION = 5000;

  useEffect(() => {
    let cancelled = false;
    const start = Date.now();
    const tick = setInterval(() => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      if (!playing) {
        setProgress(0);
        clearInterval(tick);
        return;
      }
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed >= SLIDE_DURATION) {
        setCurrent((c) => (c + 1) % TOUR_SLIDES.length);
        clearInterval(tick);
      }
    }, 50);
    return () => {
      cancelled = true;
      clearInterval(tick);
    };
  }, [current, playing]);

  const go = (idx) => {
    setCurrent(idx);
    setProgress(0);
  };
  const prev = () =>
    go((current - 1 + TOUR_SLIDES.length) % TOUR_SLIDES.length);
  const next = () => go((current + 1) % TOUR_SLIDES.length);

  const slide = TOUR_SLIDES[current];
  const Icon = slide.icon;
  const sectionKey = `tutorialPage.sections.${slide.id}`;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br ${slide.cardBg} shadow-lg`}
    >
      {/* Animated top progress bar */}
      <div className="h-1 bg-muted/40">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center">
          {/* Left – large animated icon */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <div
              className={`relative w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${slide.color} shadow-2xl flex items-center justify-center`}
            >
              <Icon className="h-12 w-12 md:h-16 md:h-16 text-white drop-shadow" />
              {/* Floating halo pulse */}
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${slide.color} animate-ping opacity-10`}
              />
            </div>
            {/* Highlight mini-icons */}
            <div className="flex gap-2">
              {slide.highlights.map((hk) => {
                const HIcon = HIGHLIGHT_ICON_MAP[hk];
                return HIcon ? (
                  <div
                    key={hk}
                    className="w-8 h-8 rounded-xl bg-background/50 border border-border/60 flex items-center justify-center"
                  >
                    <HIcon className={`h-4 w-4 ${slide.textColor}`} />
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Right – text */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            <p
              className={`text-xs font-bold uppercase tracking-widest mb-1 ${slide.textColor}`}
            >
              {t("nav.tutorial", "Guide")} · {current + 1}/{TOUR_SLIDES.length}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              {t(`${sectionKey}.title`)}
            </h3>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
              {t(`${sectionKey}.description`)}
            </p>
            {/* 3 feature pills */}
            {[1, 2, 3].map((n) => {
              const raw = t(`${sectionKey}.points.${n}`, { defaultValue: "" });
              if (!raw) return null;
              const [label, ...rest] = raw.split(":");
              return (
                <div
                  key={n}
                  className="inline-flex items-center gap-1.5 mr-2 mb-2 px-3 py-1 rounded-full bg-background/60 border border-border/60 text-xs font-medium"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-current ${slide.textColor}`}
                  />
                  <span className="font-semibold">{label.trim()}</span>
                  {rest.length > 0 && (
                    <span className="text-muted-foreground hidden sm:inline">
                      — {rest.join(":").trim().slice(0, 40)}
                      {rest.join(":").trim().length > 40 ? "..." : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex gap-1.5">
            {TOUR_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-primary" : "w-1.5 bg-primary/30"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TipsCarousel = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const tipKeys = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % tipKeys.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tipKeys.length]);

  const prev = () =>
    setCurrent((c) => (c - 1 + tipKeys.length) % tipKeys.length);
  const next = () => setCurrent((c) => (c + 1) % tipKeys.length);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-primary/15 text-primary shrink-0 mt-0.5">
          <Lightbulb className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex-1 min-h-[3.5rem]">
          <p className="text-xs font-semibold text-primary/70 uppercase tracking-widest mb-1">
            {t("tutorialPage.tips.title")}
          </p>
          <p className="text-sm leading-relaxed text-foreground/90 transition-all duration-500">
            {t(`tutorialPage.tips.items.${tipKeys[current]}`)}
          </p>
        </div>
      </div>
      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1.5">
          {tipKeys.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-primary" : "w-1.5 bg-primary/30"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={prev}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={next}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── ChecklistPanel ───────────────────────────────────────────────────────────
const ChecklistPanel = () => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  });

  const toggle = (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const done = Object.values(checked).filter(Boolean).length;
  const total = CHECKLIST_KEYS.length;
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

  return (
    <Card className="border-2 border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {t("tutorialPage.checklist.title")}
            </CardTitle>
            <CardDescription className="mt-1">
              {t("tutorialPage.checklist.subtitle")}
            </CardDescription>
          </div>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${
              allDone
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {t("tutorialPage.checklist.progress", { done, total })}
          </span>
        </div>
        {/* Progress Bar */}
        <div className="mt-3 space-y-1">
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {allDone && (
            <p className="text-sm text-center text-primary font-medium animate-in fade-in">
              {t("tutorialPage.checklist.completed")}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CHECKLIST_KEYS.map((key) => {
            const done = checked[key];
            return (
              <li key={key}>
                <button
                  onClick={() => toggle(key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 group
                    ${
                      done
                        ? "bg-primary/10 border-primary/30 text-foreground"
                        : "bg-muted/40 border-transparent hover:border-primary/20 hover:bg-muted/60"
                    }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary/50 transition-colors" />
                  )}
                  <span
                    className={`text-sm leading-snug ${
                      done ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {t(`tutorialPage.checklist.items.${key}`)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

// ─── FAQItem ──────────────────────────────────────────────────────────────────
const FAQItem = ({ qKey, aKey, index, openIndex, setOpenIndex }) => {
  const { t } = useTranslation();
  const isOpen = openIndex === index;

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        isOpen
          ? "border-primary/30 shadow-sm"
          : "border-border hover:border-primary/20"
      }`}
    >
      <button
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
      >
        <div className="flex items-start gap-3">
          <HelpCircle className="h-4 w-4 text-primary/60 shrink-0 mt-0.5" />
          <span className="font-medium text-sm">
            {t(`tutorialPage.faq.items.${qKey}`)}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-2">
          <div className="ml-7 text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/20 pl-4">
            {t(`tutorialPage.faq.items.${aKey}`)}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── FeatureCard ──────────────────────────────────────────────────────────────
const FeatureCard = ({ point, idx, colors }) => {
  const PointIcon = POINT_ICONS[idx % POINT_ICONS.length];
  const colonIdx = point.indexOf(":");
  const hasLabel = colonIdx > 0 && colonIdx < 30;
  const label = hasLabel ? point.slice(0, colonIdx).trim() : null;
  const desc = hasLabel ? point.slice(colonIdx + 1).trim() : point;

  // Derive inline color styles from Tailwind class name
  const iconColorMap = {
    "text-violet-500": "#8b5cf6",
    "text-blue-500": "#3b82f6",
    "text-emerald-500": "#10b981",
    "text-amber-500": "#f59e0b",
    "text-rose-500": "#f43f5e",
    "text-sky-500": "#0ea5e9",
    "text-orange-500": "#f97316",
    "text-teal-500": "#14b8a6",
    "text-indigo-500": "#6366f1",
    "text-fuchsia-500": "#d946ef",
  };
  const iconColor = iconColorMap[colors.icon] || "#6366f1";

  return (
    <li className="flex items-start gap-3.5 p-4 rounded-xl bg-background/60 backdrop-blur border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all duration-200 group">
      <div
        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 shadow-sm"
        style={{
          backgroundColor: `${iconColor}20`,
          border: `1.5px solid ${iconColor}40`,
        }}
      >
        <PointIcon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        {label && (
          <p
            className="text-sm font-semibold leading-snug mb-0.5"
            style={{ color: iconColor }}
          >
            {label}
          </p>
        )}
        <p className="text-sm text-muted-foreground leading-snug">{desc}</p>
      </div>
    </li>
  );
};

// ─── SectionCard ──────────────────────────────────────────────────────────────
const SectionCard = ({ section, navigate }) => {
  const { t } = useTranslation();
  const colors = SECTION_COLORS[section.id] || SECTION_COLORS.intro;
  const Icon = section.icon;
  const tipKey = `tutorialPage.sections.${section.id}.tip`;
  const exampleKey = `tutorialPage.sections.${section.id}.example`;
  const tip = t(tipKey, { defaultValue: "" });
  const example = t(exampleKey, { defaultValue: "" });

  return (
    <Card
      className={`border shadow-md bg-gradient-to-br ${colors.bg} ${colors.border} border`}
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <div
            className={`p-3.5 rounded-2xl bg-background/60 backdrop-blur ${colors.icon} shadow-sm`}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-xl">{section.title}</CardTitle>
            <CardDescription className="text-base mt-1.5 leading-snug">
              {section.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {section.content && (
          <p className="text-sm leading-relaxed text-foreground/80">
            {section.content}
          </p>
        )}

        {/* Feature Cards Grid */}
        {section.points && section.points.length > 0 && (
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {section.points.map((point, idx) => (
              <FeatureCard key={idx} point={point} idx={idx} colors={colors} />
            ))}
          </ul>
        )}

        {/* Tip Box */}
        {tip && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              {tip}
            </p>
          </div>
        )}

        {/* Example Box */}
        {example && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/60 border border-border">
            <div className="shrink-0 mt-0.5 text-xs font-bold px-2 py-0.5 rounded bg-muted-foreground/20 text-muted-foreground">
              eg.
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              {example}
            </p>
          </div>
        )}

        {section.action && (
          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => navigate(section.action.path)}
              className="gap-2 shadow-sm"
            >
              {section.action.label}
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TutorialPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("intro");
  const [visited, setVisited] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(VISITED_KEY) || '["intro"]');
    } catch {
      return ["intro"];
    }
  });

  const markVisited = useCallback((id) => {
    setVisited((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(VISITED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleTabChange = (val) => {
    setActiveTab(val);
    markVisited(val);
  };

  const sections = [
    {
      id: "intro",
      icon: BookOpen,
      title: t("tutorialPage.sections.intro.title"),
      content: t("tutorialPage.sections.intro.content"),
    },
    {
      id: "dashboard",
      icon: LayoutDashboard,
      title: t("tutorialPage.sections.dashboard.title"),
      description: t("tutorialPage.sections.dashboard.description"),
      points: [1, 2, 3, 4, 5].map((n) =>
        t(`tutorialPage.sections.dashboard.points.${n}`),
      ),
      action: { label: t("nav.dashboard"), path: "/" },
    },
    {
      id: "transactions",
      icon: Wallet,
      title: t("tutorialPage.sections.transactions.title"),
      description: t("tutorialPage.sections.transactions.description"),
      points: [1, 2, 3, 4, 5].map((n) =>
        t(`tutorialPage.sections.transactions.points.${n}`),
      ),
      action: { label: t("nav.transactions"), path: "/transactions" },
    },
    {
      id: "planning",
      icon: Target,
      title: t("tutorialPage.sections.planning.title"),
      description: t("tutorialPage.sections.planning.description"),
      points: [
        t("tutorialPage.sections.planning.budgets"),
        t("tutorialPage.sections.planning.goals"),
        t("tutorialPage.sections.planning.debt"),
        t("tutorialPage.sections.planning.subscriptions"),
        t("tutorialPage.sections.planning.challenges"),
      ],
      action: { label: t("nav.budgets"), path: "/budgets" },
    },
    {
      id: "reports",
      icon: PieChart,
      title: t("tutorialPage.sections.reports.title"),
      description: t("tutorialPage.sections.reports.description"),
      content: t("tutorialPage.sections.reports.content"),
      points: [1, 2, 3, 4, 5].map((n) =>
        t(`tutorialPage.sections.reports.points.${n}`),
      ),
      action: { label: t("nav.reports"), path: "/reports" },
    },
    {
      id: "accounts",
      icon: CreditCard,
      title: t("tutorialPage.sections.accounts.title"),
      description: t("tutorialPage.sections.accounts.description"),
      content: t("tutorialPage.sections.accounts.content"),
      points: [1, 2, 3, 4, 5].map((n) =>
        t(`tutorialPage.sections.accounts.points.${n}`),
      ),
      action: { label: t("accounts.title"), path: "/accounts" },
    },
    {
      id: "goals",
      icon: Star,
      title: t("tutorialPage.sections.goals.title"),
      description: t("tutorialPage.sections.goals.description"),
      points: [1, 2, 3, 4, 5].map((n) =>
        t(`tutorialPage.sections.goals.points.${n}`),
      ),
      action: { label: t("nav.goals"), path: "/goals" },
    },
    {
      id: "shared",
      icon: Users,
      title: t("tutorialPage.sections.shared.title"),
      description: t("tutorialPage.sections.shared.description"),
      content: t("tutorialPage.sections.shared.content"),
      points: [1, 2, 3, 4, 5].map((n) =>
        t(`tutorialPage.sections.shared.points.${n}`),
      ),
      action: { label: t("settings.title"), path: "/settings" },
    },
    {
      id: "rules",
      icon: Zap,
      title: t("tutorialPage.sections.rules.title"),
      description: t("tutorialPage.sections.rules.description"),
      content: t("tutorialPage.sections.rules.content"),
      points: [1, 2, 3, 4, 5].map((n) =>
        t(`tutorialPage.sections.rules.points.${n}`),
      ),
      action: { label: t("settings.smartRules"), path: "/settings" },
    },
    {
      id: "challenges",
      icon: Trophy,
      title: t("tutorialPage.sections.challenges.title"),
      description: t("tutorialPage.sections.challenges.description"),
      points: [1, 2, 3, 4, 5].map((n) =>
        t(`tutorialPage.sections.challenges.points.${n}`),
      ),
      action: {
        label: t("tutorialPage.sections.challenges.title"),
        path: "/challenges",
      },
    },
  ];

  const totalSections = sections.length;
  const visitedCount = visited.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("tutorialPage.title")}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t("tutorialPage.subtitle")}
          </p>
        </div>
        {/* Reading Progress */}
        <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-2 border">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {t("tutorialPage.readingProgress")}
            </p>
            <p className="text-sm font-semibold">
              {t("tutorialPage.sectionsRead", {
                count: visitedCount,
                total: totalSections,
              })}
            </p>
          </div>
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted"
              />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                strokeWidth="3"
                stroke="currentColor"
                className="text-primary"
                strokeDasharray={`${(visitedCount / totalSections) * 100} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {Math.round((visitedCount / totalSections) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Tips Carousel */}
      <TipsCarousel />

      {/* Checklist */}
      <ChecklistPanel />

      {/* Main Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full h-auto flex-wrap justify-start p-2 gap-1.5 bg-muted/50">
          {sections.map((section) => {
            const colors = SECTION_COLORS[section.id] || SECTION_COLORS.intro;
            const isVisited = visited.includes(section.id);
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex items-center gap-2 px-3 py-2 relative"
              >
                <section.icon
                  className={`h-4 w-4 ${isVisited ? colors.icon : ""}`}
                />
                <span className="hidden md:inline">{section.title}</span>
                {isVisited && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-6">
            <SectionCard section={section} navigate={navigate} />
          </TabsContent>
        ))}
      </Tabs>

      {/* FAQ CTA — now a dedicated page */}
      <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-5">
        <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold">{t("tutorialPage.faq.title")}</p>
          <p className="text-sm text-muted-foreground">
            {t("tutorialPage.faq.subtitle")}
          </p>
        </div>
        <Button onClick={() => navigate("/faq")} className="gap-2 shrink-0">
          {t("nav.faq")}
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default TutorialPage;
