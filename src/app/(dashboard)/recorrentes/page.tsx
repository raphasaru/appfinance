"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useRecurringTemplates,
  useCreateRecurringTemplate,
  useUpdateRecurringTemplate,
  useToggleRecurringTemplate,
  useDeleteRecurringTemplate,
  useGenerateMonthlyTransactions,
} from "@/lib/hooks/use-recurring";
import { formatCurrency, parseCurrency, formatCurrencyInput } from "@/lib/utils/currency";
import { categoryLabels, getCategoryLabel, ExpenseCategory } from "@/lib/utils/categories";
import { Plus, Trash2, RefreshCw, Loader2, Calendar, Download, Pencil } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Enums } from "@/lib/database.types";
import { initialTemplates } from "./seed-data";

export default function RecorrentesPage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [seeding, setSeeding] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: templates, isLoading } = useRecurringTemplates();
  const createMutation = useCreateRecurringTemplate();
  const updateMutation = useUpdateRecurringTemplate();
  const toggleMutation = useToggleRecurringTemplate();
  const deleteMutation = useDeleteRecurringTemplate();
  const generateMutation = useGenerateMonthlyTransactions();

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    category: "",
    day_of_month: "1",
  });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      description: "",
      amount: "",
      type: "expense",
      category: "",
      day_of_month: "1",
    });
  };

  const handleEdit = (template: NonNullable<typeof templates>[number]) => {
    setEditingId(template.id);
    setFormData({
      description: template.description,
      amount: formatCurrency(Number(template.amount)).replace("R$\u00a0", ""),
      type: template.type as "income" | "expense",
      category: template.category || "",
      day_of_month: String(template.day_of_month),
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.amount) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const payload = {
      description: formData.description,
      amount: parseCurrency(formData.amount),
      type: formData.type,
      category: formData.type === "expense" ? (formData.category as ExpenseCategory) : null,
      day_of_month: parseInt(formData.day_of_month),
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload } as any);
        toast.success("Template atualizado!");
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success("Template criado!");
      }
      setFormOpen(false);
      resetForm();
    } catch {
      toast.error(editingId ? "Erro ao atualizar template" : "Erro ao criar template");
    }
  };

  const handleToggle = (id: string, currentState: boolean) => {
    toggleMutation.mutate(
      { id, is_active: !currentState },
      {
        onError: () => toast.error("Erro ao atualizar"),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja excluir este template?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Template excluído"),
        onError: () => toast.error("Erro ao excluir"),
      });
    }
  };

  const handleGenerate = () => {
    generateMutation.mutate(new Date(), {
      onSuccess: (data) => {
        if (data.created > 0) {
          toast.success(`${data.created} transações criadas!`);
        } else {
          toast.info("Todas as transações já existem para este mês");
        }
      },
      onError: () => toast.error("Erro ao gerar transações"),
    });
  };

  const handleSeedData = async () => {
    if (!confirm("Deseja importar os templates da sua planilha? Isso irá criar os templates recorrentes baseados no seu CSV.")) {
      return;
    }

    setSeeding(true);
    try {
      for (const template of initialTemplates) {
        await createMutation.mutateAsync(template as any);
      }
      toast.success(`${initialTemplates.length} templates importados!`);
    } catch {
      toast.error("Erro ao importar dados");
    } finally {
      setSeeding(false);
    }
  };

  const incomeTemplates = templates?.filter((t) => t.type === "income") || [];
  const expenseTemplates = templates?.filter((t) => t.type === "expense") || [];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recorrentes</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Gerar mês
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Configure suas receitas e despesas fixas. Clique em "Gerar mês" para criar as transações do mês atual.
      </p>

      {templates?.length === 0 && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSeedData}
          disabled={seeding}
        >
          {seeding ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Importar dados da planilha
        </Button>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {incomeTemplates.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Receitas</h3>
              {incomeTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <Switch
                      checked={template.is_active ?? true}
                      onCheckedChange={() => handleToggle(template.id, template.is_active ?? true)}
                    />
                    <button
                      className={cn("flex-1 min-w-0 text-left", !template.is_active && "opacity-50")}
                      onClick={() => handleEdit(template)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{template.description}</p>
                        <span className="font-semibold currency text-income">
                          {formatCurrency(Number(template.amount))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Dia {template.day_of_month}</span>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {expenseTemplates.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Despesas</h3>
              {expenseTemplates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <Switch
                      checked={template.is_active ?? true}
                      onCheckedChange={() => handleToggle(template.id, template.is_active ?? true)}
                    />
                    <button
                      className={cn("flex-1 min-w-0 text-left", !template.is_active && "opacity-50")}
                      onClick={() => handleEdit(template)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{template.description}</p>
                        <span className="font-semibold currency text-expense">
                          {formatCurrency(Number(template.amount))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getCategoryLabel(template.category)}</span>
                        <span>·</span>
                        <span>Dia {template.day_of_month}</span>
                      </div>
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleEdit(template)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {templates?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum template cadastrado</p>
              <p className="text-sm mt-1">Toque no + para adicionar</p>
            </div>
          )}
        </div>
      )}

      <Button
        size="lg"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:bottom-8"
        onClick={() => { resetForm(); setFormOpen(true); }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {(() => {
        const title = editingId ? "Editar template recorrente" : "Novo template recorrente";
        const formContent = (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Tabs
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v as "income" | "expense" })}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense">Despesa</TabsTrigger>
                <TabsTrigger value="income">Receita</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                placeholder="R$ 0,00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: formatCurrencyInput(e.target.value) })
                }
                className="text-xl h-12 currency"
                inputMode="numeric"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                placeholder="Ex: Aluguel, Salário..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {formData.type === "expense" && (
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="day_of_month">Dia do mês *</Label>
              <Select
                value={formData.day_of_month}
                onValueChange={(v) => setFormData({ ...formData, day_of_month: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      Dia {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-12" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                editingId ? "Salvar" : "Adicionar"
              )}
            </Button>
          </form>
        );

        if (isDesktop) {
          return (
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {formContent}
              </DialogContent>
            </Dialog>
          );
        }

        return (
          <Sheet open={formOpen} onOpenChange={setFormOpen}>
            <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
              <SheetHeader className="text-left">
                <SheetTitle>{title}</SheetTitle>
              </SheetHeader>
              {formContent}
            </SheetContent>
          </Sheet>
        );
      })()}
    </div>
  );
}
