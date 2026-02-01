"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert } from "@/lib/database.types";
import { format, startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";
import { ErrorMessages } from "@/lib/errors";

type RecurringTemplate = Tables<"recurring_templates">;

export function useRecurringTemplates() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["recurring-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recurring_templates")
        .select("*")
        .order("day_of_month", { ascending: true });

      if (error) throw error;
      return data as RecurringTemplate[];
    },
  });
}

export function useCreateRecurringTemplate() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (template: Omit<TablesInsert<"recurring_templates">, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED);

      const { data, error } = await supabase
        .from("recurring_templates")
        .insert({ ...template, user_id: user.id })
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

  return useMutation({
    mutationFn: async (month: Date) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED);

      // Get active templates
      const { data: templates, error: templatesError } = await supabase
        .from("recurring_templates")
        .select("*")
        .eq("is_active", true);

      if (templatesError) throw templatesError;
      if (!templates || templates.length === 0) return { created: 0 };

      // Check existing transactions for this month
      const start = format(startOfMonth(month), "yyyy-MM-dd");
      const end = format(endOfMonth(month), "yyyy-MM-dd");

      const { data: existing } = await supabase
        .from("transactions")
        .select("description, amount")
        .eq("is_recurring", true)
        .gte("due_date", start)
        .lte("due_date", end);

      const existingSet = new Set(
        (existing || []).map((t) => `${t.description}-${t.amount}`)
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

      const { error } = await supabase
        .from("transactions")
        .insert(transactionsToCreate);

      if (error) throw error;

      return { created: transactionsToCreate.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}
