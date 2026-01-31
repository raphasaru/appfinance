# Codebase Concerns

**Analysis Date:** 2026-01-31

## Tech Debt

**Type Casting with `as any`:**
- Issue: Unsafe type casting using `as any` bypasses TypeScript safety
- Files: `src/lib/hooks/use-transactions.ts:183, 204`, `src/app/(dashboard)/historico/page.tsx:169`, `src/components/transactions/transaction-form.tsx:177`
- Impact: Runtime errors possible if category/field types change or incorrect data is passed
- Fix approach: Use proper type guards or exhaustive type mapping instead of `as any`

**Supabase `.single()` Without Error Handling in Query:**
- Issue: Multiple uses of `.single()` can throw if query returns 0 or multiple rows, but not all call sites handle errors consistently
- Files: `src/middleware.ts:70`, `src/app/(dashboard)/layout.tsx:24`, `src/app/(dashboard)/perfil/page.tsx:78`, `src/lib/hooks/*` (28+ occurrences)
- Impact: Silent failures or unhandled errors when row count doesn't match expectations
- Fix approach: Audit all `.single()` calls, use `.maybeSingle()` where appropriate, add explicit error handling or validation

**Falsy Check for Subscription ID:**
- Issue: `src/app/api/stripe/webhook/route.ts:89` casts `session.subscription` directly without null check before type assertion
- Files: `src/app/api/stripe/webhook/route.ts:89`
- Impact: TypeScript compilation succeeds but runtime errors possible if `session.subscription` is falsy
- Fix approach: Add explicit `if (!subscriptionId)` check before usage

---

## Known Bugs

**Webhook Stripe - Missing User Metadata Recovery:**
- Symptoms: User completes checkout but subscription not created if metadata is incomplete
- Files: `src/app/api/stripe/webhook/route.ts:85-115`
- Trigger: Stripe sends webhook with missing `user_id` in metadata
- Workaround: System attempts recovery via `stripe_customer_id` lookup; logs critical error for manual investigation
- Status: Partially mitigated with fallback, but edge case still exists if customer_id also missing

**Credit Card Closing Day Edge Case (Resolved):**
- Status: FIXED in recent commit - now max 28 days enforced
- Previous issue: Days 29-31 would fail in months with fewer days
- Mitigation: Form validation + validation logic updated

**WhatsApp Limit Fail-Open (Resolved):**
- Status: FIXED - fail-closed behavior now implemented
- Previous issue: When `reset_whatsapp_messages_if_needed()` RPC errored, system allowed sending beyond limit
- Current: Returns `canSend: false` on RPC error, preventing usage

---

## Security Considerations

**Webhook Secret Storage:**
- Risk: `STRIPE_WEBHOOK_SECRET` environment variable exposed if `.env.local` is committed
- Files: `.env.local` (not in repo but used everywhere), `src/app/api/stripe/webhook/route.ts:34`
- Current mitigation: Environment variable loaded from `.env.local` (local dev) and deployment platform (production)
- Recommendations:
  - Add `.env.local` to `.gitignore` (verify it is)
  - Add webhook signature verification in tests
  - Document secret rotation procedure

**Service Role Key Exposure Risk:**
- Risk: `SUPABASE_SERVICE_ROLE_KEY` used in webhook handler - if leaked, attacker can bypass RLS
- Files: `src/app/api/stripe/webhook/route.ts:13`
- Current mitigation: Only used for webhook operations where user auth impossible; fallback to anon key if service key missing
- Recommendations:
  - Rotate service role key periodically
  - Audit service role usage to minimal necessary
  - Consider separate webhook-only service role with minimal permissions

**Metadata Injection in Stripe Webhooks:**
- Risk: `session.metadata` and `subscription.metadata` not validated before use in database operations
- Files: `src/app/api/stripe/webhook/route.ts:87, 89, 141, 171`
- Current mitigation: `plan_id` defaults to 'pro' if missing; `user_id` has fallback recovery
- Recommendations:
  - Add explicit validation of metadata fields
  - Validate `planId` against `PLANS` object keys
  - Log suspicious metadata patterns

