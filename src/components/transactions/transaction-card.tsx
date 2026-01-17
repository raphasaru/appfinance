"use client";

import { Tables } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils/currency";
import { getCategoryLabel } from "@/lib/utils/categories";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Circle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCompleteTransaction, useDeleteTransaction } from "@/lib/hooks/use-transactions";
import { toast } from "sonner";

type Transaction = Tables<"transactions">;

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, onEdit }: TransactionCardProps) {
  const completeMutation = useCompleteTransaction();
  const deleteMutation = useDeleteTransaction();

  const isCompleted = transaction.status === "completed";
  const isIncome = transaction.type === "income";

  const handleComplete = () => {
    completeMutation.mutate(transaction.id, {
      onSuccess: () => {
        toast.success("Transação concluída!");
      },
      onError: () => {
        toast.error("Erro ao concluir transação");
      },
    });
  };

  const handleDelete = () => {
    if (confirm("Deseja excluir esta transação?")) {
      deleteMutation.mutate(transaction.id, {
        onSuccess: () => {
          toast.success("Transação excluída");
        },
        onError: () => {
          toast.error("Erro ao excluir transação");
        },
      });
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors",
        isCompleted && "opacity-60"
      )}
    >
      <button
        onClick={handleComplete}
        disabled={isCompleted || completeMutation.isPending}
        className={cn(
          "flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
          isCompleted
            ? "bg-primary border-primary"
            : "border-muted-foreground hover:border-primary"
        )}
      >
        {isCompleted && <Check className="h-3 w-3 text-primary-foreground" />}
      </button>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit?.(transaction)}
      >
        <div className="flex items-center justify-between gap-2">
          <p className={cn("font-medium truncate", isCompleted && "line-through")}>
            {transaction.description}
          </p>
          <span
            className={cn(
              "font-semibold currency whitespace-nowrap",
              isIncome ? "text-income" : "text-expense"
            )}
          >
            {isIncome ? "+" : "-"} {formatCurrency(Number(transaction.amount))}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span>{getCategoryLabel(transaction.category)}</span>
          <span>·</span>
          <span>
            {format(new Date(transaction.due_date), "dd MMM", { locale: ptBR })}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
