import React from "react";
import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
  Layer,
  Rectangle,
} from "recharts";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const FinancialFlowChart = ({ transactions }) => {
  const { t } = useTranslation();

  // 1. Process Data
  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  // Group by category
  const incomeByCategory = incomeTransactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
    return acc;
  }, {});

  const expenseByCategory = expenseTransactions.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
    return acc;
  }, {});

  // 2. Create Nodes and Links
  // Structure: [Income Categories] -> [Wallet] -> [Expense Categories]

  const incomeCategories = Object.keys(incomeByCategory);
  const expenseCategories = Object.keys(expenseByCategory);

  // Nodes array
  // Indices:
  // 0 to incomeCategories.length - 1: Income Categories
  // incomeCategories.length: Wallet Node
  // incomeCategories.length + 1 to ...: Expense Categories

  const nodes = [
    ...incomeCategories.map((name) => ({ name: t(name, name) })), // Income Nodes
    { name: t("common.wallet", "Carteira") }, // Central Node
    ...expenseCategories.map((name) => ({ name: t(name, name) })), // Expense Nodes
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

  // Custom Node Content
  const renderNode = ({
    x,
    y,
    width,
    height,
    index,
    payload,
    containerWidth,
  }) => {
    const isOut = x + width + 6 > containerWidth;
    return (
      <Layer key={`CustomNode${index}`}>
        <Rectangle
          x={x}
          y={y}
          width={width}
          height={height}
          fill="url(#colorGradient)"
          fillOpacity="1"
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          alignmentBaseline="middle"
          fill="#fff"
          fontSize="12"
          fontWeight="bold"
          style={{ pointerEvents: "none" }}
        >
          {/* Show name only if height is big enough */}
          {height > 20 ? payload.name : ""}
        </text>
      </Layer>
    );
  };

  // Custom Link Overlay
  // We can stick to default or slight customization

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{t("reports.financialFlow", "Fluxo Financeiro")}</CardTitle>
        <CardDescription>
          {t(
            "reports.flowDescription",
            "Visualize como o dinheiro entra na sua carteira e como é distribuído nas despesas."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[500px]">
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
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FinancialFlowChart;
