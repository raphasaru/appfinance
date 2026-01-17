"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvestments, useCreateInvestment, useDeleteInvestment } from "@/lib/hooks/use-investments";
import { formatCurrency, parseCurrency, formatCurrencyInput } from "@/lib/utils/currency";
import { Plus, Trash2, TrendingUp, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/lib/database.types";

type Investment = Tables<"investments">;

const investmentTypes = [
  { value: "stock", label: "Ações" },
  { value: "fund", label: "Fundos" },
  { value: "fixed_income", label: "Renda Fixa" },
  { value: "crypto", label: "Cripto" },
  { value: "other", label: "Outros" },
];

export default function InvestimentosPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: investments, isLoading } = useInvestments();
  const createMutation = useCreateInvestment();
  const deleteMutation = useDeleteInvestment();

  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    type: "stock",
    quantity: "",
    average_price: "",
    current_price: "",
  });

  const totalValue = investments?.reduce((acc, inv) => {
    const qty = Number(inv.quantity) || 0;
    const price = Number(inv.current_price) || Number(inv.average_price) || 0;
    return acc + qty * price;
  }, 0) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        ticker: formData.ticker || null,
        type: formData.type,
        quantity: formData.quantity ? parseFloat(formData.quantity.replace(",", ".")) : null,
        average_price: formData.average_price ? parseCurrency(formData.average_price) : null,
        current_price: formData.current_price ? parseCurrency(formData.current_price) : null,
      });
      toast.success("Investimento adicionado!");
      setFormOpen(false);
      setFormData({
        name: "",
        ticker: "",
        type: "stock",
        quantity: "",
        average_price: "",
        current_price: "",
      });
    } catch {
      toast.error("Erro ao adicionar investimento");
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja excluir este investimento?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Investimento excluído"),
        onError: () => toast.error("Erro ao excluir"),
      });
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Carteira</h1>
      </div>

      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Patrimônio total</span>
          </div>
          <p className="text-3xl font-bold mt-1 currency">
            {formatCurrency(totalValue)}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))
        ) : investments && investments.length > 0 ? (
          investments.map((investment) => {
            const qty = Number(investment.quantity) || 0;
            const price = Number(investment.current_price) || Number(investment.average_price) || 0;
            const value = qty * price;

            return (
              <Card key={investment.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{investment.name}</p>
                      {investment.ticker && (
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {investment.ticker}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{investmentTypes.find((t) => t.value === investment.type)?.label}</span>
                      {qty > 0 && (
                        <>
                          <span>·</span>
                          <span>{qty.toLocaleString("pt-BR")} un.</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold currency">{formatCurrency(value)}</p>
                    {price > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(price)} / un.
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(investment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum investimento cadastrado</p>
            <p className="text-sm mt-1">Toque no + para adicionar</p>
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:bottom-8"
        onClick={() => setFormOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
          <SheetHeader className="text-left">
            <SheetTitle>Novo investimento</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Tesouro Selic, PETR4..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticker">Ticker</Label>
                <Input
                  id="ticker"
                  placeholder="Ex: PETR4"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                placeholder="Ex: 100"
                inputMode="decimal"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="average_price">Preço médio</Label>
                <Input
                  id="average_price"
                  placeholder="R$ 0,00"
                  value={formData.average_price}
                  onChange={(e) =>
                    setFormData({ ...formData, average_price: formatCurrencyInput(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_price">Preço atual</Label>
                <Input
                  id="current_price"
                  placeholder="R$ 0,00"
                  value={formData.current_price}
                  onChange={(e) =>
                    setFormData({ ...formData, current_price: formatCurrencyInput(e.target.value) })
                  }
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
