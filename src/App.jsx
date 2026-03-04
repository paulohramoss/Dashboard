import React, { Suspense, lazy } from "react";
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
import NotificationManager from "@/components/NotificationManager";
import FinancialAssistant from "@/components/FinancialAssistant";
import OfflineBanner from "@/components/OfflineBanner";
import UpdatePrompt from "@/components/UpdatePrompt";
import { Toaster } from "sonner";
import VersionChecker from "@/components/VersionChecker";
import PremiumGate from "@/components/PremiumGate";

// Lazy loaded pages
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const ReportsPage = lazy(() => import("@/pages/ReportsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const BudgetsPage = lazy(() => import("@/pages/BudgetsPage"));
const GoalsPage = lazy(() => import("@/pages/GoalsPage"));
const AccountsPage = lazy(() => import("@/pages/AccountsPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const CookiePolicyPage = lazy(() => import("@/pages/CookiePolicyPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const SubscriptionsPage = lazy(() => import("@/pages/SubscriptionsPage"));
const DebtSnowballPage = lazy(() => import("@/pages/DebtSnowballPage"));

const TutorialPage = lazy(() => import("@/pages/TutorialPage"));
const JoinPage = lazy(() => import("@/pages/JoinPage")); // New Route
const ChallengesPage = lazy(() => import("@/pages/ChallengesPage"));
const UpgradePage = lazy(() => import("@/pages/UpgradePage"));

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-muted-foreground animate-pulse">A carregar...</div>
  </div>
);

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <VersionChecker />
        <UpdatePrompt />
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <OfflineBanner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/join" element={<JoinPage />} />{" "}
              {/* New Join Route */}
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
                      <FinancialAssistant />
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route
                            path="/transactions"
                            element={<TransactionsPage />}
                          />
                          <Route path="/calendar" element={<CalendarPage />} />
                          <Route path="/budgets" element={<BudgetsPage />} />
                          <Route path="/goals" element={<GoalsPage />} />
                          <Route
                            path="/debt"
                            element={
                              <PremiumGate
                                feature="Calculadora de Dívidas"
                                description="Visualize e planeje o pagamento das suas dívidas com o método Snowball. Disponível no Premium."
                              >
                                <DebtSnowballPage />
                              </PremiumGate>
                            }
                          />
                          <Route
                            path="/subscriptions"
                            element={<SubscriptionsPage />}
                          />
                          <Route path="/accounts" element={<AccountsPage />} />
                          <Route path="/reports" element={<ReportsPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/tutorial" element={<TutorialPage />} />
                          <Route
                            path="/challenges"
                            element={
                              <PremiumGate
                                feature="Desafios Financeiros"
                                description="Crie e participe de desafios de gastos para criar novos hábitos financeiros. Disponível no Premium."
                              >
                                <ChallengesPage />
                              </PremiumGate>
                            }
                          />
                          <Route path="/upgrade" element={<UpgradePage />} />
                        </Routes>
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
