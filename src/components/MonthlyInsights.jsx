import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTransactions } from "@/hooks/useTransactions";
import { generateMonthlyInsights } from "@/lib/gemini";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function MonthlyInsights() {
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtrar transações do mês atual
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      return (
        tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear
      );
    });
  }, [transactions]);

  const generateInsights = async () => {
    if (currentMonthTransactions.length === 0) {
      toast.info(t("insights.noData", "Sem dados suficientes para análise"));
      return;
    }

    setLoading(true);
    try {
      const language =
        t("lang") === "pt" || window.navigator.language.startsWith("pt")
          ? "pt"
          : "en";

      const result = await generateMonthlyInsights(
        currentMonthTransactions,
        language,
      );

      setInsights(result);
      toast.success(t("insights.generated", "Análise gerada com sucesso!"));
    } catch (error) {
      console.error("Erro ao gerar insights:", error);
      toast.error(t("insights.error", "Erro ao gerar análise"), {
        description: t("insights.errorDesc", "Tente novamente mais tarde."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t("insights.title", "Análise Mensal com IA")}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={generateInsights}
            disabled={loading || currentMonthTransactions.length === 0}
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t("insights.analyzing", "Analisando...")}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t("insights.generate", "Gerar Análise")}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm max-w-sm">
              {currentMonthTransactions.length === 0
                ? t(
                    "insights.empty",
                    "Adicione transações para receber insights personalizados sobre seus gastos.",
                  )
                : t(
                    "insights.cta",
                    'Clique em "Gerar Análise" para receber insights personalizados sobre seus gastos deste mês.',
                  )}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Estatísticas Resumidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="text-xs text-green-700 dark:text-green-300 font-medium">
                  {t("insights.income", "Receitas")}
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  R$ {insights.totalIncome?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <div className="text-xs text-red-700 dark:text-red-300 font-medium">
                  {t("insights.expenses", "Despesas")}
                </div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  R$ {insights.totalExpense?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div
                className={`${insights.balance >= 0 ? "bg-green-50 dark:bg-green-900/20" : "bg-orange-50 dark:bg-orange-900/20"} p-3 rounded-lg`}
              >
                <div
                  className={`text-xs ${insights.balance >= 0 ? "text-green-700 dark:text-green-300" : "text-orange-700 dark:text-orange-300"} font-medium`}
                >
                  {t("insights.balance", "Saldo")}
                </div>
                <div
                  className={`text-lg font-bold ${insights.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}
                >
                  R$ {insights.balance?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  {t("insights.transactions", "Transações")}
                </div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {insights.transactionCount || 0}
                </div>
              </div>
            </div>

            {/* Top Categorias */}
            {insights.topCategories && insights.topCategories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  {t("insights.topCategories", "Top Categorias de Despesa")}
                </h4>
                <div className="space-y-2">
                  {insights.topCategories.slice(0, 3).map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{cat.name}</span>
                      <span className="font-medium">
                        R$ {cat.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights do Gemini */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t("insights.aiAnalysis", "Análise Inteligente")}
              </h4>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {insights.summary}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
