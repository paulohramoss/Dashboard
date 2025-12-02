import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

import CurrencyInput from "@/components/ui/currency-input";

const TransactionForm = ({ onAddTransaction }) => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    frequency: "monthly",
    isInstallment: false,
    installmentsCount: 2,
    accountId: "",
  });

  // Filter categories based on selected type and deduplicate by name
  const availableCategories = useMemo(() => {
    const filtered = categories.filter((cat) => cat.type === formData.type);
    return filtered.filter(
      (cat, index, self) => index === self.findIndex((t) => t.name === cat.name)
    );
  }, [categories, formData.type]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const newAvailableCategories = categories
      .filter((cat) => cat.type === newType)
      .filter(
        (cat, index, self) =>
          index === self.findIndex((t) => t.name === cat.name)
      );

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
        (c) => c.name === categoryToSubmit && c.type === "expense"
      );

      if (category && category.budget > 0) {
        const transactionDate = new Date(formData.date);
        const currentMonth = transactionDate.getMonth();
        const currentYear = transactionDate.getFullYear();

        const spent = transactions
          .filter(
            (t) =>
              t.type === "expense" &&
              t.category === categoryToSubmit &&
              new Date(t.date).getMonth() === currentMonth &&
              new Date(t.date).getFullYear() === currentYear
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

    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: categories.filter((c) => c.type === "expense")[0]?.name || "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      frequency: "monthly",
      isInstallment: false,
      installmentsCount: 2,
      accountId: "",
      destinationAccountId: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("transactions.addTransaction")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("transactions.form.description")}
              </label>
              <Input
                placeholder="e.g. Grocery Shopping"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("transactions.form.amount")}
              </label>
              <CurrencyInput
                value={formData.amount}
                onChange={(val) => setFormData({ ...formData, amount: val })}
                placeholder="R$ 0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("transactions.form.type")}
              </label>
              <Select value={formData.type} onChange={handleTypeChange}>
                <option value="expense">
                  {t("transactions.form.expense")}
                </option>
                <option value="income">{t("transactions.form.income")}</option>
                <option value="transfer">
                  {t("transactions.form.transfer")}
                </option>
              </Select>
            </div>

            {formData.type !== "transfer" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("transactions.form.category")}
                </label>
                <Select
                  value={
                    formData.category || availableCategories[0]?.name || ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.isDefault
                        ? t(`categories.${cat.name.toLowerCase()}`)
                        : cat.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {formData.type === "transfer"
                  ? t("transactions.form.sourceAccount")
                  : t("accounts.title")}
              </label>
              <Select
                value={formData.accountId}
                onChange={(e) =>
                  setFormData({ ...formData, accountId: e.target.value })
                }
                required
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
                <label className="text-sm font-medium">
                  {t("transactions.form.destinationAccount")}
                </label>
                <Select
                  value={formData.destinationAccountId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinationAccountId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    {t("transactions.form.selectAccount")}
                  </option>
                  {accounts
                    .filter((acc) => acc.id !== formData.accountId)
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("transactions.form.date")}
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
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
                  className="w-auto h-8 min-w-[120px]"
                >
                  <option value="daily">{t("transactions.form.daily")}</option>
                  <option value="weekly">
                    {t("transactions.form.weekly")}
                  </option>
                  <option value="monthly">
                    {t("transactions.form.monthly")}
                  </option>
                  <option value="yearly">
                    {t("transactions.form.yearly")}
                  </option>
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
                  className="w-20 h-8"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> {t("transactions.form.add")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
