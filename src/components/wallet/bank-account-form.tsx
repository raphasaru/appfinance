"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateBankAccount, useUpdateBankAccount } from "@/lib/hooks/use-bank-accounts";
import { Tables } from "@/lib/database.types";
import { parseCurrency, formatCurrencyInput } from "@/lib/utils/currency";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

const formSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  type: z.enum(["checking", "savings", "investment"]),
  balance: z.string().min(1, "Saldo obrigatório"),
  bank_name: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

type BankAccount = Tables<"bank_accounts">;

interface BankAccountFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: BankAccount | null;
}

const accountTypeLabels = {
  checking: "Conta Corrente",
  savings: "Poupança",
  investment: "Investimento",
};

export function BankAccountForm({
  open,
  onOpenChange,
  account,
}: BankAccountFormProps) {
  const isEditing = !!account;
  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "checking",
      balance: "",
      bank_name: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (account) {
        form.reset({
          name: account.name,
          type: account.type as "checking" | "savings" | "investment",
          balance: formatCurrencyInput(String(Number(account.balance) * 100)),
          bank_name: account.bank_name || "",
        });
      } else {
        form.reset({
          name: "",
          type: "checking",
          balance: "",
          bank_name: "",
        });
      }
    }
  }, [open, account, form]);

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    form.setValue("balance", formatted);
  };

  const onSubmit = async (data: FormData) => {
    const balance = parseCurrency(data.balance);

    const payload = {
      name: data.name,
      type: data.type,
      balance,
      bank_name: data.bank_name || null,
    };

    try {
      if (isEditing && account) {
        await updateMutation.mutateAsync({ id: account.id, ...payload } as any);
        toast.success("Conta atualizada!");
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success("Conta criada!");
      }
      onOpenChange(false);
      form.reset();
    } catch {
      toast.error("Erro ao salvar conta");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="balance">Saldo Atual</Label>
        <Input
          id="balance"
          placeholder="R$ 0,00"
          value={form.watch("balance")}
          onChange={handleBalanceChange}
          className="text-2xl h-14 currency"
          inputMode="numeric"
        />
        {form.formState.errors.balance && (
          <p className="text-sm text-destructive">
            {form.formState.errors.balance.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Conta</Label>
          <Input
            id="name"
            placeholder="Ex: Nubank, Itau..."
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={form.watch("type")}
            onValueChange={(v) => form.setValue("type", v as "checking" | "savings" | "investment")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(accountTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bank_name">Nome do Banco (opcional)</Label>
        <Input
          id="bank_name"
          placeholder="Ex: Nu Pagamentos S.A."
          {...form.register("bank_name")}
        />
      </div>

      <Button type="submit" className="w-full h-12" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isEditing ? (
          "Salvar alterações"
        ) : (
          "Adicionar conta"
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
              {isEditing ? "Editar conta" : "Nova conta bancária"}
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
            {isEditing ? "Editar conta" : "Nova conta bancária"}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 overflow-y-auto flex-1">{formContent}</div>
      </SheetContent>
    </Sheet>
  );
}
