"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { useTransactions, useBatchCompleteTransactions } from "@/lib/hooks/use-transactions";
import { useMonthlySummary } from "@/lib/hooks/use-summary";
import { useTransactionFilters, StatusFilter } from "@/lib/hooks/use-transaction-filters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Filter, TrendingUp, TrendingDown, Receipt, ArrowUpDown, CheckSquare, X, Check, Loader2, Clock } from "lucide-react";
import { Tables } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Transaction = Tables<"transactions">;

type TypeFilter = "all" | "income" | "expense";
type SortField = "date" | "description" | "amount";
type SortOrder = "asc" | "desc";

const sortLabels: Record<`${SortField}_${SortOrder}`, string> = {
  date_desc: "Mais recentes",
  date_asc: "Mais antigas",
  description_asc: "A-Z",
  description_desc: "Z-A",
  amount_desc: "Maior valor",
  amount_asc: "Menor valor",
};

export default function TransacoesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: transactions, isLoading } = useTransactions(currentMonth);
  const { data: summary } = useMonthlySummary(currentMonth);
  const batchCompleteMutation = useBatchCompleteTransactions();

  // Use shared filter hook
  const { filtered: statusFiltered, counts, statusFilter, setStatusFilter } =
    useTransactionFilters({ transactions });

  const sortKey = `${sortField}_${sortOrder}` as `${SortField}_${SortOrder}`;

  const filteredAndSortedTransactions = useMemo(() => {
    let result = statusFiltered;

    // Type filter (adicional)
    if (typeFilter !== "all") {
      result = result.filter(t => t.type === typeFilter);
    }

    // Sort transactions
    result = [...result].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison = new Date(a.due_date + "T00:00:00").getTime() - new Date(b.due_date + "T00:00:00").getTime();
          break;
        case "description":
          comparison = a.description.localeCompare(b.description, "pt-BR");
          break;
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [statusFiltered, typeFilter, sortField, sortOrder]);

  const filteredTransactions = filteredAndSortedTransactions;

  const incomeTransactions = transactions?.filter((t) => t.type === "income") || [];
  const expenseTransactions = transactions?.filter((t) => t.type === "expense") || [];

  const handleEdit = (transaction: Transaction) => {
    if (selectionMode) return;
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

  // Selection handlers
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedIds(new Set());
  };

  const handleSelectionChange = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    const pendingIds = filteredTransactions
      .filter(t => t.status === "planned")
      .map(t => t.id);
    setSelectedIds(new Set(pendingIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBatchComplete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await batchCompleteMutation.mutateAsync(Array.from(selectedIds));
      toast.success(`${selectedIds.size} transacoes marcadas como pagas`);
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch {
      toast.error("Erro ao atualizar transacoes");
    }
  };

  // Handler for status filter - maps StatusFilter to database status
  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
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
          title="Transacoes"
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={toggleSelectionMode}>
                <CheckSquare className="h-4 w-4 mr-2" />
                {selectionMode ? "Cancelar" : "Selecionar"}
              </Button>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Transacao
              </Button>
            </div>
          }
        />
      </div>

      {/* Status Filter Tabs - Mobile */}
      <div className="px-4 md:hidden">
        <TransactionFilters
          statusFilter={statusFilter}
          onStatusChange={handleStatusFilterChange}
          counts={counts}
          variant="pills"
        />
      </div>

      {/* Mobile Tabs + Sort */}
      <div className="px-4 md:hidden space-y-3">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSelectionMode}
              className="h-8"
            >
              <CheckSquare className="h-3.5 w-3.5 mr-1" />
              {selectionMode ? "Cancelar" : "Selecionar"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span className="text-xs">{sortLabels[sortKey]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuRadioGroup
                value={sortKey}
                onValueChange={(value) => {
                  const [field, order] = value.split("_") as [SortField, SortOrder];
                  setSortField(field);
                  setSortOrder(order);
                }}
              >
                <DropdownMenuRadioItem value="date_desc">Mais recentes</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="date_asc">Mais antigas</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="description_asc">A-Z</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="description_desc">Z-A</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="amount_desc">Maior valor</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="amount_asc">Menor valor</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selection Bar - when items are selected */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto bg-primary text-primary-foreground rounded-lg shadow-lg p-3 flex items-center justify-between gap-4 z-50 md:px-6">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedIds.size} selecionada(s)</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-7 text-xs"
            >
              Selecionar pendentes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-7 text-xs"
            >
              Limpar
            </Button>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleBatchComplete}
            disabled={batchCompleteMutation.isPending}
            className="gap-1.5"
          >
            {batchCompleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Marcar como pago
          </Button>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-6">
        {/* Filters Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Tipo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setTypeFilter("all")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  typeFilter === "all"
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
                onClick={() => setTypeFilter("income")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  typeFilter === "income"
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
                onClick={() => setTypeFilter("expense")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  typeFilter === "expense"
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

          {/* Status Filter */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => handleStatusFilterChange("all")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <span>Todas</span>
                <span className="text-xs opacity-70">{counts.all}</span>
              </button>
              <button
                onClick={() => handleStatusFilterChange("pending")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === "pending"
                    ? "bg-amber-500 text-white"
                    : "hover:bg-muted"
                )}
              >
                <span>Pendentes</span>
                {counts.pending > 0 ? (
                  <Badge variant="secondary" className={cn(
                    "h-5 px-1.5 text-xs",
                    statusFilter === "pending"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>
                    {counts.pending}
                  </Badge>
                ) : (
                  <span className="text-xs opacity-70">0</span>
                )}
              </button>
              <button
                onClick={() => handleStatusFilterChange("completed")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === "completed"
                    ? "bg-income text-white"
                    : "hover:bg-muted"
                )}
              >
                <span>Concluidas</span>
                <span className="text-xs opacity-70">{counts.completed}</span>
              </button>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Resumo do Mes</CardTitle>
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
                {typeFilter === "all" && statusFilter === "all" && "Todas as Transacoes"}
                {typeFilter === "all" && statusFilter === "pending" && "Transacoes Pendentes"}
                {typeFilter === "all" && statusFilter === "completed" && "Transacoes Concluidas"}
                {typeFilter === "income" && "Receitas"}
                {typeFilter === "expense" && "Despesas"}
              </CardTitle>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      <span className="text-xs">{sortLabels[sortKey]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuRadioGroup
                      value={sortKey}
                      onValueChange={(value) => {
                        const [field, order] = value.split("_") as [SortField, SortOrder];
                        setSortField(field);
                        setSortOrder(order);
                      }}
                    >
                      <DropdownMenuRadioItem value="date_desc">Mais recentes</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="date_asc">Mais antigas</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="description_asc">A-Z</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="description_desc">Z-A</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="amount_desc">Maior valor</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="amount_asc">Menor valor</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-sm text-muted-foreground">
                  {filteredTransactions.length} {filteredTransactions.length === 1 ? "item" : "itens"}
                </span>
              </div>
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
                    selectable={selectionMode}
                    selected={selectedIds.has(transaction.id)}
                    onSelectionChange={handleSelectionChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma transacao encontrada</p>
                <p className="text-sm mt-1">Clique em "Nova Transacao" para adicionar</p>
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
              selectable={selectionMode}
              selected={selectedIds.has(transaction.id)}
              onSelectionChange={handleSelectionChange}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhuma transacao encontrada</p>
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      {!selectionMode && (
        <Button
          size="lg"
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
          onClick={handleAdd}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <TransactionForm
        open={formOpen}
        onOpenChange={handleFormClose}
        transaction={editingTransaction}
        defaultDate={currentMonth}
      />
    </div>
  );
}