**RLS Policy Assumption:**
- Risk: All hooks assume RLS filters queries by `user_id`, but code doesn't explicitly verify
- Files: `src/lib/hooks/*` (all query operations), `src/middleware.ts`
- Impact: If RLS is disabled or misconfigured, users could see each other's data
- Recommendations:
  - Add integration tests verifying RLS is enforced
  - Document RLS policy in `.planning/` for future phases
  - Consider defensive checks in critical reads

---

## Performance Bottlenecks

**Overly Broad Query Invalidation:**
- Problem: Most mutations invalidate entire `["transactions"]` and `["summary"]` query keys instead of specific month
- Files: `src/lib/hooks/use-transactions.ts:52, 75, 98, 121, 139, 225, 250, 274` (8+ occurrences)
- Impact: All months' data refetched when single transaction updated; scales poorly with large transaction history
- Improvement path:
  - Change `queryKey: ["transactions"]` to `["transactions", monthKey]`
  - Invalidate only affected month: `["transactions", format(new Date(id.due_date), "yyyy-MM")]`
  - Test with large transaction history (100+ transactions/month)

**Stripe Customer Lookup Every Checkout:**
- Problem: `src/app/api/stripe/checkout/route.ts:39-43` queries subscriptions table for every checkout
- Files: `src/app/api/stripe/checkout/route.ts:39-43`
- Impact: Adds latency to checkout flow; scales poorly if users attempt multiple checkouts
- Improvement path:
  - Cache customer_id in session/context
  - Consider Stripe customer query if row not found (reversed lookup)
  - Benchmark current vs. cached approach

**Transaction Items Not Lazy-Loaded:**
- Problem: `useTransactionWithItems()` fetches all items even if only metadata needed
- Files: `src/lib/hooks/use-transactions.ts:281-303`
- Impact: Extra data transferred; slow for transactions with many items
- Improvement path:
  - Add optional `include_items` parameter
  - Separate hook for items-only fetches
  - Profile real usage patterns

---

## Fragile Areas

**Transaction Installment Creation (Complex Multi-Step):**
- Files: `src/lib/hooks/use-transactions.ts:158-229`, `src/components/transactions/transaction-form.tsx:216-238`
- Why fragile:
  - Creates parent transaction, then N child transactions in separate mutations
  - No atomic transaction wrapper; partial failure leaves orphaned children
  - Amount split calculation `installmentAmount / total_installments` uses floating point (precision loss)
  - `parent_transaction_id` FK not validated in form
- Safe modification:
  - Wrap in Supabase transaction function (database level)
  - Use `Math.round()` for all amount calculations
  - Add FK validation before creating children
- Test coverage: `use-transactions.test.tsx` covers happy path but not failure scenarios

**Credit Card Calculation Logic:**
- Files: `src/lib/utils/credit-card.ts`, `src/components/wallet/credit-card-form.tsx`, `src/components/wallet/credit-card-card.tsx`
- Why fragile:
  - Closing day / due day edge cases (though recently fixed for 29-31)
  - `current_bill` calculation not documented
  - Timezone handling for due dates not explicit
- Safe modification:
  - Add timezone constants or use UTC only
  - Document `current_bill` = sum of transactions with `due_date >= closing_date AND due_date < next_closing`
  - Add property tests for closing day logic across months

**WhatsApp Linking Verification Flow:**
- Files: `src/app/(dashboard)/configuracoes/whatsapp/page.tsx`, `src/lib/hooks/use-whatsapp.ts`
- Why fragile:
  - 6-character code generation not shown; presumably random but unvalidated
  - Linking state machine (linking → verified → linked) not explicit
  - Code expiration not enforced (no TTL visible)
  - No rate limiting on verification attempts
- Safe modification:
  - Add code TTL (e.g., 10 minutes) in database
  - Add rate limiting (e.g., 3 attempts per minute)
  - Log all linking/verification attempts
  - Add state enum to database (matching UI logic)

