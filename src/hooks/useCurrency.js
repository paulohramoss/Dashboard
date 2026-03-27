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
 * Formats a value compactly for display (e.g. R$ 12,3 tri).
 * Thresholds are based on Brazilian Portuguese abbreviations.
 */
export const formatCompactAmount = (value, currency = "BRL") => {
  const locale = currency === "BRL" ? "pt-BR" : "en-US";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  const symbol = currency === "BRL" ? "R$" : "$";

  const fmt = (v, suffix) => {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(Math.abs(v));
    return `${sign}${symbol}\u00a0${formatted}${suffix}`;
  };

  if (abs >= 1e12) return fmt(abs / 1e12, " tri");
  if (abs >= 1e9)  return fmt(abs / 1e9,  " bi");
  if (abs >= 1e6)  return fmt(abs / 1e6,  " mi");
  if (abs >= 1e3)  return fmt(abs / 1e3,  " mil");

  const smallFormatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  return `${sign}${symbol}\u00a0${smallFormatted}`;
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
