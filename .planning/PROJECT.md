# Meu Bolso — UX Transacoes v2

## What This Is

Melhoria da UX de visualizacao e controle de status (pago/pendente) das transacoes. Lista unica com toggle inline e filtros por abas.

## Core Value

Usuario consegue marcar e filtrar transacoes por status de forma rapida e intuitiva, sem friccao.

## Current State (v1.0 Shipped)

**Shipped:** 2026-02-01

**Components built:**
- `StatusToggleButton` — 44px touch target, green/dashed states
- `TransactionCard` — uses StatusToggleButton
- `TransactionFilters` — tabs/pills variants with counters
- `TransactionsList` — unified list with filters
- `useTransactionFilters` — centralized filter logic

**Features:**
- Toggle pago/pendente em cada card
- Optimistic updates (UI antes do servidor)
- Filtros Todos/Pendentes/Pagos com contadores
- Toggle de status no formulario
- Mesma UX no Dashboard e Transacoes

## Requirements

### Validated

- ✓ Lista unica de transacoes — v1.0
- ✓ Toggle em cada card pra marcar pago/pendente — v1.0
- ✓ Touch target 44px — v1.0
- ✓ Optimistic update (< 100ms) — v1.0
- ✓ Badge verde = pago — v1.0
- ✓ Tabs Todos/Pendentes/Pagos — v1.0
- ✓ Contador por tab — v1.0
- ✓ Tab "Todos" padrao — v1.0
- ✓ Toggle no formulario — v1.0
- ✓ Mesma UX Dashboard e Transacoes — v1.0
- ✓ Componentes reutilizaveis — v1.0
- ✓ Hook compartilhado — v1.0

### Active (v2 Candidates)

- [ ] Undo snackbar (5-8s pra desfazer toggle)
- [ ] Acessibilidade ARIA (role=switch + aria-checked)
- [ ] Animacao de saida quando item muda de tab
- [ ] Swipe-to-complete no mobile
- [ ] Haptic feedback
- [ ] Persistir filtro no localStorage
- [ ] Manter scroll position por tab
- [ ] Batch selection mode

### Out of Scope

- Filtro combinado status + categoria — complexidade desnecessaria

## Context

**Codebase:**
- `src/components/transactions/status-toggle-button.tsx`
- `src/components/transactions/transaction-card.tsx`
- `src/components/transactions/transaction-filters.tsx`
- `src/components/dashboard/transactions-list.tsx`
- `src/lib/hooks/use-transaction-filters.ts`
- `src/lib/hooks/use-transactions.ts`

**Tech stack:** Next.js 15, Supabase, TanStack Query, Shadcn/ui

## Constraints

- Mobile-first: Touch targets min 44px
- Consistencia: Mesmo padrao Dashboard e Transacoes
- Shadcn/ui: Usar componentes existentes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Toggle ao inves de checkbox | Mais visual e touch-friendly | ✓ Good |
| Tabs ao inves de dropdown | Mais acessivel, menos cliques | ✓ Good |
| Badge ao inves de opacidade | Mais claro, nao "esconde" info | ✓ Good |
| Hook/component separation | Flexibilidade de composicao | ✓ Good |
| Single component with variants | Menos duplicacao de codigo | ✓ Good |
| Status mapping in hook | Encapsula schema do DB | ✓ Good |
| completed_date = due_date | Logico: pago nessa data | ✓ Good |

---
*Last updated: 2026-02-01 after v1.0 milestone*
