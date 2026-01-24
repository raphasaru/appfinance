"use client";

import { useState } from "react";
import { HeroBalanceCard } from "@/components/dashboard/hero-balance-card";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { PageHeader } from "@/components/dashboard/page-header";
import { BankAccountCard } from "@/components/wallet/bank-account-card";
import { CreditCardCard } from "@/components/wallet/credit-card-card";
import { BankAccountForm } from "@/components/wallet/bank-account-form";
import { CreditCardForm } from "@/components/wallet/credit-card-form";
import { TransactionCard } from "@/components/transactions/transaction-card";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { useBankAccounts, useDeleteBankAccount } from "@/lib/hooks/use-bank-accounts";
import { useCreditCards, useDeleteCreditCard } from "@/lib/hooks/use-credit-cards";
import { useTransactions } from "@/lib/hooks/use-transactions";
import { useMonthlySummary } from "@/lib/hooks/use-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, TrendingUp, TrendingDown, Wallet, Building2, Receipt, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { Tables } from "@/lib/database.types";
import { toast } from "sonner";

type BankAccount = Tables<"bank_accounts">;
type CreditCard = Tables<"credit_cards">;
type Transaction = Tables<"transactions">;

export default function CarteiraPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"overview" | "transactions">("overview");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  // Bank account states
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Credit card states
  const [cardFormOpen, setCardFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  // Transaction states
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Data hooks
  const { data: accounts, isLoading: accountsLoading } = useBankAccounts();
  const { data: creditCards, isLoading: cardsLoading } = useCreditCards();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(currentMonth);
  const { data: summary } = useMonthlySummary(currentMonth);
  const deleteAccountMutation = useDeleteBankAccount();
  const deleteCardMutation = useDeleteCreditCard();

  // Calculate totals
  const totalAccounts = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
  const totalInvestments = 0; // Will come from investments hook
  const totalPatrimony = totalAccounts + totalInvestments;
  const totalCreditUsed = creditCards?.reduce((sum, card) => sum + Number(card.current_bill), 0) || 0;

  // Filtered transactions
  const filteredTransactions = transactions?.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  }) || [];

  const incomeTransactions = transactions?.filter((t) => t.type === "income") || [];
  const expenseTransactions = transactions?.filter((t) => t.type === "expense") || [];

  // Handlers
  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account);
    setAccountFormOpen(true);
  };

  const handleDeleteAccount = async (account: BankAccount) => {
    if (confirm("Tem certeza que deseja excluir esta conta?")) {
      try {
        await deleteAccountMutation.mutateAsync(account.id);
        toast.success("Conta excluída!");
      } catch {
        toast.error("Erro ao excluir conta");
      }
    }
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setCardFormOpen(true);
  };

  const handleDeleteCard = async (card: CreditCard) => {
    if (confirm("Tem certeza que deseja excluir este cartao?")) {
      try {
        await deleteCardMutation.mutateAsync(card.id);
        toast.success("Cartão excluído!");
      } catch {
        toast.error("Erro ao excluir cartao");
      }
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionFormOpen(true);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionFormOpen(true);
  };

  const handleTransactionFormClose = (open: boolean) => {
    setTransactionFormOpen(open);
    if (!open) setEditingTransaction(null);
  };

  const handleAccountFormClose = (open: boolean) => {
    setAccountFormOpen(open);
    if (!open) setEditingAccount(null);
  };

  const handleCardFormClose = (open: boolean) => {
    setCardFormOpen(open);
    if (!open) setEditingCard(null);
  };

  // Transform data to component format
  const bankAccountsForCards = accounts?.map((acc) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type as "checking" | "savings" | "investment",
    balance: Number(acc.balance),
    bankName: acc.bank_name || undefined,
    color: acc.color || undefined,
  })) || [];

  const creditCardsForCards = creditCards?.map((card) => ({
    id: card.id,
    name: card.name,
    creditLimit: Number(card.credit_limit),
    currentBill: Number(card.current_bill),
    dueDay: card.due_day,
    color: card.color || undefined,
  })) || [];

  const overviewContent = (
    <div className="space-y-5">
      {/* Hero Card - Patrimônio Líquido */}
      <HeroBalanceCard
        title="Patrimônio Líquido"
        value={totalPatrimony}
        subCards={[
          {
            label: "Contas",
            value: totalAccounts,
            type: "neutral",
            icon: (
              <div className="p-1 rounded-md bg-white/20">
                <Building2 className="h-3.5 w-3.5 text-white" />
              </div>
            ),
          },
          {
            label: "Investimentos",
            value: totalInvestments,
            type: "neutral",
            icon: (
              <div className="p-1 rounded-md bg-white/20">
                <Wallet className="h-3.5 w-3.5 text-white" />
              </div>
            ),
          },
        ]}
      />

      {/* Bank Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Contas Bancárias</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary-light"
            onClick={() => {
              setEditingAccount(null);
              setAccountFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {accountsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : bankAccountsForCards.length > 0 ? (
          <div className="space-y-2">
            {bankAccountsForCards.map((account) => (
              <BankAccountCard
                key={account.id}
                account={account}
                onEdit={() => handleEditAccount(accounts!.find((a) => a.id === account.id)!)}
                onDelete={() => handleDeleteAccount(accounts!.find((a) => a.id === account.id)!)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-card rounded-xl border border-dashed border-border">
            <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2 text-primary"
              onClick={() => {
                setEditingAccount(null);
                setAccountFormOpen(true);
              }}
            >
              Adicionar primeira conta
            </Button>
          </div>
        )}
      </div>

      {/* Credit Cards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Cartões de Crédito</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary-light"
            onClick={() => {
              setEditingCard(null);
              setCardFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {cardsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : creditCardsForCards.length > 0 ? (
          <div className="space-y-2">
            {creditCardsForCards.map((card) => (
              <CreditCardCard
                key={card.id}
                card={card}
                onEdit={() => handleEditCard(creditCards!.find((c) => c.id === card.id)!)}
                onDelete={() => handleDeleteCard(creditCards!.find((c) => c.id === card.id)!)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-card rounded-xl border border-dashed border-border">
            <Wallet className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2 text-primary"
              onClick={() => {
                setEditingCard(null);
                setCardFormOpen(true);
              }}
            >
              Adicionar primeiro cartão
            </Button>
          </div>
        )}

        {creditCardsForCards.length > 0 && (
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
            <span className="text-sm text-muted-foreground">Total das faturas</span>
            <span className="font-semibold text-expense currency">
              {formatCurrency(totalCreditUsed)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const transactionsContent = (
    <div className="space-y-4">
      {/* Filter Tabs - Mobile */}
      <div className="md:hidden">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income">Receitas</TabsTrigger>
            <TabsTrigger value="expense">Despesas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transactions List */}
      {transactionsLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredTransactions.length > 0 ? (
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={handleEditTransaction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Nenhuma transação encontrada</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden px-4">
        <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          title="Carteira"
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          action={
            <Button onClick={handleAddTransaction}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          }
        />
      </div>

      {/* Tab Navigation */}
      <div className="px-4 md:px-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile Content */}
      <div className="px-4 md:hidden">
        {activeTab === "overview" ? overviewContent : transactionsContent}
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto">
          {activeTab === "overview" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Hero Card */}
                <HeroBalanceCard
                  title="Patrimônio Líquido"
                  value={totalPatrimony}
                  subCards={[
                    {
                      label: "Contas",
                      value: totalAccounts,
                      type: "neutral",
                      icon: (
                        <div className="p-1 rounded-md bg-white/20">
                          <Building2 className="h-3.5 w-3.5 text-white" />
                        </div>
                      ),
                    },
                    {
                      label: "Investimentos",
                      value: totalInvestments,
                      type: "neutral",
                      icon: (
                        <div className="p-1 rounded-md bg-white/20">
                          <Wallet className="h-3.5 w-3.5 text-white" />
                        </div>
                      ),
                    },
                  ]}
                />

                {/* Bank Accounts Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Contas Bancárias</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => {
                          setEditingAccount(null);
                          setAccountFormOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {accountsLoading ? (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                        ))}
                      </div>
                    ) : bankAccountsForCards.length > 0 ? (
                      <div className="space-y-2">
                        {bankAccountsForCards.map((account) => (
                          <BankAccountCard
                            key={account.id}
                            account={account}
                            onEdit={() => handleEditAccount(accounts!.find((a) => a.id === account.id)!)}
                            onDelete={() => handleDeleteAccount(accounts!.find((a) => a.id === account.id)!)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhuma conta cadastrada</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Credit Cards */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">Cartões de Crédito</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => {
                          setEditingCard(null);
                          setCardFormOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {cardsLoading ? (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
                        ))}
                      </div>
                    ) : creditCardsForCards.length > 0 ? (
                      <div className="space-y-2">
                        {creditCardsForCards.map((card) => (
                          <CreditCardCard
                            key={card.id}
                            card={card}
                            onEdit={() => handleEditCard(creditCards!.find((c) => c.id === card.id)!)}
                            onDelete={() => handleDeleteCard(creditCards!.find((c) => c.id === card.id)!)}
                          />
                        ))}
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl mt-4">
                          <span className="text-sm text-muted-foreground">Total das faturas</span>
                          <span className="font-semibold text-expense currency">
                            {formatCurrency(totalCreditUsed)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wallet className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Nenhum cartão cadastrado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-[280px_1fr] gap-6">
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
                        filter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        <span>Todas</span>
                      </div>
                      <span className="text-xs opacity-70">{transactions?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => setFilter("income")}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        filter === "income" ? "bg-income text-white" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Receitas</span>
                      </div>
                      <span className="text-xs opacity-70">{incomeTransactions.length}</span>
                    </button>
                    <button
                      onClick={() => setFilter("expense")}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        filter === "expense" ? "bg-expense text-white" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        <span>Despesas</span>
                      </div>
                      <span className="text-xs opacity-70">{expenseTransactions.length}</span>
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
                        <span
                          className={cn(
                            "font-bold currency",
                            (summary?.balance || 0) >= 0 ? "text-income" : "text-expense"
                          )}
                        >
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
                  {transactionsLoading ? (
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
                          onEdit={handleEditTransaction}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Nenhuma transação encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
        onClick={handleAddTransaction}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Forms */}
      <BankAccountForm
        open={accountFormOpen}
        onOpenChange={handleAccountFormClose}
        account={editingAccount}
      />

      <CreditCardForm
        open={cardFormOpen}
        onOpenChange={handleCardFormClose}
        card={editingCard}
      />

      <TransactionForm
        open={transactionFormOpen}
        onOpenChange={handleTransactionFormClose}
        transaction={editingTransaction}
        defaultDate={currentMonth}
      />
    </div>
  );
}
