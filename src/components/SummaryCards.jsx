import React from "react";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { useCurrency, formatCompactAmount } from "@/hooks/useCurrency";

export const BalanceCard = ({ amount }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <div
      className="relative rounded-[20px] overflow-hidden flex flex-col justify-end h-full min-h-[210px] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
      style={{ background: "#1a35f0" }}
    >
      {/* Hand watermark — right side */}
      <svg
        className="absolute right-0 top-0 bottom-0 h-full pointer-events-none"
        style={{ width: "55%", opacity: 0.09 }}
        viewBox="0 0 200 210"
        preserveAspectRatio="xMaxYMid meet"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M100,200 C80,200 60,185 55,165 L40,95 C38,82 46,72 58,74 C62,74 66,77 68,82" strokeWidth="8"/>
        <path d="M68,82 L62,38 C60,25 70,17 80,21 C88,24 90,34 90,43 L90,85" strokeWidth="8"/>
        <path d="M90,85 L88,30 C87,17 98,10 107,15 C115,19 116,30 116,39 L116,87" strokeWidth="8"/>
        <path d="M116,87 L116,27 C116,14 128,8 137,13 C145,18 146,29 145,38 L142,95" strokeWidth="8"/>
        <path d="M128,100 L130,33 C131,20 143,15 151,21 C158,26 158,37 157,46 L153,100" strokeWidth="8"/>
        <circle cx="129" cy="72" r="11" strokeWidth="6"/>
        <path d="M137,13 L141,8" strokeWidth="5"/>
        <path d="M148,17 L154,13" strokeWidth="5"/>
        <path d="M152,26 L160,22" strokeWidth="4"/>
        <path d="M55,165 C55,182 68,200 88,200 L115,200 C130,200 142,188 142,175 L142,155" strokeWidth="8"/>
      </svg>

      {/* Top block: lime left + icon right */}
      <div className="absolute top-0 left-0 right-0 flex items-stretch" style={{ height: 110 }}>
        {/* Lime block */}
        <div
          className="relative overflow-hidden flex flex-col justify-end p-3"
          style={{ width: "42%", background: "#c8f000" }}
        >
          <div
            className="relative z-10 font-black text-[#111] uppercase leading-[0.92]"
            style={{ fontSize: 26, letterSpacing: "-0.03em" }}
          >
            SEU<br />SALDO.
          </div>
          {/* Dot grid */}
          <svg className="absolute bottom-0 right-0 pointer-events-none" style={{ width: 72, height: 72, opacity: 0.18 }} viewBox="0 0 80 80">
            <g fill="#111">
              {[10,25,40,55,70].flatMap((x) =>
                [10,25,40,55,70].map((y) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" />
                ))
              )}
            </g>
          </svg>
        </div>

        {/* Blue right — icon */}
        <div className="flex-1 flex items-start justify-end p-4">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.14)" }}
          >
            <Wallet className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      {/* Bottom: label + value + sub */}
      <div className="relative z-10 px-5 pb-5 pt-4">
        <p
          className="text-[10px] font-bold uppercase mb-1"
          style={{ letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)" }}
        >
          {t("dashboard.totalBalance")}
        </p>
        <PrivacyBlur
          className="block font-black text-white leading-none tracking-tight truncate"
          style={{ fontSize: 38, letterSpacing: "-0.03em" }}
          title={formatCurrency(amount)}
        >
          {formatCompactAmount(amount)}
        </PrivacyBlur>
        <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          Atualizado agora
        </p>
      </div>
    </div>
  );
};

export const IncomeCard = ({ amount }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <Card className="relative overflow-hidden h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/60 dark:to-green-950/50 border-emerald-100 dark:border-emerald-900/50">
      <div className="absolute -top-5 -right-5 h-24 w-24 rounded-full bg-emerald-100/70 dark:bg-emerald-900/30 pointer-events-none" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-emerald-800/70 dark:text-emerald-200/70 uppercase tracking-widest">
            {t("dashboard.income")}
          </CardTitle>
          <div className="h-10 w-10 rounded-2xl bg-emerald-500 shadow-md shadow-emerald-200/60 dark:shadow-emerald-900/60 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-0 overflow-hidden">
        <PrivacyBlur
          className="block truncate text-3xl font-bold text-emerald-800 dark:text-emerald-100 tracking-tight"
          title={formatCurrency(amount)}
        >
          {formatCompactAmount(amount)}
        </PrivacyBlur>
        <div className="flex items-center gap-1 mt-1.5">
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs text-emerald-700/60 dark:text-emerald-300/60 font-medium">
            este mês
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export const ExpenseCard = ({ amount }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  return (
    <Card className="relative overflow-hidden h-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br from-rose-50 to-red-100 dark:from-rose-950/60 dark:to-red-950/50 border-rose-100 dark:border-rose-900/50">
      <div className="absolute -top-5 -right-5 h-24 w-24 rounded-full bg-rose-100/70 dark:bg-rose-900/30 pointer-events-none" />

      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-rose-800/70 dark:text-rose-200/70 uppercase tracking-widest">
            {t("dashboard.expenses")}
          </CardTitle>
          <div className="h-10 w-10 rounded-2xl bg-rose-500 shadow-md shadow-rose-200/60 dark:shadow-rose-900/60 flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-0 overflow-hidden">
        <PrivacyBlur
          className="block truncate text-3xl font-bold text-rose-800 dark:text-rose-100 tracking-tight"
          title={formatCurrency(amount)}
        >
          {formatCompactAmount(amount)}
        </PrivacyBlur>
        <div className="flex items-center gap-1 mt-1.5">
          <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          <span className="text-xs text-rose-700/60 dark:text-rose-300/60 font-medium">
            este mês
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const SummaryCards = ({ stats }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <BalanceCard amount={stats.balance} />
      <IncomeCard amount={stats.income} />
      <ExpenseCard amount={stats.expense} />
    </div>
  );
};

export default SummaryCards;
