import React from "react";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";

const FinancialFlowChart = ({ transactions }) => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();

  // 1. Process Data
  // 1. Process Data & Grouping logic (Threshold 1%)
  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomeTransactions.reduce(
    (acc, curr) => acc + parseFloat(curr.amount),
    0,
  );
  const totalExpense = expenseTransactions.reduce(
    (acc, curr) => acc + parseFloat(curr.amount),
    0,
  );

  const processCategories = (txs, total) => {
    const byCategory = txs.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
      return acc;
    }, {});

    const result = {};
    let othersAmount = 0;

    Object.entries(byCategory).forEach(([cat, amount]) => {
      if (total > 0 && amount / total < 0.01) {
        othersAmount += amount;
      } else {
        result[cat] = amount;
      }
    });

    if (othersAmount > 0) {
      result["Others"] = othersAmount;
    }
    return result;
  };

  const incomeByCategory = processCategories(incomeTransactions, totalIncome);
  const expenseByCategory = processCategories(
    expenseTransactions,
    totalExpense,
  );

  // 2. Create Nodes and Links
  // Structure: [Income Categories] -> [Wallet] -> [Expense Categories]

  const incomeCategories = Object.keys(incomeByCategory);
  const expenseCategories = Object.keys(expenseByCategory);

  const translateCategory = (name) => {
    if (name === "Others") return t("categories.others", "Outros");
    if (!name) return name;

    // Check if translation exists for lowercase key
    const dimKey = `categories.${name.toLowerCase()}`;

    // If translation returns the key itself (and not the text), it means missing translation
    // However, depending on i18n config, it might return the key.
    // Usually t(key, default) works best.
    return t(dimKey, name);
  };

  // Nodes array
  // Indices:
  // 0 to incomeCategories.length - 1: Income Categories
  // incomeCategories.length: Wallet Node
  // incomeCategories.length + 1 to ...: Expense Categories

  const nodes = [
    ...incomeCategories.map((name) => ({
      name: translateCategory(name),
    })), // Income Nodes
    { name: t("common.wallet", "Carteira") }, // Central Node
    ...expenseCategories.map((name) => ({
      name: translateCategory(name),
    })), // Expense Nodes
  ];

  const WALLET_INDEX = incomeCategories.length;

  const links = [];

  // Income -> Wallet Links
  incomeCategories.forEach((cat, index) => {
    links.push({
      source: index,
      target: WALLET_INDEX,
      value: incomeByCategory[cat],
    });
  });

  // Wallet -> Expense Links
  expenseCategories.forEach((cat, index) => {
    links.push({
      source: WALLET_INDEX,
      target: WALLET_INDEX + 1 + index,
      value: expenseByCategory[cat],
    });
  });

  // Handle empty data
  if (nodes.length <= 1 || links.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>
            {t("reports.financialFlow", "Fluxo Financeiro")}
          </CardTitle>
          <CardDescription>
            Visualize a origem e o destino do seu dinheiro.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          {t("common.noData", "Sem dados suficientes para exibir o gráfico.")}
        </CardContent>
      </Card>
    );
  }

  // Custom Link Overlay
  // We can stick to default or slight customization

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t("reports.financialFlow", "Fluxo Financeiro")}</CardTitle>
        <CardDescription>
          {t(
            "reports.flowDescription",
            "Visualize como o dinheiro entra na sua carteira e como é distribuído nas despesas.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[500px]" style={{ minHeight: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={{ nodes, links }}
            node={{ strokeWidth: 0 }}
            nodePadding={50}
            link={{ stroke: "#77c878", fill: "none" }}
            margin={{
              left: 20,
              right: 20,
              top: 20,
              bottom: 20,
            }}
          >
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FinancialFlowChart;
