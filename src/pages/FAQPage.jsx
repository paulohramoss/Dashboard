import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_KEYS = ["1", "2", "3", "4", "5", "6", "7"];

const CATEGORY_MAP = {
  1: "balance",
  2: "transactions",
  3: "mobile",
  4: "import",
  5: "security",
  6: "cards",
  7: "offline",
};

const CATEGORY_COLORS = {
  balance: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    border: "border-blue-500/30",
  },
  transactions: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/30",
  },
  mobile: {
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/30",
  },
  import: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/30",
  },
  security: {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/30",
  },
  cards: {
    bg: "bg-sky-500/10",
    text: "text-sky-500",
    border: "border-sky-500/30",
  },
  shadow: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
    border: "border-indigo-500/30",
  },
  offline: {
    bg: "bg-teal-500/10",
    text: "text-teal-500",
    border: "border-teal-500/30",
  },
};

// ─── FAQItem ─────────────────────────────────────────────────────────────────
const FAQItem = ({ id, openIndex, setOpenIndex, searchQuery }) => {
  const { t } = useTranslation();
  const isOpen = openIndex === id;
  const question = t(`tutorialPage.faq.items.q${id}`);
  const answer = t(`tutorialPage.faq.items.a${id}`);
  const cat = CATEGORY_MAP[id] || "balance";
  const colors = CATEGORY_COLORS[cat];

  // Hide if doesn't match search
  if (
    searchQuery &&
    !question.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) {
    return null;
  }

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(
      `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${isOpen
        ? `${colors.border} shadow-md`
        : "border-border hover:border-primary/20"
        }`}
    >
      <button
        onClick={() => setOpenIndex(isOpen ? null : id)}
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`shrink-0 p-2 rounded-xl mt-0.5 ${colors.bg}`}>
            <HelpCircle className={`h-4 w-4 ${colors.text}`} />
          </div>
          <span className="font-medium text-sm leading-snug">
            {highlightText(question)}
          </span>
        </div>
        <div className="shrink-0 mt-1">
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}
          >
            <p className="text-sm leading-relaxed text-foreground/80">
              {highlightText(answer)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── FAQPage ──────────────────────────────────────────────────────────────────
const FAQPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const visibleCount = FAQ_KEYS.filter((id) => {
    if (!searchQuery) return true;
    const q = t(`tutorialPage.faq.items.q${id}`);
    const a = t(`tutorialPage.faq.items.a${id}`);
    return (
      q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-primary/20 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <HelpCircle className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          {t("tutorialPage.faq.title")}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {t("tutorialPage.faq.subtitle")}
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOpenIndex(null);
            }}
            placeholder={t("faq.searchPlaceholder", "Pesquisar pergunta...")}
            className="pl-10 bg-background/80 border-primary/20 focus:border-primary/50"
          />
        </div>

        {/* Results count when searching */}
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-3">
            {visibleCount === 0
              ? t("faq.noResults", "Nenhum resultado encontrado.")
              : t("faq.resultsCount", "{{count}} resultado(s) encontrado(s).", {
                count: visibleCount,
              })}
          </p>
        )}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {FAQ_KEYS.map((id) => (
          <FAQItem
            key={id}
            id={id}
            openIndex={openIndex}
            setOpenIndex={setOpenIndex}
            searchQuery={searchQuery}
          />
        ))}

        {/* No results state */}
        {searchQuery && visibleCount === 0 && (
          <div className="text-center py-12 space-y-3">
            <div className="text-4xl">🔍</div>
            <p className="text-muted-foreground">
              {t("faq.noResults", "Nenhum resultado encontrado.")}
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              {t("faq.clearSearch", "Limpar pesquisa")}
            </Button>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center space-y-3">
        <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">
          {t("faq.notFound", "Não encontrou o que procurava?")}
        </p>
        <Button
          onClick={() => navigate("/tutorial")}
          variant="outline"
          className="gap-2"
        >
          {t("nav.tutorial")}
        </Button>
      </div>
    </div>
  );
};

export default FAQPage;
