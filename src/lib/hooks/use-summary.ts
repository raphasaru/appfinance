"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

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

      const summary = (data || []).reduce(
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
