"use client";

import { useState } from "react";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useMonthlySummary } from "@/lib/hooks/use-summary";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tables } from "@/lib/database.types";

type Transaction = Tables<"transactions">;

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading: transactionsLoading } = useTransactions(currentMonth);
  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(currentMonth);

  const pendingTransactions = transactions?.filter((t) => t.status === "planned") || [];
  const completedTransactions = transactions?.filter((t) => t.status === "completed") || [];

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

      <SummaryCard
        totalIncome={summary?.totalIncome || 0}
        totalExpenses={summary?.totalExpenses || 0}
        completedIncome={summary?.completedIncome || 0}
        completedExpenses={summary?.completedExpenses || 0}
        balance={summary?.balance || 0}
        isLoading={summaryLoading}
      />

      <div className="px-4 space-y-4">
        {pendingTransactions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Pendentes ({pendingTransactions.length})
            </h3>
            <div className="space-y-2">
              {pendingTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </div>
        )}

        {completedTransactions.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Concluídas ({completedTransactions.length})
            </h3>
            <div className="space-y-2">
              {completedTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          </div>
        )}

        {!transactionsLoading && transactions?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma transação neste mês</p>
            <p className="text-sm mt-1">Toque no + para adicionar</p>
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
