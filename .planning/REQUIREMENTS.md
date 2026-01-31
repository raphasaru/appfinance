# Requirements: Meu Bolso — UX Transações v2

**Defined:** 2026-01-31
**Core Value:** Usuário consegue marcar e filtrar transações por status de forma rápida e intuitiva

## v1 Requirements

### Toggle de Status

- [ ] **TOG-01**: Toggle em cada card de transação pra marcar pago/pendente
- [ ] **TOG-02**: Touch target mínimo 44x44px no toggle
- [ ] **TOG-03**: Optimistic update — feedback visual imediato antes da resposta do servidor
- [ ] **TOG-04**: Badge/ícone diferenciando status (✓ verde = pago)

### Filtro por Tabs

- [ ] **TAB-01**: Tabs no topo: Todos | Pendentes | Pagos
- [ ] **TAB-02**: Contador de itens em cada tab
- [ ] **TAB-03**: Tab "Todos" como padrão ao abrir

### Layout

- [ ] **LAY-01**: Lista única de transações (remover duas colunas)
- [ ] **LAY-02**: Mesma UX aplicada no Dashboard e página Transações

### Formulário

- [ ] **FRM-01**: Toggle de status no formulário de nova transação

### Componentes

- [ ] **CMP-01**: Componentes reutilizáveis entre Dashboard e Transações
- [ ] **CMP-02**: Hook compartilhado pra lógica de filtro

## v2 Requirements

### UX Enhancements

- **UX-01**: Undo snackbar (5-8s pra desfazer toggle)
- **UX-02**: Acessibilidade ARIA (role=switch + aria-checked)
- **UX-03**: Animação de saída suave quando item muda de tab
- **UX-04**: Swipe-to-complete no mobile
- **UX-05**: Haptic feedback

### Persistência

- **PER-01**: Persistir filtro selecionado no localStorage
- **PER-02**: Manter scroll position por tab

### Power Features

- **PWR-01**: Batch selection mode (marcar vários de uma vez)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Filtro combinado status + categoria | Complexidade desnecessária pra v1 |
| Persistir filtro (localStorage) | Simplicidade v1 |
| Animações de transição | Pode adicionar depois |
| Swipe gestures | Requer mais teste de UX |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOG-01 | TBD | Pending |
| TOG-02 | TBD | Pending |
| TOG-03 | TBD | Pending |
| TOG-04 | TBD | Pending |
| TAB-01 | TBD | Pending |
| TAB-02 | TBD | Pending |
| TAB-03 | TBD | Pending |
| LAY-01 | TBD | Pending |
| LAY-02 | TBD | Pending |
| FRM-01 | TBD | Pending |
| CMP-01 | TBD | Pending |
| CMP-02 | TBD | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 0
- Unmapped: 12 ⚠️

---
*Requirements defined: 2026-01-31*
*Last updated: 2026-01-31 after initial definition*
