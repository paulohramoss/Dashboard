import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
const JoinPage = lazy(() => import("@/pages/JoinPage"));
const ChallengesPage = lazy(() => import("@/pages/ChallengesPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const PlannerPage = lazy(() => import("@/pages/PlannerPage"));
const UserProfilePage = lazy(() => import("@/pages/UserProfilePage"));
const NotificationPreferencesPage = lazy(() => import("@/pages/NotificationPreferencesPage"));

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Beautiful loading spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          style={{ animation: "spin 0.7s linear infinite" }}
        />
      </div>
      <span
        className="text-sm text-muted-foreground"
        style={{ animation: "pulse 1.5s ease-in-out infinite" }}
      >
        A carregar...
      </span>
    </div>
  </div>
);

// Animated page wrapper — applied to each page transition
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1],
};

// Inner routes with AnimatePresence for smooth page changes
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ minHeight: "100%" }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/debt" element={<DebtSnowballPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/tutorial" element={<TutorialPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            {/* <Route path="/planner" element={<PlannerPage />} /> */}
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/notification-preferences" element={<NotificationPreferencesPage />} />
          </Routes>
        </Suspense>
      </Motion.div>
    </AnimatePresence>
  );
};

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
              <Route path="/join" element={<JoinPage />} />
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
                      <AnimatedRoutes />
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
