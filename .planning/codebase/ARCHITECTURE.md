# Architecture

**Analysis Date:** 2026-01-31

## Pattern Overview

**Overall:** Full-stack React + Node.js with server-side data layer and client-side reactive UI. Next.js App Router with middleware-based auth, Supabase for database/auth, TanStack Query for client-side state, Stripe for payments.

**Key Characteristics:**
- **Server-first**: Middleware validates auth on every request, layouts fetch data server-side
- **Reactive data**: TanStack Query caches and syncs server state with 60s stale time
- **User-scoped**: Supabase RLS auto-filters all queries by authenticated user
- **Mobile-first**: Responsive layout (sidebar desktop, bottom nav mobile) with safe area support
- **Modular form**: Zod + React Hook Form for validation, sheet/dialog containers
- **Event-driven**: Stripe webhooks trigger subscription updates, error toasts for user feedback

## Layers

**Middleware & Auth:**
- Purpose: Protect routes, enforce onboarding, manage session
- Location: `src/middleware.ts`
- Contains: Route protection logic, onboarding status check
- Depends on: Supabase auth, cookies
- Used by: All routes (executed on every request)

**App Router (Pages & API):**
- Purpose: Define routes and endpoints
- Location: `src/app/`
- Contains: Page components, API route handlers, nested layouts
- Depends on: Supabase clients, hooks, components
- Used by: Browser, external services (Stripe webhooks)

**UI Components:**
- Purpose: Reusable presentation layer
- Location: `src/components/` (ui/, dashboard/, layout/, forms)
- Contains: Shadcn base UI, feature-specific components, layout shells
- Depends on: Lucide icons, Recharts (charts), Tailwind CSS
- Used by: Page components and feature components

**React Query Hooks:**
- Purpose: Data fetching, caching, mutation
- Location: `src/lib/hooks/`
- Contains: Query definitions, mutation handlers, query invalidation
- Depends on: Supabase client, TanStack Query
- Used by: Pages and form components

