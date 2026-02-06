"use client"

import { useState } from "react"
import { Plus, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BRAZILIAN_BANKS } from "@/lib/utils/brazilian-banks"
import { Card, CardContent } from "@/components/ui/card"
import { useCreditCards, useCreateCreditCard } from "@/lib/hooks/use-credit-cards"
import { formatCurrency } from "@/lib/utils/currency"

interface StepProps {
  onNext: () => void
}

export function CardsStep({ onNext }: StepProps) {
  const { data: cards, isLoading } = useCreditCards()
  const createCard = useCreateCreditCard()
  const [isAdding, setIsAdding] = useState(false)
  const [selectedBank, setSelectedBank] = useState("")
  const [customBankName, setCustomBankName] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    credit_limit: "",
    due_day: "",
    closing_day: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Nome do cartão é obrigatório")
      return
    }

    if (!formData.due_day || !formData.closing_day) {
      toast.error("Dias de vencimento e fechamento são obrigatórios")
      return
    }

    try {
      await createCard.mutateAsync({
        name: formData.name,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        due_day: parseInt(formData.due_day),
        closing_day: parseInt(formData.closing_day),
      } as any)
      toast.success("Cartão adicionado")
      setFormData({ name: "", credit_limit: "", due_day: "", closing_day: "" })
      setSelectedBank("")
      setCustomBankName("")
      setIsAdding(false)
    } catch (error) {
      toast.error("Erro ao criar cartão")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 mb-2">
          <CreditCard className="h-6 w-6 text-purple-500" />
        </div>
        <h2 className="text-xl font-semibold">Seus cartões de crédito</h2>
        <p className="text-sm text-muted-foreground">
          Adicione seus cartões para controlar as faturas
        </p>
      </div>

      {/* Existing cards */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="space-y-2">
          {cards.map((card) => (
            <Card key={card.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{card.name}</p>
                  <span className="text-sm text-muted-foreground">
                    Vence dia {card.due_day}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Limite: {formatCurrency(card.credit_limit)}
                  </span>
                  <span className="font-medium text-red-600">
                    Fatura: {formatCurrency(card.current_bill)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">
          Nenhum cartão cadastrado ainda
        </p>
      )}

      {/* Add card form */}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="bank">Emissor do cartão</Label>
            <Select
              value={selectedBank}
              onValueChange={(value) => {
                setSelectedBank(value)
                if (value !== "other") {
                  setCustomBankName("")
                  const label = BRAZILIAN_BANKS.find(b => b.value === value)?.label || ""
                  setFormData({ ...formData, name: label })
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o emissor" />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_BANKS.map((bank) => (
                  <SelectItem key={bank.value} value={bank.value}>
                    {bank.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBank === "other" && (
            <div className="space-y-2">
              <Label htmlFor="custom_name">Nome do cartão</Label>
              <Input
                id="custom_name"
                value={customBankName}
                onChange={(e) => {
                  setCustomBankName(e.target.value)
                  setFormData({ ...formData, name: e.target.value })
                }}
                placeholder="Ex: Credicard"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="credit_limit">Limite</Label>
            <Input
              id="credit_limit"
              type="number"
              step="0.01"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
              placeholder="5000,00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closing_day">Dia de fechamento</Label>
              <Input
                id="closing_day"
                type="number"
                min="1"
                max="31"
                value={formData.closing_day}
                onChange={(e) => setFormData({ ...formData, closing_day: e.target.value })}
                placeholder="15"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_day">Dia de vencimento</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                value={formData.due_day}
                onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                placeholder="22"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsAdding(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={createCard.isPending}>
              {createCard.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar cartão
        </Button>
      )}
    </div>
  )
}
