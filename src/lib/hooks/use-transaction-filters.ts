"use client";

import { useState, useMemo } from "react";
import { Tables } from "@/lib/database.types";

type Transaction = Tables<"transactions">;

export type StatusFilter = "all" | "pending" | "completed";

export interface UseTransactionFiltersOptions {
  transactions: Transaction[] | undefined;
  defaultStatus?: StatusFilter;
}

export interface TransactionCounts {
  all: number;
  pending: number;
  completed: number;
}

export interface UseTransactionFiltersReturn {
  /** Filtered transactions based on current statusFilter */
  filtered: Transaction[];

  /** Counts for each status */
  counts: TransactionCounts;

  /** Current status filter */
  statusFilter: StatusFilter;

  /** Set status filter */
  setStatusFilter: (filter: StatusFilter) => void;
}

/**
 * Hook for filtering transactions by status.
 * Centralizes filter logic used in Dashboard and Transacoes pages.
 *
 * Status mapping:
 * - "pending" -> database status "planned"
 * - "completed" -> database status "completed"
 * - "all" -> no filter
 */
export function useTransactionFilters({
  transactions,
  defaultStatus = "all",
}: UseTransactionFiltersOptions): UseTransactionFiltersReturn {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(defaultStatus);

  const counts = useMemo<TransactionCounts>(() => {
    const all = transactions?.length || 0;
    const pending = transactions?.filter((t) => t.status === "planned").length || 0;
    const completed = transactions?.filter((t) => t.status === "completed").length || 0;

    return { all, pending, completed };
  }, [transactions]);

  const filtered = useMemo<Transaction[]>(() => {
    if (!transactions) return [];

    switch (statusFilter) {
      case "pending":
        return transactions.filter((t) => t.status === "planned");
      case "completed":
        return transactions.filter((t) => t.status === "completed");
      case "all":
      default:
        return transactions;
    }
  }, [transactions, statusFilter]);

  return {
    filtered,
    counts,
    statusFilter,
    setStatusFilter,
  };
}
