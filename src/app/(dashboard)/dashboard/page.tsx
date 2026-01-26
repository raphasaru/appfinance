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
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useMonthlySummary } from "@/lib/hooks/use-summary";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronRight } from "lucide-react";
import { Tables } from "@/lib/database.types";

type Transaction = Tables<"transactions">;

type StatusFilter = "all" | "pending" | "completed";

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading: transactionsLoading } = useTransactions(currentMonth);
  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(currentMonth);

  const pendingTransactions = transactions?.filter((t) => t.status === "planned") || [];
  const completedTransactions = transactions?.filter((t) => t.status === "completed") || [];

  // Filter and sort transactions for mobile view
  const filteredTransactions = useMemo(() => {
    let result = transactions || [];

    if (statusFilter === "pending") {
      result = result.filter((t) => t.status === "planned");
    } else if (statusFilter === "completed") {
      result = result.filter((t) => t.status === "completed");
    }

    // Sort by date descending (most recent first)
    return [...result].sort((a, b) =>
      new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    );
  }, [transactions, statusFilter]);

  // Get recent 5 transactions sorted by date (for "all" filter display limit)
  const displayTransactions = statusFilter === "all"
    ? filteredTransactions.slice(0, 5)
    : filteredTransactions;

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
              Nova Transação
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
            <h2 className="text-base font-semibold">Transações</h2>
            <Link
              href="/transacoes"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              Ver tudo
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Status Filter Tabs */}
          <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">
                Todas
                <span className="ml-1.5 text-[10px] opacity-70">
                  {transactions?.length || 0}
                </span>
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">
                Pendentes
                <span className="ml-1.5 text-[10px] opacity-70">
                  {pendingTransactions.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                Concluídas
                <span className="ml-1.5 text-[10px] opacity-70">
                  {completedTransactions.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

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
              {statusFilter === "all" && filteredTransactions.length > 5 && (
                <Link
                  href="/transacoes"
                  className="block text-center py-3 text-sm text-primary hover:text-primary-light transition-colors"
                >
                  Ver mais {filteredTransactions.length - 5} transações
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl">
              <p>
                {statusFilter === "pending" && "Nenhuma transação pendente"}
                {statusFilter === "completed" && "Nenhuma transação concluída"}
                {statusFilter === "all" && "Nenhuma transação neste mês"}
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
