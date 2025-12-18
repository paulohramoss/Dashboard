import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Repeat,
  Ghost,
} from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { cn, formatDateToLocal } from "@/lib/utils";
import { useLayout } from "@/context/LayoutContext";

import { useCurrency } from "@/hooks/useCurrency";

const TransactionHistory = ({ transactions, onDelete }) => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const { isPrivacyMode } = useLayout();
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const formatCurrency = useCurrency();

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString) => {
    return formatDateToLocal(dateString);
  };

  const getCategoryLabel = (categoryName) => {
    const category = categories.find((c) => c.name === categoryName);
    if (category?.isDefault) {
      return t(`categories.${categoryName.toLowerCase()}`);
    }
    return categoryName;
  };

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>{t("transactions.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("transactions.noTransactions")}
            </p>
          ) : (
            transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-3 md:p-4 rounded-lg border transition-colors",
                  transaction.isShadow
                    ? "bg-muted/30 border-dashed border-primary/30"
                    : "bg-card hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      transaction.type === "income"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600",
                      transaction.isShadow && "opacity-70"
                    )}
                  >
                    {transaction.type === "income" ? (
                      <ArrowUpCircle className="h-6 w-6" />
                    ) : (
                      <ArrowDownCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {transaction.description}
                      </p>
                      {transaction.isShadow && (
                        <Ghost className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(transaction.date)}</span>
                      <span>•</span>
                      <span className="truncate">
                        {getCategoryLabel(transaction.category)}
                      </span>
                      {transaction.isRecurring && (
                        <Repeat className="h-3 w-3 ml-1 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                  <span
                    className={cn(
                      "font-bold whitespace-nowrap",
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600",
                      transaction.isShadow && "opacity-70",
                      isPrivacyMode && "privacy-blur"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteClick(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("transactions.confirmDeleteTitle")}
        description={t("transactions.confirmDeleteDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />
    </Card>
  );
};

export default TransactionHistory;
