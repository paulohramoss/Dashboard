import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/useCurrency";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const ForecastCard = ({ forecast, amount }) => {
  const { t } = useTranslation();
  const { isPrivacyMode } = useLayout();
  const formatCurrency = useCurrency();

  // Determine trend color based on start vs end of forecast
  const startBalance = forecast[0]?.balance || 0;
  const endBalance = forecast[forecast.length - 1]?.balance || 0;
  const isPositive = endBalance >= startBalance;

  const color = isPositive ? "#16a34a" : "#dc2626"; // green-600 : red-600

  const formattedAmount = formatCurrency(amount);
  // Dynamic font size for large numbers
  const getFontSize = (text) => {
    if (text.length > 20) return "text-lg";
    if (text.length > 15) return "text-xl";
    return "text-2xl";
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 h-full overflow-hidden relative flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium whitespace-nowrap">
          {t("dashboard.forecast", "Previsão (Fim do Mês)")}
        </CardTitle>
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800",
            isPositive
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-red-100 dark:bg-red-900/30"
          )}
        >
          {isPositive ? (
            <TrendingUp
              className={cn(
                "h-4 w-4",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            />
          ) : (
            <TrendingDown
              className={cn(
                "h-4 w-4",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 flex-1 flex flex-col justify-center">
        <div
          className={cn(
            "font-bold flex items-center gap-2 tracking-tight",
            getFontSize(formattedAmount),
            isPositive ? "text-green-600" : "text-red-600",
            isPrivacyMode && "privacy-blur"
          )}
        >
          {formattedAmount}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("dashboard.forecastDesc", "Saldo estimado")}
        </p>
      </CardContent>

      {/* Mini Chart Background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecast}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="balance"
              stroke={color}
              fillOpacity={1}
              fill="url(#colorBalance)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ForecastCard;
