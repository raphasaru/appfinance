"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { Tables } from "@/lib/database.types";
import { StatusFilter, TransactionCounts } from "@/lib/hooks/use-transaction-filters";
import { Plus } from "lucide-react";

type Transaction = Tables<"transactions">;

interface TransactionsListProps {
  transactions: Transaction[];
  statusFilter: StatusFilter;
  onStatusChange: (filter: StatusFilter) => void;
  counts: TransactionCounts;
  onEdit: (transaction: Transaction) => void;
  onAdd: () => void;
  isLoading?: boolean;
}

export function TransactionsList({
  transactions,
  statusFilter,
  onStatusChange,
  counts,
  onEdit,
  onAdd,
  isLoading,
}: TransactionsListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((j) => (
            <div key={j} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasNoTransactions = counts.all === 0;

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Transacoes</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={onAdd}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nova
          </Button>
        </div>
        <TransactionFilters
          statusFilter={statusFilter}
          onStatusChange={onStatusChange}
          counts={counts}
          variant="pills"
          className="mt-3"
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              {statusFilter === "pending" && "Nenhuma transacao pendente"}
              {statusFilter === "completed" && "Nenhuma transacao concluida"}
              {statusFilter === "all" && "Nenhuma transacao"}
            </p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={onEdit}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
