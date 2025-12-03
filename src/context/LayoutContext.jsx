import React, { useContext } from "react";

export const LayoutContext = React.createContext({
  isExpanded: false,
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
});

export const useLayout = () => useContext(LayoutContext);