**Supabase Clients:**
- Purpose: Database and auth access
- Location: `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (SSR)
- Contains: Supabase SDK initialization, cookie management, type definitions
- Depends on: @supabase/ssr, @supabase/supabase-js
- Used by: Hooks, middleware, API routes, server layouts

**Utilities & Helpers:**
- Purpose: Formatting, validation, business logic
- Location: `src/lib/utils/`
- Contains: Currency formatting, category labels, payment method configs, credit card installment logic
- Depends on: date-fns, Zod
- Used by: Components, hooks, forms

**Error Handling:**
- Purpose: Centralized error messages and custom error types
- Location: `src/lib/errors.ts`
- Contains: ErrorMessages constant, AppError class, getErrorMessage() helper
- Depends on: None
- Used by: Hooks, components, API routes

## Data Flow

**Transaction Flow (Read):**

1. Page component mounts (e.g., `/dashboard`)
2. useTransactions(currentMonth) triggers query
3. TanStack Query checks cache (60s stale time)
4. Supabase client calls `.select()` → RLS filters by user_id
5. Data cached in memory, component re-renders
6. User navigates month → new query key, fresh data fetched
7. On stale → automatic refetch in background

**Transaction Flow (Create):**

1. TransactionForm opens, user submits
2. useCreateTransaction() mutation invoked with form data
3. Supabase retrieves authenticated user ID
4. Transaction inserted with user_id (RLS enforced)
5. Mutation succeeds → queryClient.invalidateQueries()
6. All "transactions" queries marked stale
7. Components auto-refetch stale queries
8. UI updates with new data

**Installment Transaction Flow:**

1. Credit card transaction with installments=N
2. useCreateInstallmentTransaction() calculates due dates per billing cycle
3. Parent transaction created first (installment_number=1)
4. Child transactions created in batch (installment_number=2..N, parent_transaction_id set)
5. All cached transaction queries invalidated
6. UI shows all N installments in transaction list

**Stripe Webhook Flow:**

1. Stripe event sent to `/api/stripe/webhook`
2. Signature verified with STRIPE_WEBHOOK_SECRET
3. Event type matched (checkout.session.completed, subscription.updated, etc.)
4. Handler queries Supabase for user_id (by stripe_customer_id if needed)
5. Subscription record upserted (plan, status, current_period_end)
6. Client later fetches useSubscription() → updates billing UI

**Onboarding Flow:**

1. Middleware checks profile.onboarding_completed = false
2. Redirects to `/onboarding` before any protected route
3. OnboardingPage checks useProfile() state
4. OnboardingWizard steps through categories, accounts, goals
5. Final step calls useCompleteOnboarding() → sets flag true
6. Middleware allows access to dashboard

## State Management

**Server State (Database):**
- Source of truth: Supabase PostgreSQL tables
- RLS ensures user isolation
- Queries invalidated on mutations to trigger refetch

**Client Cache (TanStack Query):**
- Stale time: 60 seconds
- Window focus refetch: disabled (refetchOnWindowFocus: false)
- Query keys: `["transactions", date]`, `["summary", date]`, `["profile"]`, etc.
- Invalidation triggers full refetch

**Local Component State:**
- UI-only state: `useState()` for form open/close, month selector, filters
- Never persisted to server unless form submission

**URL State:**
- Month selector: passed via component state (not persisted to URL)
- Filters: status filter, account/card filters (component state)

## Key Abstractions

**Transaction:**
- Purpose: Core financial record (income/expense)
- Files: `src/lib/hooks/use-transactions.ts`, schema in `src/lib/database.types.ts`
- Pattern: Type from Supabase generated types, status field tracks planned vs completed
- Special case: Installment transactions use parent_transaction_id for hierarchy

**Subscription:**
- Purpose: Stripe plan + usage tracking (WhatsApp messages)
- Files: `src/lib/hooks/use-subscription.ts`, webhook handler `src/app/api/stripe/webhook/route.ts`
- Pattern: Synced from Stripe events, upserted by webhook, read by client hooks
- Plan types: 'free' (30 WhatsApp msgs/mo), 'pro', 'pro_annual' (unlimited)

**Profile:**
- Purpose: User metadata (name, onboarding status)
- Files: `src/lib/hooks/use-profile.ts`
- Pattern: Extends auth.users table via RLS, one record per user
- Onboarding: tracked by onboarding_completed flag and onboarding_step number

**Category Budget:**
- Purpose: Monthly spending limits per expense category
- Files: `src/lib/hooks/use-category-budgets.ts`
- Pattern: One budget per category per month, created/updated from UI

**Bank Account & Credit Card:**
- Purpose: Payment method tracking
- Files: `src/lib/hooks/use-bank-accounts.ts`, `src/lib/hooks/use-credit-cards.ts`
- Pattern: Credit cards track current_bill and limit, used in transaction payment_method field

## Entry Points

**Root Entry (Landing Page):**
- Location: `src/app/page.tsx`
- Triggers: Browser navigates to /
- Responsibilities: Renders landing page (Header, Hero, Features, Pricing, Footer)
- Redirect logic: Middleware handles authenticated user → /dashboard

**Dashboard:**
- Location: `src/app/(dashboard)/dashboard/page.tsx`
- Triggers: Authenticated user navigates to /dashboard
- Responsibilities: Main overview (hero balance, transactions, quick actions)
- Data: useTransactions(), useMonthlySummary() hooks
- Mobile layout: Month selector, tabs (all/pending/completed), FAB for add
- Desktop layout: Summary cards, transactions list by status

**Auth Routes:**
- Location: `src/app/(auth)/login/page.tsx`, `cadastro/`, `esqueci-senha/`, `redefinir-senha/`
- Triggers: Unauthenticated user or signup flow
- Responsibilities: Form submission to Supabase auth
- Redirect: On success → /onboarding if first time, /dashboard otherwise

**Onboarding:**
- Location: `src/app/(dashboard)/onboarding/page.tsx` and `src/components/onboarding/`
- Triggers: profile.onboarding_completed = false (enforced by middleware)
- Responsibilities: Multi-step wizard (categories, accounts, goals, WhatsApp)
- State: onboarding_step field in profile, tracks progress

**Protected Routes (Dashboard):**
- Layout: `src/app/(dashboard)/layout.tsx` wraps all routes
- Provides: Sidebar/bottom-nav, QueryProvider, server-side auth check
- Routes: /transacoes, /carteira, /orcamento, /relatorios, /historico, /perfil, /configuracoes/*

**API Webhooks:**
- Location: `src/app/api/stripe/webhook/route.ts`
- Triggers: Stripe sends POST request with signature
- Responsibilities: Verify signature, upsert subscription records, handle events
- Events handled: checkout.session.completed, customer.subscription.created/updated/deleted, invoice.payment_failed

## Error Handling

**Strategy:** Try-catch with typed error messages, toast notifications on client

**Patterns:**

```typescript
// Hooks throw errors, caller decides notification
try {
  const data = await supabase.from(...).select()
  if (error) throw error
  return data
} catch (err) {
  console.error(err)
  throw err
}

// Component catches and displays toast
const mutation = useMutation({
  mutationFn: async (input) => { ... },
  onError: (error) => {
    const msg = getErrorMessage(error)
    toast.error(msg)
  }
})

// AppError for custom messages
export class AppError extends Error {
  constructor(public key: ErrorMessageKey, public originalError?: unknown) { ... }
}
```

Errors logged to console (development) and browser console (production), user sees friendly Portuguese messages via toast.

## Cross-Cutting Concerns

**Logging:**
- Server-side: console.log/error in middleware, API routes, hooks (dev logging only)
- Client-side: console errors from Supabase, TanStack Query, form validation
- Production: Browser DevTools console (no centralized logging configured)

**Validation:**
- Form: Zod schemas in components, React Hook Form integration
- Database: RLS policies, foreign key constraints
- API: Stripe signature verification in webhook handler

**Authentication:**
- Entry point: Supabase auth (email/password)
- Session: Cookie-based (Supabase SSR middleware)
- User identity: auth.users table, synced to profiles table
- RLS: All table queries auto-filter by auth.uid()
- Token refresh: Middleware handles via cookie management

**Permissions/Authorization:**
- Based on subscription plan (free vs pro)
- WhatsApp usage limit enforced per plan
- No role-based access control (single user per account)

**Responsive Design:**
- Breakpoint: md: 768px (Tailwind)
- Desktop: Sidebar (fixed, 256px), main content (md:pl-64)
- Mobile: Bottom nav (fixed, 64px), main content (pb-20)
- Safe area: `safe-bottom` class on bottom nav for notched devices
