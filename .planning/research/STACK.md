# Technology Stack: Transaction Status UX

**Project:** KYN App - Transaction Status Toggle & Tab Filtering
**Researched:** 2026-01-31
**Dimension:** Stack (focused on UX components for status toggles/filters)

## Current State

The codebase already implements:
- **Tabs** (`@radix-ui/react-tabs`): Used in `/transacoes` page for type filtering (Todas/Receitas/Despesas)
- **Switch** (`@radix-ui/react-switch`): Available but unused for transaction status
- **Checkbox** (`@radix-ui/react-checkbox`): Used in batch selection mode
- **Custom circular toggle button**: 24x24px inline status toggle in `TransactionCard` - works but not using Shadcn primitives

## Recommended Components

### 1. Inline Status Toggle: Keep Custom Button (Enhanced)

| Aspect | Recommendation | Rationale |
|--------|----------------|-----------|
| Component | Custom `<button>` with 24x24px circular hit area | Already implemented, proven touch-friendly |
| Enhancement | Increase hit area to 44x44px via padding | Apple HIG minimum; current 24px too small |
| Alternative rejected | `Switch` | Too horizontal, breaks visual alignment in card row |
| Alternative rejected | `Checkbox` | Semantic mismatch - status is action, not multi-select |

**Implementation pattern:**
```tsx
// Enlarge touch target while keeping visual 24px
<button
  className={cn(
    "h-11 w-11 flex items-center justify-center", // 44px touch target
    "-m-2.5" // Negative margin to keep visual spacing
  )}
>
  <span className="h-6 w-6 rounded-full border-2 ...">
    {/* Visual indicator */}
  </span>
</button>
```

### 2. Tab-Based Status Filtering: Use Existing `Tabs`

| Aspect | Recommendation | Rationale |
|--------|----------------|-----------|
| Component | `Tabs` + `TabsList` + `TabsTrigger` | Already installed, mobile-optimized in codebase |
| Layout | Full-width `TabsList` with `grid-cols-3` | Consistent with existing type filter tabs |
| Badge integration | Inline count badge in trigger | Already done in `StatusFilterTabs` component |

**Why Tabs over ToggleGroup:**
- **Semantic fit**: Status filter is navigation-like (view different lists), not toggle state
- **Existing pattern**: Type filter already uses Tabs, consistency matters
- **Badge support**: Current implementation embeds counts in triggers; ToggleGroup less suited for this

### 3. Combined Type + Status Filter (Mobile)

| Aspect | Recommendation | Rationale |
|--------|----------------|-----------|
| Pattern | Stacked: Status tabs above Type tabs | Already implemented; works well |
| Alternative | Single segmented control | Would collapse 9 states into one; too complex |
| Touch spacing | 8px gap between tab groups | Prevents mis-taps |

## Components NOT Needed

| Component | Why Skip |
|-----------|----------|
| `ToggleGroup` | Tabs work better for filter navigation; ToggleGroup better for formatting controls |
| `RadioGroup` | Same as ToggleGroup; also requires label association |
| `Select` | Hides options; tabs show counts at glance |
| `DropdownMenu` (for status) | Already used for sort; don't overload pattern |

## State Management Pattern

### Filter State: Local `useState` (Current)

```tsx
const [statusFilter, setStatusFilter] = useState<"all" | "planned" | "completed">("all");
```

**Why not URL params:**
- Month is already in URL via `MonthSelector`
- Filter state is session-ephemeral; URL state unnecessary for this UX
- Simplifies navigation (no query string pollution)

**Why not React Query:**
- Filtering is client-side over already-fetched data
- No additional API calls needed
- Current `useMemo` pattern efficient for expected data size (<500 transactions/month)

### Mutation State: TanStack Query (Current)

```tsx
const completeMutation = useCompleteTransaction();
const uncompleteMutation = useUncompleteTransaction();
```

**Optimistic updates recommended for toggle:**
```tsx
// In mutation config
onMutate: async (id) => {
  await queryClient.cancelQueries({ queryKey: ["transactions"] });
  const previous = queryClient.getQueryData(["transactions", start]);
  queryClient.setQueryData(["transactions", start], (old) =>
    old?.map(t => t.id === id ? { ...t, status: "completed" } : t)
  );
  return { previous };
},
onError: (_, __, context) => {
  queryClient.setQueryData(["transactions", start], context?.previous);
},
```

## Touch-Friendly Sizing Recommendations

| Element | Current | Recommended | Apple HIG |
|---------|---------|-------------|-----------|
| Status toggle | 24x24px | 44x44px touch area | 44pt minimum |
| Tab triggers | ~36px height | 44px min-height | 44pt minimum |
| Card padding | 12px | Keep or increase | Sufficient |
| Card gap | 8px | Keep | Sufficient |

**CSS adjustments:**
```tsx
// TabsTrigger override for mobile
<TabsTrigger className="min-h-[44px] px-4">

// Status toggle touch area
<button className="h-11 w-11 -m-2.5 flex items-center justify-center">
```

## Installation

No new packages needed. Current dependencies sufficient:
- `@radix-ui/react-tabs` (v1.1.13)
- `@radix-ui/react-checkbox` (v1.3.3)
- `@radix-ui/react-switch` (v1.2.6) - available if needed later

## Sources

- Codebase analysis: `/src/components/ui/tabs.tsx`, `/src/components/transactions/transaction-card.tsx`
- [Shadcn Toggle Group docs](https://ui.shadcn.com/docs/components/toggle-group) - evaluated, not recommended for this use case
- Apple Human Interface Guidelines - 44pt minimum touch target
- Current `/transacoes/page.tsx` implementation patterns

## Confidence Assessment

| Recommendation | Confidence | Reason |
|---------------|------------|--------|
| Keep custom toggle button | HIGH | Already proven in codebase, just needs touch area fix |
| Use Tabs for filter | HIGH | Already implemented, consistent with existing patterns |
| Local useState for filters | HIGH | Standard React pattern, no complexity needed |
| 44px touch targets | HIGH | Industry standard (Apple HIG, Material Design) |
| Skip ToggleGroup | MEDIUM | Could work, but Tabs already established pattern |
