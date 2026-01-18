"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { Tables } from "@/lib/database.types";
import { Plus, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Transaction = Tables<"transactions">;

interface TransactionsListProps {
  pendingTransactions: Transaction[];
  completedTransactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export function TransactionsList({
  pendingTransactions,
  completedTransactions,
  onEdit,
  onAdd,
  isLoading,
}: TransactionsListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasNoTransactions = pendingTransactions.length === 0 && completedTransactions.length === 0;

  if (hasNoTransactions) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">Nenhuma transacao neste mes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comece adicionando sua primeira receita ou despesa
          </p>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transacao
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pendentes */}
      <Card className={cn(
        pendingTransactions.length === 0 && "hidden lg:block"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-pending/10">
                <Clock className="h-4 w-4 text-pending" />
              </div>
              <CardTitle className="text-base font-semibold">
                Pendentes
              </CardTitle>
              <span className="text-xs bg-pending/10 text-pending px-2 py-0.5 rounded-full font-medium">
                {pendingTransactions.length}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 hidden md:flex"
              onClick={onAdd}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Nova
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {pendingTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma transacao pendente</p>
            </div>
          ) : (
            pendingTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Concluidas */}
      <Card className={cn(
        completedTransactions.length === 0 && "hidden lg:block"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-income/10">
              <CheckCircle2 className="h-4 w-4 text-income" />
            </div>
            <CardTitle className="text-base font-semibold">
              Concluidas
            </CardTitle>
            <span className="text-xs bg-income/10 text-income px-2 py-0.5 rounded-full font-medium">
              {completedTransactions.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {completedTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhuma transacao concluida</p>
            </div>
          ) : (
            completedTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
