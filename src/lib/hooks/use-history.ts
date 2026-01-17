"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export function useMonthlyHistory(months: number = 6) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["history", months],
    queryFn: async (): Promise<MonthlyData[]> => {
      const now = new Date();
      const results: MonthlyData[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const month = subMonths(now, i);
        const start = format(startOfMonth(month), "yyyy-MM-dd");
        const end = format(endOfMonth(month), "yyyy-MM-dd");

        const { data, error } = await supabase
          .from("transactions")
          .select("amount, type, status")
          .gte("due_date", start)
          .lte("due_date", end)
          .eq("status", "completed");

        if (error) throw error;

        const summary = (data || []).reduce(
          (acc, t) => {
            const amount = Number(t.amount);
            if (t.type === "income") {
              acc.income += amount;
            } else {
              acc.expenses += amount;
            }
            return acc;
          },
          { income: 0, expenses: 0 }
        );

        results.push({
          month: format(month, "MMM"),
          income: summary.income,
          expenses: summary.expenses,
          balance: summary.income - summary.expenses,
        });
      }

      return results;
    },
  });
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  [key: string]: string | number;
}

export function useCategoryBreakdown(month: Date) {
  const supabase = createClient();
  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["category-breakdown", start],
    queryFn: async (): Promise<CategoryData[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, category")
        .eq("type", "expense")
        .gte("due_date", start)
        .lte("due_date", end);

      if (error) throw error;

      const categoryTotals = (data || []).reduce<Record<string, number>>((acc, t) => {
        const cat = t.category || "variable_other";
        acc[cat] = (acc[cat] || 0) + Number(t.amount);
        return acc;
      }, {});

      const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

      return Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
        }))
        .sort((a, b) => b.amount - a.amount);
    },
  });
}
