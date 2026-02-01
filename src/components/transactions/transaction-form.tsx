"use client";

import { useEffect, useState } from "react";
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
  SelectGroup,
  SelectLabel,
  SelectSeparator,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateTransaction, useUpdateTransaction, useCreateInstallmentTransaction } from "@/lib/hooks/use-transactions";
import { useBankAccounts } from "@/lib/hooks/use-bank-accounts";
import { useCreditCards } from "@/lib/hooks/use-credit-cards";
import { useCustomCategories } from "@/lib/hooks/use-custom-categories";
import { Tables, Enums } from "@/lib/database.types";
import { categoryLabels, ExpenseCategory } from "@/lib/utils/categories";
import { parseCurrency, formatCurrencyInput, formatCurrency } from "@/lib/utils/currency";
import { PAYMENT_METHOD_CONFIG, PaymentMethod } from "@/lib/utils/payment-methods";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ChevronDown, Crown } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { StatusToggleButton } from "@/components/transactions/status-toggle-button";

const formSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.string().min(1, "Valor obrigatório"),
  type: z.enum(["income", "expense"]),
  category: z.string().optional(),
  custom_category_id: z.string().optional(),
  due_date: z.string().min(1, "Data obrigatória"),
  payment_method: z.string().optional(),
  bank_account_id: z.string().optional(),
  credit_card_id: z.string().optional(),
  installments: z.number().min(1).max(48).optional(),
  status: z.enum(["planned", "completed"]),
});

type FormData = z.infer<typeof formSchema>;

type Transaction = Tables<"transactions">;

