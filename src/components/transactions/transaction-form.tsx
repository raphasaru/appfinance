"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateTransaction, useUpdateTransaction } from "@/lib/hooks/use-transactions";
import { Tables, Enums } from "@/lib/database.types";
import { categoryLabels, ExpenseCategory } from "@/lib/utils/categories";
import { parseCurrency, formatCurrencyInput } from "@/lib/utils/currency";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.string().min(1, "Valor obrigatório"),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  due_date: z.string().min(1, "Data obrigatória"),
});

type FormData = z.infer<typeof formSchema>;

type Transaction = Tables<"transactions">;

interface TransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  defaultDate?: Date;
}

export function TransactionForm({
  open,
  onOpenChange,
  transaction,
  defaultDate = new Date(),
}: TransactionFormProps) {
  const isEditing = !!transaction;
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: transaction?.description || "",
      amount: transaction ? formatCurrencyInput(String(Number(transaction.amount) * 100)) : "",
      type: transaction?.type || "expense",
      category: transaction?.category || undefined,
      due_date: transaction?.due_date || format(defaultDate, "yyyy-MM-dd"),
    },
  });

  const transactionType = form.watch("type");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    form.setValue("amount", formatted);
  };

  const onSubmit = async (data: FormData) => {
    const amount = parseCurrency(data.amount);
    if (amount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    const payload = {
      description: data.description,
      amount,
      type: data.type as Enums<"transaction_type">,
      category: data.type === "expense" ? (data.category as ExpenseCategory) : null,
      due_date: data.due_date,
    };

    try {
      if (isEditing && transaction) {
        await updateMutation.mutateAsync({ id: transaction.id, ...payload });
        toast.success("Transação atualizada!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Transação criada!");
      }
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Erro ao salvar transação");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader className="text-left">
          <SheetTitle>
            {isEditing ? "Editar transação" : "Nova transação"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <Tabs
            value={transactionType}
            onValueChange={(v) => form.setValue("type", v as "income" | "expense")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Despesa</TabsTrigger>
              <TabsTrigger value="income">Receita</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              placeholder="R$ 0,00"
              value={form.watch("amount")}
              onChange={handleAmountChange}
              className="text-2xl h-14 currency"
              inputMode="numeric"
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Aluguel, Salário..."
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {transactionType === "expense" && (
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v)}
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
            <Label htmlFor="due_date">Data</Label>
            <Input
              id="due_date"
              type="date"
              {...form.register("due_date")}
            />
          </div>

          <Button type="submit" className="w-full h-12" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              "Salvar alterações"
            ) : (
              "Adicionar"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
