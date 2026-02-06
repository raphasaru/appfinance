"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert } from "@/lib/database.types";
import { format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { ErrorMessages } from "@/lib/errors";
import { useCrypto } from "@/components/providers/crypto-provider";

type RecurringTemplate = Tables<"recurring_templates">;

export function useRecurringTemplates() {
  const supabase = createClient();
  const { decryptRows } = useCrypto();

  return useQuery({
    queryKey: ["recurring-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_templates")
        .select("*")
        .order("day_of_month", { ascending: true });

      if (error) throw error;
      return decryptRows("recurring_templates", data as RecurringTemplate[]);
    },
  });
}

export function useCreateRecurringTemplate() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow } = useCrypto();

  return useMutation({
    mutationFn: async (template: Omit<TablesInsert<"recurring_templates">, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED);

      const encrypted = await encryptRow("recurring_templates", { ...template, user_id: user.id } as Record<string, unknown>);

      const { data, error } = await supabase
        .from("recurring_templates")
        .insert(encrypted)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    },
  });
}

export function useToggleRecurringTemplate() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("recurring_templates")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    },
  });
}

export function useUpdateRecurringTemplate() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow } = useCrypto();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<TablesInsert<"recurring_templates">, "user_id">>) => {
      const encrypted = await encryptRow("recurring_templates", updates as Record<string, unknown>);

      const { data, error } = await supabase
        .from("recurring_templates")
        .update(encrypted)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    },
  });
}

export function useDeleteRecurringTemplate() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("recurring_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-templates"] });
    },
  });
}

export function useGenerateMonthlyTransactions() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow, decryptRows } = useCrypto();

  return useMutation({
    mutationFn: async (month: Date) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED);

      // Get active templates
      const { data: templatesRaw, error: templatesError } = await supabase
        .from("recurring_templates")
        .select("*")
        .eq("is_active", true);

      if (templatesError) throw templatesError;
      if (!templatesRaw || templatesRaw.length === 0) return { created: 0 };

      const templates = await decryptRows("recurring_templates", templatesRaw as Record<string, unknown>[]) as RecurringTemplate[];

      // Check existing transactions for this month
      const start = format(startOfMonth(month), "yyyy-MM-dd");
      const end = format(endOfMonth(month), "yyyy-MM-dd");

      const { data: existingRaw } = await supabase
        .from("transactions")
        .select("description, amount")
        .eq("is_recurring", true)
        .gte("due_date", start)
        .lte("due_date", end);

      // Decrypt existing to compare descriptions
      const existing = existingRaw
        ? await decryptRows("transactions", existingRaw as Record<string, unknown>[])
        : [];

      const existingSet = new Set(
        existing.map((t: any) => `${t.description}-${t.amount}`)
      );

      // Create transactions that don't exist yet
      const daysInMonth = getDaysInMonth(month);
      const transactionsToCreate = templates
        .filter((t) => !existingSet.has(`${t.description}-${t.amount}`))
        .map((template) => {
          const day = Math.min(template.day_of_month, daysInMonth);
          const dueDate = new Date(month.getFullYear(), month.getMonth(), day);

          return {
            user_id: user.id,
            description: template.description,
            amount: template.amount,
            type: template.type,
            category: template.category,
            due_date: format(dueDate, "yyyy-MM-dd"),
            is_recurring: true,
            recurring_day: template.day_of_month,
            status: "planned" as const,
          };
        });

      if (transactionsToCreate.length === 0) {
        return { created: 0 };
      }

      const encryptedTransactions = await Promise.all(
        transactionsToCreate.map((t) => encryptRow("transactions", t as Record<string, unknown>))
      );

      const { error } = await supabase
        .from("transactions")
        .insert(encryptedTransactions);

      if (error) throw error;

      return { created: transactionsToCreate.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}
