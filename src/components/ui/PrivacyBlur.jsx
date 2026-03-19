import React from "react";
import { useLayout } from "@/context/LayoutContext";

const PrivacyBlur = ({ children, className = "", ...rest }) => {
  const { isPrivacyMode } = useLayout();

  return (
    <span
      {...rest}
      className={`${className} transition-all duration-300 ${
        isPrivacyMode ? "filter blur-sm select-none" : ""
      }`}
    >
      {children}
    </span>
  );
};

export default PrivacyBlur;
