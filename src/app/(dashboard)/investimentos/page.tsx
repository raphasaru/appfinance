"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvestments, useCreateInvestment, useDeleteInvestment } from "@/lib/hooks/use-investments";
import { formatCurrency, parseCurrency, formatCurrencyInput } from "@/lib/utils/currency";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Plus, Trash2, TrendingUp, Wallet, Loader2, Briefcase, PiggyBank, Bitcoin, BarChart3, Landmark } from "lucide-react";
import { toast } from "sonner";
import { Tables } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type Investment = Tables<"investments">;

const investmentTypes = [
  { value: "stock", label: "Ações", icon: BarChart3 },
  { value: "fund", label: "Fundos", icon: Briefcase },
  { value: "fixed_income", label: "Renda Fixa", icon: Landmark },
  { value: "crypto", label: "Cripto", icon: Bitcoin },
  { value: "other", label: "Outros", icon: PiggyBank },
];

const getTypeInfo = (type: string) => {
  return investmentTypes.find((t) => t.value === type) || investmentTypes[4];
};

export default function InvestimentosPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: investments, isLoading } = useInvestments();
  const createMutation = useCreateInvestment();
  const deleteMutation = useDeleteInvestment();
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );

  return (
    <div className="space-y-6">
      {/* Mobile Header */}
      <div className="p-4 md:hidden">
        <h1 className="text-xl font-semibold">Carteira</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          title="Investimentos"
          showMonthSelector={false}
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Investimento
            </Button>
          }
        />
      </div>

      {/* Total Card */}
      <div className="px-4 md:px-0">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/5" />
            <div className="relative">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Patrimônio Total</span>
              </div>
              <p className="text-4xl font-bold mt-2 currency tracking-tight">
                {formatCurrency(totalValue)}
              </p>
              <p className="text-sm text-primary-foreground/70 mt-2">
                {investments?.length || 0} {investments?.length === 1 ? "investimento" : "investimentos"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investments Grid */}
      <div className="px-4 md:px-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-10 w-10 bg-muted rounded-lg" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-6 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : investments && investments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investments.map((investment) => {
              const qty = Number(investment.quantity) || 0;
              const price = Number(investment.current_price) || Number(investment.average_price) || 0;
              const avgPrice = Number(investment.average_price) || 0;
              const value = qty * price;
              const typeInfo = getTypeInfo(investment.type);
              const IconComponent = typeInfo.icon;

              const profitLoss = avgPrice > 0 && price > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0;

              return (
                <Card key={investment.id} className="group hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        investment.type === "stock" && "bg-blue-500/10 text-blue-600",
                        investment.type === "fund" && "bg-purple-500/10 text-purple-600",
                        investment.type === "fixed_income" && "bg-green-500/10 text-green-600",
                        investment.type === "crypto" && "bg-orange-500/10 text-orange-600",
                        investment.type === "other" && "bg-gray-500/10 text-gray-600",
                      )}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(investment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{investment.name}</h3>
                        {investment.ticker && (
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                            {investment.ticker}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{typeInfo.label}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-2xl font-bold currency">{formatCurrency(value)}</p>
                      <div className="flex items-center justify-between mt-1">
                        {qty > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {qty.toLocaleString("pt-BR")} un. @ {formatCurrency(price)}
                          </span>
                        )}
                        {profitLoss !== 0 && (
                          <span className={cn(
                            "text-sm font-medium",
                            profitLoss > 0 ? "text-income" : "text-expense"
                          )}>
                            {profitLoss > 0 ? "+" : ""}{profitLoss.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Nenhum investimento cadastrado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando seu primeiro investimento
              </p>
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Investimento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile FAB */}
      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:hidden z-40"
        onClick={() => setFormOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Form Modal/Sheet */}
      {isDesktop ? (
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Investimento</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {formContent}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Sheet open={formOpen} onOpenChange={setFormOpen}>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-xl px-4">
            <SheetHeader className="text-left">
              <SheetTitle>Novo investimento</SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto flex-1">
              {formContent}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
