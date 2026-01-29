"use client";

import { useState, useMemo } from "react";
import { HeroBalanceCard } from "@/components/dashboard/hero-balance-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryBudgetCard, CategoryBudget } from "@/components/reports/category-budget-card";
import { CategoryPieChart } from "@/components/reports/category-pie-chart";
import {
  PeriodSelector,
  PeriodType,
  DateRange,
  getPeriodDateRange,
  formatPeriodLabel,
} from "@/components/reports/period-selector";
import {
  AccountCardFilter,
  ActiveFilters,
} from "@/components/reports/account-card-filter";
import {
  usePeriodSummary,
  usePeriodCategorySpending,
  PeriodFilters,
} from "@/lib/hooks/use-summary";
import { useMonthlyHistory } from "@/lib/hooks/use-history";
import { useCategoryBudgets } from "@/lib/hooks/use-category-budgets";
import { ExpenseCategory } from "@/lib/utils/categories";
import { formatCurrency } from "@/lib/utils/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const CHART_COLORS = {
  income: "#22C55E",
  expense: "#EF4444",
  primary: "#6366F1",
};

const allCategories: ExpenseCategory[] = [
  "fixed_housing",
  "fixed_utilities",
  "fixed_subscriptions",
  "fixed_personal",
  "fixed_taxes",
  "variable_credit",
  "variable_food",
  "variable_transport",
  "variable_other",
];

