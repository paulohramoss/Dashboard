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
import CurrencyInput from "@/components/ui/currency-input";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";

const AccountsPage = () => {
  const { t } = useTranslation();
  const { accounts, addAccount, deleteAccount, updateAccount, loading } =
    useAccounts();
  const { transactions } = useTransactions();
  const { isPrivacyMode } = useLayout();
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "checking",
    initialBalance: "",
    color: "#000000",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

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
    });

    setIsEditOpen(false);
    setEditingAccount(null);
  };

  const accountBalances = useMemo(() => {
    return accounts.map((account) => {
      const accountTransactions = transactions.filter(
        (t) => t.accountId === account.id
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
          (t) => t.type === "transfer" && t.destinationAccountId === account.id
        )
        .reduce((acc, t) => acc + parseFloat(t.amount), 0);

      return {
        ...account,
        currentBalance:
          (account.initialBalance || 0) +
          income -
          expense -
          transfersOut +
          transfersIn,
      };
    });
  }, [accounts, transactions]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.name || newAccount.initialBalance === "") return;

    await addAccount({
      ...newAccount,
      initialBalance: parseFloat(newAccount.initialBalance),
    });

    setNewAccount({
      name: "",
      type: "checking",
      initialBalance: "",
      color: "#000000",
    });
    setIsAdding(false);
  };

  const confirmDelete = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (accountToDelete) {
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
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("accounts.title")}
          </h2>
          <p className="text-muted-foreground">{t("accounts.subtitle")}</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("accounts.addAccount")}
        </Button>
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
                </select>
              </div>
              <div className="w-[150px] space-y-2">
                <Label>{t("accounts.initialBalance")}</Label>
                <CurrencyInput
                  value={newAccount.initialBalance}
                  onChange={(val) =>
                    setNewAccount({ ...newAccount, initialBalance: val })
                  }
                  placeholder="R$ 0,00"
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
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
          </>
        ) : (
          accountBalances.map((account) => (
            <Card key={account.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {account.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getIcon(account.type)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => handleEditClick(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => confirmDelete(account)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    isPrivacyMode && "privacy-blur"
                  )}
                >
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(account.currentBalance)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: account.color }}
                  />
                  <p className="text-xs text-muted-foreground capitalize">
                    {t(`accounts.${account.type}`)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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

export default AccountsPage;
