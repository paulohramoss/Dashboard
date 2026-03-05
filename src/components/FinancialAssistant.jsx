import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFinancialChat } from "@/hooks/useFinancialChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, X, Send, Trash2, AlertTriangle } from "lucide-react";

export default function FinancialAssistant() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const {
    messages,
    sendMessage,
    clearChat,
    loading,
    proactiveInsights,
    triggerProactiveInsight,
  } = useFinancialChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const language =
        t("lang") === "pt" || window.navigator.language.startsWith("pt")
          ? "pt"
          : "en";
      triggerProactiveInsight(language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const message = inputValue;
    setInputValue("");

    const language =
      t("lang") === "pt" || window.navigator.language.startsWith("pt")
        ? "pt"
        : "en";
    await sendMessage(message, language);
  };

  const handleClearChat = () => {
    clearChat();
    setShowClearModal(false);
  };

  const suggestedQuestions = [
    t("assistant.q1", "Qual é o meu saldo atual?"),
    t("assistant.q2", "Como posso economizar este mês?"),
    t("assistant.q3", "Qual minha maior despesa?"),
    t("assistant.q4", "Dicas para organizar minhas finanças"),
  ];

  return (
    <>
      {/* Botão Flutuante */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative inline-flex">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-transform hover:scale-110"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Fechar chat" : "Abrir assistente de IA"}
          >
            <span className="text-3xl animate-pulse" role="img" aria-label="AI">
              ✨
            </span>
          </Button>
          {proactiveInsights.length > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center pointer-events-none shadow">
              {proactiveInsights.length}
            </span>
          )}
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-background border rounded-lg shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold">
                {t("assistant.title", "Assistente Financeiro")}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                onClick={() => setShowClearModal(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.isError
                      ? "bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100"
                      : msg.isCoach
                      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 border border-amber-200 dark:border-amber-800"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {msg.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (only show when chat is empty) */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">
                {t("assistant.suggested", "Perguntas sugeridas:")}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 2).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputValue(q)}
                    className="text-xs px-3 py-1 rounded-full bg-background border hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t(
                  "assistant.placeholder",
                  "Digite sua pergunta...",
                )}
                disabled={loading}
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Clear Chat Confirmation Modal */}
      <Dialog open={showClearModal} onOpenChange={setShowClearModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl">
                {t("assistant.clearModal.title", "Limpar Conversa?")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              {t(
                "assistant.clearModal.description",
                "Esta ação removerá todo o histórico de mensagens desta conversa. Você não poderá desfazer esta ação.",
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
              className="w-full sm:w-auto"
            >
              {t("common.cancel", "Cancelar")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearChat}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("assistant.clearModal.confirm", "Limpar Conversa")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
