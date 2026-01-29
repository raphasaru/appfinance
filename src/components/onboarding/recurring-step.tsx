"use client"

import { Repeat, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRecurringTemplates } from "@/lib/hooks/use-recurring"
import { categoryLabels, ExpenseCategory } from "@/lib/utils/categories"
import { formatCurrency } from "@/lib/utils/currency"
import { Tables } from "@/lib/database.types"

type RecurringTemplate = Tables<"recurring_templates">

interface StepProps {
  onNext: () => void
}

export function RecurringStep({ onNext }: StepProps) {
  const { data: templates, isLoading } = useRecurringTemplates()

  const activeTemplates = templates?.filter((t: RecurringTemplate) => t.is_active) || []
  const incomeTemplates = activeTemplates.filter((t: RecurringTemplate) => t.type === "income")
  const expenseTemplates = activeTemplates.filter((t: RecurringTemplate) => t.type === "expense")

  const totalIncome = incomeTemplates.reduce((sum: number, t: RecurringTemplate) => sum + Number(t.amount), 0)
  const totalExpense = expenseTemplates.reduce((sum: number, t: RecurringTemplate) => sum + Number(t.amount), 0)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 mb-2">
          <Repeat className="h-6 w-6 text-cyan-500" />
        </div>
        <h2 className="text-xl font-semibold">Transações recorrentes</h2>
        <p className="text-sm text-muted-foreground">
          Configure receitas e despesas que se repetem todo mês
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : activeTemplates.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Receitas</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(totalExpense)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2">
            {activeTemplates.slice(0, 5).map((template: RecurringTemplate) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium text-sm">{template.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Dia {template.day_of_month} • {template.category ? categoryLabels[template.category as ExpenseCategory] : "Sem categoria"}
                  </p>
                </div>
                <Badge variant={template.type === "income" ? "default" : "destructive"}>
                  {formatCurrency(Number(template.amount))}
                </Badge>
              </div>
            ))}
            {activeTemplates.length > 5 && (
              <p className="text-center text-sm text-muted-foreground">
                +{activeTemplates.length - 5} transações
              </p>
            )}
          </div>
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Nenhuma transação recorrente
            </p>
            <p className="text-xs text-muted-foreground">
              Configure em Recorrentes para automatizar seus lançamentos
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Transações recorrentes são geradas automaticamente todo mês
      </p>
    </div>
  )
}
