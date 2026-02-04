import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Sparkles } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useRules } from "@/hooks/useRules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import CurrencyInput from "@/components/ui/currency-input";
import MagicScan from "@/components/MagicScan";
import { getCurrentLocalDate } from "@/lib/utils";
import { parseInputDate } from "@/utils/dateUtils";
import { suggestCategory } from "@/lib/gemini";

const KEYWORD_MAP = {
  // Transport
  uber: { category: "Transport", type: "expense" },
  99: { category: "Transport", type: "expense" },
  taxi: { category: "Transport", type: "expense" },
  bus: { category: "Transport", type: "expense" },
  onibus: { category: "Transport", type: "expense" },
  metro: { category: "Transport", type: "expense" },
  gas: { category: "Transport", type: "expense" },
  fuel: { category: "Transport", type: "expense" },
  gasolina: { category: "Transport", type: "expense" },
  combustivel: { category: "Transport", type: "expense" },

  // Food
  supermarket: { category: "Food", type: "expense" },
  mercado: { category: "Food", type: "expense" },
  grocery: { category: "Food", type: "expense" },
  market: { category: "Food", type: "expense" },
  food: { category: "Food", type: "expense" },
  restaurante: { category: "Food", type: "expense" },
  ifood: { category: "Food", type: "expense" },
  pizza: { category: "Food", type: "expense" },
  burger: { category: "Food", type: "expense" },
  lunch: { category: "Food", type: "expense" },
  almoco: { category: "Food", type: "expense" },
  dinner: { category: "Food", type: "expense" },
  jantar: { category: "Food", type: "expense" },
  coffee: { category: "Food", type: "expense" },
  cafe: { category: "Food", type: "expense" },

  // Entertainment
  netflix: { category: "Entertainment", type: "expense" },
  spotify: { category: "Entertainment", type: "expense" },
  cinema: { category: "Entertainment", type: "expense" },
  movie: { category: "Entertainment", type: "expense" },
  game: { category: "Entertainment", type: "expense" },
  steam: { category: "Entertainment", type: "expense" },
  playstation: { category: "Entertainment", type: "expense" },
  xbox: { category: "Entertainment", type: "expense" },

  // Utilities
  water: { category: "Utilities", type: "expense" },
  agua: { category: "Utilities", type: "expense" },
  light: { category: "Utilities", type: "expense" },
  luz: { category: "Utilities", type: "expense" },
  internet: { category: "Utilities", type: "expense" },
  wifi: { category: "Utilities", type: "expense" },
  rent: { category: "Utilities", type: "expense" },
  aluguel: { category: "Utilities", type: "expense" },
  energy: { category: "Utilities", type: "expense" },
  energia: { category: "Utilities", type: "expense" },

  // Shopping
  amazon: { category: "General", type: "expense" },
  mercadolivre: { category: "General", type: "expense" },
  shopee: { category: "General", type: "expense" },
  zara: { category: "General", type: "expense" },
  nike: { category: "General", type: "expense" },

  // Salary
  salary: { category: "Salary", type: "income" },
  salario: { category: "Salary", type: "income" },
  freelance: { category: "Freelance", type: "income" },
  freela: { category: "Freelance", type: "income" },
};

