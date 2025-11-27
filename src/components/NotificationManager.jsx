import { useEffect, useRef } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useNotifications } from "@/hooks/useNotifications";
import { useTranslation } from "react-i18next";

const NotificationManager = () => {
  const { t } = useTranslation();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { sendNotification, enabled } = useNotifications();

  // Refs to track if we've already notified about something to avoid spam
  const notifiedBudgets = useRef(new Set());
  const notifiedDueDates = useRef(new Set());

  // Check for budget excesses
  useEffect(() => {
    if (!enabled || categories.length === 0 || transactions.length === 0)
      return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    categories.forEach((category) => {
      if (category.budget <= 0) return;

      const spent = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.category === category.name &&
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear
        )
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

      const key = `${category.id}-${currentMonth}-${currentYear}`;

      if (spent > category.budget && !notifiedBudgets.current.has(key)) {
        sendNotification(
          t("budgets.budgetAlert"),
          t("budgets.budgetExceeded", { category: category.name })
        );
        notifiedBudgets.current.add(key);
      }
    });
  }, [transactions, categories, enabled, sendNotification, t]);

  // Check for due dates (today and tomorrow)
  useEffect(() => {
    if (!enabled || transactions.length === 0) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    transactions.forEach((t) => {
      if (!t.nextDueDate) return;

      if (
        t.nextDueDate === todayStr &&
        !notifiedDueDates.current.has(`${t.id}-today`)
      ) {
        sendNotification(
          "Conta Vencendo Hoje!",
          `A transação "${t.description}" vence hoje.`
        );
        notifiedDueDates.current.add(`${t.id}-today`);
      } else if (
        t.nextDueDate === tomorrowStr &&
        !notifiedDueDates.current.has(`${t.id}-tomorrow`)
      ) {
        sendNotification(
          "Conta Vencendo Amanhã",
          `A transação "${t.description}" vence amanhã.`
        );
        notifiedDueDates.current.add(`${t.id}-tomorrow`);
      }
    });
  }, [transactions, enabled, sendNotification]);

  return null; // This component doesn't render anything
};

export default NotificationManager;
