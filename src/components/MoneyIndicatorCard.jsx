import React from "react";
import { motion as Motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { useCurrency } from "@/hooks/useCurrency";

const MoneyIndicatorCard = ({ stats }) => {
  const formatCurrency = useCurrency();

  const canSpend = Math.max(stats.income - stats.expense, 0);
  const isOver = stats.income - stats.expense < 0;
  const spendingRatio =
    stats.income > 0
      ? Math.min((stats.expense / stats.income) * 100, 100)
      : 0;

  const size = 180;
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (spendingRatio / 100) * circumference;

  const ringColor =
    spendingRatio < 70 ? "#4ade80" : spendingRatio < 90 ? "#fbbf24" : "#f87171";

  return (
    <Card className="h-full overflow-hidden border-0 shadow-lg bg-gradient-to-br from-primary via-primary to-[hsl(167,60%,14%)] relative">
      {/* Decorative blobs */}
      <div className="absolute -top-14 -right-14 h-52 w-52 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />

      <CardContent className="relative z-10 h-full flex flex-col items-center justify-center gap-5 py-6 px-4">
        {/* Label */}
        <p className="text-primary-foreground/55 text-xs font-semibold uppercase tracking-widest text-center">
          Você ainda pode gastar
        </p>

        {/* Circular ring + center value */}
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="-rotate-90"
            style={{ filter: "drop-shadow(0 0 12px rgba(74,222,128,0.25))" }}
          >
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={strokeWidth}
            />
            {/* Progress */}
            <Motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.3, ease: "easeOut" }}
            />
          </svg>

          {/* Center text (rotated back to normal) */}
          <div className="absolute flex flex-col items-center gap-0.5 text-center px-2">
            {isOver ? (
              <span className="text-[#f87171] font-bold text-lg leading-tight">
                Estourado
              </span>
            ) : (
              <PrivacyBlur className="text-white font-extrabold text-[1.6rem] leading-tight tracking-tight">
                {formatCurrency(canSpend)}
              </PrivacyBlur>
            )}
            {!isOver && (
              <span
                className="text-[11px] font-medium"
                style={{ color: ringColor }}
              >
                {Math.round(100 - spendingRatio)}% livre
              </span>
            )}
          </div>
        </div>

        {/* Mini stats row */}
        <div className="flex items-center gap-6 text-center">
          <div className="flex flex-col gap-0.5">
            <p className="text-primary-foreground/40 text-[10px] font-semibold uppercase tracking-wider">
              Receita
            </p>
            <PrivacyBlur className="text-white/80 font-semibold text-xs">
              {formatCurrency(stats.income)}
            </PrivacyBlur>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex flex-col gap-0.5">
            <p className="text-primary-foreground/40 text-[10px] font-semibold uppercase tracking-wider">
              Gasto
            </p>
            <PrivacyBlur className="text-white/80 font-semibold text-xs">
              {formatCurrency(stats.expense)}
            </PrivacyBlur>
          </div>

          <div className="w-px h-8 bg-white/10" />

          <div className="flex flex-col gap-0.5">
            <p className="text-primary-foreground/40 text-[10px] font-semibold uppercase tracking-wider">
              Usado
            </p>
            <span
              className="font-bold text-xs"
              style={{ color: ringColor }}
            >
              {Math.round(spendingRatio)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoneyIndicatorCard;
