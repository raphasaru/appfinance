"use client";

import { useState } from "react";
import { Tables } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils/currency";
import { getCategoryLabel, ExpenseCategory } from "@/lib/utils/categories";
import { getPaymentMethodIcon, getPaymentMethodColor, PaymentMethod } from "@/lib/utils/payment-methods";
import { isDueSoon, isOverdue } from "@/lib/utils/credit-card";
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
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompleteTransaction, useUncompleteTransaction } from "@/lib/hooks/use-transactions";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";

type Transaction = Tables<"transactions"> & {
  transaction_items?: Array<{
    id: string;
    description: string;
    amount: number;
    quantity: number;
  }>;
};

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
  selectable?: boolean;
  selected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
}

export function TransactionCard({
  transaction,
  onEdit,
  selectable = false,
  selected = false,
  onSelectionChange,
}: TransactionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isIncome = transaction.type === "income";
  const isCompleted = transaction.status === "completed";
  const category = transaction.category as ExpenseCategory | null;
  const paymentMethod = transaction.payment_method as PaymentMethod | null;
  const hasInstallments = transaction.total_installments && transaction.total_installments > 1;
  const hasItems = transaction.transaction_items && transaction.transaction_items.length > 0;

  const completeMutation = useCompleteTransaction();
  const uncompleteMutation = useUncompleteTransaction();
  const isToggling = completeMutation.isPending || uncompleteMutation.isPending;

  // Check due date status
  const dueSoon = !isCompleted && !isIncome && isDueSoon(transaction.due_date, 3);
  const overdue = !isCompleted && !isIncome && isOverdue(transaction.due_date);

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

  const PaymentIcon = getPaymentMethodIcon(paymentMethod);
  const paymentColor = getPaymentMethodColor(paymentMethod);

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

  const handleCheckboxChange = (checked: boolean) => {
    onSelectionChange?.(transaction.id, checked);
  };

  const cardContent = (
    <div
      onClick={() => !selectable && onEdit?.(transaction)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl bg-card border cursor-pointer transition-colors",
        isCompleted
          ? "border-border hover:border-primary/30"
          : "border-dashed border-muted-foreground/30 hover:border-primary/50",
        dueSoon && "border-amber-400 dark:border-amber-600 border-solid",
        overdue && "border-red-400 dark:border-red-600 border-solid"
      )}
    >
      {/* Checkbox for selection mode */}
      {selectable ? (
        <Checkbox
          checked={selected}
          onCheckedChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        />
      ) : (
        /* Status Toggle Button */
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
      )}

      {/* Category Icon */}
      <div className={cn("p-2.5 rounded-xl flex-shrink-0", iconColorClass)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Description and Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "font-medium truncate",
            !isCompleted && "text-muted-foreground"
          )}>
            {transaction.description}
          </p>
          {hasInstallments && (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              {transaction.installment_number}/{transaction.total_installments}
            </span>
          )}
          {PaymentIcon && (
            <PaymentIcon className={cn("h-3.5 w-3.5 flex-shrink-0", paymentColor)} />
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
          <span>
            {format(new Date(transaction.due_date), "dd MMM", { locale: ptBR })}
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span>{getCategoryLabel(category)}</span>
          {!isCompleted && (
            <>
              <span className="text-muted-foreground/50">•</span>
              {overdue ? (
                <span className="flex items-center gap-0.5 text-red-600 dark:text-red-500">
                  <AlertTriangle className="h-3 w-3" />
                  Vencida
                </span>
              ) : dueSoon ? (
                <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="h-3 w-3" />
                  Vence em breve
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-500">
                  <Clock className="h-3 w-3" />
                  Pendente
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Amount and expand button */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
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
        {hasItems && (
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        )}
      </div>
    </div>
  );

  if (hasItems) {
    return (
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          {cardContent}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-10 mt-1 space-y-1 pb-2">
            {transaction.transaction_items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-1.5 text-sm bg-muted/50 rounded-lg"
              >
                <span className="text-muted-foreground">
                  {item.quantity > 1 && `${item.quantity}x `}{item.description}
                </span>
                <span className="font-medium currency">
                  {formatCurrency(Number(item.amount) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return cardContent;
}
