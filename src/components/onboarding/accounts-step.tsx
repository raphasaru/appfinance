"use client"

import { useState } from "react"
import { Plus, Building2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useBankAccounts, useCreateBankAccount } from "@/lib/hooks/use-bank-accounts"
import { formatCurrency } from "@/lib/utils/currency"

interface StepProps {
  onNext: () => void
}

const ACCOUNT_TYPES = [
  { value: "checking", label: "Conta Corrente" },
  { value: "savings", label: "Poupança" },
  { value: "investment", label: "Investimentos" },
]

export function AccountsStep({ onNext }: StepProps) {
  const { data: accounts, isLoading } = useBankAccounts()
  const createAccount = useCreateBankAccount()
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bank_name: "",
    type: "checking",
    balance: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Nome da conta é obrigatório")
      return
    }

    try {
      await createAccount.mutateAsync({
        name: formData.name,
        bank_name: formData.bank_name || null,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0,
      })
      toast.success("Conta adicionada")
      setFormData({ name: "", bank_name: "", type: "checking", balance: "" })
      setIsAdding(false)
    } catch (error) {
      toast.error("Erro ao criar conta")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-2">
          <Building2 className="h-6 w-6 text-blue-500" />
        </div>
        <h2 className="text-xl font-semibold">Suas contas bancárias</h2>
        <p className="text-sm text-muted-foreground">
          Adicione suas contas para acompanhar seus saldos
        </p>
      </div>

      {/* Existing accounts */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : accounts && accounts.length > 0 ? (
        <div className="space-y-2">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{account.name}</p>
                  {account.bank_name && (
                    <p className="text-sm text-muted-foreground">{account.bank_name}</p>
                  )}
                </div>
                <span className="font-semibold text-green-600">
                  {formatCurrency(account.balance)}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">
          Nenhuma conta cadastrada ainda
        </p>
      )}

      {/* Add account form */}
      {isAdding ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da conta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Nubank"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">Banco (opcional)</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              placeholder="Ex: Nu Pagamentos S.A."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Saldo atual</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              placeholder="0,00"
            />
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
            <Button type="submit" className="flex-1" disabled={createAccount.isPending}>
              {createAccount.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
          Adicionar conta
        </Button>
      )}
    </div>
  )
}
