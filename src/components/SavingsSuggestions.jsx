import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import { analyzeSavingsOpportunities } from "@/lib/gemini";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Lightbulb, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function SavingsSuggestions() {
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeSavings = async () => {
    setLoading(true);
    try {
      const language =
        t("lang") === "pt" || window.navigator.language.startsWith("pt")
          ? "pt"
          : "en";

      const result = await analyzeSavingsOpportunities(
        transactions,
        30, // últimos 30 dias
        language,
      );

      setSuggestions(result);
      toast.success(t("savings.generated", "Sugestões geradas!"));
    } catch (error) {
      console.error("Erro ao analisar sugestões de economia:", error);
      toast.error(t("savings.error", "Erro ao gerar sugestões"), {
        description: t("savings.errorDesc", "Tente novamente mais tarde."),
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-load ao montar (opcional)
  useEffect(() => {
    if (transactions.length > 0 && !suggestions) {
      // Pequeno delay para não sobrecarregar na primeira carga
      const timer = setTimeout(() => analyzeSavings(), 2000);
      return () => clearTimeout(timer);
    }
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            {t("savings.title", "Sugestões de Economia")}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={analyzeSavings}
            disabled={loading || transactions.length === 0}
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t("savings.analyzing", "Analisando...")}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t("savings.refresh", "Atualizar")}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!suggestions ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Lightbulb className="h-12 w-12 mb-4 opacity-50 text-yellow-500" />
            <p className="text-sm max-w-sm">
              {loading
                ? t("savings.loading", "Analisando seus padrões de gastos...")
                : t(
                    "savings.cta",
                    "Receba dicas personalizadas para economizar baseadas nos seus hábitos.",
                  )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">
                {t("savings.analyzed", "Últimos")} {suggestions.analyzedDays}{" "}
                {t("savings.days", "dias")}
              </div>
              <div className="text-2xl font-bold">
                R$ {suggestions.totalSpent?.toFixed(2) || "0.00"}
              </div>
              <div className="text-xs text-muted-foreground">
                {suggestions.transactionCount}{" "}
                {t("savings.transactionsAnalyzed", "transações analisadas")}
              </div>
            </div>

            {/* Sugestões */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("savings.suggestions", "Recomendações Personalizadas")}
              </h4>
              {suggestions.suggestions && suggestions.suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t(
                    "savings.noSuggestions",
                    "Nenhuma sugestão disponível no momento.",
                  )}
                </p>
              )}
            </div>

            {/* Footer motivacional */}
            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground italic">
                💡{" "}
                {t(
                  "savings.tip",
                  "Pequenas mudanças podem gerar grandes economias ao longo do tempo!",
                )}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