const TransactionForm = ({
  onAddTransaction,
  initialData = null,
  isEditing = false,
  variant = "default", // "default" | "clean"
}) => {
  const { t, i18n } = useTranslation();
  const { categories, addCategory } = useCategories();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { rules, addRule } = useRules();

  const [formData, setFormData] = useState({
    description: initialData?.description || "",
    amount: initialData?.amount || "",
    type: initialData?.type || "expense",
    category:
      initialData?.category ||
      categories.filter((c) => c.type === "expense")[0]?.name ||
      "",
    date: initialData?.date || getCurrentLocalDate(),
    isRecurring: initialData?.isRecurring || false,
    frequency: initialData?.frequency || "monthly",
    isInstallment: initialData?.isInstallment || false,
    installmentsCount: initialData?.installmentsCount || 2,
    accountId: initialData?.accountId || "",
    destinationAccountId: initialData?.destinationAccountId || "", // Add this if missing in original state
  });

  const [aiLoading, setAiLoading] = useState(false);

  // Filter categories based on selected type and deduplicate by name
  // Filter categories based on selected type and deduplicate by translated name
  const availableCategories = useMemo(() => {
    const filtered = categories.filter((cat) => cat.type === formData.type);

    // Deduplicate based on translated name to avoid "Food" (Alimentação) and "Alimentação" appearing together
    return filtered.filter((cat, index, self) => {
      const catName = cat.isDefault
        ? t(`categories.${cat.name.toLowerCase()}`)
        : cat.name;

      return (
        index ===
        self.findIndex((c) => {
          const cName = c.isDefault
            ? t(`categories.${c.name.toLowerCase()}`)
            : c.name;
          return cName === catName;
        })
      );
    });
  }, [categories, formData.type, t]);

  const handleDescriptionChange = (e) => {
    const description = e.target.value;
    let newType = formData.type;
    let newCategory = formData.category;

    // Smart Categorization
    const lowerDesc = description.toLowerCase();

    // 1. Check Custom User Rules First (Priority)
    let matchFound = false;

    // We can assume rules are loaded.
    for (const rule of rules) {
      if (lowerDesc.includes(rule.keyword)) {
        // Verify category exists
        const categoryExists = categories.some(
          (c) => c.name === rule.category && c.type === rule.type,
        );
        if (categoryExists) {
          newType = rule.type;
          newCategory = rule.category;
          matchFound = true;
          break;
        }
      }
    }

    // 2. Fallback to Static Map if no custom rule matched
    if (!matchFound) {
      for (const [key, mapping] of Object.entries(KEYWORD_MAP)) {
        if (lowerDesc.includes(key)) {
          const categoryExists = categories.some(
            (c) => c.name === mapping.category && c.type === mapping.type,
          );

          if (categoryExists) {
            newType = mapping.type;
            newCategory = mapping.category;
            break; // Stop at first match
          }
        }
      }
    }

    setFormData({
      ...formData,
      description,
      type: newType,
      category: newCategory,
    });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const newAvailableCategories = categories
      .filter((cat) => cat.type === newType)
      .filter((cat, index, self) => {
        const catName = cat.isDefault
          ? t(`categories.${cat.name.toLowerCase()}`)
          : cat.name;

        return (
          index ===
          self.findIndex((c) => {
            const cName = c.isDefault
              ? t(`categories.${c.name.toLowerCase()}`)
              : c.name;
            return cName === catName;
          })
        );
      });

    setFormData({
      ...formData,
      type: newType,
      category: newAvailableCategories[0]?.name || "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.accountId)
      return;

    if (formData.type === "transfer" && !formData.destinationAccountId) {
      toast.error(t("transactions.errors.missingDestination"));
      return;
    }

    const categoryToSubmit =
      formData.type === "transfer"
        ? "Transfer"
        : formData.category || availableCategories[0]?.name || "";
    const amountValue = parseFloat(formData.amount);

    // Check for budget overflow
    if (formData.type === "expense") {
      const category = categories.find(
        (c) => c.name === categoryToSubmit && c.type === "expense",
      );

      if (category && category.budget > 0) {
        const transactionDate = parseInputDate(formData.date);
        const currentMonth = transactionDate.getMonth();
        const currentYear = transactionDate.getFullYear();

        const spent = transactions
          .filter(
            (t) =>
              t.type === "expense" &&
              t.category === categoryToSubmit &&
              new Date(t.date).getMonth() === currentMonth &&
              new Date(t.date).getFullYear() === currentYear,
          )
          .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

        if (spent + amountValue > category.budget) {
          toast.warning(t("budgets.budgetAlert"), {
            description: t("budgets.budgetExceeded", {
              category: categoryToSubmit,
            }),
            duration: 5000,
          });
        }
      }
    }

    onAddTransaction({
      ...formData,
      category: categoryToSubmit,
      amount: amountValue,
    });

    if (!isEditing) {
      setFormData({
        description: "",
        amount: "",
        type: "expense",
        category: categories.filter((c) => c.type === "expense")[0]?.name || "",
        date: getCurrentLocalDate(),
        isRecurring: false,
        frequency: "monthly",
        isInstallment: false,
        installmentsCount: 2,
        accountId: "",
        destinationAccountId: "",
      });
    }

    // Suggest saving a rule if one doesn't exist
    checkForRuleSuggestion(
      formData.description,
      categoryToSubmit,
      formData.type,
    );
  };

  const handleScanComplete = (data) => {
    setFormData((prev) => ({
      ...prev,
      amount: data.amount || prev.amount,
      date: data.date || prev.date,
      description: prev.description || "Recibo Escaneado", // Optional default
    }));
  };

  const handleAISuggest = async () => {
    if (!formData.description || formData.description.trim() === "") {
      toast.error(
        t("transactions.ai.noDescription", "Adicione uma descrição primeiro"),
      );
      return;
    }

    setAiLoading(true);
    try {
      // Detectar idioma usando i18n do componente
      const language = i18n.language.startsWith("pt") ? "pt" : "en";

      const result = await suggestCategory(
        formData.description,
        availableCategories,
        language,
      );

      // Sanitizar o nome da categoria removendo sufixos como (expense), (income), etc.
      const sanitizedCategoryName = result.category
        .replace(
          /\s*\((expense|income|transfer|despesa|receita|transferência)\)\s*/gi,
          "",
        )
        .trim();

      // Verificar se a categoria sugerida existe
      const suggestedCat = availableCategories.find(
        (c) => c.name.toLowerCase() === sanitizedCategoryName.toLowerCase(),
      );

      if (suggestedCat) {
        // Categoria existe - aplicar normalmente
        setFormData({ ...formData, category: suggestedCat.name });
        toast.success(
          t("transactions.ai.categorySuggested", "Categoria sugerida por IA"),
          {
            description:
              result.reasoning || `${suggestedCat.name} (${result.confidence})`,
            duration: 4000,
          },
        );
      } else {
        // Categoria NÃO existe - criar automaticamente
        const colorPalette = [
          "#ef4444",
          "#f97316",
          "#f59e0b",
          "#eab308",
          "#84cc16",
          "#22c55e",
          "#10b981",
          "#14b8a6",
          "#06b6d4",
          "#0ea5e9",
          "#3b82f6",
          "#6366f1",
          "#8b5cf6",
          "#a855f7",
          "#d946ef",
          "#ec4899",
          "#f43f5e",
        ];

        const randomColor =
          colorPalette[Math.floor(Math.random() * colorPalette.length)];

        // Criar a nova categoria com nome sanitizado
        await addCategory({
          name: sanitizedCategoryName,
          type: formData.type,
          color: randomColor,
          isDefault: false,
        });

        // Aplicar a categoria criada
        setFormData({ ...formData, category: sanitizedCategoryName });

        toast.success(
          t(
            "transactions.ai.categoryCreated",
            "Nova categoria criada pela IA! 🎉",
          ),
          {
            description: `${sanitizedCategoryName} - ${result.reasoning || t("transactions.ai.autoCreated", "Categoria criada automaticamente")}`,
            duration: 5000,
          },
        );
      }
    } catch (error) {
      console.error("Erro ao sugerir categoria com IA:", error);
      toast.error(t("transactions.ai.error", "Erro ao sugerir categoria"), {
        description: t(
          "transactions.ai.errorDesc",
          "Tente novamente ou selecione manualmente.",
        ),
      });
    } finally {
      setAiLoading(false);
    }
  };

  const checkForRuleSuggestion = (description, category, type) => {
    const lowerDesc = description.toLowerCase().trim();
    if (!lowerDesc) return;

    // 1. Check if covered by existing custom rules
    const hasCustomRule = rules.some((r) => lowerDesc.includes(r.keyword));
    if (hasCustomRule) return;

    // 2. Check if covered by hardcoded map
    const hasStaticRule = Object.keys(KEYWORD_MAP).some((key) =>
      lowerDesc.includes(key),
    );
    if (hasStaticRule) return;

    // 3. If no rule exists, prompt user
    toast(t("rules.suggestionTitle", "Sugestão de Regra Inteligente 💡"), {
      description: t("rules.suggestionDesc", {
        description,
        category,
        defaultValue: `Deseja sempre classificar "${description}" como "${category}"?`,
      }),
      action: {
        label: t("rules.save", "Salvar Regra"),
        onClick: () => {
          addRule({
            keyword: description, // Use the full description as keyword
            category,
            type,
          });
        },
      },
      duration: 8000,
    });
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="description">
            {t("transactions.form.description")}
          </label>
          <Input
            id="description"
            placeholder="e.g. Grocery Shopping"
            value={formData.description}
            onChange={handleDescriptionChange}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="amount">
            {t("transactions.form.amount")}
          </label>
          <div className="flex gap-2">
            <CurrencyInput
              id="amount"
              value={formData.amount}
              onChange={(val) => setFormData({ ...formData, amount: val })}
              placeholder="R$ 0,00"
              required
              className="flex-1 h-11"
            />
            <MagicScan onScanComplete={handleScanComplete} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="type">
            {t("transactions.form.type")}
          </label>
          <Select
            id="type"
            value={formData.type}
            onChange={handleTypeChange}
            className="h-11"
          >
            <option value="expense">{t("transactions.form.expense")}</option>
            <option value="income">{t("transactions.form.income")}</option>
            <option value="transfer">{t("transactions.form.transfer")}</option>
          </Select>
        </div>

        {formData.type !== "transfer" && (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="category">
              {t("transactions.form.category")}
            </label>
            <div className="flex gap-2">
              <Select
                id="category"
                value={formData.category || availableCategories[0]?.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="h-11 flex-1"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.isDefault
                      ? t(`categories.${cat.name.toLowerCase()}`)
                      : cat.name}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAISuggest}
                disabled={aiLoading || !formData.description}
                className="h-11 w-11 shrink-0"
                title={t(
                  "transactions.ai.suggestCategory",
                  "Sugerir categoria com IA",
                )}
              >
                {aiLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="accountId">
            {formData.type === "transfer"
              ? t("transactions.form.sourceAccount")
              : t("accounts.title")}
          </label>
          <Select
            id="accountId"
            value={formData.accountId}
            onChange={(e) =>
              setFormData({ ...formData, accountId: e.target.value })
            }
            required
            className="h-11"
          >
            <option value="">{t("transactions.form.selectAccount")}</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </Select>
        </div>

        {formData.type === "transfer" && (
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="destinationAccountId"
            >
              {accounts.find((a) => a.id === formData.destinationAccountId)
                ?.type === "credit"
                ? t("transactions.form.paymentInfo", "Pagar Fatura do Cartão:") // Custom label
                : t("transactions.form.destinationAccount")}
            </label>
            <Select
              id="destinationAccountId"
              value={formData.destinationAccountId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  destinationAccountId: e.target.value,
                })
              }
              required
              className="h-11"
            >
              <option value="">{t("transactions.form.selectAccount")}</option>
              {accounts
                .filter((acc) => acc.id !== formData.accountId)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}{" "}
                    {acc.type === "credit"
                      ? `(${t("accounts.credit", "Cartão")})`
                      : ""}
                  </option>
                ))}
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="date">
            {t("transactions.form.date")}
          </label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className="h-11"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isRecurring: checked,
                  isInstallment: checked ? false : formData.isInstallment,
                })
              }
            />
            <Label htmlFor="recurring">
              {t("transactions.form.recurring")}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="installment"
              checked={formData.isInstallment}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isInstallment: checked,
                  isRecurring: checked ? false : formData.isRecurring,
                })
              }
            />
            <Label htmlFor="installment">
              {t("transactions.form.isInstallment")}
            </Label>
          </div>
        </div>

        {formData.isRecurring && (
          <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <Label htmlFor="frequency">
              {t("transactions.form.frequency")}:
            </Label>
            <Select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({ ...formData, frequency: e.target.value })
              }
              className="w-[180px] h-10"
            >
              <option value="daily">{t("transactions.form.daily")}</option>
              <option value="weekly">{t("transactions.form.weekly")}</option>
              <option value="monthly">{t("transactions.form.monthly")}</option>
              <option value="yearly">{t("transactions.form.yearly")}</option>
            </Select>
          </div>
        )}

        {formData.isInstallment && (
          <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
            <Label htmlFor="installments">
              {t("transactions.form.installments")}:
            </Label>
            <Input
              type="number"
              id="installments"
              min="2"
              max="99"
              value={formData.installmentsCount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  installmentsCount: parseInt(e.target.value) || 2,
                })
              }
              className="w-20 h-10"
            />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full h-11 md:h-10 touch-target">
        {isEditing ? (
          <>
            <Pencil className="mr-2 h-4 w-4" /> {t("common.save", "Salvar")}
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" /> {t("transactions.form.add")}
          </>
        )}
      </Button>
    </form>
  );

  if (variant === "clean") {
    return FormContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("transactions.addTransaction")}</CardTitle>
      </CardHeader>
      <CardContent>{FormContent}</CardContent>
    </Card>
  );
};

export default TransactionForm;
