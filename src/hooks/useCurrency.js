import { useTranslation } from "react-i18next";
import { useCallback } from "react";

/**
 * Standalone formatter — usable outside React components.
 */
export const formatAmount = (value, currency = "BRL") => {
  const locale = currency === "BRL" ? "pt-BR" : "en-US";
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value
  );
};

/**
 * Returns a locale-aware `formatCurrency(value, currency?)` function.
 * The optional `currency` argument overrides BRL, enabling per-account
 * currency display without changing the global locale preference.
 */
export const useCurrency = () => {
  const { i18n } = useTranslation();

  const formatCurrency = useCallback(
    (value, currency = "BRL") => {
      const language = i18n.language || "en";
      const locale = language.startsWith("pt") ? "pt-BR" : "en-US";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(value);
    },
    [i18n.language]
  );

  return formatCurrency;
};
