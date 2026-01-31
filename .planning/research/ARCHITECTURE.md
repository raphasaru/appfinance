# Architecture Patterns: Transaction Status Filter UX

**Domain:** React filter state + TanStack Query integration
**Researched:** 2026-01-31
**Confidence:** HIGH (verified against existing codebase patterns)

## Current State Analysis

### Existing Patterns in Codebase

1. **Filter state managed via local `useState`** - Both Dashboard and Transacoes pages duplicate status filter logic
2. **TanStack Query fetches all data, client filters** - `useTransactions(month)` returns all transactions, filtering via `useMemo`
3. **No optimistic updates** - Mutations use `invalidateQueries`, causing refetch
4. **Partial component reuse** - `AccountCardFilter` exists for reports; status filter duplicated inline

### Code Evidence

**Dashboard page (lines 26, 37-50):**
```typescript
const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
const filteredTransactions = useMemo(() => {
  // Filter logic duplicated from Transacoes page
}, [transactions, statusFilter]);
```

**Transacoes page (lines 46, 71-100):**
```typescript
const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
const filteredAndSortedTransactions = useMemo(() => {
  // Same filter logic, plus sorting
}, [transactions, typeFilter, statusFilter, sortField, sortOrder]);
```

---

## Recommended Architecture

### 1. State Management Pattern: Lifted Local State + Props

**Recommendation:** Keep `useState` at page level, extract filter components.

**Rationale:**
- Filters are UI concerns, not shared across pages
- URL state adds complexity without benefit (filters reset on navigation is fine)
- Context overkill for 2 pages

**Pattern:**
```typescript
// Page level - owns the state
const [filters, setFilters] = useState<TransactionFilters>({
  status: "all",
  type: "all",
  sort: { field: "date", order: "desc" }
});

// Shared component - receives state + setters
<StatusFilterTabs
  value={filters.status}
  onChange={(status) => setFilters(prev => ({ ...prev, status }))}
  counts={counts}
/>
```

### 2. Component Composition Strategy

**Extract these reusable components:**

| Component | Location | Props | Reuse |
|-----------|----------|-------|-------|
| `StatusFilterTabs` | `components/transactions/status-filter-tabs.tsx` | `value, onChange, counts` | Dashboard, Transacoes |
| `StatusToggleButton` | `components/transactions/status-toggle-button.tsx` | `isCompleted, onToggle, isLoading` | TransactionCard |
| `TransactionFiltersBar` | `components/transactions/filters-bar.tsx` | `filters, onChange, counts` | Transacoes (desktop sidebar) |

**Component hierarchy:**
```
TransactionCard
  └── StatusToggleButton (extracted from current inline button)

Dashboard/Transacoes pages
  └── StatusFilterTabs (shared)
        └── TabsTrigger with badge counts

Transacoes page (desktop)
  └── TransactionFiltersBar
        └── TypeFilter
        └── StatusFilter
        └── SortDropdown
```

### 3. Data Flow for Toggle Actions

**Current flow (no optimistic):**
```
User clicks toggle → mutation.mutateAsync() → wait for response → invalidateQueries → refetch → UI updates
```

**Recommended flow (optimistic updates):**
```
User clicks toggle → optimistic UI update → mutation fires → on success: confirm; on error: rollback
```

**Implementation with TanStack Query:**
```typescript
export function useToggleTransactionStatus() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === "completed" ? "planned" : "completed";
      const { error } = await supabase
        .from("transactions")
        .update({
          status: newStatus,
          completed_date: newStatus === "completed" ? format(new Date(), "yyyy-MM-dd") : null,
        })
        .eq("id", id);
      if (error) throw error;
      return { id, newStatus };
    },

    // Optimistic update
    onMutate: async ({ id, currentStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions"] });

      // Snapshot previous value
      const previousTransactions = queryClient.getQueriesData({ queryKey: ["transactions"] });

      // Optimistically update
      queryClient.setQueriesData({ queryKey: ["transactions"] }, (old: Transaction[] | undefined) => {
        if (!old) return old;
        return old.map(t =>
          t.id === id
            ? { ...t, status: currentStatus === "completed" ? "planned" : "completed" }
            : t
        );
      });

      return { previousTransactions };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        context.previousTransactions.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
  });
}
```

### 4. Filter State Type Definition

