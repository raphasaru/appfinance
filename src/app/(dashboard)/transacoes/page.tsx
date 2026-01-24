"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useMonthlySummary } from "@/lib/hooks/use-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { Tables } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";

type Transaction = Tables<"transactions">;

export default function TransacoesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const { data: transactions, isLoading } = useTransactions(currentMonth);
  const { data: summary } = useMonthlySummary(currentMonth);

  const filteredTransactions = transactions?.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  }) || [];

  const incomeTransactions = transactions?.filter((t) => t.type === "income") || [];
  const expenseTransactions = transactions?.filter((t) => t.type === "expense") || [];

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
          title="Transações"
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

      {/* Mobile Tabs */}
      <div className="px-4 md:hidden">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Filtros</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setFilter("all")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <span>Todas</span>
                </div>
                <span className="text-xs opacity-70">
                  {transactions?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setFilter("income")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  filter === "income"
                    ? "bg-income text-white"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Receitas</span>
                </div>
                <span className="text-xs opacity-70">
                  {incomeTransactions.length}
                </span>
              </button>
              <button
                onClick={() => setFilter("expense")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  filter === "expense"
                    ? "bg-expense text-white"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  <span>Despesas</span>
                </div>
                <span className="text-xs opacity-70">
                  {expenseTransactions.length}
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resumo do Mês</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Receitas</span>
                <span className="font-medium currency text-income">
                  {formatCurrency(summary?.totalIncome || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Despesas</span>
                <span className="font-medium currency text-expense">
                  {formatCurrency(summary?.totalExpenses || 0)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Saldo</span>
                  <span className={cn(
                    "font-bold currency",
                    (summary?.balance || 0) >= 0 ? "text-income" : "text-expense"
                  )}>
                    {formatCurrency(summary?.balance || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {filter === "all" && "Todas as Transações"}
                {filter === "income" && "Receitas"}
                {filter === "expense" && "Despesas"}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? "item" : "itens"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma transação encontrada</p>
                <p className="text-sm mt-1">Clique em "Nova Transação" para adicionar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Transactions */}
      <div className="px-4 space-y-2 md:hidden">
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
