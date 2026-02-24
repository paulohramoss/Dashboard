import { useEffect, useRef } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useNotifications } from "@/hooks/useNotifications";
import { useAnomalyDetection } from "@/hooks/useAnomalyDetection";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

const NotificationManager = () => {
  const { t } = useTranslation();
  const formatCurrency = useCurrency();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { sendNotification, enabled } = useNotifications();
  const { monthlySpikes, largeSingleTx } = useAnomalyDetection(transactions);

  // Refs to track already-sent notifications and avoid spam
  const notifiedBudgets = useRef(new Set());
  const notifiedBudgetWarnings = useRef(new Set());
  const notifiedDueDates = useRef(new Set());
  const notifiedAnomalies = useRef(new Set());
  const notifiedLargeTx = useRef(new Set());

  // Budget exceeded (100%) and 80% warning alerts
  useEffect(() => {
    if (!enabled || categories.length === 0 || transactions.length === 0)
      return;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    categories.forEach((category) => {
      if (category.budget <= 0) return;

      const spent = transactions
        .filter(
          (tx) =>
            tx.type === "expense" &&
            tx.category === category.name &&
            new Date(tx.date).getMonth() === currentMonth &&
            new Date(tx.date).getFullYear() === currentYear
        )
        .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

      const key = `${category.id}-${currentMonth}-${currentYear}`;
      const percent = (spent / category.budget) * 100;

      // 100% exceeded
      if (spent > category.budget && !notifiedBudgets.current.has(key)) {
        sendNotification(
          t("budgets.budgetAlert"),
          t("budgets.budgetExceeded", { category: category.name }),
          { tag: `budget-exceeded-${key}` }
        );
        notifiedBudgets.current.add(key);
      }

      // 80% warning (only fire once, before the 100% alert)
      const warningKey = `warn-${key}`;
      if (
        percent >= 80 &&
        percent < 100 &&
        !notifiedBudgetWarnings.current.has(warningKey)
      ) {
        sendNotification(
          t("notifications.budgetWarningTitle"),
          t("notifications.budgetWarningBody", {
            percent: Math.round(percent),
            category: category.name,
          }),
          { tag: `budget-warning-${warningKey}` }
        );
        notifiedBudgetWarnings.current.add(warningKey);
      }
    });
  }, [transactions, categories, enabled, sendNotification, t]);

  // Due-date alerts (today and tomorrow)
  useEffect(() => {
    if (!enabled || transactions.length === 0) return;

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    transactions.forEach((tx) => {
      if (!tx.nextDueDate) return;

      if (
        tx.nextDueDate === todayStr &&
        !notifiedDueDates.current.has(`${tx.id}-today`)
      ) {
        sendNotification(
          t("notifications.dueToday"),
          t("notifications.dueTodayBody", { description: tx.description }),
          { tag: `due-today-${tx.id}` }
        );
        notifiedDueDates.current.add(`${tx.id}-today`);
      } else if (
        tx.nextDueDate === tomorrowStr &&
        !notifiedDueDates.current.has(`${tx.id}-tomorrow`)
      ) {
        sendNotification(
          t("notifications.dueTomorrow"),
          t("notifications.dueTomorrowBody", { description: tx.description }),
          { tag: `due-tomorrow-${tx.id}` }
        );
        notifiedDueDates.current.add(`${tx.id}-tomorrow`);
      }
    });
  }, [transactions, enabled, sendNotification, t]);

  // Unusual spending alerts: monthly spikes and large single transactions
  useEffect(() => {
    if (!enabled) return;

    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    // Monthly spending spikes (> 120% of 3-month average)
    monthlySpikes.forEach(({ category, percentage }) => {
      const key = `spike-${category}-${month}-${year}`;
      if (notifiedAnomalies.current.has(key)) return;

      const categoryKey = `categories.${category.toLowerCase()}`;
      const displayCategory =
        t(categoryKey) !== categoryKey ? t(categoryKey) : category;

      sendNotification(
        t("insights.anomalyNotificationTitle"),
        t("insights.anomalyNotificationBody", {
          category: displayCategory,
          percentage,
        }),
        { tag: `anomaly-${key}` }
      );
      notifiedAnomalies.current.add(key);
    });

    // Large single transactions (> 3x median for their category)
    largeSingleTx.forEach(({ id, category, amount, times }) => {
      const key = `large-${id}`;
      if (notifiedLargeTx.current.has(key)) return;

      const categoryKey = `categories.${category.toLowerCase()}`;
      const displayCategory =
        t(categoryKey) !== categoryKey ? t(categoryKey) : category;

      sendNotification(
        t("insights.largeTransactionTitle"),
        t("insights.largeTransactionBody", {
          amount: formatCurrency(amount),
          category: displayCategory,
          times,
        }),
        { tag: `large-tx-${key}` }
      );
      notifiedLargeTx.current.add(key);
    });
  }, [
    monthlySpikes,
    largeSingleTx,
    enabled,
    sendNotification,
    t,
    formatCurrency,
  ]);

  return null;
};

export default NotificationManager;
