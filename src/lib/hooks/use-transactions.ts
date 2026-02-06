"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";
import { startOfMonth, endOfMonth, format, addMonths } from "date-fns";
import { getInstallmentDueDates } from "@/lib/utils/credit-card";
import { ErrorMessages } from "@/lib/errors";
import { useCrypto } from "@/components/providers/crypto-provider";

type Transaction = Tables<"transactions">;

export function useTransactions(month: Date) {
  const supabase = createClient();
  const { decryptRows } = useCrypto();
  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["transactions", start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("due_date", start)
        .lte("due_date", end)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return decryptRows("transactions", data as Transaction[]);
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow } = useCrypto();

  return useMutation({
    mutationFn: async (transaction: Omit<TablesInsert<"transactions">, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED);

      const row = { ...transaction, user_id: user.id };
      const encrypted = await encryptRow("transactions", row as Record<string, unknown>);

      const { data, error } = await supabase
        .from("transactions")
        .insert(encrypted)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow } = useCrypto();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"transactions"> & { id: string }) => {
      const encrypted = await encryptRow("transactions", updates as Record<string, unknown>);

      const { data, error } = await supabase
        .from("transactions")
        .update(encrypted)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useCompleteTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          completed_date: format(new Date(), "yyyy-MM-dd"),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({ queryKey: ["transactions"] });

      const previousQueries: Array<{ queryKey: readonly unknown[]; data: unknown }> = [];

      queries.forEach((query) => {
        const data = query.state.data as Transaction[] | undefined;
        if (!data) return;

        previousQueries.push({ queryKey: query.queryKey, data });

        queryClient.setQueryData(
          query.queryKey,
          data.map((t) =>
            t.id === id
              ? { ...t, status: "completed" as const, completed_date: format(new Date(), "yyyy-MM-dd") }
              : t
          )
        );
      });

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      context?.previousQueries.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useUncompleteTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "planned",
          completed_date: null,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.findAll({ queryKey: ["transactions"] });

      const previousQueries: Array<{ queryKey: readonly unknown[]; data: unknown }> = [];

      queries.forEach((query) => {
        const data = query.state.data as Transaction[] | undefined;
        if (!data) return;

        previousQueries.push({ queryKey: query.queryKey, data });

        queryClient.setQueryData(
          query.queryKey,
          data.map((t) =>
            t.id === id
              ? { ...t, status: "planned" as const, completed_date: null }
              : t
          )
        );
      });

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      context?.previousQueries.forEach(({ queryKey, data }) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // CASCADE: deleting parent will auto-delete children via FK constraint
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export interface InstallmentTransactionInput {
  description: string;
  amount: number;
  type: "expense";
  category?: string;
  payment_method: "credit";
  credit_card_id: string;
  total_installments: number;
  purchase_date: Date;
  closing_day: number;
  due_day: number;
  notes?: string;
}

export function useCreateInstallmentTransaction() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow } = useCrypto();

  return useMutation({
    mutationFn: async (input: InstallmentTransactionInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED);

      const dueDates = getInstallmentDueDates(
        input.purchase_date,
        { closing_day: input.closing_day, due_day: input.due_day },
        input.total_installments
      );

      const installmentAmount = input.amount / input.total_installments;

      // Create first transaction (parent)
      const parentRow = await encryptRow("transactions", {
        user_id: user.id,
        description: input.description,
        amount: installmentAmount,
        type: input.type,
        category: input.category as any,
        payment_method: "credit",
        credit_card_id: input.credit_card_id,
        installment_number: 1,
        total_installments: input.total_installments,
        due_date: format(dueDates[0], "yyyy-MM-dd"),
        status: "planned",
        notes: input.notes,
      } as Record<string, unknown>);

      const { data: parent, error: parentError } = await supabase
        .from("transactions")
        .insert(parentRow)
        .select()
        .single();

      if (parentError) throw parentError;

      // Create remaining installments as children
      if (input.total_installments > 1) {
        const childrenPlain = dueDates.slice(1).map((dueDate, index) => ({
          user_id: user.id,
          description: input.description,
          amount: installmentAmount,
          type: input.type,
          category: input.category as any,
          payment_method: "credit" as const,
          credit_card_id: input.credit_card_id,
          installment_number: index + 2,
          total_installments: input.total_installments,
          parent_transaction_id: parent.id,
          due_date: format(dueDate, "yyyy-MM-dd"),
          status: "planned" as const,
          notes: input.notes,
        }));

        const encryptedChildren = await Promise.all(
          childrenPlain.map((c) => encryptRow("transactions", c as Record<string, unknown>))
        );

        const { error: childError } = await supabase
          .from("transactions")
          .insert(encryptedChildren);

        if (childError) throw childError;
      }

      return parent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useBatchCompleteTransactions() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;

      const { error } = await supabase
        .from("transactions")
        .update({
          status: "completed",
          completed_date: format(new Date(), "yyyy-MM-dd"),
        })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useBatchUncompleteTransactions() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (ids.length === 0) return;

      const { error } = await supabase
        .from("transactions")
        .update({
          status: "planned",
          completed_date: null,
        })
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}

export function useTransactionWithItems(transactionId: string | null) {
  const supabase = createClient();
  const { decryptRow, decryptRows } = useCrypto();

  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      if (!transactionId) return null;

      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          transaction_items (*)
        `)
        .eq("id", transactionId)
        .single();

      if (error) throw error;

      const decryptedTransaction = await decryptRow(
        "transactions",
        data as Record<string, unknown>
      );

      if (data.transaction_items && Array.isArray(data.transaction_items)) {
        (decryptedTransaction as any).transaction_items = await decryptRows(
          "transaction_items",
          data.transaction_items as Record<string, unknown>[]
        );
      }

      return decryptedTransaction;
    },
    enabled: !!transactionId,
  });
}
