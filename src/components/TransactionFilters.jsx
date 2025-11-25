import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/useCategories";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

const TransactionFilters = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all",
    startDate: "",
    endDate: "",
  });

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
      startDate: "",
      endDate: "",
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="text-sm font-medium">
              {t("transactions.search")}
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("transactions.searchPlaceholder")}
                value={filters.search}
                onChange={(e) => handleChange("search", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2 w-full md:w-[180px]">
            <label className="text-sm font-medium">
              {t("transactions.form.type")}
            </label>
            <Select
              value={filters.type}
              onChange={(e) => handleChange("type", e.target.value)}
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
            >
              <option value="all">{t("transactions.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.isDefault
                    ? t(`categories.${cat.name.toLowerCase()}`)
                    : cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2 w-full md:w-auto">
            <label className="text-sm font-medium">
              {t("transactions.dateRange")}
            </label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="text-xs w-[130px]"
              />
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="text-xs w-[130px]"
              />
            </div>
          </div>

          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full md:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            {t("transactions.clearFilters")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFilters;
