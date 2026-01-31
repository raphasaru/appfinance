# Requirements: Meu Bolso — UX Transacoes v2

**Defined:** 2026-01-31
**Core Value:** Usuario consegue marcar e filtrar transacoes por status de forma rapida e intuitiva

## v1 Requirements

### Toggle de Status

- [ ] **TOG-01**: Toggle em cada card de transacao pra marcar pago/pendente
- [ ] **TOG-02**: Touch target minimo 44x44px no toggle
- [ ] **TOG-03**: Optimistic update — feedback visual imediato antes da resposta do servidor
- [ ] **TOG-04**: Badge/icone diferenciando status (check verde = pago)

### Filtro por Tabs

- [ ] **TAB-01**: Tabs no topo: Todos | Pendentes | Pagos
- [ ] **TAB-02**: Contador de itens em cada tab
- [ ] **TAB-03**: Tab "Todos" como padrao ao abrir

### Layout

- [ ] **LAY-01**: Lista unica de transacoes (remover duas colunas)
- [ ] **LAY-02**: Mesma UX aplicada no Dashboard e pagina Transacoes

### Formulario

- [ ] **FRM-01**: Toggle de status no formulario de nova transacao

### Componentes

- [ ] **CMP-01**: Componentes reutilizaveis entre Dashboard e Transacoes
- [ ] **CMP-02**: Hook compartilhado pra logica de filtro

## v2 Requirements

### UX Enhancements

- **UX-01**: Undo snackbar (5-8s pra desfazer toggle)
- **UX-02**: Acessibilidade ARIA (role=switch + aria-checked)
- **UX-03**: Animacao de saida suave quando item muda de tab
- **UX-04**: Swipe-to-complete no mobile
- **UX-05**: Haptic feedback

### Persistencia

- **PER-01**: Persistir filtro selecionado no localStorage
- **PER-02**: Manter scroll position por tab

### Power Features

- **PWR-01**: Batch selection mode (marcar varios de uma vez)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Filtro combinado status + categoria | Complexidade desnecessaria pra v1 |
| Persistir filtro (localStorage) | Simplicidade v1 |
| Animacoes de transicao | Pode adicionar depois |
| Swipe gestures | Requer mais teste de UX |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TOG-01 | Phase 2 | Pending |
| TOG-02 | Phase 1 | Pending |
| TOG-03 | Phase 2 | Pending |
| TOG-04 | Phase 1 | Pending |
| TAB-01 | Phase 3 | Pending |
| TAB-02 | Phase 3 | Pending |
| TAB-03 | Phase 3 | Pending |
| LAY-01 | Phase 1 | Pending |
| LAY-02 | Phase 1 | Pending |
| FRM-01 | Phase 2 | Pending |
| CMP-01 | Phase 1 | Pending |
| CMP-02 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-01-31*
*Last updated: 2026-01-31 after roadmap creation*
