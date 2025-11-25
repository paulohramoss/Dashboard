import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TransactionForm = ({ onAddTransaction }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: "General",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    onAddTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
    });

    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "General",
      date: new Date().toISOString().split("T")[0],
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
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
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
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="General">General</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Salary">Salary</option>
                <option value="Freelance">Freelance</option>
                <option value="Other">Other</option>
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
          <Button type="submit" className="w-full">
            <Plus className="mr-2 h-4 w-4" /> {t("transactions.form.add")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
