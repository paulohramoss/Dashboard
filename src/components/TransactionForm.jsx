import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TransactionForm = ({ onAddTransaction }) => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
    frequency: "monthly",
    accountId: "",
  });

  // Filter categories based on selected type
  const availableCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === formData.type);
  }, [categories, formData.type]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const newAvailableCategories = categories.filter(
      (cat) => cat.type === newType
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

    const categoryToSubmit =
      formData.category || availableCategories[0]?.name || "";

    onAddTransaction({
      ...formData,
      category: categoryToSubmit,
      amount: parseFloat(formData.amount),
    });

    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: categories.filter((c) => c.type === "expense")[0]?.name || "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
      frequency: "monthly",
      accountId: "",
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
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
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
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("transactions.form.category")}
              </label>
              <Select
                value={formData.category || availableCategories[0]?.name || ""}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("accounts.title")}
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

          <div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isRecurring: checked })
                }
              />
              <Label htmlFor="recurring">
                {t("transactions.form.recurring")}
              </Label>
            </div>

            {formData.isRecurring && (
              <div className="flex-1 flex items-center space-x-2 animate-in fade-in slide-in-from-left-5">
                <Label htmlFor="frequency">
                  {t("transactions.form.frequency")}:
                </Label>
                <Select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-32 h-8"
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
