import React, { useState } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import TourGuide from "@/components/TourGuide";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { icon: LayoutDashboard, label: t("nav.dashboard"), path: "/" },
    { icon: Wallet, label: t("nav.transactions"), path: "/transactions" },
    { icon: Target, label: t("nav.budgets"), path: "/budgets" },
    { icon: Wallet, label: t("accounts.title"), path: "/accounts" },
    { icon: PieChart, label: t("nav.reports"), path: "/reports" },
    { icon: Settings, label: t("nav.settings"), path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <TourGuide />
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-200 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold text-primary">{t("app.title")}</h1>
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
              id={
                item.path === "/transactions" ? "nav-transactions" : undefined
              }
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
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
              "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-all duration-300",
              isConfirmingLogout
                ? "bg-destructive text-destructive-foreground shadow-lg scale-105"
                : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <LogOut
              className={cn(
                "h-5 w-5 transition-transform",
                isConfirmingLogout && "rotate-180"
              )}
            />
            {isConfirmingLogout ? t("nav.confirmLogout") : t("nav.logout")}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
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
        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>

        <footer className="border-t bg-card/50 p-4 text-center text-xs text-muted-foreground">
          v1.0.0
        </footer>
      </main>
    </div>
  );
};

export default Layout;
