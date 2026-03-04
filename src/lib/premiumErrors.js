/**
 * Checks if an error is a free-tier limit error and returns the toast config.
 * Use this in catch blocks of mutation calls.
 *
 * @param {Error} error
 * @param {Function} t - i18next t()
 * @param {Function} navigate - react-router navigate()
 * @returns {boolean} true if it was a limit error (so you can skip generic error handling)
 */
export const handlePremiumLimitError = (error, t, navigate) => {
  if (error?.message !== "LIMIT_REACHED") return false;

  const key = error.limitKey || "transactions";
  const limit = error.limit ?? 0;

  // Use sonner toast
  import("sonner").then(({ toast }) => {
    toast.error(t(`limitReached.${key}`, { limit }), {
      action: {
        label: t("premium.upgrade"),
        onClick: () => navigate("/upgrade"),
      },
      duration: 6000,
    });
  });

  return true;
};
