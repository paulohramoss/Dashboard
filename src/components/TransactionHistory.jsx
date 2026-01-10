import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Repeat,
  Ghost,
  Pencil,
} from "lucide-react";
import { Users } from "lucide-react"; // Import Users for the avatar fallback
import { useCategories } from "@/hooks/useCategories";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { cn, formatDateToLocal } from "@/lib/utils";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { useCurrency } from "@/hooks/useCurrency";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";

const TransactionRow = ({
  data,
  index,
  style,
  onEdit,
  onDelete,
  formatCurrency,
  getCategoryLabel,
  formatDate,
  currentUser,
}) => {
  const transaction = data[index];
  const isOwner = currentUser?.id === transaction.userId;

  return (
    <div style={style}>
      <div
        className={cn(
          "flex items-center justify-between p-3 md:p-4 rounded-lg border transition-colors mx-1 mb-2", // Added margin for spacing simulation
          transaction.isShadow
            ? "bg-muted/30 border-dashed border-primary/30"
            : "bg-card hover:bg-accent/50"
        )}
        style={{ height: "calc(100% - 8px)" }} // Adjust height to account for faux gap
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative">
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
            {/* Show creator avatar if not current user */}
            {!isOwner && transaction.userId && (
              <div
                className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-muted"
                title="Created by partner"
              >
                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                  {/* Ideally we would have user check, for now simple initial of ID or generic icon if we don't have name */}
                  <Users className="h-2.5 w-2.5" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{transaction.description}</p>
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
          <PrivacyBlur
            className={cn(
              "font-bold whitespace-nowrap",
              transaction.type === "income" ? "text-green-600" : "text-red-600",
              transaction.isShadow && "opacity-70"
            )}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </PrivacyBlur>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={() => onEdit && onEdit(transaction)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const TransactionHistory = ({
  transactions,
  onDelete,
  onEdit,
  limit,
  className,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { categories } = useCategories();
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

  // Wrapper for Row to pass extra props
  const Row = ({ index, style }) => (
    <TransactionRow
      data={transactions}
      index={index}
      style={style}
      onEdit={onEdit}
      onDelete={handleDeleteClick}
      formatCurrency={formatCurrency}
      getCategoryLabel={getCategoryLabel}
      formatDate={formatDate}
      currentUser={user}
    />
  );

  return (
    <Card
      className={cn("col-span-4 lg:col-span-3 h-full flex flex-col", className)}
    >
      <CardHeader>
        <CardTitle>{t("transactions.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 md:p-6 pt-0">
        <div className="space-y-4 h-full">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("transactions.noTransactions")}
            </p>
          ) : limit || transactions.length < 50 ? (
            // Simple map for Dashboard or small lists
            <div className="space-y-2">
              {transactions
                .slice(0, limit || transactions.length)
                .map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    data={transactions}
                    index={index}
                    style={{}} // No absolute positioning needed here
                    onEdit={onEdit}
                    onDelete={handleDeleteClick}
                    formatCurrency={formatCurrency}
                    getCategoryLabel={getCategoryLabel}
                    formatDate={formatDate}
                    currentUser={user}
                  />
                ))}
            </div>
          ) : (
            // Virtualized list for large history
            <div className="h-[600px] w-full">
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    height={height}
                    width={width}
                    itemCount={transactions.length}
                    itemSize={90} // Adjusted height + gap
                    className="no-scrollbar"
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            </div>
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
