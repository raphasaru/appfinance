"use client"

import { useState } from "react"
import { PieChart, Loader2, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useCategoryBudgets, useUpsertCategoryBudget } from "@/lib/hooks/use-category-budgets"
import { categoryLabels, ExpenseCategory } from "@/lib/utils/categories"
import { formatCurrency } from "@/lib/utils/currency"
import { Tables } from "@/lib/database.types"
import { toast } from "sonner"

type CategoryBudget = Tables<"category_budgets">

const ALL_CATEGORIES: ExpenseCategory[] = [
  "fixed_housing",
  "fixed_utilities",
  "fixed_subscriptions",
  "fixed_personal",
  "fixed_taxes",
  "variable_credit",
  "variable_food",
  "variable_transport",
  "variable_other",
]

interface StepProps {
  onNext: () => void
}

export function BudgetStep({ onNext }: StepProps) {
  const { data: budgets, isLoading } = useCategoryBudgets()
  const [editingCategory, setEditingCategory] = useState<{
    category: ExpenseCategory
    label: string
    budget: number
  } | null>(null)
  const [editValue, setEditValue] = useState("")
  const upsertBudget = useUpsertCategoryBudget()

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
      ) : (
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
            {ALL_CATEGORIES.map((cat) => {
              const budget = budgets?.find((b: CategoryBudget) => b.category === cat)
              const amount = budget?.monthly_budget || 0
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setEditingCategory({
                      category: cat,
                      label: categoryLabels[cat],
                      budget: amount,
                    })
                    setEditValue(amount > 0 ? String(amount) : "")
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-accent transition-colors text-left"
                >
                  <span className="text-sm">{categoryLabels[cat]}</span>
                  <div className="flex items-center gap-2">
                    <span className={amount > 0 ? "font-medium" : "text-muted-foreground"}>
                      {amount > 0 ? formatCurrency(amount) : "Não definido"}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Clique em uma categoria para definir o orçamento
      </p>

      <Sheet open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>{editingCategory?.label}</SheetTitle>
            <SheetDescription>
              Defina o orçamento mensal para esta categoria
            </SheetDescription>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Orçamento mensal (R$)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="0,00"
                autoFocus
              />
            </div>
            <Button
              className="w-full"
              disabled={upsertBudget.isPending}
              onClick={async () => {
                if (!editingCategory) return
                try {
                  await upsertBudget.mutateAsync([{
                    category: editingCategory.category,
                    monthly_budget: parseFloat(editValue) || 0,
                  }])
                  toast.success("Orçamento atualizado")
                  setEditingCategory(null)
                } catch {
                  toast.error("Erro ao atualizar orçamento")
                }
              }}
            >
              {upsertBudget.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
