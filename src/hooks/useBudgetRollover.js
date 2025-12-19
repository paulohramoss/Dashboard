import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const useBudgetRollover = (categories, transactions) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id || categories.length === 0 || transactions.length === 0)
      return;

    const processRollovers = async () => {
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`; // e.g., "2023-10"

      for (const category of categories) {
        if (!category.rollover || !category.budget) continue;

        // If never checked, or checked in a previous month
        if (category.lastRolloverCheck !== currentMonthKey) {
          // Determine the start date for calculation
          // If first time, maybe start from created date? Or just previous month?
          // Let's assume we process from the last checked month + 1, or just the previous month if new.

          let lastCheckDate = category.lastRolloverCheck
            ? new Date(
                category.lastRolloverCheck.split("-")[0],
                category.lastRolloverCheck.split("-")[1]
              )
            : new Date(now.getFullYear(), now.getMonth() - 1); // Default to previous month

          // If last check was this month, skip (should be covered by the if above, but safety check)
          if (
            lastCheckDate.getMonth() === now.getMonth() &&
            lastCheckDate.getFullYear() === now.getFullYear()
          )
            continue;

          // We need to iterate from lastCheckDate up to (but not including) current month
          // Actually, let's simplify:
          // If we missed 3 months, we calculate budget - spent for each of those months.

          let accumulatedToAdd = 0;
          let iterDate = new Date(lastCheckDate);

          // If it's the first time running this logic on an existing category,
          // we might only want to process the IMMEDIATE previous month to avoid massive historical changes?
          // The user said "Infinite rollover", implying history.
          // But safe bet: if no lastRolloverCheck, just do previous month.
          if (!category.lastRolloverCheck) {
            iterDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          } else {
            // Move to next month after last check
            iterDate.setMonth(iterDate.getMonth() + 1);
          }

          while (iterDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
            const month = iterDate.getMonth();
            const year = iterDate.getFullYear();

            const monthlySpent = transactions
              .filter(
                (t) =>
                  t.type === "expense" &&
                  t.category === category.name &&
                  new Date(t.date).getMonth() === month &&
                  new Date(t.date).getFullYear() === year
              )
              .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

            if (monthlySpent < category.budget) {
              accumulatedToAdd += category.budget - monthlySpent;
            }

            iterDate.setMonth(iterDate.getMonth() + 1);
          }

          if (
            accumulatedToAdd > 0 ||
            category.lastRolloverCheck !== currentMonthKey
          ) {
            const newAccumulated =
              (category.accumulatedRollover || 0) + accumulatedToAdd;

            try {
              const docRef = doc(db, "categories", category.id);
              await updateDoc(docRef, {
                accumulatedRollover: newAccumulated,
                lastRolloverCheck: currentMonthKey,
              });
            } catch (error) {
              console.error("Error updating rollover:", error);
            }
          }
        }
      }
    };

    processRollovers();
  }, [categories, transactions, user?.id]);
};
