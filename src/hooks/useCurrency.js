import { useTranslation } from "react-i18next";
import { useCallback } from "react";

export const useCurrency = () => {
  const { i18n } = useTranslation();

  const formatCurrency = useCallback(
    (value) => {
      const language = i18n.language || "en";
      const locale = language.startsWith("pt") ? "pt-BR" : "en-US";
      // const currency = language.startsWith('pt') ? 'BRL' : 'USD';
      // User seems to want BRL value displayed but conditioned by locale format (dots/commas).
      // The previous implementation utilized BRL transaction values but formatted them with en-US locale for EN users.
      // I will adhere to that: always BRL currency, but locale-dependent formatting.

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "BRL",
      }).format(value);
    },
    [i18n.language]
  );

  return formatCurrency;
};
