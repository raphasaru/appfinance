# Meu Bolso — UX Transações v2

## What This Is

Melhoria da UX de visualização e controle de status (pago/pendente) das transações. Simplifica de duas colunas para uma lista única com toggle inline e filtros por abas.

## Core Value

Usuário consegue marcar e filtrar transações por status de forma rápida e intuitiva, sem fricção.

## Requirements

### Validated

- ✓ CRUD transações com status planned/completed — existing
- ✓ Visualização por mês com MonthSelector — existing
- ✓ Filtros básicos (conta, cartão) — existing
- ✓ Formulário de transação com React Hook Form + Zod — existing
- ✓ TanStack Query com cache 60s — existing

### Active

- [ ] Lista única de transações (remover duas colunas)
- [ ] Toggle/switch em cada card pra marcar pago/pendente
- [ ] Tabs no topo: Todos | Pendentes | Pagos (padrão: Todos)
- [ ] Badge/ícone diferenciando status (✓ verde = pago)
- [ ] Toggle de status no formulário de nova transação
- [ ] Aplicar mesma UX no Dashboard e página Transações

### Out of Scope

- Persistir filtro selecionado (localStorage) — simplicidade v1
- Animações de transição de status — pode adicionar depois
- Filtro combinado status + categoria — complexidade desnecessária

## Context

**Codebase atual:**
- Dashboard: `src/app/(dashboard)/dashboard/page.tsx`
- Transações: `src/app/(dashboard)/transacoes/page.tsx`
- Hooks: `src/lib/hooks/use-transactions.ts`
- Cards: `src/components/transactions/`

**Componentes Shadcn disponíveis:**
- Switch (toggle)
- Tabs
- Badge

**Status atual no DB:** `transaction_status: "planned" | "completed"`

## Constraints

- **UI**: Usar componentes Shadcn existentes (Switch, Tabs, Badge)
- **Mobile-first**: Toggle precisa ser touch-friendly (min 44px)
- **Consistência**: Mesmo padrão visual no Dashboard e Transações

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Toggle ao invés de checkbox | Mais visual e touch-friendly | — Pending |
| Tabs ao invés de dropdown | Mais acessível, menos cliques | — Pending |
| Badge ao invés de opacidade | Mais claro, não "esconde" info | — Pending |

---
*Last updated: 2026-01-31 after initialization*
