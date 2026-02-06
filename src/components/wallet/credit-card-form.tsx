"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useCreateCreditCard, useUpdateCreditCard } from "@/lib/hooks/use-credit-cards";
import { Tables } from "@/lib/database.types";
import { parseCurrency, formatCurrencyInput } from "@/lib/utils/currency";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

const formSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  credit_limit: z.string().min(1, "Limite obrigatório"),
  current_bill: z.string(),
  due_day: z.string().min(1, "Dia de vencimento obrigatório"),
  closing_day: z.string().min(1, "Dia de fechamento obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

type CreditCard = Tables<"credit_cards">;

interface CreditCardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card?: CreditCard | null;
}

export function CreditCardForm({
  open,
  onOpenChange,
  card,
}: CreditCardFormProps) {
  const isEditing = !!card;
  const createMutation = useCreateCreditCard();
  const updateMutation = useUpdateCreditCard();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      credit_limit: "",
      current_bill: "",
      due_day: "",
      closing_day: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (card) {
        form.reset({
          name: card.name,
          credit_limit: formatCurrencyInput(String(Number(card.credit_limit) * 100)),
          current_bill: formatCurrencyInput(String(Number(card.current_bill) * 100)),
          due_day: String(card.due_day),
          closing_day: String(card.closing_day),
        });
      } else {
        form.reset({
          name: "",
          credit_limit: "",
          current_bill: "",
          due_day: "",
          closing_day: "",
        });
      }
    }
  }, [open, card, form]);

  const handleCurrencyChange = (field: "credit_limit" | "current_bill") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    form.setValue(field, formatted);
  };

  const onSubmit = async (data: FormData) => {
    const creditLimit = parseCurrency(data.credit_limit);
    const currentBill = parseCurrency(data.current_bill) || 0;
    const dueDay = parseInt(data.due_day, 10);
    const closingDay = parseInt(data.closing_day, 10);

    if (creditLimit <= 0) {
      toast.error("Limite deve ser maior que zero");
      return;
    }

    if (dueDay < 1 || dueDay > 28) {
      toast.error("Dia de vencimento deve ser entre 1 e 28 (para funcionar em todos os meses)");
      return;
    }

    if (closingDay < 1 || closingDay > 28) {
      toast.error("Dia de fechamento deve ser entre 1 e 28 (para funcionar em todos os meses)");
      return;
    }

    const payload = {
      name: data.name,
      credit_limit: creditLimit,
      current_bill: currentBill,
      due_day: dueDay,
      closing_day: closingDay,
    };

    try {
      if (isEditing && card) {
        await updateMutation.mutateAsync({ id: card.id, ...payload } as any);
        toast.success("Cartão atualizado!");
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success("Cartão criado!");
      }
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Erro ao salvar cartão");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Cartão</Label>
        <Input
          id="name"
          placeholder="Ex: Nubank Platinum..."
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="credit_limit">Limite de Crédito</Label>
          <Input
            id="credit_limit"
            placeholder="R$ 0,00"
            value={form.watch("credit_limit")}
            onChange={handleCurrencyChange("credit_limit")}
            className="currency"
            inputMode="numeric"
          />
          {form.formState.errors.credit_limit && (
            <p className="text-sm text-destructive">
              {form.formState.errors.credit_limit.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_bill">Fatura Atual</Label>
          <Input
            id="current_bill"
            placeholder="R$ 0,00"
            value={form.watch("current_bill")}
            onChange={handleCurrencyChange("current_bill")}
            className="currency"
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="closing_day">Dia de Fechamento</Label>
          <Input
            id="closing_day"
            type="number"
            min="1"
            max="28"
            placeholder="Ex: 5"
            {...form.register("closing_day")}
          />
          {form.formState.errors.closing_day && (
            <p className="text-sm text-destructive">
              {form.formState.errors.closing_day.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_day">Dia de Vencimento</Label>
          <Input
            id="due_day"
            type="number"
            min="1"
            max="28"
            placeholder="Ex: 15"
            {...form.register("due_day")}
          />
          {form.formState.errors.due_day && (
            <p className="text-sm text-destructive">
              {form.formState.errors.due_day.message}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full h-12" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isEditing ? (
          "Salvar alterações"
        ) : (
          "Adicionar cartão"
        )}
      </Button>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar cartão" : "Novo cartão de crédito"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">{formContent}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl px-4">
        <SheetHeader className="text-left">
          <SheetTitle>
            {isEditing ? "Editar cartão" : "Novo cartão de crédito"}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 overflow-y-auto flex-1">{formContent}</div>
      </SheetContent>
    </Sheet>
  );
}
