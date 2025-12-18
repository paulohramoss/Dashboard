import {
  addDays,
  addMonths,
  addYears,
  format,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  isSameDay,
  isValid,
} from "date-fns";
import { parseInputDate } from "@/utils/dateUtils";

/**
 * Calculates the cash flow forecast for the next N days.
 *
 * @param {number} currentBalance - The current wallet balance.
 * @param {Array} transactions - List of all transactions.
 * @param {number} days - Number of days to project (default 30).
 * @returns {Array} Array of { date: string, balance: number, income: number, expense: number, isForecast: true }.
 */
export const calculateCashFlowForecast = (
  currentBalance,
  transactions,
  days = 30
) => {
  const today = startOfDay(new Date());
  const endDate = endOfDay(addDays(today, days));

  // 1. Identify Existing Future Transactions (e.g. Installments)
  // We filter for transactions strictly AFTER today.
  const futureTransactions = transactions.filter((t) => {
    const tDate = parseInputDate(t.date);
    if (!isValid(tDate)) return false;
    return isAfter(tDate, today) && isBefore(tDate, endDate) && !t.isShadow;
  });

  // 2. Identify and Project Recurring Transactions
  // Find transactions marked isRecurring: true.
  // IMPORTANT: We must assume these define the separate future occurrences, NOT duplicate the existing ones.
  const recurringTemplates = transactions.filter(
    (t) => t.isRecurring && t.nextDueDate && !t.isShadow
  );

  const projectedRecurring = [];

  recurringTemplates.forEach((t) => {
    let nextDate = parseInputDate(t.nextDueDate);
    if (!isValid(nextDate)) return; // Skip invalid due dates

    // Project occurrences until endDate
    while (isBefore(nextDate, endDate)) {
      // Only include if it's in the future window (nextDueDate essentially should be, but just to be safe)
      if (isAfter(nextDate, today) || isSameDay(nextDate, today)) {
        // include today if due today? usually yes
        projectedRecurring.push({
          ...t,
          id: `projected-${t.id}-${nextDate.getTime()}`, // specific ID
          date: format(nextDate, "yyyy-MM-dd"),
          isProjected: true,
          amount: parseFloat(t.amount),
        });
      }

      // Calculate next occurrence
      switch (t.frequency) {
        case "daily":
          nextDate = addDays(nextDate, 1);
          break;
        case "weekly":
          nextDate = addDays(nextDate, 7);
          break;
        case "monthly":
          nextDate = addMonths(nextDate, 1);
          break;
        case "yearly":
          nextDate = addYears(nextDate, 1);
          break;
        default:
          nextDate = addDays(endDate, 1); // Break loop
          break;
      }
    }
  });

  // 3. Combine All Future Events
  // Note: futureTransactions contains actual DB records (like installments).
  // projectedRecurring contains virtual records.
  const allFutureEvents = [...futureTransactions, ...projectedRecurring];

  // 4. Generate Daily Balances
  const forecast = [];
  let runningBalance = currentBalance;

  // We iterate day by day to have a continuous line, or we can just emit days with changes.
  // For a chart, a point per day is good.

  for (let i = 1; i <= days; i++) {
    const currentDate = addDays(today, i);
    const dateStr = format(currentDate, "yyyy-MM-dd");

    // Find events for this day
    const daysEvents = allFutureEvents.filter((e) => e.date === dateStr);

    let dailyIncome = 0;
    let dailyExpense = 0;

    daysEvents.forEach((e) => {
      if (e.type === "income") {
        dailyIncome += parseFloat(e.amount);
        runningBalance += parseFloat(e.amount);
      } else if (e.type === "expense") {
        dailyExpense += parseFloat(e.amount);
        runningBalance -= parseFloat(e.amount);
      }
    });

    forecast.push({
      date: dateStr,
      balance: runningBalance,
      totalIncome: dailyIncome, // For chart consistency
      totalExpense: dailyExpense, // For chart consistency
      isForecast: true,
    });
  }

  return forecast;
};