```typescript
// lib/types/filters.ts
export type StatusFilter = "all" | "planned" | "completed";
export type TypeFilter = "all" | "income" | "expense";
export type SortField = "date" | "description" | "amount";
export type SortOrder = "asc" | "desc";

export interface TransactionFilters {
  status: StatusFilter;
  type: TypeFilter;
  sort: {
    field: SortField;
    order: SortOrder;
  };
}

export interface FilterCounts {
  all: number;
  planned: number;
  completed: number;
  income: number;
  expense: number;
}
```

### 5. Shared Filtering Logic Hook

```typescript
// lib/hooks/use-filtered-transactions.ts
export function useFilteredTransactions(
  transactions: Transaction[] | undefined,
  filters: TransactionFilters
) {
  return useMemo(() => {
    if (!transactions) return [];

    let result = transactions;

    // Status filter
    if (filters.status !== "all") {
      result = result.filter(t => t.status === filters.status);
    }

    // Type filter
    if (filters.type !== "all") {
      result = result.filter(t => t.type === filters.type);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (filters.sort.field) {
        case "date":
          cmp = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case "description":
          cmp = a.description.localeCompare(b.description, "pt-BR");
          break;
        case "amount":
          cmp = Number(a.amount) - Number(b.amount);
          break;
      }
      return filters.sort.order === "asc" ? cmp : -cmp;
    });

    return result;
  }, [transactions, filters]);
}

export function useFilterCounts(transactions: Transaction[] | undefined): FilterCounts {
  return useMemo(() => ({
    all: transactions?.length || 0,
    planned: transactions?.filter(t => t.status === "planned").length || 0,
    completed: transactions?.filter(t => t.status === "completed").length || 0,
    income: transactions?.filter(t => t.type === "income").length || 0,
    expense: transactions?.filter(t => t.type === "expense").length || 0,
  }), [transactions]);
}
```

---

## Anti-Patterns to Avoid

### 1. Server-Side Filtering for Status

**Why bad:** Extra DB round trips for simple client-side filter. Status filter is UI state, not data query.

**Exception:** If list grows to 1000+ items per month, consider server-side pagination with status filter.

### 2. Global Context for Page-Specific Filters

**Why bad:** Adds complexity, no benefit. Filters don't need to persist across navigation.

### 3. URL State for Simple Filters

**Why bad:** Overkill complexity. Users don't bookmark/share filtered transaction views.

**When to use:** If analytics needs to track filter usage, or deep-linking becomes a requirement.

### 4. Separate Queries per Status

**Why bad:**
```typescript
// DON'T do this
const { data: planned } = useTransactions(month, { status: "planned" });
const { data: completed } = useTransactions(month, { status: "completed" });
```
Two queries when one suffices. Complicates cache invalidation.

---

## File Changes Summary

| Action | Path | Purpose |
|--------|------|---------|
| CREATE | `src/lib/types/filters.ts` | Type definitions |
| CREATE | `src/lib/hooks/use-filtered-transactions.ts` | Shared filtering logic |
| CREATE | `src/components/transactions/status-filter-tabs.tsx` | Reusable tab component |
| CREATE | `src/components/transactions/status-toggle-button.tsx` | Extracted from TransactionCard |
| MODIFY | `src/lib/hooks/use-transactions.ts` | Add `useToggleTransactionStatus` with optimistic updates |
| MODIFY | `src/components/transactions/transaction-card.tsx` | Use StatusToggleButton |
| MODIFY | `src/app/(dashboard)/dashboard/page.tsx` | Use shared components |
| MODIFY | `src/app/(dashboard)/transacoes/page.tsx` | Use shared components |

---

## Implementation Phases

**Phase 1: Extract Types + Filtering Hook** (LOW risk)
- Create `filters.ts` types
- Create `use-filtered-transactions.ts`
- No UI changes yet

**Phase 2: Extract Components** (MEDIUM risk)
- Create `StatusFilterTabs`
- Create `StatusToggleButton`
- Refactor pages to use new components
- Visual regression testing needed

**Phase 3: Optimistic Updates** (MEDIUM risk)
- Add `useToggleTransactionStatus` with optimistic logic
- Update `TransactionCard` to use new mutation
- Test error rollback scenarios

---

## Sources

- Codebase analysis: `/src/app/(dashboard)/dashboard/page.tsx`, `/src/app/(dashboard)/transacoes/page.tsx`
- Existing pattern: `/src/components/reports/account-card-filter.tsx`
- TanStack Query optimistic updates: Official docs pattern
- Confidence: HIGH (all patterns verified against existing code)

---

## Open Questions

1. Should batch complete use optimistic updates too? (Currently no optimistic)
2. Persist filter preference in localStorage? (Currently resets)
3. Mobile vs desktop: same component or variants? (Currently inline duplicate)
