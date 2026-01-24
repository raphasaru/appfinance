"use client";

import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategoryBudgets, useUpsertCategoryBudget } from "@/lib/hooks/use-category-budgets";
import { categoryLabels, ExpenseCategory } from "@/lib/utils/categories";
import { parseCurrency, formatCurrencyInput, formatCurrency } from "@/lib/utils/currency";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { Enums } from "@/lib/database.types";

interface BudgetEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allCategories: ExpenseCategory[] = [
  "fixed_housing",
  "fixed_utilities",
  "fixed_subscriptions",
  "fixed_personal",
  "fixed_taxes",
  "variable_credit",
  "variable_food",
  "variable_transport",
  "variable_other",
];

export function BudgetEditSheet({ open, onOpenChange }: BudgetEditSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data: existingBudgets } = useCategoryBudgets();
  const upsertMutation = useUpsertCategoryBudget();

  const [budgetValues, setBudgetValues] = useState<Record<ExpenseCategory, string>>(
    {} as Record<ExpenseCategory, string>
  );

  useEffect(() => {
    if (open && existingBudgets) {
      const values: Record<ExpenseCategory, string> = {} as Record<ExpenseCategory, string>;
      for (const cat of allCategories) {
        const existing = existingBudgets.find((b) => b.category === cat);
        if (existing && existing.monthly_budget > 0) {
          values[cat] = formatCurrencyInput(String(Number(existing.monthly_budget) * 100));
        } else {
          values[cat] = "";
        }
      }
      setBudgetValues(values);
    }
  }, [open, existingBudgets]);

  const handleChange = (category: ExpenseCategory) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setBudgetValues((prev) => ({ ...prev, [category]: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const budgetsToSave: Array<{ category: Enums<"expense_category">; monthly_budget: number }> = [];

    for (const cat of allCategories) {
      const value = budgetValues[cat];
      const amount = value ? parseCurrency(value) : 0;
      if (amount >= 0) {
        budgetsToSave.push({ category: cat, monthly_budget: amount });
      }
    }

    try {
      await upsertMutation.mutateAsync(budgetsToSave);
      toast.success("Orçamentos salvos!");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar orçamentos");
    }
  };

  const totalBudget = Object.values(budgetValues).reduce((sum, val) => {
    return sum + (val ? parseCurrency(val) : 0);
  }, 0);

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {allCategories.map((category) => (
          <div key={category} className="flex items-center gap-4">
            <Label htmlFor={category} className="w-32 text-sm shrink-0">
              {categoryLabels[category]}
            </Label>
            <Input
              id={category}
              placeholder="R$ 0,00"
              value={budgetValues[category] || ""}
              onChange={handleChange(category)}
              className="currency flex-1"
              inputMode="numeric"
            />
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Total Orçado</span>
          <span className="font-bold text-lg currency">
            {formatCurrency(totalBudget)}
          </span>
        </div>

        <Button type="submit" className="w-full h-12" disabled={upsertMutation.isPending}>
          {upsertMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Salvar orçamentos"
          )}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Orçamento por Categoria</DialogTitle>
          </DialogHeader>
          <div className="mt-4">{formContent}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl px-4">
        <SheetHeader className="text-left">
          <SheetTitle>Editar Orçamento por Categoria</SheetTitle>
        </SheetHeader>
        <div className="mt-6 overflow-y-auto flex-1 pb-8">{formContent}</div>
      </SheetContent>
    </Sheet>
  );
}
