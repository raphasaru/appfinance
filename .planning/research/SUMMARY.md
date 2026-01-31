# Project Research Summary

**Project:** Meu Bolso - Transaction Status Toggle & Filter UX
**Domain:** Personal finance PWA - transaction management
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

Research focused on UX improvements for transaction status toggling (planned/completed) and filter tabs. Existing implementation works but has critical gaps: 24px touch targets (too small), no optimistic updates (perceived lag), duplicate filter logic across pages, and missing undo capability.

Recommended approach: Keep custom circular toggle button (enlarge touch area to 44px via padding), use existing Tabs component for filters (matches current type filter pattern), extract shared components to reduce duplication, implement optimistic updates via TanStack Query's `onMutate` hook. No new dependencies needed - all components already in codebase.

Key risks: Race conditions from rapid toggling (prevent with `cancelQueries`), items disappearing under active filter without feedback (add exit animation + toast), toggle state ambiguity (enhance visual differentiation). All mitigated through established patterns from authoritative sources.

## Key Findings

### Recommended Stack

No new stack changes. Current dependencies sufficient:
- `@radix-ui/react-tabs` (v1.1.13) - for status filter tabs
- `@radix-ui/react-checkbox` (v1.3.3) - for batch selection
- TanStack Query - add optimistic updates pattern

**Core UX components:**
- **Custom toggle button** - Already implemented, just needs 44px touch target (Apple HIG minimum). Rejected Switch/Checkbox (semantic mismatch).
- **Tabs for filtering** - Already used for type filter, reuse pattern for status filter. Rejected ToggleGroup/Select (navigation vs control).
- **Local useState** - Current pattern works. Rejected URL state/Context (unnecessary complexity).

**Touch-friendly sizing:**
| Element | Current | Required |
|---------|---------|----------|
| Status toggle | 24px | 44px touch area |
| Tab triggers | ~36px | 44px min-height |

### Expected Features

**Must have (table stakes):**
- Visual status differentiation - solid vs dashed borders (already done)
- Single-tap toggle - immediate effect, no confirmation (already done)
- Optimistic UI updates - <100ms response (missing, add)
- Undo capability - snackbar with "Desfazer", 5-8s timeout (missing, add)
- Filter tabs - Todos/Pendentes/Pagos with count badges (partially done)
- Clear pending indicator - muted text, clock icon (already done)
- Loading state on toggle - spinner during API call (already done)
- Accessibility - `role="switch"`, `aria-checked` (missing, add)

**Should have (competitive):**
- Swipe-to-complete - power users mark paid with gesture (defer to v2)
- Batch status toggle - select multiple, toggle all (already implemented, needs UI)
- Haptic feedback - subtle vibration on toggle (defer to v2)
- Exit animation - item fades out when filtered away (nice-to-have)

**Defer (v2+):**
- Auto-complete on date - mark completed when due date passes
- Smart status suggestions - AI-based batch suggestions
- Filter state persistence - localStorage for user preference

### Architecture Approach

Keep local component state, extract reusable components, add optimistic updates to mutations. Current approach is sound - just needs consolidation and performance enhancement.

**Major components:**
1. **StatusToggleButton** - Extract from TransactionCard inline button, add 44px touch target and ARIA
2. **StatusFilterTabs** - Extract from Dashboard/Transacoes duplication, reusable with counts
3. **useToggleTransactionStatus** - New hook with optimistic updates, replaces separate complete/uncomplete mutations
4. **useFilteredTransactions** - Shared filtering logic hook, eliminates duplication

**Data flow:**
```
User taps toggle → onMutate (instant UI update) → mutation → onSuccess/onError → invalidate
User switches tab → client-side filter via useMemo → no API call
```

### Critical Pitfalls

1. **Race conditions from rapid toggling** - User taps toggle twice quickly, mutations overlap, UI bounces between states. Prevention: `cancelQueries()` before `onMutate`, snapshot previous data for rollback.

2. **Items disappear under active filter** - User on "Pendentes" tab, marks paid, item vanishes, user thinks deleted. Prevention: 200-300ms exit animation + toast "Marcado como pago" with undo.

3. **Touch target too small** - Current 24px toggle causes mis-taps, opens detail by accident. Prevention: 44x44px touch area with padding, 8px spacing from other interactive elements.

4. **Toggle state ambiguity** - User unsure if ON means "is paid" or "will pay". Prevention: Clear visual diff (green checkmark vs grey circle), text labels, high contrast.

