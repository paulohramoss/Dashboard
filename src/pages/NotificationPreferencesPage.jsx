import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Bell,
  BellOff,
  Wallet,
  ClipboardList,
  Target,
  BarChart2,
  Lightbulb,
  RefreshCw,
  Smartphone,
  Mail,
  MonitorSmartphone,
} from "lucide-react";
import { toast } from "sonner";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useNotifications } from "@/hooks/useNotifications";

const NOTIFICATION_TYPES = [
  {
    key: "lowBalance",
    icon: Wallet,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    key: "expenseReminder",
    icon: ClipboardList,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "financialGoals",
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    key: "weeklySummary",
    icon: BarChart2,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    key: "financialInsights",
    icon: Lightbulb,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    key: "recurringSubscriptions",
    icon: RefreshCw,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

const CHANNELS = [
  { key: "inApp", icon: MonitorSmartphone },
  { key: "email", icon: Mail },
  { key: "push", icon: Smartphone },
];

const NotificationPreferencesPage = () => {
  const { t } = useTranslation();
  const { preferences, updatePreference, isAnyEnabled } =
    useNotificationPreferences();
  const { permission, requestPermission } = useNotifications();

  const handleToggle = async (notificationType, channel, value) => {
    if (channel === "push" && value && permission !== "granted") {
      const perm = await requestPermission();
      if (perm !== "granted") return;
    }
    updatePreference(notificationType, channel, value);
    toast.success(
      value
        ? t("notificationPreferences.enabled")
        : t("notificationPreferences.disabled")
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          {t("notificationPreferences.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("notificationPreferences.subtitle")}
        </p>
      </div>

      {/* Channel Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("notificationPreferences.channels")}
          </CardTitle>
          <CardDescription>
            {t("notificationPreferences.channelsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {CHANNELS.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {t(`notificationPreferences.channel.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>{t("notificationPreferences.preferences")}</CardTitle>
          <CardDescription>
            {t("notificationPreferences.preferencesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Column headers - hidden on mobile */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_repeat(3,_80px)] gap-2 px-4 pb-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
            <span>{t("notificationPreferences.notificationType")}</span>
            {CHANNELS.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-center justify-center gap-1">
                <Icon className="h-3 w-3" />
                <span className="hidden md:inline">
                  {t(`notificationPreferences.channel.${key}`)}
                </span>
              </div>
            ))}
          </div>

          <div className="divide-y divide-border">
            {NOTIFICATION_TYPES.map(({ key, icon: Icon, color, bg }) => {
              const anyEnabled = isAnyEnabled(key);
              const prefs = preferences[key] || {};

              return (
                <div
                  key={key}
                  className="py-4 px-2 sm:px-4 flex flex-col sm:grid sm:grid-cols-[1fr_repeat(3,_80px)] gap-3 sm:gap-2 sm:items-center"
                >
                  {/* Notification info */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                      {anyEnabled ? (
                        <Icon className={`h-4 w-4 ${color}`} />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${!anyEnabled ? "text-muted-foreground" : "text-foreground"}`}
                      >
                        {t(`notificationPreferences.type.${key}.label`)}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {t(`notificationPreferences.type.${key}.desc`)}
                      </p>
                    </div>
                  </div>

                  {/* Channel toggles */}
                  <div className="flex sm:contents justify-around sm:pl-0">
                    {CHANNELS.map(({ key: channelKey, icon: ChannelIcon }) => (
                      <div
                        key={channelKey}
                        className="flex flex-col sm:flex-row sm:justify-center items-center gap-1 sm:gap-0"
                      >
                        {/* Mobile label */}
                        <Label
                          htmlFor={`${key}-${channelKey}`}
                          className="sm:hidden text-[10px] text-muted-foreground flex items-center gap-0.5 cursor-pointer"
                        >
                          <ChannelIcon className="h-3 w-3" />
                          {t(`notificationPreferences.channel.${channelKey}`)}
                        </Label>
                        <Switch
                          id={`${key}-${channelKey}`}
                          checked={!!prefs[channelKey]}
                          onCheckedChange={(val) =>
                            handleToggle(key, channelKey, val)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Push notification permission notice */}
      {permission === "denied" && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-4 flex items-start gap-3">
            <BellOff className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                {t("notificationPreferences.pushDenied")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("notificationPreferences.pushDeniedDesc")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationPreferencesPage;
