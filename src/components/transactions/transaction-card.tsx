"use client";

import { Tables } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils/currency";
import { getCategoryLabel, ExpenseCategory } from "@/lib/utils/categories";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Home,
  Zap,
  CreditCard,
  User,
  FileText,
  UtensilsCrossed,
  Car,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  LucideIcon,
  Check,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompleteTransaction, useUncompleteTransaction } from "@/lib/hooks/use-transactions";
import { toast } from "sonner";

type Transaction = Tables<"transactions">;

// Map categories to icons
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

// Map categories to colors
const categoryColorMap: Record<ExpenseCategory, string> = {
  fixed_housing: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  fixed_utilities: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  fixed_subscriptions: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  fixed_personal: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  fixed_taxes: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  variable_credit: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  variable_food: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  variable_transport: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  variable_other: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
};

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, onEdit }: TransactionCardProps) {
  const isIncome = transaction.type === "income";
  const isCompleted = transaction.status === "completed";
  const category = transaction.category as ExpenseCategory | null;

  const completeMutation = useCompleteTransaction();
  const uncompleteMutation = useUncompleteTransaction();
  const isToggling = completeMutation.isPending || uncompleteMutation.isPending;

  // Get icon and color based on transaction type and category
  const Icon = isIncome
    ? ArrowUpRight
    : category
    ? categoryIconMap[category] || MoreHorizontal
    : MoreHorizontal;

  const iconColorClass = isIncome
    ? "bg-income/10 text-income"
    : category
    ? categoryColorMap[category]
    : "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isCompleted) {
        await uncompleteMutation.mutateAsync(transaction.id);
        toast.success("Transação marcada como pendente");
      } else {
        await completeMutation.mutateAsync(transaction.id);
        toast.success("Transação marcada como paga");
      }
    } catch {
      toast.error("Erro ao atualizar transação");
    }
  };

  return (
    <div
      onClick={() => onEdit?.(transaction)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-card border cursor-pointer transition-colors",
        isCompleted
          ? "border-border hover:border-primary/30"
          : "border-dashed border-muted-foreground/30 hover:border-primary/50"
      )}
    >
      {/* Status Toggle Button */}
      <button
        onClick={handleToggleStatus}
        disabled={isToggling}
        className={cn(
          "flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
          isCompleted
            ? "bg-income border-income text-white"
            : "border-muted-foreground/40 hover:border-primary hover:bg-primary/10"
        )}
      >
        {isToggling ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : isCompleted ? (
          <Check className="h-3 w-3" />
        ) : null}
      </button>

      {/* Category Icon */}
      <div className={cn("p-2.5 rounded-xl flex-shrink-0", iconColorClass)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Description and Meta */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          !isCompleted && "text-muted-foreground"
        )}>
          {transaction.description}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          <span>
            {format(new Date(transaction.due_date), "dd MMM", { locale: ptBR })}
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span>{getCategoryLabel(category)}</span>
          {!isCompleted && (
            <>
              <span className="text-muted-foreground/50">•</span>
              <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-500">
                <Clock className="h-3 w-3" />
                Pendente
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <span
          className={cn(
            "font-semibold currency",
            isIncome ? "text-income" : "text-expense",
            !isCompleted && "opacity-70"
          )}
        >
          {isIncome ? "+" : "-"}{formatCurrency(Number(transaction.amount))}
        </span>
      </div>
    </div>
  );
}
