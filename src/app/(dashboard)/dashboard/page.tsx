"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionsList } from "@/components/dashboard/transactions-list";
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

  const handleAdd = () => {
    setEditingTransaction(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          title="Dashboard"
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          action={
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transacao
            </Button>
          }
        />
      </div>

      {/* Mobile Summary */}
      <div className="md:hidden">
        <SummaryCard
          totalIncome={summary?.totalIncome || 0}
          totalExpenses={summary?.totalExpenses || 0}
          completedIncome={summary?.completedIncome || 0}
          completedExpenses={summary?.completedExpenses || 0}
          balance={summary?.balance || 0}
          isLoading={summaryLoading}
        />
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:block">
        <SummaryCards
          totalIncome={summary?.totalIncome || 0}
          totalExpenses={summary?.totalExpenses || 0}
          completedIncome={summary?.completedIncome || 0}
          completedExpenses={summary?.completedExpenses || 0}
          balance={summary?.balance || 0}
          isLoading={summaryLoading}
        />
      </div>

      {/* Mobile Transactions */}
      <div className="px-4 space-y-4 md:hidden">
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
              Concluidas ({completedTransactions.length})
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
            <p>Nenhuma transacao neste mes</p>
            <p className="text-sm mt-1">Toque no + para adicionar</p>
          </div>
        )}
      </div>

      {/* Desktop Transactions */}
      <div className="hidden md:block">
        <TransactionsList
          pendingTransactions={pendingTransactions}
          completedTransactions={completedTransactions}
          onEdit={handleEdit}
          onAdd={handleAdd}
          isLoading={transactionsLoading}
        />
      </div>

      {/* Mobile FAB */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
        onClick={handleAdd}
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
