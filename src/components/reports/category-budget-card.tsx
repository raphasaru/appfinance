"use client";

import {
  Home,
  Zap,
  CreditCard,
  User,
  FileText,
  UtensilsCrossed,
  Car,
  MoreHorizontal,
  LucideIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { ExpenseCategory, getCategoryLabel } from "@/lib/utils/categories";

const categoryIconMap: Record<ExpenseCategory, LucideIcon> = {
  fixed_housing: Home,
  fixed_utilities: Zap,
  fixed_subscriptions: CreditCard,
  fixed_personal: User,
  fixed_taxes: FileText,
  variable_credit: CreditCard,
  variable_food: UtensilsCrossed,
  variable_transport: Car,
  variable_other: MoreHorizontal,
};

const categoryColors: Record<ExpenseCategory, string> = {
  fixed_housing: "bg-blue-500",
  fixed_utilities: "bg-yellow-500",
  fixed_subscriptions: "bg-purple-500",
  fixed_personal: "bg-pink-500",
  fixed_taxes: "bg-gray-500",
  variable_credit: "bg-orange-500",
  variable_food: "bg-green-500",
  variable_transport: "bg-cyan-500",
  variable_other: "bg-slate-500",
};

export interface CategoryBudget {
  category: ExpenseCategory;
  spent: number;
  budget: number;
}

interface CategoryBudgetCardProps {
  data: CategoryBudget;
  onClick?: () => void;
}

export function CategoryBudgetCard({ data, onClick }: CategoryBudgetCardProps) {
  const { category, spent, budget } = data;
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOverBudget = spent > budget;
  const remaining = budget - spent;

  const Icon = categoryIconMap[category] || MoreHorizontal;
  const bgColor = categoryColors[category] || "bg-slate-500";

  const getProgressColor = () => {
    if (isOverBudget) return "bg-expense";
    if (percentage >= 80) return "bg-pending";
    return "bg-income";
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors text-left"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-xl", bgColor)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{getCategoryLabel(category)}</p>
        </div>
        <span
          className={cn(
            "text-sm font-semibold currency",
            isOverBudget ? "text-expense" : "text-foreground"
          )}
        >
          {formatCurrency(spent)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500 rounded-full", getProgressColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {isOverBudget ? (
              <span className="text-expense">
                Excedido em {formatCurrency(Math.abs(remaining))}
              </span>
            ) : (
              `Resta ${formatCurrency(remaining)}`
            )}
          </span>
          <span>Meta: {formatCurrency(budget)}</span>
        </div>
      </div>
    </button>
  );
}
