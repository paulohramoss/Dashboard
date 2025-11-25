import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccounts } from "@/hooks/useAccounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Plus,
  Wallet,
  CreditCard,
  Banknote,
  Building2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const AccountsPage = () => {
  const { t } = useTranslation();
  const { accounts, addAccount, deleteAccount } = useAccounts();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "checking",
    color: "#3b82f6",
    initialBalance: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    addAccount({
      ...formData,
      initialBalance: parseFloat(formData.initialBalance) || 0,
    });

    setFormData({
      name: "",
      type: "checking",
      color: "#3b82f6",
      initialBalance: "",
    });
    setIsAdding(false);
  };

  const getIcon = (type) => {
    switch (type) {
      case "checking":
        return <Building2 className="h-6 w-6" />;
      case "savings":
        return <Wallet className="h-6 w-6" />;
      case "credit":
        return <CreditCard className="h-6 w-6" />;
      case "cash":
        return <Banknote className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("accounts.title")}
          </h2>
          <p className="text-muted-foreground">{t("accounts.subtitle")}</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" /> {t("accounts.addAccount")}
        </Button>
      </div>

      {isAdding && (
        <Card className="max-w-md mx-auto animate-in slide-in-from-top-5">
          <CardHeader>
            <CardTitle>{t("accounts.newAccount")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("accounts.name")}
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Nubank"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("accounts.type")}
                </label>
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="checking">{t("accounts.checking")}</option>
                  <option value="savings">{t("accounts.savings")}</option>
                  <option value="credit">{t("accounts.credit")}</option>
                  <option value="cash">{t("accounts.cash")}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("accounts.initialBalance")}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.initialBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, initialBalance: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("accounts.color")}
                </label>
                <div className="flex gap-2">
                  {[
                    "#3b82f6",
                    "#ef4444",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6",
                    "#ec4899",
                  ].map((color) => (
                    <div
                      key={color}
                      className={cn(
                        "w-8 h-8 rounded-full cursor-pointer border-2",
                        formData.color === color
                          ? "border-primary"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {t("common.save")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card key={account.id} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ backgroundColor: account.color }}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {account.name}
              </CardTitle>
              <div className={cn("text-muted-foreground")}>
                {getIcon(account.type)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(account.initialBalance)}
              </div>
              <p className="text-xs text-muted-foreground capitalize">
                {t(`accounts.${account.type}`)}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => deleteAccount(account.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AccountsPage;
