"use client";

import { CreditCard, MoreVertical } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface CreditCardData {
  id: string;
  name: string;
  creditLimit: number;
  currentBill: number;
  dueDay: number;
  color?: string;
}

interface CreditCardCardProps {
  card: CreditCardData;
  onEdit?: (card: CreditCardData) => void;
  onDelete?: (card: CreditCardData) => void;
}

export function CreditCardCard({ card, onEdit, onDelete }: CreditCardCardProps) {
  const usedPercentage = Math.min((card.currentBill / card.creditLimit) * 100, 100);
  const availableLimit = card.creditLimit - card.currentBill;

  const getProgressColor = () => {
    if (usedPercentage >= 80) return "bg-expense";
    if (usedPercentage >= 50) return "bg-pending";
    return "bg-income";
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-border space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
          <CreditCard className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{card.name}</p>
          <p className="text-sm text-muted-foreground">
            Vence dia {card.dueDay}
          </p>
        </div>

        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(card)}>
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(card)}
                  className="text-destructive"
                >
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Limit Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Fatura atual</span>
          <span className="font-semibold text-expense currency">
            {formatCurrency(card.currentBill)}
          </span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-500", getProgressColor())}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Disponível: {formatCurrency(availableLimit)}</span>
          <span>Limite: {formatCurrency(card.creditLimit)}</span>
        </div>
      </div>
    </div>
  );
}
