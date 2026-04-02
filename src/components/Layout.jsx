import React, { useState, useEffect, useRef } from "react";
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
  User,
  ChevronDown,
  ChevronRight,
  Bell,
  CreditCard,
  LogOut,
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
  const [isPinned, setIsPinned] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sidebarPinned");
        return saved !== null ? JSON.parse(saved) : false;
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
  const [openGroup, setOpenGroup] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0 });
  const popoverRef = useRef(null);
  const closeTimerRef = useRef(null);

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

  const isExpanded = isPinned || isHovered || openGroup !== null;

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

  // Close popover on route change
  useEffect(() => {
    const timer = setTimeout(() => setOpenGroup(null), 0);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const navGroups = [
    {
      icon: LayoutDashboard,
      label: t("nav.dashboard"),
      path: "/",
    },
    {
      icon: Wallet,
      label: "Finanças",
      key: "financas",
      children: [
        { icon: Wallet, label: t("nav.transactions"), path: "/transactions" },
        { icon: CreditCard, label: t("accounts.title"), path: "/accounts" },
        { icon: Repeat, label: t("nav.subscriptions"), path: "/subscriptions" },
        { icon: TrendingDown, label: t("nav.debt", "Dívidas"), path: "/debt" },
      ],
    },
    {
      icon: Target,
      label: "Planejamento",
      key: "planejamento",
      children: [
        { icon: Target, label: t("nav.budgets"), path: "/budgets" },
        { icon: Star, label: t("nav.goals"), path: "/goals" },
        { icon: Calendar, label: t("nav.calendar"), path: "/calendar" },
      ],
    },
    {
      icon: PieChart,
      label: "Análise",
      key: "analise",
      children: [
        { icon: PieChart, label: t("nav.reports"), path: "/reports" },
        { icon: Swords, label: t("nav.challenges"), path: "/challenges" },
      ],
    },
    {
      icon: HelpCircle,
      label: "Suporte",
      key: "suporte",
      children: [
        { icon: BookOpen, label: t("nav.tutorial"), path: "/tutorial" },
        { icon: HelpCircle, label: t("nav.faq"), path: "/faq" },
      ],
    },
    {
      icon: Settings,
      label: t("nav.settings"),
      key: "configuracoes",
      children: [
        { icon: Bell, label: t("nav.notificationPreferences"), path: "/notification-preferences" },
        { icon: Settings, label: t("nav.settings"), path: "/settings" },
      ],
    },
  ];

  const handleGroupEnter = (e, key) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPosition({ top: rect.top });
    setOpenGroup(key);
  };

  const handleGroupLeave = () => {
    closeTimerRef.current = setTimeout(() => setOpenGroup(null), 120);
  };

  const handlePopoverEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handlePopoverLeave = () => {
    closeTimerRef.current = setTimeout(() => setOpenGroup(null), 120);
  };

  const sidebarWidth = isExpanded || isSidebarOpen ? 264 : 88;

  const _activeGroup = navGroups.find(
    (g) => g.children && g.children.some((c) => c.path === location.pathname)
  );

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
          onMouseLeave={() => { setIsHovered(false); }}
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card border-r border-border flex flex-col",
            "transition-[width,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            "w-64 transform lg:transform-none",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
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
                <img
                  src="/logo.png"
                  alt="eazy"
                  className="h-9 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "block";
                  }}
                />
                <h1
                  className="text-2xl font-black text-primary uppercase tracking-tight truncate hidden"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  eazy
                </h1>
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
              <>
                <img
                  src="/logo.png"
                  alt="eazy"
                  className="h-8 w-8 object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "inline";
                  }}
                />
                <span className="font-black text-primary text-xl uppercase tracking-tight hidden">E</span>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav id="sidebar-nav" className="p-4 space-y-1 flex-1 overflow-y-auto">
            {navGroups.map((group) => {
              // Standalone link (no children)
              if (group.path) {
                const isActive = location.pathname === group.path;
                return (
                  <Link
                    key={group.path}
                    to={group.path}
                    id={group.path === "/transactions" ? "nav-transactions" : undefined}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md overflow-hidden transition-all duration-200 ease-out",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      !isExpanded && "lg:justify-center lg:px-2",
                    )}
                  >
                    <group.icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={cn(
                        "flex-1 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                        isExpanded || isSidebarOpen
                          ? "max-w-full opacity-100"
                          : "lg:max-w-0 lg:opacity-0",
                      )}
                    >
                      {group.label}
                    </span>
                  </Link>
                );
              }

              // Group item with popover
              const isGroupActive = group.children.some(
                (c) => c.path === location.pathname
              );
              const isOpen = openGroup === group.key;

              return (
                <div key={group.key} className="relative">
                  <button
                    data-group-trigger
                    onMouseEnter={(e) => handleGroupEnter(e, group.key)}
                    onMouseLeave={handleGroupLeave}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md overflow-hidden transition-all duration-200 ease-out",
                      isGroupActive || isOpen
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      !isExpanded && "lg:justify-center lg:px-2",
                    )}
                  >
                    <group.icon className="h-5 w-5 flex-shrink-0" />
                    <span
                      className={cn(
                        "flex-1 text-left overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                        isExpanded || isSidebarOpen
                          ? "max-w-full opacity-100"
                          : "lg:max-w-0 lg:opacity-0",
                      )}
                    >
                      {group.label}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-200",
                        isOpen && "rotate-90",
                        !isExpanded && "lg:hidden",
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Group Popover */}
        <AnimatePresence>
          {openGroup && (() => {
            const group = navGroups.find((g) => g.key === openGroup);
            if (!group) return null;
            return (
              <Motion.div
                key={openGroup}
                ref={popoverRef}
                onMouseEnter={handlePopoverEnter}
                onMouseLeave={handlePopoverLeave}
                initial={{ opacity: 0, x: -8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="fixed z-[60] min-w-[200px]"
                style={{
                  left: sidebarWidth,
                  top: Math.min(
                    popoverPosition.top,
                    typeof window !== "undefined"
                      ? window.innerHeight - (group.children.length * 48 + 56)
                      : popoverPosition.top
                  ),
                }}
              >
                {/* Arrow */}
                <div
                  className="absolute left-0 top-4 -translate-x-full w-0 h-0"
                  style={{
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderRight: "6px solid hsl(var(--border))",
                  }}
                />
                <div
                  className="absolute left-[1px] top-4 -translate-x-full w-0 h-0"
                  style={{
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderRight: "5px solid hsl(var(--card))",
                  }}
                />

                <div className="bg-card border rounded-xl shadow-xl overflow-hidden">
                  {/* Group title */}
                  <div className="px-4 py-2.5 border-b bg-muted/30">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {group.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="p-1.5 space-y-0.5">
                    {group.children.map((child) => {
                      const isActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => {
                            setOpenGroup(null);
                            setIsSidebarOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                        >
                          <child.icon className="h-4 w-4 flex-shrink-0" />
                          <span className="whitespace-nowrap">{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </Motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 flex flex-col min-h-screen overflow-hidden transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
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
              <div className="flex-1 min-w-0">
                <h1 className="text-base md:text-xl lg:text-2xl font-bold text-foreground truncate flex items-center gap-2">
                  <span>{getGreeting().emoji}</span>
                  <span>{getGreeting().text}</span>
                </h1>
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
                <span className="font-black text-primary uppercase tracking-tight" style={{ letterSpacing: '-0.01em' }}>
                  eazy
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
