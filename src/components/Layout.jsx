import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  PieChart,
  Wallet,
  Settings,
  Menu,
  X,
  LogOut,
  Target,
  Pin,
  PinOff,
  Calendar,
  Star,
  Eye,
  EyeOff,
  Repeat,
  TrendingDown,
  BookOpen,
  Swords,
  HelpCircle,
  CalendarCheck,
  User,
  ChevronDown,
  Bell,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown";
import { Analytics } from "@vercel/analytics/react";

import { toast } from "sonner";
import { LayoutContext } from "@/context/LayoutContext";
import IOSInstallPrompt from "@/components/IOSInstallPrompt";

import versionData from "@/version.json";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sidebarPinned");
        return saved !== null ? JSON.parse(saved) : false; // Default to false
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("privacyMode");
        return saved !== null ? JSON.parse(saved) : false;
      } catch {
        return false;
      }
    }
    return false;
  });

  const togglePrivacyMode = () => {
    const newState = !isPrivacyMode;
    setIsPrivacyMode(newState);
    localStorage.setItem("privacyMode", JSON.stringify(newState));
    toast.success(newState ? t("privacy.enabled") : t("privacy.disabled"));
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const togglePin = () => {
    const newState = !isPinned;
    setIsPinned(newState);
    toast.success(newState ? t("sidebar.pinned") : t("sidebar.unpinned"), {
      description: newState
        ? t("sidebar.pinnedDesc")
        : t("sidebar.unpinnedDesc"),
    });
  };

  const appVersion = versionData.version;

  // Desktop: Expanded if pinned OR hovered
  const isExpanded = isPinned || isHovered;

  // Function to determine greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name?.split(" ")[0] || "Usuário";

    if (hour >= 5 && hour < 12) {
      return { text: t("dashboard.goodMorning", { name }), emoji: "☀️" };
    } else if (hour >= 12 && hour < 18) {
      return { text: t("dashboard.goodAfternoon", { name }), emoji: "👋" };
    } else {
      return { text: t("dashboard.goodNight", { name }), emoji: "🌙" };
    }
  };

  useEffect(() => {
    localStorage.setItem("sidebarPinned", JSON.stringify(isPinned));
  }, [isPinned]);

  const navItems = [
    { icon: LayoutDashboard, label: t("nav.dashboard"), path: "/" },
    { icon: Wallet, label: t("nav.transactions"), path: "/transactions" },
    { icon: Calendar, label: t("nav.calendar"), path: "/calendar" },
    { icon: Repeat, label: t("nav.subscriptions"), path: "/subscriptions" },
    { icon: Target, label: t("nav.budgets"), path: "/budgets" },
    { icon: Star, label: t("nav.goals"), path: "/goals" },
    { icon: TrendingDown, label: t("nav.debt", "Dívidas"), path: "/debt" },
    { icon: Wallet, label: t("accounts.title"), path: "/accounts" },
    { icon: PieChart, label: t("nav.reports"), path: "/reports" },
    { icon: Swords, label: t("nav.challenges"), path: "/challenges" },
    { icon: CalendarCheck, label: t("nav.planner"), path: "/planner" },
    { icon: BookOpen, label: t("nav.tutorial"), path: "/tutorial" },
    { icon: HelpCircle, label: t("nav.faq"), path: "/faq" },
    { icon: Bell, label: t("nav.notificationPreferences"), path: "/notification-preferences" },
    { icon: Settings, label: t("nav.settings"), path: "/settings" },
  ];

  return (
    <LayoutContext.Provider
      value={{
        isExpanded,
        isSidebarOpen,
        setIsSidebarOpen,
        isPrivacyMode,
        togglePrivacyMode,
      }}
    >
      <div className="min-h-screen bg-background flex">
        <Analytics />
        <IOSInstallPrompt />
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <Motion.div
              key="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card border-r flex flex-col",
            "transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            // Mobile: transform based on state, fixed width
            "w-64 transform lg:transform-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop: width based on expanded state
            isExpanded ? "lg:w-64" : "lg:w-20",
          )}
        >
          <div
            className={cn(
              "min-h-16 h-auto py-4 flex items-center border-b transition-all duration-300",
              isExpanded ? "px-6 justify-between" : "px-0 justify-center",
            )}
          >
            {isExpanded || isSidebarOpen ? (
              <>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent truncate">
                  {t("app.title")}
                </h1>
                {/* Desktop Pin Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "hidden lg:flex h-8 w-8 ml-auto hover:bg-muted",
                    isPinned && "text-primary bg-primary/10",
                  )}
                  onClick={togglePin}
                  title={isPinned ? t("sidebar.unpin") : t("sidebar.pin")}
                >
                  {isPinned ? (
                    <Pin className="h-4 w-4 rotate-45" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                </Button>
              </>
            ) : (
              <span className="font-bold text-primary text-xl">FD</span>
            )}

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav
            id="sidebar-nav"
            className="p-4 space-y-2 flex-1 overflow-y-auto"
          >
            {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  id={
                    item.path === "/transactions"
                      ? "nav-transactions"
                      : undefined
                  }
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md overflow-hidden transition-all duration-200 ease-out",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    !isExpanded && "lg:justify-center lg:px-2",
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                  <span
                    className={cn(
                      "flex-1 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                      isExpanded || isSidebarOpen
                        ? "max-w-full opacity-100"
                        : "lg:max-w-0 lg:opacity-0",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}

            <button
              onClick={() => {
                if (isConfirmingLogout) {
                  logout();
                } else {
                  setIsConfirmingLogout(true);
                }
              }}
              onMouseLeave={() => setIsConfirmingLogout(false)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-300 overflow-hidden",
                isConfirmingLogout
                  ? "bg-destructive text-destructive-foreground shadow-lg scale-105"
                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                !isExpanded && "lg:justify-center lg:px-2",
              )}
            >
              <LogOut
                className={cn(
                  "h-5 w-5 transition-transform flex-shrink-0",
                  isConfirmingLogout && "rotate-180",
                )}
              />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                  isExpanded || isSidebarOpen
                    ? "max-w-full opacity-100"
                    : "lg:max-w-0 lg:opacity-0",
                )}
              >
                {isConfirmingLogout ? t("nav.confirmLogout") : t("nav.logout")}
              </span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 flex flex-col min-h-screen overflow-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            // Adjust margin based on expanded state (pinned OR hovered)
            isExpanded ? "lg:ml-64" : "lg:ml-20",
          )}
        >
          {/* Header */}
          <header className="min-h-16 h-auto py-3 md:py-4 border-b bg-card flex items-center px-4 md:px-6 lg:px-8 justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden -ml-2 touch-target flex-shrink-0"
                onClick={toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </Button>
              {/* Greeting */}
              <div className="flex-1 min-w-0">
                <h1 className="text-base md:text-xl lg:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                  <span>{getGreeting().emoji}</span>
                  <span>{getGreeting().text}</span>
                </h1>
                <p className="text-xs text-muted-foreground hidden md:block mt-0.5">
                  {t("dashboard.subtitle", "Aqui está o resumo das suas finanças")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePrivacyMode}
                title={
                  isPrivacyMode ? t("privacy.disable") : t("privacy.enable")
                }
                className="text-muted-foreground hover:text-foreground touch-target"
              >
                {isPrivacyMode ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
              <LanguageToggle />
              <ThemeToggle />
              <CustomDropdown
                align="end"
                trigger={
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors cursor-pointer">
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-sm font-semibold text-foreground leading-tight">
                        {user?.name?.split(" ")[0] || user?.name}
                      </span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {user?.email?.split("@")[0]}
                      </span>
                    </div>
                    <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-primary/20">
                      <AvatarImage src={user?.photoURL} alt={user?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
                  </button>
                }
              >
                {/* User info header */}
                <div className="px-2 py-2 border-b border-border mb-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>

                <DropdownItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  {t("userMenu.myProfile", "Meu perfil")}
                </DropdownItem>

                <DropdownItem onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                  {t("userMenu.accountSettings", "Configurações da conta")}
                </DropdownItem>

                <div className="border-t border-border my-1" />

                <DropdownItem onClick={logout} destructive>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </DropdownItem>
              </CustomDropdown>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>

          <footer className="border-t bg-card/50 py-4 md:py-6 px-4 md:px-6 lg:px-8 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground/80">
                  FinanceDash
                </span>
                <span>&copy; {new Date().getFullYear()}</span>
                <span className="hidden md:inline text-muted-foreground/30">
                  |
                </span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {appVersion}
                </span>
              </div>

              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                <span>{t("footer.developedBy")}</span>
                <a
                  href="https://www.linkedin.com/in/paulo-ramos-83402818a/"
                  target="_blank"
                  className="font-medium text-foreground"
                >
                  Paulo Ramos
                </a>
                <span className="text-muted-foreground/50">&</span>
                <a
                  href="https://www.linkedin.com/in/gabriel-schmitz-donada-760678233/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                  target="_blank"
                  className="font-medium text-foreground"
                >
                  Gabriel Donada
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
