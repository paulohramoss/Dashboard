import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import TransactionsPage from "@/pages/TransactionsPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import BudgetsPage from "@/pages/BudgetsPage";
import GoalsPage from "@/pages/GoalsPage";
import AccountsPage from "@/pages/AccountsPage";
import CalendarPage from "@/pages/CalendarPage";
import NotificationManager from "@/components/NotificationManager";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const LayoutWithKey = () => {
  const { user } = useAuth();
  return (
    <Layout key={user?.id}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
};

import { Toaster } from "sonner";

import VersionChecker from "@/components/VersionChecker";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <VersionChecker />
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <NotificationManager />
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route
                        path="/transactions"
                        element={<TransactionsPage />}
                      />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/budgets" element={<BudgetsPage />} />
                      <Route path="/goals" element={<GoalsPage />} />
                      <Route path="/accounts" element={<AccountsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
