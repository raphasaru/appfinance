"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  totalIncome: number;
  totalExpenses: number;
  completedIncome: number;
  completedExpenses: number;
  balance: number;
  isLoading?: boolean;
}

export function SummaryCard({
  totalIncome,
  totalExpenses,
  completedIncome,
  completedExpenses,
  balance,
  isLoading,
}: SummaryCardProps) {
  const incomeProgress = totalIncome > 0 ? (completedIncome / totalIncome) * 100 : 0;
  const expenseProgress = totalExpenses > 0 ? (completedExpenses / totalExpenses) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="mx-4 overflow-hidden">
        <CardContent className="p-5">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/2" />
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "mx-4 overflow-hidden border-0 shadow-lg transition-all duration-300",
      balance >= 0
        ? "bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-500/10"
        : "bg-gradient-to-br from-amber-600 to-amber-700 shadow-amber-500/20"
    )}>
      <CardContent className="p-5 relative">
        {/* Decorative elements */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-12 -bottom-6 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative">
          {/* Balance Hero */}
          <div className="flex items-center justify-between mb-5">
            <div className={cn(
              "flex items-center gap-2",
              balance >= 0 ? "text-slate-400" : "text-amber-200"
            )}>
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium">Saldo previsto</span>
            </div>
            <span className="text-3xl font-bold currency text-white tracking-tight">
              {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
            </span>
          </div>

          {/* Income/Expense Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Income */}
            <div className="bg-white/5 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-xs text-slate-300 font-medium">Receitas</span>
              </div>
              <p className="text-lg font-bold currency text-white">
                {formatCurrency(totalIncome)}
              </p>
              <div className="space-y-1">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(incomeProgress, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {Math.round(incomeProgress)}% recebido
                </p>
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-white/5 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-rose-400" />
                </div>
                <span className="text-xs text-slate-300 font-medium">Despesas</span>
              </div>
              <p className="text-lg font-bold currency text-white">
                {formatCurrency(totalExpenses)}
              </p>
              <div className="space-y-1">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(expenseProgress, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {Math.round(expenseProgress)}% pago
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
