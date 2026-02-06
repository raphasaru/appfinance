"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useCrypto } from "@/components/providers/crypto-provider";

interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  completedIncome: number;
  completedExpenses: number;
  pendingIncome: number;
  pendingExpenses: number;
  balance: number;
  completedBalance: number;
}

export function useMonthlySummary(month: Date) {
  const supabase = createClient();
  const { decryptRows } = useCrypto();
  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["summary", start],
    queryFn: async (): Promise<MonthlySummary> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type, status")
        .gte("due_date", start)
        .lte("due_date", end);

      if (error) throw error;

      const decrypted = await decryptRows("transactions", (data || []) as Record<string, unknown>[]);

      const summary = decrypted.reduce(
        (acc, t: any) => {
          const amount = Number(t.amount);
          if (t.type === "income") {
            acc.totalIncome += amount;
            if (t.status === "completed") {
              acc.completedIncome += amount;
            } else {
              acc.pendingIncome += amount;
            }
          } else {
            acc.totalExpenses += amount;
            if (t.status === "completed") {
              acc.completedExpenses += amount;
            } else {
              acc.pendingExpenses += amount;
            }
          }
          return acc;
        },
        {
          totalIncome: 0,
          totalExpenses: 0,
          completedIncome: 0,
          completedExpenses: 0,
          pendingIncome: 0,
          pendingExpenses: 0,
        }
      );

      return {
        ...summary,
        balance: summary.totalIncome - summary.totalExpenses,
        completedBalance: summary.completedIncome - summary.completedExpenses,
      };
    },
  });
}

// Period Summary with filters for accounts and cards
export interface PeriodFilters {
  bankAccountIds?: string[];
  creditCardIds?: string[];
}

export function usePeriodSummary(
  startDate: Date,
  endDate: Date,
  filters?: PeriodFilters
) {
  const supabase = createClient();
  const { decryptRows } = useCrypto();
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");

  const filterKey = filters
    ? `${filters.bankAccountIds?.join(",") || ""}-${filters.creditCardIds?.join(",") || ""}`
    : "all";

  return useQuery({
    queryKey: ["period-summary", start, end, filterKey],
    queryFn: async (): Promise<MonthlySummary> => {
      let query = supabase
        .from("transactions")
        .select("amount, type, status, bank_account_id, credit_card_id")
        .gte("due_date", start)
        .lte("due_date", end);

      const { data, error } = await query;

      if (error) throw error;

      const decrypted = await decryptRows("transactions", (data || []) as Record<string, unknown>[]);

      // Apply filters client-side for flexibility with OR logic
      let filtered = decrypted as any[];

      if (filters?.bankAccountIds?.length || filters?.creditCardIds?.length) {
        filtered = filtered.filter((t) => {
          const matchAccount =
            !filters.bankAccountIds?.length ||
            (t.bank_account_id && filters.bankAccountIds.includes(t.bank_account_id));
          const matchCard =
            !filters.creditCardIds?.length ||
            (t.credit_card_id && filters.creditCardIds.includes(t.credit_card_id));

          // If both filters active, match either
          if (filters.bankAccountIds?.length && filters.creditCardIds?.length) {
            return matchAccount || matchCard;
          }
          // If only one filter active, match that one
          return matchAccount && matchCard;
        });
      }

      const summary = filtered.reduce(
        (acc, t) => {
          const amount = Number(t.amount);
          if (t.type === "income") {
            acc.totalIncome += amount;
            if (t.status === "completed") {
              acc.completedIncome += amount;
            } else {
              acc.pendingIncome += amount;
            }
          } else {
            acc.totalExpenses += amount;
            if (t.status === "completed") {
              acc.completedExpenses += amount;
            } else {
              acc.pendingExpenses += amount;
            }
          }
          return acc;
        },
        {
          totalIncome: 0,
          totalExpenses: 0,
          completedIncome: 0,
          completedExpenses: 0,
          pendingIncome: 0,
          pendingExpenses: 0,
        }
      );

      return {
        ...summary,
        balance: summary.totalIncome - summary.totalExpenses,
        completedBalance: summary.completedIncome - summary.completedExpenses,
      };
    },
  });
}

// Category spending with period and filters
export function usePeriodCategorySpending(
  startDate: Date,
  endDate: Date,
  filters?: PeriodFilters
) {
  const supabase = createClient();
  const { decryptRows } = useCrypto();
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");

  const filterKey = filters
    ? `${filters.bankAccountIds?.join(",") || ""}-${filters.creditCardIds?.join(",") || ""}`
    : "all";

  return useQuery({
    queryKey: ["period-category-spending", start, end, filterKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("category, amount, bank_account_id, credit_card_id")
        .eq("type", "expense")
        .gte("due_date", start)
        .lte("due_date", end);

      if (error) throw error;

      const decrypted = await decryptRows("transactions", (data || []) as Record<string, unknown>[]);

      // Apply filters client-side
      let filtered = decrypted as any[];

      if (filters?.bankAccountIds?.length || filters?.creditCardIds?.length) {
        filtered = filtered.filter((t) => {
          const matchAccount =
            !filters.bankAccountIds?.length ||
            (t.bank_account_id && filters.bankAccountIds.includes(t.bank_account_id));
          const matchCard =
            !filters.creditCardIds?.length ||
            (t.credit_card_id && filters.creditCardIds.includes(t.credit_card_id));

          if (filters.bankAccountIds?.length && filters.creditCardIds?.length) {
            return matchAccount || matchCard;
          }
          return matchAccount && matchCard;
        });
      }

      // Aggregate spending by category
      const spending: Record<string, number> = {};

      for (const transaction of filtered) {
        if (transaction.category) {
          const cat = transaction.category;
          spending[cat] = (spending[cat] || 0) + Number(transaction.amount);
        }
      }

      return spending;
    },
  });
}
