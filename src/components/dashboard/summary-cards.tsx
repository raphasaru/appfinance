"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  completedIncome: number;
  completedExpenses: number;
  balance: number;
  isLoading?: boolean;
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  completedIncome,
  completedExpenses,
  balance,
  isLoading,
}: SummaryCardsProps) {
  const incomeProgress = totalIncome > 0 ? (completedIncome / totalIncome) * 100 : 0;
  const expenseProgress = totalExpenses > 0 ? (completedExpenses / totalExpenses) * 100 : 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-8 bg-muted rounded w-2/3" />
                <div className="h-2 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Receitas Card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300">
        <CardContent className="p-6 relative">
          {/* Decorative elements */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-4 h-16 w-16 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center gap-2 text-emerald-100">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Receitas</span>
            </div>

            <p className="text-3xl font-bold mt-2 currency tracking-tight">
              {formatCurrency(totalIncome)}
            </p>

            {/* Progress section */}
            <div className="mt-4 space-y-2">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(incomeProgress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-emerald-100">
                  {formatCurrency(completedIncome)} recebido
                </p>
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  {Math.round(incomeProgress)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Despesas Card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 transition-all duration-300">
        <CardContent className="p-6 relative">
          {/* Decorative elements */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-4 h-16 w-16 rounded-full bg-white/5" />

          <div className="relative">
            <div className="flex items-center gap-2 text-rose-100">
              <TrendingDown className="h-5 w-5" />
              <span className="text-sm font-medium">Despesas</span>
            </div>

            <p className="text-3xl font-bold mt-2 currency tracking-tight">
              {formatCurrency(totalExpenses)}
            </p>

            {/* Progress section */}
            <div className="mt-4 space-y-2">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(expenseProgress, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-rose-100">
                  {formatCurrency(completedExpenses)} pago
                </p>
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                  {Math.round(expenseProgress)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Card */}
      <Card className={cn(
        "overflow-hidden border-0 text-white shadow-lg transition-all duration-300",
        balance >= 0
          ? "bg-gradient-to-br from-slate-700 to-slate-800 shadow-slate-500/20 hover:shadow-xl hover:shadow-slate-500/30"
          : "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
      )}>
        <CardContent className="p-6 relative">
          {/* Decorative elements */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-4 h-16 w-16 rounded-full bg-white/5" />
          <div className="absolute left-1/2 -bottom-8 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative">
            <div className={cn(
              "flex items-center gap-2",
              balance >= 0 ? "text-slate-300" : "text-amber-100"
            )}>
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium">Saldo Previsto</span>
            </div>

            <p className="text-3xl font-bold mt-2 currency tracking-tight">
              {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
            </p>

            {/* Summary section */}
            <div className={cn(
              "mt-4 pt-4 border-t",
              balance >= 0 ? "border-white/10" : "border-white/20"
            )}>
              <div className="flex items-center justify-between text-sm">
                <div className="space-y-1">
                  <p className={cn(
                    "text-xs",
                    balance >= 0 ? "text-slate-400" : "text-amber-100"
                  )}>
                    Receitas - Despesas
                  </p>
                </div>
                <div className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  balance >= 0
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/20 text-white"
                )}>
                  {balance >= 0 ? "Positivo" : "Negativo"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
