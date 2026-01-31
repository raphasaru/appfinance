# UX Pitfalls: Toggle + Filter Tabs for Transaction Status

**Domain:** Mobile financial app - transaction status management
**Researched:** 2026-01-31
**Confidence:** HIGH (multiple authoritative sources)

---

## Critical Pitfalls

Mistakes that cause rewrites or major user frustration.

### Pitfall 1: Optimistic Update Race Conditions

**What goes wrong:** User rapidly toggles status multiple times. First mutation completes and invalidates cache while second mutation is in-flight. UI reverts to stale state, then flips again when second mutation completes. User sees state "bounce" back and forth.

**Why it happens:** React Query's `invalidateQueries` after first mutation fetches server state before second mutation commits. Each mutation triggers independent invalidation.

**Warning signs:**
- State flickers when tapping toggle quickly
- Users report "it keeps changing back"
- Network tab shows multiple GET requests interleaved with mutations

**Prevention:**
- Cancel in-flight queries before mutating: `queryClient.cancelQueries()`
- Snapshot previous data for rollback: `queryClient.getQueryData()`
- Only invalidate after LAST mutation (debounce invalidation)
- Consider `setQueryData` for instant UI + background sync

**Phase to address:** Implementation phase - hooks refactoring

**Sources:** [TkDodo Concurrent Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query), [TanStack Discussion #7932](https://github.com/TanStack/query/discussions/7932)

---

### Pitfall 2: Item Disappears When Toggling Under Active Filter

**What goes wrong:** User is on "Pendentes" tab. Taps toggle to mark transaction as paid. Transaction instantly vanishes from list (correct behavior) but user panics - thinks data was deleted.

**Why it happens:** No visual feedback that item moved to different tab. Optimistic update removes item from filtered list immediately.

**Warning signs:**
- Support tickets: "my transaction disappeared"
- Users re-creating transactions they already marked as paid
- Hesitation before tapping toggle (learned fear)

**Prevention:**
- **Exit animation:** Item fades/slides out with subtle delay (200-300ms)
- **Toast confirmation:** "Marcado como pago" with undo link
- **Show destination:** "Movido para Pagos" micro-copy
- **Consider:** Brief "ghost" state where item stays visible but greyed out before removal

**Phase to address:** UI/animation phase

---

### Pitfall 3: Toggle Touch Target Too Small

**What goes wrong:** User tries to tap toggle but misses, accidentally opens transaction details instead. On mobile, fat fingers hit adjacent elements.

**Why it happens:** Toggle visual is ~20px but needs 44px touch target. Designers focus on visual size, not tap area.

**Warning signs:**
- High rate of accidental detail opens
- Users complaining toggle "doesn't work"
- Analytics show high tap-abandon rate on toggle

**Prevention:**
- Minimum 44x44px touch target (Apple HIG) or 48x48dp (Material)
- 8px minimum spacing between toggle and other interactive elements
- Invisible padding around visual toggle
- Test on actual devices, not just browser DevTools

**Phase to address:** Component design phase

**Sources:** [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/), [Ahmad Shadeed Target Size](https://ishadeed.com/article/target-size/)

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 4: No Loading State During Toggle

**What goes wrong:** User taps toggle, nothing visible happens for 200-500ms while mutation runs. User taps again (thinking first tap failed), causing double-toggle or race condition.

**Prevention:**
- Instant optimistic UI change (< 100ms)
- If optimistic not possible, show micro-loading indicator ON the toggle
- Disable toggle during mutation to prevent double-tap
- For <1s operations: instant feedback, no spinner

**Phase to address:** Implementation phase

**Sources:** [GitHub Primer Loading](https://primer.style/ui-patterns/loading/), [NN/g Progress Indicators](https://www.nngroup.com/articles/progress-indicators/)

---

### Pitfall 5: Toggle State Ambiguity

**What goes wrong:** User can't tell if toggle means "is paid" or "mark as paid". ON/OFF states look too similar (slight color difference). User unsure if tapping will pay or unpay.

**Warning signs:**
- Users asking "what does the toggle do?"
- Accidental status reversals
- Low toggle usage despite feature awareness

**Prevention:**
- Clear labels: "Pago" visible text, not just icon
- High contrast states: green checkmark (paid) vs grey circle (pending)
- Don't rely solely on color - add icon differentiation
- Consider text labels alongside toggle: "Pendente" / "Pago"

**Phase to address:** Design phase

**Sources:** [UX Movement Toggle Misuse](https://uxmovement.com/mobile/stop-misusing-toggle-switches/), [Eleken Toggle UX](https://www.eleken.co/blog-posts/toggle-ux)

---

### Pitfall 6: Filter Tab Counts Not Updating

**What goes wrong:** User toggles transaction to "paid". Filter tabs still show old counts (e.g., "Pendentes (5)" when it should be "Pendentes (4)"). Creates distrust.

**Prevention:**
- Derive counts from filtered data, not separate query
- Update counts optimistically along with list
- After mutation settles, counts match server state

**Phase to address:** Implementation phase

---

### Pitfall 7: Tab Switching Loses Scroll Position

**What goes wrong:** User scrolls through 50 transactions, switches tab to check something, switches back - now at top of list. Loses context.

**Prevention:**
- Store scroll position per tab
- Restore position when returning to tab
- Or: Keep all tabs rendered (hidden), not unmounted

**Phase to address:** Implementation phase

---

## Minor Pitfalls

Annoying but fixable issues.

### Pitfall 8: No Empty State Per Filter

**What goes wrong:** User on "Pendentes" tab with no pending transactions sees blank screen. User confused if data is loading or truly empty.

**Prevention:**
- Context-aware empty states: "Nenhuma transacao pendente - bom trabalho!"
- Different messaging per tab
- Include CTA when appropriate

**Phase to address:** UI polish phase

---

### Pitfall 9: Filter Tabs Scroll Off Screen

**What goes wrong:** On narrow mobile screens, third tab partially hidden. User doesn't realize there's a third option.

**Prevention:**
- Ensure all 3 tabs visible on 320px width
- If tabs must scroll: show partial tab + scroll indicator
- Test on smallest supported screen size

**Phase to address:** Responsive design phase

**Sources:** [Eleken Tabs UX](https://www.eleken.co/blog-posts/tabs-ux)

---

### Pitfall 10: Accessibility - Toggle Not Announced Correctly

**What goes wrong:** Screen reader announces toggle as "checkbox" or gives no state information. Blind users can't use the feature.

**Prevention:**
- Use `role="switch"` with `aria-checked`
- Accessible name: "Marcar transacao X como paga"
- State change announced: "pago" / "pendente"
- Support both Space and Enter keys

**Phase to address:** Component design phase (build it in from start)

**Sources:** [Sara Soueidan Toggle](https://www.sarasoueidan.com/blog/toggle-switch-design/), [Atomic A11y Toggle](https://www.atomica11y.com/accessible-design/toggle-switch/)

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|----------------|------------|
| Hook refactoring | Race conditions (P1) | Use `cancelQueries` + snapshot pattern |
| Component design | Touch targets (P3), A11y (P10) | Start with 44px, add ARIA from day 1 |
| UI/animations | Disappearing items (P2) | Exit animation + toast feedback |
| Implementation | Loading states (P4), Counts (P6) | Optimistic updates, derived counts |
| Polish | Empty states (P8), Responsive (P9) | Context-aware messaging, test 320px |

---

## Quick Reference: Toggle States

```
CORRECT STATES:
[grey circle] Pendente -> tap -> [green checkmark] Pago
[green checkmark] Pago -> tap -> [grey circle] Pendente

AVOID:
- Toggle that's always green/always blue (no visual diff)
- Toggle without text label nearby
- Toggle that requires confirmation popup (breaks instant expectation)
```

---

## Sources

- [TkDodo Concurrent Optimistic Updates](https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query) - HIGH confidence
- [TanStack Query Optimistic Updates](https://tanstack.com/query/v4/docs/framework/react/guides/optimistic-updates) - HIGH confidence
- [UX Movement Toggle Misuse](https://uxmovement.com/mobile/stop-misusing-toggle-switches/) - HIGH confidence
- [Eleken Toggle UX](https://www.eleken.co/blog-posts/toggle-ux) - MEDIUM confidence
- [Ahmad Shadeed Target Size](https://ishadeed.com/article/target-size/) - HIGH confidence
- [Sara Soueidan Toggle Design](https://www.sarasoueidan.com/blog/toggle-switch-design/) - HIGH confidence
- [Smashing Magazine Filter Patterns](https://www.smashingmagazine.com/2021/07/frustrating-design-patterns-broken-frozen-filters/) - MEDIUM confidence
- [Eleken Tabs UX](https://www.eleken.co/blog-posts/tabs-ux) - MEDIUM confidence
- [Atomic A11y Toggle](https://www.atomica11y.com/accessible-design/toggle-switch/) - HIGH confidence
- [GitHub Primer Loading](https://primer.style/ui-patterns/loading/) - HIGH confidence
