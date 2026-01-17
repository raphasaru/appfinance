"use client";

import { useState } from "react";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Tables } from "@/lib/database.types";

type Transaction = Tables<"transactions">;

export default function TransacoesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading } = useTransactions(currentMonth);

  const filteredTransactions = transactions?.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  }) || [];

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingTransaction(null);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />

      <div className="px-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-4 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma transação encontrada</p>
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:bottom-8"
        onClick={() => setFormOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <TransactionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        transaction={editingTransaction}
        defaultDate={currentMonth}
      />
    </div>
  );
}
