import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

const TransactionFilters = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    accountId: "all",
    startDate: "",
    endDate: "",
  });

  // Deduplicate categories based on name
  const uniqueCategories = React.useMemo(() => {
    const seen = new Set();
    return categories.filter((cat) => {
      const duplicate = seen.has(cat.name);
      seen.add(cat.name);
      return !duplicate;
    });
  }, [categories]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      category: "all",
      accountId: "all",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 items-stretch md:items-end">
          <div className="space-y-2 flex-1 min-w-full md:min-w-[200px]">
            <label className="text-sm font-medium">
              {t("transactions.search")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("transactions.searchPlaceholder")}
                value={filters.search}
                onChange={(e) => handleChange("search", e.target.value)}
                className="pl-9 h-11"
              />
            </div>
          </div>

          <div className="space-y-2 w-full md:w-[180px]">
            <label className="text-sm font-medium">
              {t("common.account") || "Conta"}
            </label>
            <Select
              value={filters.accountId}
              onChange={(e) => handleChange("accountId", e.target.value)}
              className="h-11"
            >
              <option value="all">
                {t("common.allAccounts") || "Todas as Contas"}
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2 w-full md:w-[180px]">
            <label className="text-sm font-medium">
              {t("transactions.form.type")}
            </label>
            <Select
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="h-11"
            >
              <option value="all">{t("transactions.allTypes")}</option>
              <option value="income">{t("transactions.form.income")}</option>
              <option value="expense">{t("transactions.form.expense")}</option>
            </Select>
          </div>

          <div className="space-y-2 w-full md:w-[180px]">
            <label className="text-sm font-medium">
              {t("transactions.form.category")}
            </label>
            <Select
              value={filters.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="h-11"
            >
              <option value="all">{t("transactions.allCategories")}</option>
              {uniqueCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.isDefault
                    ? t(`categories.${cat.name.toLowerCase()}`)
                    : cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2 w-full md:w-auto md:flex-1">
            <label className="text-sm font-medium">
              {t("transactions.dateRange")}
            </label>
            <div className="grid grid-cols-2 md:flex gap-2">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="w-full md:w-[140px] h-11"
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="w-full md:w-[140px] h-11"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full md:w-auto h-11 touch-target"
          >
            <X className="mr-2 h-4 w-4" />
            <span className="md:inline">{t("transactions.clearFilters")}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
