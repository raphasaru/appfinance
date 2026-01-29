"use client"

import { PieChart, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useCategoryBudgets } from "@/lib/hooks/use-category-budgets"
import { categoryLabels, ExpenseCategory } from "@/lib/utils/categories"
import { formatCurrency } from "@/lib/utils/currency"
import { Tables } from "@/lib/database.types"

type CategoryBudget = Tables<"category_budgets">

interface StepProps {
  onNext: () => void
}

export function BudgetStep({ onNext }: StepProps) {
  const { data: budgets, isLoading } = useCategoryBudgets()

  const totalBudget = budgets?.reduce((sum: number, b: CategoryBudget) => sum + b.monthly_budget, 0) || 0

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 mb-2">
          <PieChart className="h-6 w-6 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold">Defina seu orçamento</h2>
        <p className="text-sm text-muted-foreground">
          Configure limites mensais por categoria na tela de Orçamento
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : budgets && budgets.length > 0 ? (
        <>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Orçamento total</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalBudget)}
              </p>
              <p className="text-xs text-muted-foreground">por mês</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {budgets.slice(0, 5).map((budget: CategoryBudget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <span className="text-sm">
                  {categoryLabels[budget.category as ExpenseCategory] || budget.category}
                </span>
                <span className="font-medium">
                  {formatCurrency(budget.monthly_budget)}
                </span>
              </div>
            ))}
            {budgets.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                +{budgets.length - 5} categorias
              </p>
            )}
          </div>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Nenhum orçamento definido
            </p>
            <p className="text-xs text-muted-foreground">
              Você pode configurar isso depois em Orçamento
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Você pode ajustar os valores a qualquer momento
      </p>
    </div>
  )
}
