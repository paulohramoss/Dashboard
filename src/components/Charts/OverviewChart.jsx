import React from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OverviewChart = ({ transactions }) => {
  const { t } = useTranslation();

  const data = React.useMemo(() => {
    const grouped = transactions.reduce((acc, curr) => {
      const date = curr.date;
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

      // Always add to total (Shadow + Real)
      if (curr.type === "income") {
        acc[date].totalIncome += amount;
        if (!curr.isShadow) {
          acc[date].income += amount;
        }
      } else if (curr.type === "expense") {
        acc[date].totalExpense += amount;
        if (!curr.isShadow) {
          acc[date].expense += amount;
        }
      }
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions]);

  return (
    <Card className="col-span-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle>{t("charts.financialOverview")}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
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
                new Date(value).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
              dy={10}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip
              cursor={{ stroke: "#888888", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />

            {/* Shadow Data (Total) - Rendered behind real data */}
            <Area
              type="monotone"
              dataKey="totalIncome"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={0.1}
              fill="url(#colorIncome)"
              name={`${t("charts.income")} (${t("dashboard.simulated")})`}
            />
            <Area
              type="monotone"
              dataKey="totalExpense"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              fillOpacity={0.1}
              fill="url(#colorExpense)"
              name={`${t("charts.expense")} (${t("dashboard.simulated")})`}
            />

            {/* Real Data */}
            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncome)"
              name={t("charts.income")}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
              name={t("charts.expense")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default OverviewChart;
