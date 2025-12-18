import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import TourGuide from "@/components/TourGuide";
import { toast } from "sonner";
import { LayoutContext } from "@/context/LayoutContext";
import IOSInstallPrompt from "@/components/IOSInstallPrompt";

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

  // Desktop: Expanded if pinned OR hovered
  const isExpanded = isPinned || isHovered;

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
        <TourGuide />
        <IOSInstallPrompt />
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card border-r transition-all duration-300 ease-in-out",
            // Mobile: transform based on state, fixed width
            "w-64 transform lg:transform-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop: width based on expanded state
            isExpanded ? "lg:w-64" : "lg:w-20"
          )}
        >
          <div
            className={cn(
              "h-16 flex items-center border-b transition-all duration-300",
              isExpanded ? "px-6 justify-between" : "px-0 justify-center"
            )}
          >
            {isExpanded || isSidebarOpen ? (
              <>
                <h1 className="text-xl font-bold text-primary truncate">
                  {t("app.title")}
                </h1>
                {/* Desktop Pin Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "hidden lg:flex h-8 w-8 ml-auto hover:bg-muted",
                    isPinned && "text-primary bg-primary/10"
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

          <nav id="sidebar-nav" className="p-4 space-y-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                id={
                  item.path === "/transactions" ? "nav-transactions" : undefined
                }
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 overflow-hidden whitespace-nowrap",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !isExpanded && "lg:justify-center lg:px-2"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
                <span
                  className={cn(
                    "transition-all duration-300 opacity-100",
                    !isExpanded && "lg:opacity-0 lg:w-0 lg:hidden"
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
                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-300 overflow-hidden whitespace-nowrap",
                isConfirmingLogout
                  ? "bg-destructive text-destructive-foreground shadow-lg scale-105"
                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                !isExpanded && "lg:justify-center lg:px-2"
              )}
            >
              <LogOut
                className={cn(
                  "h-5 w-5 transition-transform flex-shrink-0",
                  isConfirmingLogout && "rotate-180"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-300 opacity-100",
                  !isExpanded && "lg:opacity-0 lg:w-0 lg:hidden"
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
            "flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300 ease-in-out",
            // Adjust margin based on expanded state (pinned OR hovered)
            isExpanded ? "lg:ml-64" : "lg:ml-20"
          )}
        >
          {/* Header */}
          <header className="h-16 border-b bg-card flex items-center px-6 lg:px-8 justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden -ml-2"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-4 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePrivacyMode}
                title={
                  isPrivacyMode ? t("privacy.disable") : t("privacy.enable")
                }
                className="text-muted-foreground hover:text-foreground"
              >
                {isPrivacyMode ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
              <LanguageToggle />
              <ThemeToggle />
              <span className="text-sm font-medium hidden md:block">
                {user?.name}
              </span>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>

          <footer className="border-t bg-card/50 p-4 text-center text-xs text-muted-foreground">
            v1.0.10
          </footer>
        </main>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
