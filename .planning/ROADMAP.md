# Roadmap: UX Transacoes v2

## Overview

Migrar de duas colunas para lista unica com toggle inline de status e filtro por tabs. Tres fases: componentes base, comportamento toggle com optimistic updates, e filtros com tabs.

## Phases

- [x] **Phase 1: Componentes & Layout** - Extrair componentes reutilizaveis, lista unica, touch targets 44px ✓
- [ ] **Phase 2: Toggle & Form** - Toggle inline com optimistic updates, toggle no formulario
- [ ] **Phase 3: Filter Tabs** - Tabs Todos/Pendentes/Pagos com contadores

## Phase Details

### Phase 1: Componentes & Layout
**Goal**: Componentes reutilizaveis com touch-friendly sizing e layout unificado
**Depends on**: Nothing
**Requirements**: CMP-01, CMP-02, LAY-01, LAY-02, TOG-02, TOG-04
**Success Criteria** (what must be TRUE):
  1. StatusToggleButton existe como componente reutilizavel
  2. Touch target do toggle tem minimo 44x44px
  3. Badge de status (check verde = pago) visivel em cada card
  4. Lista unica de transacoes (sem duas colunas separadas)
  5. Mesmo componente usado no Dashboard e Transacoes
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — StatusToggleButton + TransactionCard (Wave 1) ✓
- [x] 01-02-PLAN.md — useTransactionFilters hook + TransactionFilters (Wave 1) ✓
- [x] 01-03-PLAN.md — TransactionsList refactor + Dashboard integration (Wave 2) ✓
- [x] 01-04-PLAN.md — Transacoes page integration (Wave 2) ✓

### Phase 2: Toggle & Form
**Goal**: Toggle funcional com feedback imediato e integracao no formulario
**Depends on**: Phase 1
**Requirements**: TOG-01, TOG-03, FRM-01
**Success Criteria** (what must be TRUE):
  1. Usuario pode tocar toggle pra alternar pago/pendente
  2. UI atualiza imediatamente (< 100ms) antes da resposta do servidor
  3. Erro do servidor reverte estado visual
  4. Formulario de nova transacao tem toggle de status
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Optimistic updates for toggle mutations (Wave 1)
- [ ] 02-02-PLAN.md — Status toggle in TransactionForm (Wave 1)

### Phase 3: Filter Tabs
**Goal**: Filtro por status via tabs com feedback de contagem
**Depends on**: Phase 2
**Requirements**: TAB-01, TAB-02, TAB-03
**Success Criteria** (what must be TRUE):
  1. Tabs Todos | Pendentes | Pagos visiveis no topo
  2. Cada tab mostra contador de itens
  3. Tab "Todos" selecionada por padrao ao abrir
  4. Filtro funciona instantaneamente (client-side)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Componentes & Layout | 4/4 | ✓ Complete | 2026-02-01 |
| 2. Toggle & Form | 0/2 | In progress | - |
| 3. Filter Tabs | 0/TBD | Not started | - |
