import React from "react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

const CurrencyInput = ({
  value,
  onChange,
  placeholder,
  className,
  currency = "BRL",
  ...props
}) => {
  const { i18n } = useTranslation();

  const formatCurrency = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const number = Number(val);
    const locale = i18n.language?.startsWith("pt") ? "pt-BR" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(number);
  };

  const displayValue = formatCurrency(value);

  const handleChange = (e) => {
    let inputValue = e.target.value;

    // Remove non-numeric characters
    const numericValue = inputValue.replace(/[^0-9]/g, "");

    // Convert to float (divide by 100 to handle cents)
    const floatValue = parseFloat(numericValue) / 100;

    if (isNaN(floatValue)) {
      onChange("");
      return;
    }

    onChange(floatValue);
  };

  return (
    <Input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default CurrencyInput;
