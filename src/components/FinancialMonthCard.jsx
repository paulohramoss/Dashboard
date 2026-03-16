import React from "react";
import { useTranslation } from "react-i18next";
import { Wallet, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { useCurrency } from "@/hooks/useCurrency";

const FinancialMonthCard = ({ balance, income, expense }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  const canStillSpend = income - expense;
  const isPositive = canStillSpend >= 0;

  return (
    <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          {t("financialMonth.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Saldo atual */}
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {t("financialMonth.currentBalance")}
              </p>
              <PrivacyBlur className="text-xl font-bold text-foreground">
                {formatCurrency(balance)}
              </PrivacyBlur>
            </div>
          </div>

          {/* Você já gastou */}
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {t("financialMonth.alreadySpent")}
              </p>
              <PrivacyBlur className="text-xl font-bold text-red-600">
                {formatCurrency(expense)}
              </PrivacyBlur>
            </div>
          </div>

          {/* Você ainda pode gastar */}
          <div className="flex items-start gap-3">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                isPositive ? "bg-green-100" : "bg-orange-100"
              }`}
            >
              {isPositive ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {t("financialMonth.canStillSpend")}
              </p>
              <PrivacyBlur
                className={`text-xl font-bold ${
                  isPositive ? "text-green-600" : "text-orange-600"
                }`}
              >
                {isPositive
                  ? formatCurrency(canStillSpend)
                  : t("financialMonth.budgetExhausted")}
              </PrivacyBlur>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialMonthCard;
