import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Wallet,
  CreditCard,
  Landmark,
  Banknote,
  TrendingUp,
  Building2,
  Edit,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import CurrencyInput from "@/components/ui/currency-input";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
// import { cn } from "@/lib/utils"; // Removed as unused

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Draggable Card Component
const SortableAccountCard = ({ account, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const AccountsPage = () => {
  const { t } = useTranslation();
  const {
    accounts,
    addAccount,
    deleteAccount,
    updateAccount,
    reorderAccounts,
    loading,
  } = useAccounts();
  const { transactions } = useTransactions();
  // const { isPrivacyMode } = useLayout();
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "checking",
    initialBalance: 0,
    color: "#000000",
    closingDay: 1, // Default closing day for credit cards
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Reordering Logic
  const [isReordering, setIsReordering] = useState(false);
  const [orderedAccounts, setOrderedAccounts] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setOrderedAccounts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    await reorderAccounts(orderedAccounts);
    setIsReordering(false);
  };

  const handleCancelReorder = () => {
    setIsReordering(false);
    setOrderedAccounts(accounts);
  };

  const handleEditClick = (account) => {
    setEditingAccount({ ...account });
    setIsEditOpen(true);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!editingAccount.name) return;

    await updateAccount(editingAccount.id, {
      name: editingAccount.name,
      type: editingAccount.type,
      color: editingAccount.color,
      closingDay: editingAccount.closingDay,
    });

    setIsEditOpen(false);
    setEditingAccount(null);
  };

  const accountBalances = useMemo(() => {
    return accounts.map((account) => {
      const accountTransactions = transactions.filter(
        (t) => t.accountId === account.id,
      );
      const income = accountTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);
      const expense = accountTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      // Calculate transfers
      const transfersOut = transactions
        .filter((t) => t.type === "transfer" && t.accountId === account.id)
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      const transfersIn = transactions
        .filter(
          (t) => t.type === "transfer" && t.destinationAccountId === account.id,
        )
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      const currentBalance =
        (account.initialBalance || 0) +
        income -
        expense -
        transfersOut +
        transfersIn;

      return {
        ...account,
        currentBalance,
        invoiceValue:
          account.type === "credit"
            ? (account.initialBalance || 0) - currentBalance
            : 0,
      };
    });
  }, [accounts, transactions]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (
      !newAccount.name ||
      newAccount.initialBalance === "" ||
      newAccount.initialBalance === null ||
      newAccount.initialBalance === undefined
    )
      return;

    await addAccount({
      ...newAccount,
      initialBalance: parseFloat(newAccount.initialBalance),
      closingDay:
        newAccount.type === "credit"
          ? parseInt(newAccount.closingDay) || 1
          : null,
    });

    setNewAccount({
      name: "",
      type: "checking",
      initialBalance: 0,
      color: "#000000",
      closingDay: 1,
    });
    setIsAdding(false);
  };

  const confirmDelete = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (accountToDelete) {
      // Check for associated transactions
      const hasTransactions = transactions.some(
        (t) =>
          t.accountId === accountToDelete.id ||
          t.destinationAccountId === accountToDelete.id,
      );

      if (hasTransactions) {
        toast.error(t("accounts.deleteErrorHasTransactions"));
        setDeleteDialogOpen(false);
        setAccountToDelete(null);
        return;
      }

      await deleteAccount(accountToDelete.id);
      setAccountToDelete(null);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "checking":
        return <Landmark className="h-4 w-4" />;
      case "savings":
        return <Wallet className="h-4 w-4" />;
      case "credit":
        return <CreditCard className="h-4 w-4" />;
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "investment":
        return <TrendingUp className="h-4 w-4" />;
      case "loan":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("accounts.title")}
          </h2>
          <p className="text-muted-foreground">{t("accounts.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          {isReordering ? (
            <>
              <Button variant="outline" onClick={handleCancelReorder}>
                {t("accounts.cancelReorder")}
              </Button>
              <Button onClick={handleSaveOrder}>
                {t("accounts.saveOrder")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsReordering(true);
                  setOrderedAccounts(accounts);
                }}
              >
                {t("accounts.reorder")}
              </Button>
              <Button onClick={() => setIsAdding(!isAdding)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("accounts.addAccount")}
              </Button>
            </>
          )}
        </div>
      </div>

      {isAdding && (
        <Card className="animate-in slide-in-from-top-5">
          <CardContent className="pt-6">
            <form onSubmit={handleAddAccount} className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>{t("accounts.name")}</Label>
                <Input
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                  required
                />
              </div>

              {newAccount.type === "credit" && (
                <div className="w-[100px] space-y-2 animate-in fade-in slide-in-from-left-2">
                  <Label>{t("accounts.closingDay", "Fechamento")}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={newAccount.closingDay}
                    onChange={(e) =>
                      setNewAccount({
                        ...newAccount,
                        closingDay: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </div>
              )}
              <div className="w-[150px] space-y-2">
                <Label>{t("accounts.type")}</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newAccount.type}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, type: e.target.value })
                  }
                >
                  <option value="checking">{t("accounts.checking")}</option>
                  <option value="savings">{t("accounts.savings")}</option>
                  <option value="credit">{t("accounts.credit")}</option>
                  <option value="cash">{t("accounts.cash")}</option>
                  <option value="investment">{t("accounts.investment")}</option>
                  <option value="loan">
                    {t("accounts.loan", "Empréstimo")}
                  </option>
                </select>
              </div>
              <div className="w-[150px] space-y-2">
                <Label>
                  {newAccount.type === "credit"
                    ? t("accounts.limit", "Limite")
                    : t("accounts.initialBalance")}
                </Label>
                <CurrencyInput
                  value={newAccount.initialBalance}
                  onChange={(val) =>
                    setNewAccount({ ...newAccount, initialBalance: val })
                  }
                  required
                />
              </div>
              <div className="w-[80px] space-y-2">
                <Label>{t("accounts.color")}</Label>
                <Input
                  type="color"
                  className="h-10 p-1 cursor-pointer"
                  value={newAccount.color}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, color: e.target.value })
                  }
                />
              </div>
              <Button type="submit">{t("common.save")}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isReordering ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedAccounts.map((a) => a.id)}
                strategy={rectSortingStrategy}
              >
                {orderedAccounts.map((account) => {
                  const balanceInfo = accountBalances.find(
                    (b) => b.id === account.id,
                  );
                  return (
                    <SortableAccountCard key={account.id} account={account}>
                      <Card className="relative overflow-hidden group cursor-move hover:shadow-lg transition-shadow">
                        <div
                          className="absolute top-0 left-0 w-1 h-full"
                          style={{ backgroundColor: account.color }}
                        />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            {account.name}
                          </CardTitle>
                          <div className="text-muted-foreground">
                            {getIcon(account.type)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <PrivacyBlur className="text-2xl font-bold">
                            {formatCurrency(
                              balanceInfo ? balanceInfo.currentBalance : 0,
                            )}
                          </PrivacyBlur>
                          <p className="text-xs text-muted-foreground capitalize">
                            {account.type === "credit"
                              ? t(
                                  "accounts.availableLimit",
                                  "Limite Disponível",
                                )
                              : t(`accounts.${account.type}`)}
                          </p>
                          {account.type === "credit" && (
                            <div className="mt-2 pt-2 border-t text-sm flex justify-between">
                              <span className="text-muted-foreground">
                                {t("accounts.invoice", "Fatura")}:
                              </span>
                              <PrivacyBlur>
                                {formatCurrency(
                                  balanceInfo ? balanceInfo.invoiceValue : 0,
                                )}
                              </PrivacyBlur>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </SortableAccountCard>
                  );
                })}
              </SortableContext>
            </DndContext>
          ) : (
            accounts.map((account) => {
              const balanceInfo = accountBalances.find(
                (b) => b.id === account.id,
              );
              return (
                <Card
                  key={account.id}
                  className="relative overflow-hidden group transition-all hover:shadow-md"
                >
                  <div
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {account.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {getIcon(account.type)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEditClick(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => confirmDelete(account)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PrivacyBlur className="text-2xl font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(balanceInfo ? balanceInfo.currentBalance : 0)}
                    </PrivacyBlur>
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: account.color }}
                      />
                      <p className="text-xs text-muted-foreground capitalize">
                        {account.type === "credit"
                          ? t("accounts.availableLimit", "Limite Disponível")
                          : t(`accounts.${account.type}`)}
                      </p>
                    </div>

                    {account.type === "credit" && (
                      <div className="mt-4 pt-2 border-t text-sm flex justify-between items-center">
                        <span className="text-muted-foreground">
                          {t("accounts.invoice", "Fatura Atual")}:
                        </span>
                        <PrivacyBlur className="font-medium">
                          {formatCurrency(
                            balanceInfo ? balanceInfo.invoiceValue : 0,
                          )}
                        </PrivacyBlur>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("accounts.editTitle") || "Edit Account"}
            </DialogTitle>
          </DialogHeader>
          {editingAccount && (
            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("accounts.name")}</Label>
                <Input
                  value={editingAccount.name}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("accounts.type")}</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingAccount.type}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      type: e.target.value,
                    })
                  }
                  disabled={editingAccount.type === "credit"} // Disable if credit card
                >
                  <option value="checking">{t("accounts.checking")}</option>
                  <option value="savings">{t("accounts.savings")}</option>
                  <option value="credit">{t("accounts.credit")}</option>
                  <option value="cash">{t("accounts.cash")}</option>
                  <option value="investment">{t("accounts.investment")}</option>
                  <option value="loan">
                    {t("accounts.loan", "Empréstimo")}
                  </option>
                  <option value="loan">
                    {t("accounts.loan", "Empréstimo")}
                  </option>
                </select>
                {editingAccount.type === "credit" && (
                  <p className="text-xs text-muted-foreground">
                    {t("accounts.creditTypeLocked") ||
                      "Credit card type cannot be changed."}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("accounts.color")}</Label>
                <Input
                  type="color"
                  className="h-10 p-1 cursor-pointer"
                  value={editingAccount.color}
                  onChange={(e) =>
                    setEditingAccount({
                      ...editingAccount,
                      color: e.target.value,
                    })
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("accounts.saveAccount")}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={t("accounts.deleteTitle")}
        description={t("accounts.deleteDescription")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
      />
    </div>
  );
};

// Helper for formatting currency (can be moved to utils or shared)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

export default AccountsPage;
