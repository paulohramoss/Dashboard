/**
 * Heuristically detects subscriptions from a list of transactions.
 * It looks for common subscription keywords and exact recurring amounts across months.
 */

const COMMON_SUBSCRIPTIONS = [
  "netflix",
  "spotify",
  "amazon",
  "prime",
  "disney",
  "hbo",
  "max",
  "apple",
  "youtube",
  "gympass",
  "smartfit",
  "globo",
  "paramount",
  "adobe",
  "microsoft",
  "playstation",
  "xbox",
  "game pass",
  "icloud",
  "google one",
  "chatgpt",
  "openai",
  "midjourney",
];

export const detectSubscriptions = (transactions) => {
  if (!transactions || transactions.length === 0) return [];

  // Only consider expenses for subscriptions
  const expenses = transactions.filter((t) => t.type === "expense");
  
  const potentialSubscriptions = new Map();

  // Helper to normalize strings for comparison
  const normalize = (str) =>
    (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  expenses.forEach((transaction) => {
    // 1. Check if the user manually marked it as recurring
    if (transaction.isRecurring) {
      if (!potentialSubscriptions.has(transaction.id)) {
        potentialSubscriptions.set(transaction.id, {
          ...transaction,
          detectedBy: "manual",
        });
      }
      return;
    }

    const descNorm = normalize(transaction.description);

    // 2. Heuristic: Keyword matching
    const hasKeyword = COMMON_SUBSCRIPTIONS.some((keyword) =>
      descNorm.includes(keyword)
    );

    if (hasKeyword) {
      // Group by description and amount to avoid duplicates
      const key = `${descNorm}-${transaction.amount}`;
      if (!potentialSubscriptions.has(key)) {
        potentialSubscriptions.set(key, { ...transaction, detectedBy: "keyword" });
      } else {
        // Keep the most recent one
        const existing = potentialSubscriptions.get(key);
        if (new Date(transaction.date) > new Date(existing.date)) {
           potentialSubscriptions.set(key, { ...transaction, detectedBy: "keyword" });
        }
      }
      return;
    }

    // 3. Heuristic: Same description and amount occurring multiple times across different months
    // (This requires looking at the whole dataset, which we can approximate by grouping everything)
  });

  // Second pass for recurring amounts (if no keyword was met but it repeats)
  const groupedByKey = {};
  expenses.forEach((t) => {
      const key = `${normalize(t.description)}-${t.amount}`;
      if (!groupedByKey[key]) groupedByKey[key] = [];
      groupedByKey[key].push(t);
  });

  Object.values(groupedByKey).forEach((group) => {
      if (group.length >= 2) {
          // Check if they are in different months
          const months = new Set(group.map(t => new Date(t.date).getMonth()));
          if (months.size > 1) {
              // It repeats across months! Sort by date newest first.
              group.sort((a, b) => new Date(b.date) - new Date(a.date));
               const latest = group[0];
               const key = `${normalize(latest.description)}-${latest.amount}`;
               // Only add if we haven't already added it via keyword or manual
               let alreadyAdded = false;
               potentialSubscriptions.forEach(sub => {
                   if (sub.id === latest.id || (`${normalize(sub.description)}-${sub.amount}` === key)) {
                       alreadyAdded = true;
                   }
               });
               
               if(!alreadyAdded) {
                   potentialSubscriptions.set(key, { ...latest, detectedBy: "pattern" });
               }
          }
      }
  });


  // Convert Set to Array and return unique subscriptions
  // Ensure we don't have overlapping logic if one was manual AND matched keyword
  return Array.from(potentialSubscriptions.values());
};