export default function RelatoriosPage() {
  // Period state
  const [periodType, setPeriodType] = useState<PeriodType>("this_month");
  const [dateRange, setDateRange] = useState<DateRange>(
    getPeriodDateRange("this_month")
  );

  // Filter state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const filters: PeriodFilters | undefined = useMemo(() => {
    if (selectedAccounts.length === 0 && selectedCards.length === 0) {
      return undefined;
    }
    return {
      bankAccountIds: selectedAccounts.length > 0 ? selectedAccounts : undefined,
      creditCardIds: selectedCards.length > 0 ? selectedCards : undefined,
    };
  }, [selectedAccounts, selectedCards]);

  // Data hooks with period and filters
  const { data: summary, isLoading: summaryLoading } = usePeriodSummary(
    dateRange.start,
    dateRange.end,
    filters
  );
  const { data: history, isLoading: historyLoading } = useMonthlyHistory();
  const { data: categoryBudgets } = useCategoryBudgets();
  const { data: categorySpending, isLoading: spendingLoading } =
    usePeriodCategorySpending(dateRange.start, dateRange.end, filters);

  const handlePeriodChange = (period: PeriodType, range: DateRange) => {
    setPeriodType(period);
    setDateRange(range);
  };

  const clearFilters = () => {
    setSelectedAccounts([]);
    setSelectedCards([]);
  };

  // Prepare chart data
  const chartData =
    history?.map((item) => ({
      month: item.month,
      REC: item.income,
      DES: item.expenses,
      SAL: item.balance,
    })) || [];

  const balance = (summary?.totalIncome || 0) - (summary?.totalExpenses || 0);

  // Build budget data
  const budgetData: CategoryBudget[] = allCategories
    .map((category) => {
      const budgetItem = categoryBudgets?.find((b) => b.category === category);
      const spent = categorySpending?.[category] || 0;
      const budget = budgetItem?.monthly_budget || 0;

      return {
        category,
        spent: Number(spent),
        budget: Number(budget),
      };
    })
    .filter((b) => b.budget > 0 || b.spent > 0);

  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
  const totalBudget = budgetData.reduce((sum, b) => sum + b.budget, 0);
  const budgetDifference = totalBudget - totalSpent;

  // Pie chart data
  const pieChartData = budgetData
    .filter((b) => b.spent > 0)
    .map((b) => ({
      category: b.category,
      amount: b.spent,
      percentage: totalSpent > 0 ? (b.spent / totalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Period label for display
  const periodLabel = formatPeriodLabel(periodType, dateRange);

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden px-4 space-y-4">
        <h1 className="text-xl font-bold">Relatórios</h1>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <PeriodSelector
                value={periodType}
                dateRange={dateRange}
                onChange={handlePeriodChange}
              />
            </div>
            <AccountCardFilter
              selectedAccounts={selectedAccounts}
              selectedCards={selectedCards}
              onAccountsChange={setSelectedAccounts}
              onCardsChange={setSelectedCards}
            />
          </div>
          <ActiveFilters
            selectedAccounts={selectedAccounts}
            selectedCards={selectedCards}
            onRemoveAccount={(id) =>
              setSelectedAccounts(selectedAccounts.filter((a) => a !== id))
            }
            onRemoveCard={(id) =>
              setSelectedCards(selectedCards.filter((c) => c !== id))
            }
            onClearAll={clearFilters}
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <div className="flex items-center gap-3">
            <PeriodSelector
              value={periodType}
              dateRange={dateRange}
              onChange={handlePeriodChange}
            />
            <AccountCardFilter
              selectedAccounts={selectedAccounts}
              selectedCards={selectedCards}
              onAccountsChange={setSelectedAccounts}
              onCardsChange={setSelectedCards}
            />
          </div>
        </div>
        <ActiveFilters
          selectedAccounts={selectedAccounts}
          selectedCards={selectedCards}
          onRemoveAccount={(id) =>
            setSelectedAccounts(selectedAccounts.filter((a) => a !== id))
          }
          onRemoveCard={(id) =>
            setSelectedCards(selectedCards.filter((c) => c !== id))
          }
          onClearAll={clearFilters}
        />
      </div>

      {/* Mobile Layout */}
      <div className="px-4 space-y-5 md:hidden">
        {/* Hero Card */}
        <HeroBalanceCard
          title="Balanço do Período"
          value={balance}
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

        {/* Monthly Evolution Chart */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Evolução Mensal</h2>
          <div className="bg-card rounded-xl border border-border p-4">
            {historyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">
                  Carregando...
                </div>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={2}>
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      width={40}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                    />
                    <Bar
                      dataKey="REC"
                      name="Receitas"
                      fill={CHART_COLORS.income}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="DES"
                      name="Despesas"
                      fill={CHART_COLORS.expense}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="SAL"
                      name="Saldo"
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p className="text-sm">Sem dados históricos disponíveis</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <CategoryPieChart data={pieChartData} isLoading={spendingLoading} />

        {/* Category Spending */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Orçamento por Categoria</h2>
            <span className="text-sm text-muted-foreground">{periodLabel}</span>
          </div>

          {spendingLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : budgetData.length > 0 ? (
            <div className="space-y-2">
              {budgetData.map((budget) => (
                <CategoryBudgetCard key={budget.category} data={budget} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                Sem gastos neste período
              </p>
            </div>
          )}

          {/* Summary */}
          {budgetData.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total gasto
                </span>
                <span className="font-semibold text-expense currency">
                  {formatCurrency(totalSpent)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total orçado
                </span>
                <span className="font-semibold currency">
                  {formatCurrency(totalBudget)}
                </span>
              </div>
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Diferença</span>
                  <span
                    className={cn(
                      "font-bold currency",
                      budgetDifference >= 0 ? "text-income" : "text-expense"
                    )}
                  >
                    {formatCurrency(budgetDifference)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Card */}
              <HeroBalanceCard
                title="Balanço do Período"
                value={balance}
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

              {/* Monthly Evolution Chart Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Evolução Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="h-72 flex items-center justify-center">
                      <div className="animate-pulse text-muted-foreground">
                        Carregando...
                      </div>
                    </div>
                  ) : chartData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barGap={4}>
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) =>
                              `${(value / 1000).toFixed(0)}k`
                            }
                            width={50}
                          />
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: "12px",
                              paddingTop: "16px",
                            }}
                          />
                          <Bar
                            dataKey="REC"
                            name="Receitas"
                            fill={CHART_COLORS.income}
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="DES"
                            name="Despesas"
                            fill={CHART_COLORS.expense}
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="SAL"
                            name="Saldo"
                            fill={CHART_COLORS.primary}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-muted-foreground">
                      <p className="text-sm">Sem dados históricos disponíveis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <CategoryPieChart data={pieChartData} isLoading={spendingLoading} />
            </div>

            {/* Right Column - Category Budget */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Orçamento por Categoria
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {periodLabel}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {spendingLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-16 bg-muted animate-pulse rounded-xl"
                        />
                      ))}
                    </div>
                  ) : budgetData.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        {budgetData.map((budget) => (
                          <CategoryBudgetCard
                            key={budget.category}
                            data={budget}
                          />
                        ))}
                      </div>

                      {/* Summary */}
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Total gasto
                          </span>
                          <span className="font-semibold text-expense currency">
                            {formatCurrency(totalSpent)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Total orçado
                          </span>
                          <span className="font-semibold currency">
                            {formatCurrency(totalBudget)}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Diferença</span>
                            <span
                              className={cn(
                                "font-bold currency",
                                budgetDifference >= 0
                                  ? "text-income"
                                  : "text-expense"
                              )}
                            >
                              {formatCurrency(budgetDifference)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Sem gastos neste período</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