**Webhook Handler Error Recovery:**
- Files: `src/app/api/stripe/webhook/route.ts:85-115`
- Why fragile:
  - Silently returns without updating subscription if recovery fails
  - Manual investigation required (logs only)
  - No alerting mechanism for critical failures
  - Upsert behavior depends on Stripe metadata consistency
- Safe modification:
  - Implement webhook event storage table (idempotency)
  - Add proper error status codes to Stripe (vs. always 200 OK)
  - Set up monitoring/alerting for critical log messages
  - Consider dead-letter queue for unprocessable events

---

## Scaling Limits

**React Query Cache Size:**
- Current capacity: Unbounded - all queries cached in memory
- Limit: With 500+ transactions and monthly history, browser memory usage grows linearly
- Scaling path:
  - Implement cache size limits via `staleTime` / `gcTime`
  - Currently `gcTime` defaults to 5 minutes (OK for MVP)
  - Add memory monitoring in production

**Supabase Query Performance:**
- Current capacity: Free tier allows ~50k rows/month, unlimited reads on published APIs
- Limit: Dashboard queries (7+ simultaneous) will slow with 10k+ transactions
- Scaling path:
  - Add database indexes on `(user_id, due_date)` for transactions
  - Consider pagination for transaction lists
  - Use Supabase realtime selectively (not on large tables)

**Stripe Webhook Processing:**
- Current capacity: Single handler processes all events sequentially
- Limit: During high-volume signup periods, webhooks may queue in Stripe
- Scaling path:
  - Add event deduplication (idempotency keys)
  - Consider async processing (job queue)
  - Monitor webhook latency in production

---

## Dependencies at Risk

**Next.js 16.1.2 (Recent):**
- Risk: Very new version (released ~2 months ago); ecosystem may have undiscovered issues
- Impact: Breaking changes in minor versions possible
- Migration plan:
  - Monitor release notes in next major
  - Have upgrade path ready for critical bugs
  - Pin exact version in production

**Stripe SDK v20.2.0:**
- Risk: API version pinned to `2025-12-15.clover` (specific); future API changes may break
- Impact: Type mismatches if Stripe API evolves
- Migration plan:
  - Regularly update SDK version
  - Test Stripe integration in CI
  - Monitor Stripe API deprecation warnings

**React 19.2.3 (Stable but New Features Fragile):**
- Risk: Server Components and async components still evolving
- Impact: Potential issues with server-side rendering in edge cases
- Migration plan:
  - Keep eye on React 19 release notes
  - Test SSR thoroughly before major deploys
  - Consider fallback to React 18 if critical issues found

---

## Missing Critical Features

**Idempotency for Stripe Webhooks:**
- Problem: No webhook deduplication; if Stripe retries, duplicate subscriptions possible
- Blocks: Reliable multi-retry webhook handling
- Fix: Add `webhook_event_id` unique constraint to database, store event before processing

**Offline Support (PWA):**
- Problem: App requires internet for most operations; no service worker caching
- Blocks: Use on poor connections, offline transaction recording
- Fix: Implement service worker for static assets, queue transactions for sync

**Backup/Export Data:**
- Problem: No user data export or backup mechanism
- Blocks: LGPD compliance may require export capability
- Fix: Add PDF export route, scheduled email backups

**Suspicious Activity Monitoring:**
- Problem: No logging of unusual patterns (large transactions, bulk deletes, etc.)
- Blocks: Fraud detection, audit trails
- Fix: Add audit table, alert on anomalies

---

## Test Coverage Gaps

**Critical Mutations Without Tests:**
- What's not tested: `useUpdateTransaction`, `useDeleteTransaction`, `useCompleteTransaction`, batch operations
- Files: `src/lib/hooks/use-transactions.ts` (5 mutations, ~50% coverage)
- Risk: Silent failures when updating/deleting transactions
- Priority: High - these are core operations

**Stripe Webhook Integration:**
- What's not tested: Webhook signature verification, error recovery, metadata fallback
- Files: `src/app/api/stripe/webhook/route.ts` (0% test coverage)
- Risk: Payment processing failures go unnoticed
- Priority: High - financial impact