interface TransactionItem {
  id?: string;
  description: string;
  amount: string;
  quantity: number;
}

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
  const createInstallmentMutation = useCreateInstallmentTransaction();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: bankAccounts = [] } = useBankAccounts();
  const { data: creditCards = [] } = useCreditCards();
  const { data: customCategories = [] } = useCustomCategories();

  const [items, setItems] = useState<TransactionItem[]>([]);
  const [itemsOpen, setItemsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      type: "expense",
      category: undefined,
      custom_category_id: undefined,
      due_date: format(defaultDate, "yyyy-MM-dd"),
      payment_method: undefined,
      bank_account_id: undefined,
      credit_card_id: undefined,
      installments: 1,
      status: "planned",
    },
  });

  // Reset form when transaction changes or modal opens
  useEffect(() => {
    if (open) {
      if (transaction) {
        form.reset({
          description: transaction.description,
          amount: formatCurrencyInput(String(Number(transaction.amount) * 100)),
          type: transaction.type,
          category: transaction.category || undefined,
          custom_category_id: transaction.custom_category_id || undefined,
          due_date: transaction.due_date,
          payment_method: transaction.payment_method || undefined,
          bank_account_id: transaction.bank_account_id || undefined,
          credit_card_id: transaction.credit_card_id || undefined,
          installments: transaction.total_installments || 1,
          status: transaction.status ?? "planned",
        });
        setItems([]);
      } else {
        form.reset({
          description: "",
          amount: "",
          type: "expense",
          category: undefined,
          custom_category_id: undefined,
          due_date: format(defaultDate, "yyyy-MM-dd"),
          payment_method: undefined,
          bank_account_id: undefined,
          credit_card_id: undefined,
          installments: 1,
          status: "planned",
        });
        setItems([]);
      }
    }
  }, [open, transaction, form, defaultDate]);

  const transactionType = form.watch("type");
  const paymentMethod = form.watch("payment_method") as PaymentMethod | undefined;
  const creditCardId = form.watch("credit_card_id");
  const installments = form.watch("installments") || 1;

  const isCredit = paymentMethod === "credit";
  const showBankAccount = !isCredit && paymentMethod;
  const showCreditCard = isCredit;
  const showInstallments = isCredit && creditCardId;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    form.setValue("amount", formatted);
  };

  // Sub-items handlers
  const addItem = () => {
    setItems([...items, { description: "", amount: "", quantity: 1 }]);
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: string | number) => {
    const newItems = [...items];
    if (field === "amount" && typeof value === "string") {
      newItems[index].amount = formatCurrencyInput(value);
    } else {
      (newItems[index] as any)[field] = value;
    }
    setItems(newItems);

    // Auto-sum items to total
    const total = newItems.reduce((sum, item) => {
      const itemAmount = parseCurrency(item.amount);
      return sum + itemAmount * item.quantity;
    }, 0);

    if (total > 0) {
      form.setValue("amount", formatCurrencyInput(String(Math.round(total * 100))));
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);

    // Recalculate total
    const total = newItems.reduce((sum, item) => {
      const itemAmount = parseCurrency(item.amount);
      return sum + itemAmount * item.quantity;
    }, 0);

    if (total > 0) {
      form.setValue("amount", formatCurrencyInput(String(Math.round(total * 100))));
    }
  };

  const onSubmit = async (data: FormData) => {
    const amount = parseCurrency(data.amount);
    if (amount <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    const selectedCard = creditCards.find(c => c.id === data.credit_card_id);

    // Handle installment creation for credit card
    if (isCredit && selectedCard && data.installments && data.installments > 1 && !isEditing) {
      try {
        await createInstallmentMutation.mutateAsync({
          description: data.description,
          amount,
          type: "expense",
          category: data.category,
          payment_method: "credit",
          credit_card_id: selectedCard.id,
          total_installments: data.installments,
          purchase_date: new Date(data.due_date),
          closing_day: selectedCard.closing_day,
          due_day: selectedCard.due_day,
        });
        toast.success(`${data.installments} parcelas criadas!`);
        onOpenChange(false);
        form.reset();
        return;
      } catch {
        toast.error("Erro ao criar parcelas");
        return;
      }
    }

    const payload = {
      description: data.description,
      amount,
      type: data.type as Enums<"transaction_type">,
      category: data.type === "expense" && !data.custom_category_id ? (data.category as ExpenseCategory) : null,
      custom_category_id: data.type === "expense" ? data.custom_category_id || null : null,
      due_date: data.due_date,
      payment_method: data.payment_method as PaymentMethod || null,
      bank_account_id: showBankAccount ? data.bank_account_id || null : null,
      credit_card_id: showCreditCard ? data.credit_card_id || null : null,
      installment_number: isCredit && !isEditing ? 1 : null,
      total_installments: isCredit && !isEditing ? 1 : null,
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

  const isPending = createMutation.isPending || updateMutation.isPending || createInstallmentMutation.isPending;

  const installmentAmount = installments > 1 ? parseCurrency(form.watch("amount")) / installments : 0;

  const formContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            value={form.watch("custom_category_id") ? `custom:${form.watch("custom_category_id")}` : form.watch("category")}
            onValueChange={(v) => {
              if (v.startsWith("custom:")) {
                form.setValue("custom_category_id", v.replace("custom:", ""));
                form.setValue("category", undefined);
              } else {
                form.setValue("category", v);
                form.setValue("custom_category_id", undefined);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categorias padrão</SelectLabel>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
              {customCategories.length > 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-1">
                      <Crown className="h-3 w-3 text-yellow-500" />
                      Suas categorias
                    </SelectLabel>
                    {customCategories.map((cat) => (
                      <SelectItem key={cat.id} value={`custom:${cat.id}`}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color || "#6366f1" }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}
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

      {/* Status toggle */}
      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label>Status</Label>
          <p className="text-xs text-muted-foreground">
            {form.watch("status") === "completed" ? "Já pago" : "Pendente"}
          </p>
        </div>
        <StatusToggleButton
          status={form.watch("status") || "planned"}
          onToggle={() => {
            const current = form.watch("status");
            form.setValue("status", current === "completed" ? "planned" : "completed");
          }}
          size="md"
        />
      </div>

      {transactionType === "expense" && (
        <div className="space-y-2">
          <Label>Forma de Pagamento</Label>
          <Select
            value={paymentMethod}
            onValueChange={(v) => {
              form.setValue("payment_method", v);
              if (v !== "credit") {
                form.setValue("credit_card_id", undefined);
                form.setValue("installments", 1);
              }
              if (v === "credit") {
                form.setValue("bank_account_id", undefined);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_METHOD_CONFIG).map(([value, config]) => {
                const Icon = config.icon;
                return (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      {config.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {showBankAccount && bankAccounts.length > 0 && (
        <div className="space-y-2">
          <Label>Conta</Label>
          <Select
            value={form.watch("bank_account_id")}
            onValueChange={(v) => form.setValue("bank_account_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a conta" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showCreditCard && creditCards.length > 0 && (
        <div className="space-y-2">
          <Label>Cartão</Label>
          <Select
            value={creditCardId}
            onValueChange={(v) => form.setValue("credit_card_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cartão" />
            </SelectTrigger>
            <SelectContent>
              {creditCards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showInstallments && !isEditing && (
        <div className="space-y-2">
          <Label>Parcelas</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={48}
              value={installments}
              onChange={(e) => form.setValue("installments", parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">
              {installments > 1 && `${installments}x de ${formatCurrency(installmentAmount)}`}
            </span>
          </div>
        </div>
      )}

      {/* Sub-items */}
      <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between">
            <span>Sub-itens {items.length > 0 && `(${items.length})`}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${itemsOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
              <Input
                placeholder="Descrição"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="R$ 0,00"
                value={item.amount}
                onChange={(e) => updateItem(index, "amount", e.target.value)}
                className="w-24 currency"
                inputMode="numeric"
              />
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                className="w-16"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar item
          </Button>
        </CollapsibleContent>
      </Collapsible>

      <Button type="submit" className="w-full h-12" disabled={isPending}>
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isEditing ? (
          "Salvar alterações"
        ) : installments > 1 ? (
          `Criar ${installments} parcelas`
        ) : (
          "Adicionar"
        )}
      </Button>
    </form>
  );

  // Desktop: Use Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar transação" : "Nova transação"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {formContent}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile: Use Sheet
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-xl px-4">
        <SheetHeader className="text-left">
          <SheetTitle>
            {isEditing ? "Editar transação" : "Nova transação"}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 overflow-y-auto flex-1 pb-8">
          {formContent}
        </div>
      </SheetContent>
    </Sheet>
  );
}
