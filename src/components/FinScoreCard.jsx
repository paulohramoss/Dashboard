import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Tooltip,
} from "recharts";
import { useTransactions } from "@/hooks/useTransactions";
// import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { Info } from "lucide-react";
import {
  Tooltip as UiTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PrivacyBlur from "@/components/ui/PrivacyBlur";

const FinScoreCard = () => {
  const { t } = useTranslation();
  const { transactions, stats } = useTransactions();
  // const { accounts } = useAccounts(); // Removed as unused
  const { categories } = useCategories();

  const scoreData = useMemo(() => {
    let score = 0;
    const maxScore = 1000;
    const breakdown = {
      savings: 0,
      budget: 0,
      emergency: 0,
      debt: 0,
    };

    // 1. Savings Rate (+300 pts)
    // Formula: (Income - Expense) / Income >= 20% -> 300pts
    const income = stats.income || 0;
    const expense = stats.expense || 0;
    const savings = income - expense;
    // Only calculate if positive income
    if (income > 0) {
      const savingsRate = Math.max(0, savings / income);
      // Linear scale up to 20%
      const savingsScore = Math.min(300, (savingsRate / 0.2) * 300);
      breakdown.savings = Math.round(savingsScore);
      score += breakdown.savings;
    }

    // 2. Budget Adherence (+200 pts)
    // Check if any active budget is overspent
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const budgets = categories.filter((c) => c.budget > 0);
    if (budgets.length > 0) {
      let overspentCount = 0;
      budgets.forEach((cat) => {
        const spent = transactions
          .filter(
            (t) =>
              t.type === "expense" &&
              t.category === cat.name &&
              new Date(t.date).getMonth() === currentMonth &&
              new Date(t.date).getFullYear() === currentYear,
          )
          .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

        // Simple logic: if spent > budget (considering rollover?), assume strict for now
        // Or simplified: Just check if spent > budget
        // Note: For simplicity, ignoring rollover logic here to keep it strictly "monthly adherence"
        if (spent > cat.budget) {
          overspentCount++;
        }
      });

      // If 0 overspent => 200. Each overspent reduces score
      // example: 200 - (overspent * 50)
      const budgetScore = Math.max(0, 200 - overspentCount * 50);
      breakdown.budget = Math.round(budgetScore);
      score += breakdown.budget;
    } else {
      // If no budgets set, give a neutral partial score or 0?
      // Let's encourage setting budgets. Give 100 for "potential" or 0 to encourage setting them?
      // Let's give 100 as a baseline if no budgets exist (neutral).
      breakdown.budget = 100;
      score += 100;
    }

    // 3. Emergency Fund (+300 pts)
    // Total Balance >= 3 * Monthly Expenses
    // We'll use this month's expense as "Monthly Expense" proxy or average if we had it.
    // Using current month expense for simplicity.
    const totalBalance = stats.balance;
    const monthlyExpense = expense > 0 ? expense : 1; // avoid division by zero
    const coverageRatio = totalBalance / monthlyExpense;

    if (totalBalance > 0) {
      // Target is 3x.
      // If coverage >= 3 -> 300
      // Else scaled
      const emergencyScore = Math.min(300, (coverageRatio / 3) * 300);
      breakdown.emergency = Math.round(emergencyScore);
      score += breakdown.emergency;
    }

    // 4. Debt Health (+200 pts)
    // Simple check: Do we have credit card accounts with huge utilization?
    // Or simpler: Do we have "Loan" accounts?
    // For now, let's use:
    // +100 if Total Balance > 0
    // +100 if Income > Expense
    if (totalBalance > 0) {
      breakdown.debt += 100;
      score += 100;
    }
    if (savings > 0) {
      breakdown.debt += 100;
      score += 100;
    }

    return {
      score: Math.min(maxScore, Math.round(score)),
      breakdown,
    };
  }, [stats, transactions, categories]);

  // Gauge Chart Data
  // We want a semi-circle range.
  // We can simulate this with a PieChart of startAngle 180, endAngle 0
  const data = [
    { name: "Score", value: scoreData.score },
    { name: "Remaining", value: 1000 - scoreData.score },
  ];

  // Color interpolation
  // 0-300 Red, 300-700 Yellow, 700-1000 Green
  let scoreColor = "#ef4444"; // red-500
  if (scoreData.score > 700) scoreColor = "#22c55e"; // green-500
  else if (scoreData.score > 300) scoreColor = "#eab308"; // yellow-500

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            FinScore
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  <p>
                    {t(
                      "finscore.tooltip",
                      "Pontuação baseada em poupança, orçamento, reserva e dívidas.",
                    )}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[160px]">
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="75%"
                startAngle={180}
                endAngle={0}
                innerRadius="75%"
                outerRadius="90%"
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell key="score" fill={scoreColor} />
                <Cell key="remaining" fill="#e5e7eb" /> {/* gray-200 */}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="absolute top-[75%] left-1/2 -translate-x-1/2 -translate-y-[80%] text-center pointer-events-none w-full px-4">
          <PrivacyBlur
            className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none"
            style={{ color: scoreColor }}
          >
            {scoreData.score}
          </PrivacyBlur>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
            {scoreData.score >= 800
              ? t("finscore.excellent", "Excelente")
              : scoreData.score >= 500
                ? t("finscore.good", "Bom")
                : t("finscore.needsWork", "Atenção")}
          </p>
        </div>

        {/* Mini breakdown text (optional, but requested by user logic) */}
        {/* <div className="mt-auto w-full grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-4">
            <div>Economy: {scoreData.breakdown.savings}</div>
            <div>Budget: {scoreData.breakdown.budget}</div>
        </div> */}
      </CardContent>
    </Card>
  );
};

export default FinScoreCard;
