"use client";

import { useState } from "react";
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

interface SubCardData {
  label: string;
  value: number;
  type: "income" | "expense" | "neutral";
  icon?: React.ReactNode;
}

interface HeroBalanceCardProps {
  title: string;
  value: number;
  subCards?: SubCardData[];
  className?: string;
  showVisibilityToggle?: boolean;
}

export function HeroBalanceCard({
  title,
  value,
  subCards,
  className,
  showVisibilityToggle = true,
}: HeroBalanceCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const formatValue = (val: number) => {
    if (!isVisible) return "R$ ••••••";
    return formatCurrency(val);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-primary-dark to-primary p-5",
        className
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/5" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-white/80 uppercase tracking-wide">
          {title}
        </span>
        {showVisibilityToggle && (
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isVisible ? "Ocultar valor" : "Mostrar valor"}
          >
            {isVisible ? (
              <Eye className="h-4 w-4 text-white/90" />
            ) : (
              <EyeOff className="h-4 w-4 text-white/90" />
            )}
          </button>
        )}
      </div>

      {/* Main value */}
      <div className="relative mb-6">
        <span className="text-3xl font-bold text-white tracking-tight currency">
          {formatValue(value)}
        </span>
      </div>

      {/* Sub cards */}
      {subCards && subCards.length > 0 && (
        <div className="relative grid grid-cols-2 gap-3">
          {subCards.map((card, index) => (
            <div
              key={index}
              className="rounded-xl bg-white/10 backdrop-blur-sm p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                {card.type === "income" ? (
                  <div className="p-1 rounded-md bg-income/20">
                    <ArrowUpRight className="h-3.5 w-3.5 text-green-300" />
                  </div>
                ) : card.type === "expense" ? (
                  <div className="p-1 rounded-md bg-expense/20">
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-300" />
                  </div>
                ) : (
                  card.icon
                )}
                <span className="text-xs font-medium text-white/70">
                  {card.label}
                </span>
              </div>
              <span
                className={cn(
                  "text-lg font-semibold currency",
                  card.type === "income" && "text-green-300",
                  card.type === "expense" && "text-red-300",
                  card.type === "neutral" && "text-white"
                )}
              >
                {formatValue(card.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
