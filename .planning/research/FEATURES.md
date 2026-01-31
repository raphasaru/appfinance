# Feature Landscape: Transaction Status Toggle UX

**Domain:** Finance app - transaction list with pending/completed status
**Researched:** 2026-01-31
**Confidence:** HIGH (verified with authoritative UX sources)

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Mobile Notes |
|---------|--------------|------------|--------------|
| **Visual status differentiation** | Users need instant recognition of state. Standard: solid border = completed, dashed = pending. Color-coded badges/icons. | Low | Use color + icon, not color alone (accessibility) |
| **Single-tap status toggle** | Toggle should take immediate effect like a light switch. No confirmation dialog for reversible actions. | Low | Touch target min 44px. Current circular button (24px) is too small. |
| **Optimistic UI updates** | UI must respond <100ms. Network latency causes perceived sluggishness. Update immediately, rollback on error. | Med | Already using TanStack Query - implement `onMutate` for instant feedback |
| **Undo capability** | Binary actions need easy reversal. Reduces user anxiety, especially for financial data. | Med | Snackbar with "Desfazer" action, 5-8 sec timeout |
| **Filter tabs** | Users expect to filter by status. "Todos / Pendentes / Pagos" is standard segmented control pattern. | Low | Horizontal scrollable tabs in thumb zone. Show count badges. |
| **Clear pending indicator** | Pending items need distinct visual treatment: muted text, clock icon, dashed borders. Users must know what's not finalized. | Low | Current implementation has this. Keep it. |
| **Loading state on toggle** | User needs feedback during API call. Spinner or state transition animation. | Low | Already implemented with `Loader2`. Good. |
| **Accessibility: screen reader support** | Toggle buttons need `aria-checked` or `aria-pressed`. State must be announced. | Med | Use `role="switch"` with `aria-checked` instead of plain button |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Mobile Notes |
|---------|-------------------|------------|--------------|
| **Swipe-to-complete** | Power users can mark paid with single swipe gesture. Feels native on mobile. Leading edge = mark complete, trailing = other actions. | Med | Use `swipeActions` pattern. Reveal green checkmark on left swipe. |
| **Batch status toggle** | Select multiple transactions, toggle all at once. Saves time for recurring monthly tasks. | High | Long-press to enter selection mode. Floating action bar for batch actions. |
| **Auto-complete on date** | System marks as completed when due date passes (optional). Reduces manual work for fixed expenses. | Med | Requires user preference toggle. Could confuse some users. |
| **Smart status suggestions** | AI suggests marking similar transactions as paid when one is completed (e.g., all utilities). | High | Show non-intrusive prompt, don't auto-apply. |
| **Haptic feedback on toggle** | Subtle vibration confirms action completion. Standard iOS/Android pattern. | Low | Use Vibration API. Short pulse (50ms) on success. |
| **Visual completion animation** | Brief animation showing check appearing, item transitioning to "completed" style. | Low | CSS transition: 200ms ease-out. Strikethrough effect or color shift. |
| **Due date warnings** | Highlight overdue (red) and due-soon (amber) items. Current impl has this - it's differentiating. | Already done | Keep current AlertTriangle icons. |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Confirmation dialog for toggle** | Breaks immediacy. Toggle switches must take effect instantly. Dialogs add friction to frequent action. | Use undo snackbar instead. Let user reverse easily. |
| **Toggle + Save button combo** | Mixes immediate action (toggle) with form submission. Confuses mental model. | Toggle = immediate. Forms = explicit submit. Never mix. |
| **Color-only status indication** | 8% of men are colorblind. Color alone fails WCAG. | Use icon + text + color. Current Clock/Check icons are good. |
| **Tiny tap targets** | Current 24px toggle button is undersized. Causes frustration on mobile. | Min 44x44px touch target per Apple/Google guidelines. |
| **Status change without feedback** | Silent updates cause uncertainty. "Did it work?" | Toast confirmation + optimistic UI + undo option. |
| **Auto-dismiss snackbar without action completion** | Gmail-style where "Undo" disappears in 5s. Stresses users. | 8 second minimum, or persist until dismissed for critical actions. |
| **Hiding batch actions** | Multi-select is discoverable only by accident via long-press. | Add "Selecionar" button visible in UI. Enter selection mode explicitly. |
| **Swipe without visual hint** | Swipe gestures are invisible. Users may never discover them. | Subtle edge indicator or onboarding tooltip on first use. |

## Feature Dependencies

```
Basic Status Toggle (table stakes)
    ↓
Optimistic UI + Undo (required for good UX)
    ↓
Swipe Actions (differentiator, builds on toggle)
    ↓
Batch Selection (differentiator, requires selection state management)
```

Filter tabs are independent and can be built in parallel.

## Current Implementation Analysis

**What's Good:**
- Visual differentiation (dashed vs solid borders, color coding)
- Loading spinner on toggle
- Pending/Overdue/Due-soon indicators
- Category icons and payment method icons

**Gaps to Address:**
1. **Touch target too small** - 24px circular button, needs 44px
2. **No undo capability** - toast.success shows, but no undo action
3. **No optimistic updates** - waits for API before UI change
4. **No accessibility attributes** - button lacks role="switch" and aria-checked
5. **No filter tabs** - lists are split by cards but no filtering in single view
6. **Selection mode exists but not easily discoverable** - selectable prop exists but needs trigger

## MVP Recommendation

For MVP status toggle improvement, prioritize:

1. **Increase touch target** - Quick fix, big impact
2. **Add optimistic updates** - Already using TanStack Query, just add `onMutate`
3. **Add undo snackbar** - Sonner already available, add action prop
4. **Add aria attributes** - Accessibility compliance

Defer to post-MVP:
- Swipe-to-complete: Requires gesture library, more testing
- Batch selection UI: Complex state management, lower frequency use case
- Haptic feedback: Nice-to-have, not critical

## Sources

- [Toggle-Switch Guidelines - Nielsen Norman Group](https://www.nngroup.com/articles/toggle-switch-guidelines/)
- [Case study: Designing for status changes - Medium](https://medium.com/design-bootcamp/ux-design-for-status-19e8a92b2aa3)
- [Checkbox vs Toggle Switch - UXtweak](https://blog.uxtweak.com/checkbox-vs-toggle-switch/)
- [Using Swipe to Trigger Contextual Actions - NN/G](https://www.nngroup.com/articles/contextual-swipe/)
- [Snackbar: The appropriate interruption - Google Developers](https://medium.com/google-developers/snackbar-the-appropriate-interruption-ceb54d9be583)
- [Optimistic UI Patterns - Simon Hearne](https://simonhearne.com/2021/optimistic-ui-patterns/)
- [Bulk action UX guidelines - Eleken](https://www.eleken.co/blog-posts/bulk-actions-ux)
- [Switch Pattern - W3C WAI ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)
- [Status indicators - Carbon Design System](https://carbondesignsystem.com/patterns/status-indicator-pattern/)
- [Filter UX Design Patterns - Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-filtering)
