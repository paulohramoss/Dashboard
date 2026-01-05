import React from "react";
import { useTranslation } from "react-i18next";
import { useCategories } from "@/hooks/useCategories";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CategoryChart = ({ transactions }) => {
  const { t } = useTranslation();
  const { categories } = useCategories();

  const data = React.useMemo(() => {
    const expenses = transactions.filter((t) => t.type === "expense");
    const grouped = expenses.reduce((acc, curr) => {
      const categoryName = curr.category || "Other";
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += curr.amount;
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, value]) => {
        const category = categories.find((c) => c.name === name);
        return {
          name: category?.isDefault
            ? t(`categories.${name.toLowerCase()}`)
            : name,
          value,
          color: category?.color || "#94a3b8", // Default color if not found
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, t, categories]);

  return (
    <Card className="col-span-3 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle>{t("charts.expensesByCategory")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", height: 350 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(value)
                }
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#1e293b" }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
