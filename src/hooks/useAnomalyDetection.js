import { useMemo } from "react";
import { subMonths, format, parseISO } from "date-fns";

/**
 * Detects two types of spending anomalies:
 * - monthlySpikes: categories where current-month total > 120% of 3-month average
 * - largeSingleTx: individual transactions in current month that are > 3x the
 *   median transaction amount for that category in the previous 3 months
 */
export const useAnomalyDetection = (transactions) => {
  return useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { monthlySpikes: [], largeSingleTx: [] };
    }

    const today = new Date();
    const getMonthKey = (date) => format(date, "yyyy-MM");
    const currentMonthKey = getMonthKey(today);
    const threeMonthsAgo = subMonths(today, 3);

    // Aggregate monthly totals per category
    const expensesByMonth = {};
    // Individual tx amounts per category from previous 3 months (not current)
    const prevTxAmountsByCategory = {};

    transactions.forEach((tx) => {
      if (tx.type !== "expense") return;

      const date = parseISO(tx.date);
      const monthKey = getMonthKey(date);

      if (!expensesByMonth[monthKey]) expensesByMonth[monthKey] = {};
      if (!expensesByMonth[monthKey][tx.category])
        expensesByMonth[monthKey][tx.category] = 0;
      expensesByMonth[monthKey][tx.category] += parseFloat(tx.amount);

      // Collect amounts from previous months only (not current) for median
      if (date >= threeMonthsAgo && monthKey !== currentMonthKey) {
        if (!prevTxAmountsByCategory[tx.category])
          prevTxAmountsByCategory[tx.category] = [];
        prevTxAmountsByCategory[tx.category].push(parseFloat(tx.amount));
      }
    });

    // 1. Monthly category spending spikes (> 120% of 3-month average)
    const monthlySpikes = [];
    const currentMonthByCategory = expensesByMonth[currentMonthKey] || {};

    Object.entries(currentMonthByCategory).forEach(
      ([category, currentAmount]) => {
        let sumPrevious = 0;
        for (let i = 1; i <= 3; i++) {
          const prevKey = getMonthKey(subMonths(today, i));
          sumPrevious += expensesByMonth[prevKey]?.[category] || 0;
        }
        const average = sumPrevious / 3;

        if (average > 10 && currentAmount > average * 1.2) {
          monthlySpikes.push({
            category,
            currentAmount,
            average,
            percentage: Math.round(((currentAmount - average) / average) * 100),
          });
        }
      }
    );

    // 2. Large single transactions in current month (> 3x median of previous months)
    const largeSingleTx = [];
    const currentMonthTxs = transactions.filter(
      (tx) =>
        tx.type === "expense" &&
        getMonthKey(parseISO(tx.date)) === currentMonthKey
    );

    currentMonthTxs.forEach((tx) => {
      const amounts = prevTxAmountsByCategory[tx.category];
      if (!amounts || amounts.length < 2) return;

      const sorted = [...amounts].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 === 0
          ? (sorted[mid - 1] + sorted[mid]) / 2
          : sorted[mid];

      const txAmount = parseFloat(tx.amount);
      if (median > 5 && txAmount > median * 3) {
        largeSingleTx.push({
          id: tx.id,
          description: tx.description,
          category: tx.category,
          amount: txAmount,
          median,
          times: Math.round(txAmount / median),
        });
      }
    });

    return { monthlySpikes, largeSingleTx };
  }, [transactions]);
};
