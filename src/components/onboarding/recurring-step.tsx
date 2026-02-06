"use client"

import { useState } from "react"
import { Repeat, Loader2, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useRecurringTemplates, useCreateRecurringTemplate } from "@/lib/hooks/use-recurring"
import { categoryLabels, ExpenseCategory } from "@/lib/utils/categories"
import { formatCurrency } from "@/lib/utils/currency"
import { Tables } from "@/lib/database.types"
import { toast } from "sonner"

type RecurringTemplate = Tables<"recurring_templates">

interface StepProps {
  onNext: () => void
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
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

export function RecurringStep({ onNext }: StepProps) {
  const { data: templates, isLoading } = useRecurringTemplates()
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "" as ExpenseCategory | "",
    day_of_month: "",
  })
  const createTemplate = useCreateRecurringTemplate()

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

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar recorrente
          </Button>
        </>
      ) : (
        <>
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

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar recorrente
          </Button>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Transações recorrentes são geradas automaticamente todo mês
      </p>

      <Sheet open={isAdding} onOpenChange={setIsAdding}>
        <SheetContent side="bottom" className="h-auto max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nova transação recorrente</SheetTitle>
            <SheetDescription>
              Configure uma receita ou despesa que se repete todo mês
            </SheetDescription>
          </SheetHeader>
          <form
            className="p-4 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!formData.description || !formData.amount || !formData.day_of_month) {
                toast.error("Preencha todos os campos obrigatórios")
                return
              }
              try {
                await createTemplate.mutateAsync({
                  description: formData.description,
                  amount: parseFloat(formData.amount),
                  type: formData.type,
                  category: formData.type === "expense" ? (formData.category || null) : null,
                  day_of_month: parseInt(formData.day_of_month),
                  is_active: true,
                } as any)
                toast.success("Recorrente adicionada")
                setFormData({
                  description: "",
                  amount: "",
                  type: "expense",
                  category: "",
                  day_of_month: "",
                })
                setIsAdding(false)
              } catch {
                toast.error("Erro ao criar recorrente")
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") =>
                  setFormData({ ...formData, type: value, category: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Salário, Aluguel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0,00"
              />
            </div>

            {formData.type === "expense" && (
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: ExpenseCategory) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryLabels[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="day">Dia do mês</Label>
              <Input
                id="day"
                type="number"
                min="1"
                max="31"
                value={formData.day_of_month}
                onChange={(e) => setFormData({ ...formData, day_of_month: e.target.value })}
                placeholder="15"
              />
            </div>

            <Button type="submit" className="w-full" disabled={createTemplate.isPending}>
              {createTemplate.isPending ? "Salvando..." : "Adicionar"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
