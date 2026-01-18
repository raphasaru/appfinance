"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
      <Card className="overflow-hidden group hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-income/10">
                  <TrendingUp className="h-4 w-4 text-income" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Receitas</span>
              </div>
              <p className="text-2xl font-bold tracking-tight currency text-income">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-income bg-income/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              {Math.round(incomeProgress)}%
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-income rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(incomeProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(completedIncome)} recebido de {formatCurrency(totalIncome)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Despesas Card */}
      <Card className="overflow-hidden group hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-expense/10">
                  <TrendingDown className="h-4 w-4 text-expense" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Despesas</span>
              </div>
              <p className="text-2xl font-bold tracking-tight currency text-expense">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-expense bg-expense/10 px-2 py-1 rounded-full">
              <ArrowDownRight className="h-3 w-3" />
              {Math.round(expenseProgress)}%
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-expense rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(expenseProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(completedExpenses)} pago de {formatCurrency(totalExpenses)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saldo Card */}
      <Card className={cn(
        "overflow-hidden group hover:shadow-md transition-shadow duration-300",
        balance >= 0 ? "bg-gradient-to-br from-income/5 to-transparent" : "bg-gradient-to-br from-expense/5 to-transparent"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  balance >= 0 ? "bg-income/10" : "bg-expense/10"
                )}>
                  <Wallet className={cn("h-4 w-4", balance >= 0 ? "text-income" : "text-expense")} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Saldo Previsto</span>
              </div>
              <p className={cn(
                "text-2xl font-bold tracking-tight currency",
                balance >= 0 ? "text-income" : "text-expense"
              )}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Receitas - Despesas</span>
              <span className={cn(
                "font-medium currency",
                balance >= 0 ? "text-income" : "text-expense"
              )}>
                {balance >= 0 ? "+" : ""}{formatCurrency(balance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
