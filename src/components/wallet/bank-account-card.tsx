"use client";

import { Building2, MoreVertical } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BankAccount {
  id: string;
  name: string;
  type: "checking" | "savings" | "investment";
  balance: number;
  bankName?: string;
  color?: string;
}

interface BankAccountCardProps {
  account: BankAccount;
  onEdit?: (account: BankAccount) => void;
  onDelete?: (account: BankAccount) => void;
}

const accountTypeLabels: Record<BankAccount["type"], string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  investment: "Investimento",
};

export function BankAccountCard({ account, onEdit, onDelete }: BankAccountCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
      <div
        className={cn(
          "p-3 rounded-xl",
          account.color ? `bg-[${account.color}]/10` : "bg-primary/10"
        )}
      >
        <Building2 className="h-5 w-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{account.name}</p>
        <p className="text-sm text-muted-foreground">
          {accountTypeLabels[account.type]}
        </p>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "font-semibold currency",
            account.balance >= 0 ? "text-income" : "text-expense"
          )}
        >
          {formatCurrency(account.balance)}
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
              <DropdownMenuItem onClick={() => onEdit(account)}>
                Editar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(account)}
                className="text-destructive"
              >
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
