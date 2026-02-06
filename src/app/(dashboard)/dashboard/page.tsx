"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { HeroBalanceCard } from "@/components/dashboard/hero-balance-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionsList } from "@/components/dashboard/transactions-list";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useMonthlySummary } from "@/lib/hooks/use-summary";
import { useTransactionFilters } from "@/lib/hooks/use-transaction-filters";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight } from "lucide-react";
import { Tables } from "@/lib/database.types";

type Transaction = Tables<"transactions">;

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading: transactionsLoading } = useTransactions(currentMonth);
  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(currentMonth);

  // Use centralized filter hook
  const { filtered, counts, statusFilter, setStatusFilter } = useTransactionFilters({
    transactions,
  });

  // Sort filtered transactions by date descending
  const sortedTransactions = useMemo(() => {
    return [...filtered].sort((a, b) =>
      new Date(b.due_date + "T00:00:00").getTime() - new Date(a.due_date + "T00:00:00").getTime()
    );
  }, [filtered]);

  // Limit display on mobile for "all" filter
  const displayTransactions = statusFilter === "all"
    ? sortedTransactions.slice(0, 5)
    : sortedTransactions;

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

      {/* Mobile Layout */}
      <div className="md:hidden px-4 space-y-5">
        {/* Month Selector */}
        <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />

        {/* Hero Balance Card */}
        <HeroBalanceCard
          title="Saldo Total"
          value={summary?.balance || 0}
          subCards={[
            {
              label: "Receitas",
              value: summary?.totalIncome || 0,
              type: "income",
            },
            {
              label: "Despesas",
              value: summary?.totalExpenses || 0,
              type: "expense",
            },
          ]}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Transactions with Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Transacoes</h2>
            <Link
              href="/transacoes"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              Ver tudo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Status Filter Tabs */}
          <TransactionFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            counts={counts}
            variant="tabs"
          />

          {transactionsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : displayTransactions.length > 0 ? (
            <div className="space-y-2">
              {displayTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={handleEdit}
                />
              ))}
              {statusFilter === "all" && sortedTransactions.length > 5 && (
                <Link
                  href="/transacoes"
                  className="block text-center py-3 text-sm text-primary hover:text-primary-light transition-colors"
                >
                  Ver mais {sortedTransactions.length - 5} transacoes
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl">
              <p>
                {statusFilter === "pending" && "Nenhuma transacao pendente"}
                {statusFilter === "completed" && "Nenhuma transacao concluida"}
                {statusFilter === "all" && "Nenhuma transacao neste mes"}
              </p>
              <p className="text-sm mt-1">Toque no + para adicionar</p>
            </div>
          )}
        </div>
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

      {/* Desktop Transactions */}
      <div className="hidden md:block">
        <TransactionsList
          transactions={sortedTransactions}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          counts={counts}
          onEdit={handleEdit}
          onAdd={handleAdd}
          isLoading={transactionsLoading}
        />
      </div>

      {/* Mobile FAB */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40 bg-primary hover:bg-primary-light"
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
