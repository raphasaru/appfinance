"use client";

import { useState } from "react";
import { HeroBalanceCard } from "@/components/dashboard/hero-balance-card";
import { MonthSelector } from "@/components/dashboard/month-selector";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryBudgetCard, CategoryBudget } from "@/components/reports/category-budget-card";
import { BudgetEditSheet } from "@/components/budget/budget-edit-sheet";
import { useCategoryBudgets, useCategorySpending } from "@/lib/hooks/use-category-budgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target, PiggyBank, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { ExpenseCategory, categoryLabels } from "@/lib/utils/categories";
import { cn } from "@/lib/utils";

interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
}

// Mock goals - will be replaced with real data later
const mockGoals: SavingsGoal[] = [
  { id: "1", name: "Reserva de Emergência", target: 15000, current: 8500 },
  { id: "2", name: "Viagem de Férias", target: 5000, current: 2100, deadline: "2025-12" },
];

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

export default function OrcamentoPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [budgetEditOpen, setBudgetEditOpen] = useState(false);

  // Data hooks
  const { data: categoryBudgets, isLoading: budgetsLoading } = useCategoryBudgets();
  const { data: categorySpending, isLoading: spendingLoading } = useCategorySpending(currentMonth);

  const isLoading = budgetsLoading || spendingLoading;

  // Build combined budget data
  const budgetData: CategoryBudget[] = allCategories.map((category) => {
    const budgetItem = categoryBudgets?.find((b) => b.category === category);
    const spent = categorySpending?.[category] || 0;
    const budget = budgetItem?.monthly_budget || 0;

    return {
      category,
      spent: Number(spent),
      budget: Number(budget),
    };
  }).filter((b) => b.budget > 0 || b.spent > 0); // Only show categories with data

  const totalBudget = budgetData.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgetData.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="md:hidden px-4">
        <MonthSelector currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          title="Orçamento"
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          action={
            <Button onClick={() => setBudgetEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Orçamento
            </Button>
          }
        />
      </div>

      {/* Mobile Layout */}
      <div className="px-4 space-y-5 md:hidden">
        {/* Hero Card - Budget Overview */}
        <HeroBalanceCard
          title="Orçamento do Mês"
          value={remaining}
          subCards={[
            {
              label: "Orcado",
              value: totalBudget,
              type: "neutral",
              icon: (
                <div className="p-1 rounded-md bg-white/20">
                  <Target className="h-3.5 w-3.5 text-white" />
                </div>
              ),
            },
            {
              label: "Gasto",
              value: totalSpent,
              type: "expense",
            },
          ]}
        />

        {/* Budget by Category */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Orçamento por Categoria</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary-light"
              onClick={() => setBudgetEditOpen(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
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
              <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum orçamento definido</p>
              <Button
                variant="link"
                size="sm"
                className="mt-2 text-primary"
                onClick={() => setBudgetEditOpen(true)}
              >
                Definir orçamento
              </Button>
            </div>
          )}
        </div>

        {/* Savings Goals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Metas de Economia</h2>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-light">
              <Plus className="h-4 w-4 mr-1" />
              Nova Meta
            </Button>
          </div>

          {mockGoals.length > 0 ? (
            <div className="space-y-2">
              {mockGoals.map((goal) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div
                    key={goal.id}
                    className="p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <PiggyBank className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{goal.name}</p>
                        {goal.deadline && (
                          <p className="text-xs text-muted-foreground">
                            Meta: {new Date(goal.deadline + "-01").toLocaleDateString("pt-BR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                        </span>
                        <span className="font-medium text-primary">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-xl border border-dashed border-border">
              <PiggyBank className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma meta definida</p>
              <Button variant="link" size="sm" className="mt-2 text-primary">
                Criar primeira meta
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Budget Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Card */}
              <HeroBalanceCard
                title="Orçamento do Mês"
                value={remaining}
                subCards={[
                  {
                    label: "Orcado",
                    value: totalBudget,
                    type: "neutral",
                    icon: (
                      <div className="p-1 rounded-md bg-white/20">
                        <Target className="h-3.5 w-3.5 text-white" />
                      </div>
                    ),
                  },
                  {
                    label: "Gasto",
                    value: totalSpent,
                    type: "expense",
                  },
                ]}
              />

              {/* Budget by Category Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Orçamento por Categoria</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => setBudgetEditOpen(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : budgetData.length > 0 ? (
                    <div className="space-y-2">
                      {budgetData.map((budget) => (
                        <CategoryBudgetCard key={budget.category} data={budget} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nenhum orçamento definido</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 text-primary"
                        onClick={() => setBudgetEditOpen(true)}
                      >
                        Definir orçamento
                      </Button>
                    </div>
                  )}

                  {budgetData.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total gasto</span>
                        <span className="font-semibold text-expense currency">
                          {formatCurrency(totalSpent)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total orçado</span>
                        <span className="font-semibold currency">
                          {formatCurrency(totalBudget)}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Disponível</span>
                          <span
                            className={cn(
                              "font-bold currency",
                              remaining >= 0 ? "text-income" : "text-expense"
                            )}
                          >
                            {formatCurrency(remaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Savings Goals */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Metas de Economia</CardTitle>
                    <Button variant="ghost" size="sm" className="text-primary">
                      <Plus className="h-4 w-4 mr-1" />
                      Nova
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {mockGoals.length > 0 ? (
                    <div className="space-y-4">
                      {mockGoals.map((goal) => {
                        const percentage = Math.min((goal.current / goal.target) * 100, 100);
                        return (
                          <div key={goal.id} className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-primary/10">
                                <PiggyBank className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm">{goal.name}</p>
                                {goal.deadline && (
                                  <p className="text-xs text-muted-foreground">
                                    Meta: {new Date(goal.deadline + "-01").toLocaleDateString("pt-BR", {
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all duration-500 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                                </span>
                                <span className="font-medium text-primary">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <PiggyBank className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Nenhuma meta definida</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Edit Sheet */}
      <BudgetEditSheet open={budgetEditOpen} onOpenChange={setBudgetEditOpen} />
    </div>
  );
}
