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
      <Card className="mx-4">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2" />
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
    <Card className="mx-4">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Saldo previsto</span>
          </div>
          <span
            className={cn(
              "text-2xl font-bold currency",
              balance >= 0 ? "text-income" : "text-expense"
            )}
          >
            {formatCurrency(balance)}
          </span>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                <span>Receitas</span>
              </div>
              <span className="currency text-income font-medium">
                {formatCurrency(totalIncome)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-income transition-all duration-500"
                style={{ width: `${Math.min(incomeProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(completedIncome)} recebido ({Math.round(incomeProgress)}%)
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                <span>Despesas</span>
              </div>
              <span className="currency text-expense font-medium">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-expense transition-all duration-500"
                style={{ width: `${Math.min(expenseProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(completedExpenses)} pago ({Math.round(expenseProgress)}%)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
