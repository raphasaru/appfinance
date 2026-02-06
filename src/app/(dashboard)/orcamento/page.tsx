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
import { Target, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { ExpenseCategory, categoryLabels } from "@/lib/utils/categories";
import { cn } from "@/lib/utils";

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

      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
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
        </div>
      </div>

      {/* Budget Edit Sheet */}
      <BudgetEditSheet open={budgetEditOpen} onOpenChange={setBudgetEditOpen} />
    </div>
  );
}
