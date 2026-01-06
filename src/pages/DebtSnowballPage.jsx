import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import CurrencyInput from "@/components/ui/currency-input";
import { CreditCard, Building2, Calculator, TrendingDown } from "lucide-react";
import { motion as Motion } from "framer-motion";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
// import { cn } from "@/lib/utils"; // Removed as unused

const DebtSnowballPage = () => {
  const { t } = useTranslation();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const formatCurrency = useCurrency();

  // Calculate current balances for all accounts
  const accountsWithBalance = useMemo(() => {
    return accounts.map((account) => {
      const accountTransactions = transactions.filter(
        (t) => t.accountId === account.id
      );
      const balance = accountTransactions.reduce((acc, curr) => {
        return curr.type === "income"
          ? acc + parseFloat(curr.amount)
          : acc - parseFloat(curr.amount);
      }, parseFloat(account.initialBalance || 0));
      return { ...account, balance };
    });
  }, [accounts, transactions]);

  // Filter debts: Credit Card or Loan with NEGATIVE balance
  const debts = useMemo(() => {
    return accountsWithBalance.filter(
      (acc) => (acc.type === "credit" || acc.type === "loan") && acc.balance < 0
    );
  }, [accountsWithBalance]);

  // State for calculator inputs per debt
  const [calculators, setCalculators] = useState({});

  const handleCalcChange = (id, field, value) => {
    setCalculators((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const calculatePayoff = (balance, payment, rate = 0) => {
    if (!payment || payment <= 0) return null;
    const principal = Math.abs(balance);
    const monthlyRate = rate / 100 / 12;

    if (monthlyRate === 0) {
      const months = Math.ceil(principal / payment);
      return { months, totalInterest: 0 };
    }

    // Formula: N = -log(1 - (r * P) / A) / log(1 + r)
    // P = Principal, A = Payment, r = monthly rate

    if (payment <= principal * monthlyRate) {
      return { error: "Payment too low to cover interest" };
    }

    const months = Math.ceil(
      -Math.log(1 - (monthlyRate * principal) / payment) /
        Math.log(1 + monthlyRate)
    );

    const totalPaid = months * payment; // Approximation
    const totalInterest = totalPaid - principal;

    return { months, totalInterest };
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingDown className="h-8 w-8 text-destructive" />
          {t("debt.title", "Gestão de Dívidas")}
        </h1>
        <p className="text-muted-foreground">
          {t(
            "debt.subtitle",
            "Planeje o pagamento de suas dívidas e fique livre delas."
          )}
        </p>
      </div>

      {debts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <TrendingDown className="h-6 w-6 text-green-600 rotate-180" />
            </div>
            <h3 className="text-lg font-semibold text-green-700">
              {t("debt.noDebts", "Parabéns! Nenhuma dívida encontrada.")}
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              {t(
                "debt.noDebtsDesc",
                "Suas contas de cartão e empréstimo estão positivas ou zeradas."
              )}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {debts.map((debt) => {
            const inputs = calculators[debt.id] || { payment: "", rate: "" };
            const result = calculatePayoff(
              debt.balance,
              parseFloat(inputs.payment),
              parseFloat(inputs.rate) || 0
            );

            return (
              <Motion.div key={debt.id} layout>
                <Card className="relative overflow-hidden border-t-4 border-t-destructive">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {debt.type === "loan" ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          {debt.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {t(`accounts.${debt.type}`)}
                        </p>
                      </div>
                      <PrivacyBlur className="text-xl font-bold text-destructive">
                        {formatCurrency(debt.balance)}
                      </PrivacyBlur>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        {t("debt.monthlyPayment", "Pagamento Mensal (R$)")}
                      </Label>
                      <CurrencyInput
                        value={inputs.payment}
                        onChange={(val) =>
                          handleCalcChange(debt.id, "payment", val)
                        }
                        placeholder="Ex: 500,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t("debt.interestRate", "Juros ao Ano (%)")}
                      </Label>
                      <Input
                        type="number"
                        value={inputs.rate}
                        onChange={(e) =>
                          handleCalcChange(debt.id, "rate", e.target.value)
                        }
                        placeholder="Ex: 12"
                      />
                    </div>

                    {result && !result.error && (
                      <div className="bg-muted p-4 rounded-lg space-y-2 animate-in fade-in zoom-in-95">
                        <div className="flex justify-between text-sm">
                          <span>
                            {t("debt.timeToPayoff", "Tempo Estimado")}:
                          </span>
                          <span className="font-bold text-primary">
                            {result.months} {t("debt.months", "meses")}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{t("debt.debtFreeDate", "Livre em")}:</span>
                          <span className="font-bold">
                            {new Date(
                              new Date().setMonth(
                                new Date().getMonth() + result.months
                              )
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {result.totalInterest > 0 && (
                          <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
                            <span>
                              + {t("debt.interest", "Juros Estimados")}:
                            </span>
                            <span>{formatCurrency(result.totalInterest)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {result && result.error && (
                      <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                        {t(
                          "debt.paymentTooLow",
                          "Pagamento insuficiente para cobrir os juros."
                        )}
                      </div>
                    )}

                    {!inputs.payment && (
                      <div className="text-xs text-center text-muted-foreground py-2">
                        {t(
                          "debt.enterPayment",
                          "Informe um valor mensal para simular."
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Motion.div>
            );
          })}
        </div>
      )}
    </Motion.div>
  );
};

export default DebtSnowballPage;