5. **Filter counts not updating** - Tab shows "Pendentes (5)" after marking one paid. Prevention: Derive counts from filtered data, update optimistically.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Component Extraction & Touch Targets
**Rationale:** Low-risk refactor, immediate UX improvement, no behavioral changes
**Delivers:** Reusable StatusToggleButton (44px), StatusFilterTabs components
**Addresses:** Touch target pitfall, code duplication
**Avoids:** Pitfall 3 (small targets)
**Research flag:** None - standard React component extraction

### Phase 2: Optimistic Updates & Undo
**Rationale:** Core performance improvement, table stakes feature gap
**Delivers:** Instant toggle feedback, undo snackbar
**Uses:** TanStack Query `onMutate` pattern
**Addresses:** Table stakes requirements (optimistic UI, undo)
**Avoids:** Pitfalls 1, 4, 5 (race conditions, loading states, counts)
**Research flag:** Test race condition scenarios (rapid toggling)

### Phase 3: Accessibility & Polish
**Rationale:** Compliance + UX refinement after core mechanics proven
**Delivers:** ARIA attributes, exit animations, empty states
**Addresses:** Table stakes (screen reader support)
**Avoids:** Pitfall 10 (accessibility), Pitfall 2 (disappearing items), Pitfall 8 (empty states)
**Research flag:** None - standard A11y patterns

### Phase Ordering Rationale

- **Phase 1 first** - Component extraction is foundation for other phases. Touch target fix has highest ROI (low effort, high impact).
- **Phase 2 depends on Phase 1** - Optimistic updates need extracted hook structure. Can't add undo without knowing where toggle is called.
- **Phase 3 builds on working mechanics** - Accessibility and animations layer on top of functional toggle. Polish phase naturally comes last.

This order minimizes risk: refactor → behavior change → refinement. Each phase deliverable and testable independently.

### Research Flags

Phases with standard patterns (skip research):
- **Phase 1:** Component extraction - well-documented React pattern
- **Phase 3:** Accessibility - ARIA patterns established in W3C docs

Needs validation during implementation:
- **Phase 2:** Race condition handling - test rapid toggle scenarios, verify `cancelQueries` behavior with multiple in-flight mutations

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All components already in codebase, no new deps needed |
| Features | HIGH | Verified against NN/G, Apple HIG, Google Material guidelines |
| Architecture | HIGH | Patterns verified in existing codebase (Dashboard/Transacoes analysis) |
| Pitfalls | HIGH | Multiple authoritative sources (TkDodo, Sara Soueidan, Ahmad Shadeed) |

**Overall confidence:** HIGH

### Gaps to Address

- **Batch selection UI** - Component exists (`selectable` prop in TransactionCard) but no trigger to enter mode. Defer or add "Selecionar" button? Decision needed during Phase 1.
- **Filter state persistence** - Should tabs reset on navigation or persist via localStorage? Current behavior: reset. User testing may reveal preference.
- **Mobile vs desktop filter UI** - Current implementation duplicates logic. Phase 1 should clarify if same component works for both or needs responsive variants.

## Sources

### Primary (HIGH confidence)
- Codebase analysis - `/src/app/(dashboard)/dashboard/page.tsx`, `/src/app/(dashboard)/transacoes/page.tsx`, `/src/components/transactions/transaction-card.tsx`
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) - 44pt touch target minimum
- [TkDodo: Concurrent Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query) - Race condition prevention
- [TanStack Query: Optimistic Updates](https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates) - Official pattern
- [Nielsen Norman Group: Toggle Switch Guidelines](https://www.nngroup.com/articles/toggle-switch-guidelines/) - UX best practices
- [W3C ARIA: Switch Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) - Accessibility spec
- [Sara Soueidan: Toggle Switch Design](https://www.sarasoueidan.com/blog/toggle-switch-design/) - A11y implementation
- [Ahmad Shadeed: Target Size](https://ishadeed.com/article/target-size/) - Touch area guidelines

### Secondary (MEDIUM confidence)
- [Shadcn Toggle Group docs](https://ui.shadcn.com/docs/components/toggle-group) - Evaluated but rejected for this use case
- [Medium: Optimistic UI Patterns](https://simonhearne.com/2021/optimistic-ui-patterns/) - Pattern overview
- [Eleken: Toggle UX](https://www.eleken.co/blog-posts/toggle-ux) - Design case studies
- [Google Developers: Snackbar Design](https://medium.com/google-developers/snackbar-the-appropriate-interruption-ceb54d9be583) - Undo pattern

---
*Research completed: 2026-01-31*
*Ready for roadmap: yes*