**API Routes Security:**
- What's not tested: Authentication checks, authorization, input validation
- Files: `src/app/api/stripe/*` (checkout, portal, webhook)
- Risk: Unauthorized access, data manipulation
- Priority: High - security critical

**Form Validation Edge Cases:**
- What's not tested: Invalid amounts (negative, zero), date range validation, category constraints
- Files: `src/components/transactions/transaction-form.tsx`, `src/components/wallet/credit-card-form.tsx`
- Risk: Invalid data in database
- Priority: Medium - UI prevents most cases but server validation weak

**Custom Categories CRUD:**
- What's not tested: Category creation, validation, deletion, deduplication
- Files: `src/lib/hooks/use-custom-categories.ts` (0% coverage)
- Risk: Orphaned categories, naming conflicts
- Priority: Medium

**WhatsApp Integration:**
- What's not tested: Verification code flow, linking state transitions, usage counting
- Files: `src/lib/hooks/use-whatsapp.ts`, `src/app/(dashboard)/configuracoes/whatsapp/page.tsx` (0% coverage)
- Risk: Silent linking failures, uncounted messages
- Priority: Medium

**Error Handling in Components:**
- What's not tested: Error boundaries, fallback UIs, toast notifications
- Files: `src/app/error.tsx`, various error boundaries
- Risk: Bad UX on errors, confusing messages
- Priority: Low - not critical but improves user experience

---

## Code Quality Issues

**Inconsistent Error Messages:**
- Pattern: Some errors in Portuguese (`src/lib/errors.ts`), some in English (API responses)
- Files: `src/app/api/stripe/checkout/route.ts:24, 33, 102`, `src/lib/hooks/use-whatsapp.ts:47, 105, 140`
- Fix: Consolidate all errors in `src/lib/errors.ts` with Portuguese + English keys

**Hardcoded URLs:**
- Pattern: App URL hardcoded in multiple places
- Files: `src/lib/utils/check-limits.ts:94`, `src/app/api/stripe/checkout/route.ts:68`
- Fix: Create `src/lib/config.ts` with `APP_URL` constant

**Magic Numbers Without Constants:**
- Pattern: `30` (WhatsApp limit), `48` (installment max), `28` (max day), `19.90` (price)
- Files: Scattered across `plans.ts`, `check-limits.ts`, `transaction-form.tsx`
- Fix: Consolidate into `src/lib/constants.ts`

**Unused Imports:**
- Pattern: Likely unused imports from deleted `investments` feature
- Files: Need full scan, but check all pages for dead imports
- Fix: Run `npx eslint --fix` or enable unused import detection

---

## Database Schema Issues

**Missing Indexes:**
- Current: `transactions.user_id` probably has index, but `(user_id, due_date)` composite missing
- Impact: Dashboard queries with date filters slow
- Fix: Add index: `CREATE INDEX ON transactions(user_id, due_date)`

**Soft Delete Not Implemented:**
- Current: Deletes are hard (CASCADE)
- Impact: No audit trail, can't recover accidental deletes
- Fix: Consider soft delete columns (`deleted_at`) for critical tables

**No Data Validation at DB Level:**
- Current: All validation happens in app layer
- Impact: Corrupt data possible from direct database access or bugs
- Fix: Add CHECK constraints, triggers for critical logic

---

## Configuration & Deployment Concerns

**Environment Variable Validation Missing:**
- Risk: App starts even if required env vars are missing; fails at first API call
- Files: `src/lib/stripe/client.ts:7` has good check, but others don't
- Fix: Add validation function that runs at app startup

**Stripe API Version Hardcoded:**
- Risk: If Stripe deprecates `2025-12-15.clover`, update required everywhere
- Files: `src/lib/stripe/client.ts:11`
- Fix: Move to environment variable or config

**No Feature Flags:**
- Risk: Rolling back broken features requires code change + redeploy
- Impact: MVP is fine, but will need as features increase
- Fix: Consider Supabase feature flags table or environment-based toggles

---

*Concerns audit: 2026-01-31*
