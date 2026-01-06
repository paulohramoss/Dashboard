import React from "react";
import { useLayout } from "@/context/LayoutContext";

const PrivacyBlur = ({ children, className = "" }) => {
  const { isPrivacyMode } = useLayout();

  return (
    <span
      className={`${className} transition-all duration-300 ${
        isPrivacyMode ? "filter blur-sm select-none" : ""
      }`}
    >
      {children}
    </span>
  );
};

export default PrivacyBlur;
