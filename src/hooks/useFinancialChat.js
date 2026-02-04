import { useState } from "react";
import { answerFinancialQuestion } from "@/lib/gemini";
import { useTransactions } from "@/hooks/useTransactions";

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

  const sendMessage = async (userMessage, language = "pt") => {
    if (!userMessage || userMessage.trim() === "") return;

    // Adicionar mensagem do usuário
    const userMsg = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      // Preparar contexto financeiro do usuário
      const userContext = {
        balance: parseFloat(stats?.balance || 0),
        income: parseFloat(stats?.income || 0),
        expense: parseFloat(stats?.expense || 0),
        recentTransactions: transactions.slice(0, 10),
        topCategory: getTopCategory(transactions),
      };

      // Obter resposta do Gemini
      const answer = await answerFinancialQuestion(
        userMessage,
        userContext,
        language,
      );

      // Adicionar resposta do assistente
      const assistantMsg = {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Erro no chat financeiro:", error);

      // Mensagem de erro amigável
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
