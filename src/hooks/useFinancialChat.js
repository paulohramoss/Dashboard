import { useState, useMemo } from "react";
import { answerFinancialQuestion } from "@/lib/gemini";
import { useTransactions } from "@/hooks/useTransactions";
import { subMonths, format, parseISO } from "date-fns";

/**
 * Hook personalizado para gerenciar conversação com assistente financeiro
 */
export const useFinancialChat = () => {
  const { stats, transactions } = useTransactions();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Olá! 👋 Sou seu assistente financeiro pessoal. Como posso ajudá-lo hoje?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Detectar picos de gasto no mês atual vs. média dos últimos 3 meses
  const proactiveInsights = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const today = new Date();
    const getMonthKey = (date) => format(date, "yyyy-MM");
    const currentMonthKey = getMonthKey(today);

    const expensesByMonth = {};
    transactions.forEach((tx) => {
      if (tx.type !== "expense") return;
      try {
        const date = parseISO(tx.date);
        const monthKey = getMonthKey(date);
        if (!expensesByMonth[monthKey]) expensesByMonth[monthKey] = {};
        if (!expensesByMonth[monthKey][tx.category])
          expensesByMonth[monthKey][tx.category] = 0;
        expensesByMonth[monthKey][tx.category] += parseFloat(tx.amount || 0);
      } catch {
        // skip invalid dates
      }
    });

    const alerts = [];
    const currentCategories = expensesByMonth[currentMonthKey] || {};

    Object.entries(currentCategories).forEach(([category, currentAmount]) => {
      let sum = 0;
      for (let i = 1; i <= 3; i++) {
        const key = getMonthKey(subMonths(today, i));
        sum += expensesByMonth[key]?.[category] || 0;
      }
      const average = sum / 3;
      if (average > 10 && currentAmount > average * 1.2) {
        const percentage = Math.round(((currentAmount - average) / average) * 100);
        alerts.push({ category, percentage, currentAmount, average });
      }
    });

    return alerts;
  }, [transactions]);

  const sendMessage = async (userMessage, language = "pt") => {
    if (!userMessage || userMessage.trim() === "") return;

    const userMsg = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      const userContext = {
        balance: parseFloat(stats?.balance || 0),
        income: parseFloat(stats?.income || 0),
        expense: parseFloat(stats?.expense || 0),
        recentTransactions: transactions.slice(0, 10),
        topCategory: getTopCategory(transactions),
      };

      const answer = await answerFinancialQuestion(
        userMessage,
        userContext,
        language,
      );

      const assistantMsg = {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Erro no chat financeiro:", error);

      const errorMsg = {
        role: "assistant",
        content:
          language === "pt"
            ? "Desculpe, tive um problema ao processar sua pergunta. Pode tentar novamente?"
            : "Sorry, I had a problem processing your question. Could you try again?",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Dispara mensagem proativa do coach quando o chat é aberto pela primeira vez
  const triggerProactiveInsight = (language = "pt") => {
    setMessages((prev) => {
      if (prev.length > 1 || proactiveInsights.length === 0) return prev;

      const top = proactiveInsights[0];
      const content =
        language === "pt"
          ? `💡 Antes de começarmos, notei algo importante: você gastou **${top.percentage}% a mais** em **${top.category}** este mês comparado à sua média dos últimos 3 meses (média: R$ ${top.average.toFixed(2)} · atual: R$ ${top.currentAmount.toFixed(2)}). Quer que eu sugira formas de reduzir esses gastos?`
          : `💡 Before we start, I noticed something: you spent **${top.percentage}% more** on **${top.category}** this month vs. your 3-month average (avg: $${top.average.toFixed(2)} · current: $${top.currentAmount.toFixed(2)}). Want me to suggest ways to reduce these expenses?`;

      return [
        ...prev,
        { role: "assistant", content, timestamp: new Date(), isCoach: true },
      ];
    });
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Olá! 👋 Sou seu assistente financeiro pessoal. Como posso ajudá-lo hoje?",
        timestamp: new Date(),
      },
    ]);
  };

  return {
    messages,
    sendMessage,
    clearChat,
    loading,
    proactiveInsights,
    triggerProactiveInsight,
  };
};

// Função auxiliar para encontrar categoria com maior gasto
function getTopCategory(transactions) {
  if (!transactions || transactions.length === 0) return "N/A";

  const categoryTotals = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const cat = t.category || "Other";
      categoryTotals[cat] =
        (categoryTotals[cat] || 0) + parseFloat(t.amount || 0);
    });

  const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
  return sorted.length > 0 ? sorted[0][0] : "N/A";
}
