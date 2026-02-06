"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert, Enums } from "@/lib/database.types";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ErrorMessages } from "@/lib/errors";
import { useCrypto } from "@/components/providers/crypto-provider";

type CategoryBudget = Tables<"category_budgets">;
type ExpenseCategory = Enums<"expense_category">;

export function useCategoryBudgets() {
  const supabase = createClient();
  const { decryptRows } = useCrypto();

  return useQuery({
    queryKey: ["category-budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("category_budgets")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return decryptRows("category_budgets", data as CategoryBudget[]);
    },
  });
}

export function useUpsertCategoryBudget() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow } = useCrypto();

  return useMutation({
    mutationFn: async (budgets: Array<{ category: ExpenseCategory; monthly_budget: number }>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED);

      // Get existing budgets
      const { data: existing } = await supabase
        .from("category_budgets")
        .select("id, category")
        .eq("user_id", user.id);

      const existingMap = new Map(existing?.map((b) => [b.category, b.id]) || []);

      // Separate updates and inserts
      const updates: Array<{ id: string; monthly_budget: number }> = [];
      const inserts: any[] = [];

      for (const budget of budgets) {
        const existingId = existingMap.get(budget.category);
        if (existingId) {
          updates.push({ id: existingId, monthly_budget: budget.monthly_budget });
        } else {
          inserts.push({
            user_id: user.id,
            category: budget.category,
            monthly_budget: budget.monthly_budget,
          });
        }
      }

      // Perform updates (encrypt monthly_budget)
      for (const update of updates) {
        const encrypted = await encryptRow("category_budgets", { monthly_budget: update.monthly_budget } as Record<string, unknown>);
        const { error } = await supabase
          .from("category_budgets")
          .update(encrypted)
          .eq("id", update.id);
        if (error) throw error;
      }

      // Perform inserts (encrypt monthly_budget)
      if (inserts.length > 0) {
        const encryptedInserts = await Promise.all(
          inserts.map((i) => encryptRow("category_budgets", i as Record<string, unknown>))
        );
        const { error } = await supabase.from("category_budgets").insert(encryptedInserts);
        if (error) throw error;
      }

      return { updates: updates.length, inserts: inserts.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-budgets"] });
    },
  });
}

// Get actual spending per category for a specific month
export function useCategorySpending(month: Date) {
  const supabase = createClient();
  const { decryptRows } = useCrypto();
  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["category-spending", start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("category, amount")
        .eq("type", "expense")
        .gte("due_date", start)
        .lte("due_date", end);

      if (error) throw error;

      const decrypted = await decryptRows("transactions", (data || []) as Record<string, unknown>[]);

      // Aggregate spending by category
      const spending: Record<ExpenseCategory, number> = {} as Record<ExpenseCategory, number>;

      for (const transaction of decrypted as any[]) {
        if (transaction.category) {
          const cat = transaction.category as ExpenseCategory;
          spending[cat] = (spending[cat] || 0) + Number(transaction.amount);
        }
      }

      return spending;
    },
  });
}
