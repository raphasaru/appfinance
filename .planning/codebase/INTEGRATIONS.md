# External Integrations

**Analysis Date:** 2026-01-31

## APIs & External Services

**Payment Processing:**
- Stripe - Subscription billing, checkout sessions, customer management
  - SDK/Client: `stripe` v20.2.0 (Node.js SDK)
  - Auth: `STRIPE_SECRET_KEY` (server-side), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client-side)
  - Webhook Secret: `STRIPE_WEBHOOK_SECRET`
  - API Version: `2025-12-15.clover`

**WhatsApp Integration:**
- External WhatsApp microservice (`whatsapp-service/` separate project)
  - Purpose: AI-powered transaction logging via WhatsApp messages (text, audio, image)
  - Linking flow: User gets 6-character verification code, sends to bot, service validates and links `whatsapp_lid`
  - Usage tracking: Messages counted and limited per subscription plan

## Data Storage

**Databases:**
- PostgreSQL via Supabase
  - Provider: Supabase Cloud
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`
  - Client: `@supabase/supabase-js` v2.90.1
  - Auth: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client-side), `SUPABASE_SERVICE_ROLE_KEY` (server-side)
  - Features: Row-Level Security (RLS), PostgREST API, JWT auth

**File Storage:**
- Local filesystem only (no cloud storage configured)

**Caching:**
- TanStack React Query v5.90.17 (in-memory client-side caching)
- Cache strategies configured per query (staleTime, gcTime, retry logic)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built on PostgreSQL)
  - Implementation: OAuth2 via Supabase + cookie-based sessions
  - Flow: Email/password signup → Supabase handles user creation → Auth callback → Session cookies
  - Auth Callback Route: `src/app/auth/callback/route.ts` - handles OAuth2 code exchange
  - Session Management: Middleware (`src/middleware.ts`) validates user for protected routes
  - RLS: All database tables enforce authentication via `auth.uid()`

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, Datadog, or similar integration)

**Logs:**
- Console logging only (via `console.error()`, `console.log()`)
- No centralized logging service configured

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js framework and `NEXT_PUBLIC_APP_URL` configuration)

**CI Pipeline:**
- Not detected (no GitHub Actions, GitLab CI, or similar in repo)

## Environment Configuration

**Required env vars (from `.env.example`):**

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=https://fin.prizely.com.br
```

**Secrets location:**
- `.env.local` (local development, git-ignored)
- Vercel environment variables (production)

## API Routes

**Stripe Integration Endpoints:**

All located in `src/app/api/stripe/`:

- `POST /api/stripe/checkout` (`src/app/api/stripe/checkout/route.ts`)
  - Purpose: Create Stripe checkout session for plan upgrade
  - Auth: Requires authenticated user (Supabase session)
  - Payload: `{ planId: 'pro' | 'pro_annual' }`
  - Response: `{ url: string }` (Stripe checkout URL)
  - Creates/retrieves Stripe customer, generates session with metadata

- `POST /api/stripe/portal` (`src/app/api/stripe/portal/route.ts`)
  - Purpose: Redirect to Stripe billing portal for subscription management
  - Auth: Requires authenticated user
  - Response: `{ url: string }` (Stripe portal URL)
  - Requires existing Stripe customer ID in database

- `POST /api/stripe/webhook` (`src/app/api/stripe/webhook/route.ts`)
  - Purpose: Handle Stripe webhook events
  - Auth: Validates via Stripe signature verification
  - Webhook Secret: `STRIPE_WEBHOOK_SECRET`
  - Handled Events:
    - `checkout.session.completed` - Activates subscription, stores Stripe IDs in database
    - `customer.subscription.created/updated` - Updates subscription status and plan
    - `customer.subscription.deleted` - Downgrades to free plan, marks as canceled
    - `invoice.payment_failed` - Updates subscription status to `past_due`
  - Database: Uses service role client (unauthenticated webhook context)
  - Metadata Recovery: Attempts to recover `user_id` via `stripe_customer_id` if missing

**Authentication Routes:**

- `GET /auth/callback` (`src/app/auth/callback/route.ts`)
  - Purpose: OAuth2 code exchange callback
  - Query params: `code` (auth code), `next` (redirect path)
  - Exchanges auth code for session via Supabase
  - Redirects to dashboard or login on failure

## Webhooks & Callbacks

**Incoming:**
- Stripe webhooks → `POST /api/stripe/webhook`
  - Subscriptions, payments, invoices

**Outgoing:**
- None configured (app does not initiate webhooks to external services)

## Data Flow: Stripe Subscription Lifecycle

1. **User initiates upgrade** → Click "Upgrade" button
2. **Checkout session created** → `POST /api/stripe/checkout` creates Stripe session
3. **User redirected to Stripe** → Enters payment details
4. **Payment processed** → Stripe fires `checkout.session.completed` webhook
5. **Webhook handler** → `POST /api/stripe/webhook` upserts subscription in database
6. **Subscription active** → User can access premium features based on `plan` field
7. **Subscription management** → User visits `POST /api/stripe/portal` to change/cancel

## Subscription Plans

| Plan | Price | WhatsApp Limit | Stripe Price ID |
|------|-------|----------------|-----------------|
| Free (default) | R$ 0 | 30 msgs/month | N/A |
| Pro (monthly) | R$ 19,90 | Unlimited | `STRIPE_PRO_MONTHLY_PRICE_ID` |
| Pro (annual) | R$ 179,90 | Unlimited | `STRIPE_PRO_ANNUAL_PRICE_ID` |

See `src/lib/stripe/plans.ts` for plan definitions and helper functions.

## Database Tables with RLS

All tables in `src/lib/database.types.ts` (auto-generated from Supabase schema):

Core tables:
- `profiles` - User profiles (extends auth.users)
- `transactions` - Income/expense records
- `investments` - Investment portfolio
- `investment_history` - Price history
- `bank_accounts` - Bank account data
- `credit_cards` - Credit card data
- `category_budgets` - Monthly budget per category
- `subscriptions` - Stripe subscription tracking + WhatsApp usage
- `user_whatsapp_links` - WhatsApp linking + verification
- `financial_goals` - Savings goals and debt tracking
- `recurring_templates` - Monthly recurring transaction templates

RPC Functions:
- `increment_whatsapp_message(p_user_id)` - Increment WhatsApp counter, check limits
- `reset_whatsapp_messages_if_needed(p_user_id)` - Reset counter at month start

## Client-Side Integrations

**React Query Hooks** (in `src/lib/hooks/`):
All hooks use TanStack React Query for server state management:
- `useTransactions(month)` - CRUD transactions, filter by month
- `useMonthlySummary(month)` - Monthly income/expenses
- `useSubscription()` - Subscription status and WhatsApp usage
- `useBankAccounts()` - Bank account CRUD
- `useCreditCards()` - Credit card CRUD
- `useCategoryBudgets()` - Budget CRUD
- `useWhatsAppLink()` - WhatsApp linking status
- And others (see `src/lib/hooks/` directory)

---

*Integration audit: 2026-01-31*
