"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StatusFilter, TransactionCounts } from "@/lib/hooks/use-transaction-filters";

export interface TransactionFiltersProps {
  /** Current status filter value */
  statusFilter: StatusFilter;
  /** Callback when filter changes */
  onStatusChange: (filter: StatusFilter) => void;
  /** Counts for each status */
  counts: TransactionCounts;
  /** Visual variant */
  variant?: "tabs" | "pills";
  /** Additional class names */
  className?: string;
}

/**
 * Reusable transaction status filter component.
 * Supports two visual variants:
 * - "tabs": Uses Shadcn Tabs (used in Dashboard mobile)
 * - "pills": Rounded buttons (used in Transacoes page)
 */
export function TransactionFilters({
  statusFilter,
  onStatusChange,
  counts,
  variant = "tabs",
  className,
}: TransactionFiltersProps) {
  if (variant === "pills") {
    return (
      <div className={cn("flex gap-1 bg-muted p-1 rounded-lg", className)}>
        <button
          onClick={() => onStatusChange("all")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            statusFilter === "all"
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
          )}
        >
          Todas
          <span className="text-xs text-muted-foreground">({counts.all})</span>
        </button>
        <button
          onClick={() => onStatusChange("pending")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            statusFilter === "pending"
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
          )}
        >
          Pendentes
          {counts.pending > 0 && (
            <Badge
              variant="secondary"
              className="h-5 px-1.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            >
              {counts.pending}
            </Badge>
          )}
        </button>
        <button
          onClick={() => onStatusChange("completed")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            statusFilter === "completed"
              ? "bg-background shadow-sm"
              : "hover:bg-background/50"
          )}
        >
          Concluidas
          <span className="text-xs text-muted-foreground">({counts.completed})</span>
        </button>
      </div>
    );
  }

  // Default: tabs variant
  return (
    <Tabs
      value={statusFilter}
      onValueChange={(v) => onStatusChange(v as StatusFilter)}
      className={className}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all" className="text-xs">
          Todas
          <span className="ml-1.5 text-[10px] opacity-70">{counts.all}</span>
        </TabsTrigger>
        <TabsTrigger value="pending" className="text-xs">
          Pendentes
          <span className="ml-1.5 text-[10px] opacity-70">{counts.pending}</span>
        </TabsTrigger>
        <TabsTrigger value="completed" className="text-xs">
          Concluidas
          <span className="ml-1.5 text-[10px] opacity-70">{counts.completed}</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
