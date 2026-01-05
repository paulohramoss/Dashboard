import React from "react";
import { useTranslation } from "react-i18next";
import {
  ComposedChart,
  Area,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isAfter, subDays, startOfDay } from "date-fns";
import { parseInputDate, formatDate } from "@/utils/dateUtils";

const OverviewChart = ({ transactions, forecastData = [], currentBalance }) => {
  const { t, i18n } = useTranslation();

  const currencyFormatter = (value) => {
    if (isNaN(value) || value === null || value === undefined) return "R$ 0,00";
    return new Intl.NumberFormat(i18n.language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const data = React.useMemo(() => {
    // 1. Process Historical Data
    // Group transactions by date
    const grouped = transactions.reduce((acc, curr) => {
      const date = curr.date; // YYYY-MM-DD
      if (!acc[date]) {
        acc[date] = {
          date,
          income: 0,
          expense: 0,
          totalIncome: 0,
          totalExpense: 0,
        };
      }

      const amount = parseFloat(curr.amount);
      if (curr.type === "income") {
        acc[date].totalIncome += amount;
        if (!curr.isShadow) acc[date].income += amount;
      } else if (curr.type === "expense") {
        acc[date].totalExpense += amount;
        if (!curr.isShadow) acc[date].expense += amount;
      }
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // We want last 30 days history? Or all time?
    // Let's take last 30 days for clarity + future 30 days.
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);

    // Wait, 'currentBalance' from useTransactions (stats.balance) includes ALL transactions in the list.
    // Ensure we unroll backwards correctly.
    // We need to iterate BACKWARDS from the last transaction date available?
    // Or just iterate forwards if we calculate initial balance?
    // Calculating initial balance is hard. Unrolling is safer.

    // Create a map of daily net change
    const dailyNet = {};
    sortedDates.forEach((date) => {
      const d = grouped[date];
      dailyNet[date] = d.totalIncome - d.totalExpense;
    });

    // Reconstruct balance history
    // We start from currentBalance (presumed to be "End of Time" or "Now"?)
    // stats.balance is sum of ALL transactions in the list.
    // If list has future transactions (installments), currentBalance INCLUDES them.
    // So currentBalance is the balance at the end of the Last Transaction Date.

    // Let's filter transactions to find "Today's Balance".
    // Actually, stats.balance is simpler. It's the sum of everything.
    // We might need to adjust it to be "Balance as of Today" if we want to show history relative to today.
    // But let's assume stats.balance is correct Total.

    // Let's sort transactions descending to walk back.

    // Map entries for display
    // We only want to show relevant range.
    // Let's create a continuous timeline from 30 days ago to 30 days future.

    const combinedData = [];

    let tempBalance = currentBalance;

    // Walk backwards through ALL sorted transactions to build daily balances
    // (If date is future, we subtract change to find previous balance)
    // (If date is past, we subtract change to find even previous balance)

    // Actually it's easier to map Balance at Close of Day.
    // Balance(T) = Balance(T+1) - Income(T+1) + Expense(T+1) ?
    // No. Balance(T-1) = Balance(T) - NetChange(T).

    // We iterate backwards through dates.
    // Find latest date in transactions.
    // If latest date > today, unroll until today.

    // Let's populate the 'grouped' object with 'balance' property.
    // Better: Iterate all sorted dates descending.

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = sortedDates[i];
      grouped[date].balance = tempBalance; // Balance at end of this day
      // Update tempBalance for the *previous* day
      const change = grouped[date].totalIncome - grouped[date].totalExpense;
      tempBalance -= change;
    }

    // Now 'grouped' has historical balances.
    // Filter for last 30 days range.

    const historicalRange = sortedDates.filter((d) =>
      isAfter(new Date(d), thirtyDaysAgo)
    ); // And before today?

    historicalRange.forEach((date) => {
      combinedData.push({
        ...grouped[date],
        historicalBalance: grouped[date].balance, // For solid line
      });
    });

    // 2. Add Forecast Data (Future)
    // Forecast data starts from tomorrow usually.
    // But we want to connect the line. The last point of history should be the first point of forecast?
    // Or Forecast data has Today's balance?

    // Ensure forecastData is sorted and starts after the last historical date.
    if (forecastData.length > 0) {
      // Connect the lines: Add a point for Today (or last history date) with projectedBalance = same as historicalBalance
      const lastHistory = combinedData[combinedData.length - 1];
      if (lastHistory) {
        // Create a "Bridge" point if needed, or just ensure forecast starts drawing from there.
        // Line chart connects points if dataKey exists.
        // If we use two separate dataKeys (historicalBalance, projectedBalance), they won't connect automatically unless they share a point.
        // So let's add projectedBalance to the last history point.
        lastHistory.projectedBalance = lastHistory.historicalBalance;
      }

      forecastData.forEach((f) => {
        // date, balance, totalIncome, totalExpense
        combinedData.push({
          date: f.date,
          income: f.totalIncome, // Optional: show forecast bars? user said "continue dotted", implies Balance line.
          expense: f.totalExpense,
          totalIncome: f.totalIncome,
          totalExpense: f.totalExpense,
          projectedBalance: f.balance,
          isForecast: true,
        });
      });
    }

    return combinedData;
  }, [transactions, forecastData, currentBalance]);

  return (
    <Card className="col-span-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle>{t("charts.financialOverview")}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="flex flex-wrap justify-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>{t("charts.income")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>{t("charts.expense")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            <span>{t("charts.balance")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-[#3b82f6] border-dashed" />
            <span>{t("charts.projectedBalance") || "Forecast"}</span>
          </div>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  formatDate(parseInputDate(value), "dd MMM")
                }
                dy={10}
              />
              {/* YAxis Left: Income/Expense */}
              <YAxis
                yAxisId="left"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={currencyFormatter}
              />
              {/* YAxis Right: Balance */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#3b82f6"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={currencyFormatter}
              />

              <Tooltip
                cursor={{ stroke: "#888888", strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelFormatter={(value) =>
                  formatDate(parseInputDate(value), "dd/MM/yyyy")
                }
                formatter={(value) => [currencyFormatter(value)]}
              />

              {/* Areas for Income/Expense (Left Axis) */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIncome)"
                name={t("charts.income")}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpense)"
                name={t("charts.expense")}
              />

              {/* Forecast Areas (lighter, dotted stroke?) - Optional */}
              {/* Keeping it simple: Balance Line is the hero here */}

              {/* Line for Historical Balance (Right Axis) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="historicalBalance"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                name={t("charts.balance")}
              />

              {/* Line for Projected Balance (Right Axis) */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="projectedBalance"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
                name={t("charts.projectedBalance") || "Forecast"}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverviewChart;
