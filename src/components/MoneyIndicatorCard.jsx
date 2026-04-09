import React from "react";
import PrivacyBlur from "@/components/ui/PrivacyBlur";
import { useCurrency } from "@/hooks/useCurrency";

const MoneyIndicatorCard = ({ stats }) => {
  const formatCurrency = useCurrency();

  const canSpend = Math.max(stats.income - stats.expense, 0);
  const isOver = stats.income - stats.expense < 0;
  const spendingRatio =
    stats.income > 0
      ? Math.min((stats.expense / stats.income) * 100, 100)
      : stats.expense > 0
      ? 100
      : 0;
  const freePercent = Math.round(100 - spendingRatio);

  return (
    <div
      className="rounded-[20px] overflow-hidden flex flex-col h-full min-h-[210px] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
      style={{ background: "#0c0c0c" }}
    >
      {/* Blue top stripe */}
      <div className="w-full" style={{ height: 7, background: "#1a35f0" }} />

      {/* Body */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 pb-6 pt-4 gap-1">
        {/* "EAZY" ghost text */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 460 170"
          preserveAspectRatio="xMidYMid meet"
        >
          <text
            x="230"
            y="155"
            textAnchor="middle"
            fontFamily="'Inter','Arial',sans-serif"
            fontWeight="900"
            fontSize="160"
            fill="#c8f000"
            opacity="0.055"
            letterSpacing="-4"
          >
            EAZY
          </text>
        </svg>

        {/* Dot grid — corner */}
        <svg
          className="absolute bottom-2 right-2 pointer-events-none"
          style={{ width: 56, height: 56, opacity: 0.08 }}
          viewBox="0 0 60 60"
        >
          <g fill="#c8f000">
            {[8, 20, 32, 44].flatMap((x) =>
              [8, 20, 32, 44].map((y) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
              ))
            )}
          </g>
        </svg>

        {/* Label */}
        <p
          className="relative z-10 text-[11px] font-bold uppercase text-center"
          style={{ letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}
        >
          Você ainda pode gastar
        </p>

        {/* Value */}
        <PrivacyBlur
          className="relative z-10 font-black leading-none text-center"
          style={{
            fontSize: 46,
            letterSpacing: "-0.03em",
            color: isOver ? "#f87171" : "#1a35f0",
            textShadow: isOver
              ? "none"
              : "0 0 40px rgba(26,53,240,0.35)",
          }}
        >
          {isOver ? "Estourado" : formatCurrency(canSpend)}
        </PrivacyBlur>

        {/* Lime pill */}
        <div
          className="relative z-10 mt-1 px-4 py-1 rounded-full font-bold text-[11px]"
          style={{ background: "#c8f000", color: "#111" }}
        >
          {isOver ? "0% livre" : `${freePercent}% livre`}
        </div>
      </div>
    </div>
  );
};

export default MoneyIndicatorCard;
