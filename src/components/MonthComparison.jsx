import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const parseDate = (d) => {
  if (!d) return null;
  if (typeof d === "string") {
    if (d.includes("-")) {
      const [y, m, day] = d.split("-").map(Number);
      return new Date(y, m - 1, day);
    }
    return new Date(d);
  }
  if (d.toDate) return d.toDate();
  return new Date(d);
};

const getMonthStats = (transactions, year, month) => {
  const txns = transactions.filter((t) => {
    const d = parseDate(t.date);
    if (!d) return false;
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const income = txns
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  const expense = txns
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
  return { income, expense, balance: income - expense, count: txns.length };
};

const DeltaBadge = ({ current, previous, invert = false }) => {
  if (previous === 0) return null;
  const pct = Math.round(((current - previous) / Math.abs(previous)) * 100);
  const isHigher = pct > 0;
  const isGood = invert ? !isHigher : isHigher;

  if (pct === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isGood ? "text-green-600" : "text-red-500"
      )}
    >
      {isHigher ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {Math.abs(pct)}%
    </span>
  );
};

const MonthComparison = ({ transactions }) => {
  const { t } = useTranslation();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const sameMonthLastYear = currentMonth;
  const lastYear = currentYear - 1;

  const current = useMemo(
    () => getMonthStats(transactions, currentYear, currentMonth),
    [transactions, currentYear, currentMonth]
  );

  const previous = useMemo(
    () => getMonthStats(transactions, prevYear, prevMonth),
    [transactions, prevYear, prevMonth]
  );

  const sameLastYear = useMemo(
    () => getMonthStats(transactions, lastYear, sameMonthLastYear),
    [transactions, lastYear, sameMonthLastYear]
  );

  const formatCurrency = (v) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v);

  const monthLabel = (year, month) =>
    new Date(year, month, 1).toLocaleString("pt-BR", {
      month: "short",
      year: "2-digit",
    });

  const rows = [
    {
      label: t("reports.comparison.income"),
      current: current.income,
      previous: previous.income,
      lastYear: sameLastYear.income,
      invert: false,
    },
    {
      label: t("reports.comparison.expense"),
      current: current.expense,
      previous: previous.expense,
      lastYear: sameLastYear.expense,
      invert: true,
    },
    {
      label: t("reports.comparison.balance"),
      current: current.balance,
      previous: previous.balance,
      lastYear: sameLastYear.balance,
      invert: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("reports.comparison.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("reports.comparison.subtitle")}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 font-medium text-muted-foreground">
                  {t("reports.comparison.metric")}
                </th>
                <th className="text-right pb-3 font-medium text-foreground">
                  {monthLabel(currentYear, currentMonth)}
                  <span className="ml-1 text-xs text-primary">
                    ({t("reports.comparison.current")})
                  </span>
                </th>
                <th className="text-right pb-3 font-medium text-muted-foreground">
                  {monthLabel(prevYear, prevMonth)}
                </th>
                <th className="text-right pb-3 font-medium text-muted-foreground">
                  {monthLabel(lastYear, sameMonthLastYear)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.label} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-medium">{row.label}</td>
                  <td className="py-3 text-right font-semibold">
                    <span
                      className={cn(
                        row.label === t("reports.comparison.balance")
                          ? row.current >= 0
                            ? "text-green-600"
                            : "text-red-500"
                          : ""
                      )}
                    >
                      {formatCurrency(row.current)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-muted-foreground">
                        {formatCurrency(row.previous)}
                      </span>
                      <DeltaBadge
                        current={row.current}
                        previous={row.previous}
                        invert={row.invert}
                      />
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-muted-foreground">
                        {formatCurrency(row.lastYear)}
                      </span>
                      <DeltaBadge
                        current={row.current}
                        previous={row.lastYear}
                        invert={row.invert}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          {t("reports.comparison.note")}
        </p>
      </CardContent>
    </Card>
  );
};

export default MonthComparison;
