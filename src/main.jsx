import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Translation } from "react-i18next";
import "./index.css";
import "./i18n";
import App from "./App.jsx";

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "20px",
            color: "white",
            background: "#1a1a1a",
            height: "100vh",
          }}
        >
          <Translation>
            {(t) => <h1>{t("common.genericError")}</h1>}
          </Translation>
          <p>{this.state.error && this.state.error.toString()}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
