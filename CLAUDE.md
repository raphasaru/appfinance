# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meu Bolso** - A PWA for personal financial management built with Next.js 15 and Supabase. The app helps users track income/expenses, manage budgets, investments, and integrates with WhatsApp for quick transaction logging via AI.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Payments**: Stripe (subscriptions)
- **WhatsApp**: External microservice (`whatsapp-service/`)
- **Language**: Portuguese (pt-BR)

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm start            # Start production server
npx tsc --noEmit     # Type check
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/                    # Auth pages (login, signup, password reset)
│   ├── (dashboard)/               # Protected app pages
│   │   ├── dashboard/             # Main overview
│   │   ├── transacoes/            # Transaction list
│   │   ├── historico/             # Charts and history
│   │   ├── investimentos/         # Investment portfolio
│   │   ├── recorrentes/           # Recurring templates
│   │   ├── carteira/              # Bank accounts & credit cards
│   │   ├── orcamento/             # Budget management
│   │   ├── relatorios/            # Reports
│   │   ├── perfil/                # User profile
│   │   └── configuracoes/         # Settings
│   │       ├── assinatura/        # Subscription management
│   │       └── whatsapp/          # WhatsApp linking
│   ├── api/
│   │   └── stripe/                # Stripe API routes
│   │       ├── checkout/          # Create checkout session
│   │       ├── portal/            # Customer portal
│   │       └── webhook/           # Stripe webhooks
│   ├── auth/callback/             # Supabase auth callback
│   └── pricing/                   # Public pricing page
├── components/
│   ├── ui/                        # Shadcn base components
│   ├── layout/                    # Header, Sidebar, BottomNav
│   ├── dashboard/                 # SummaryCards, MonthSelector, TransactionsList
│   ├── transactions/              # TransactionCard, TransactionForm
│   ├── wallet/                    # BankAccountCard, CreditCardCard
│   ├── budget/                    # BudgetEditSheet
│   ├── reports/                   # CategoryBudgetCard
│   ├── subscription/              # BillingSettings, PlanBadge, UsageMeter
│   ├── pricing/                   # PricingCard, PricingTable, UpgradeModal
│   └── providers/                 # QueryProvider
└── lib/
    ├── supabase/                  # Supabase clients (client.ts, server.ts)
    ├── stripe/                    # Stripe config (client.ts, plans.ts)
    ├── hooks/                     # React Query hooks
    ├── utils/                     # Currency, categories, check-limits
    └── database.types.ts          # Generated Supabase types
```

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends auth.users) |
| `transactions` | Income/expense records with status (planned/completed) |
| `recurring_templates` | Monthly recurring transaction templates |
| `investments` | Investment portfolio (stocks, funds, crypto) |
| `investment_history` | Price history for investments |
| `bank_accounts` | Bank accounts with balance |
| `credit_cards` | Credit cards with limit and current bill |
| `category_budgets` | Monthly budget per expense category |
| `subscriptions` | Stripe subscription data + WhatsApp usage |
| `user_whatsapp_links` | WhatsApp number linking with verification |
| `financial_goals` | Monthly savings goals and debt tracking |

### Enums

```typescript
expense_category:
  | "fixed_housing"        // Moradia fixa
  | "fixed_utilities"      // Contas fixas
  | "fixed_subscriptions"  // Assinaturas
  | "fixed_personal"       // Pessoal fixo
  | "fixed_taxes"          // Impostos
  | "variable_credit"      // Cartão de crédito
  | "variable_food"        // Alimentação
  | "variable_transport"   // Transporte
  | "variable_other"       // Outros variáveis

transaction_status: "planned" | "completed"
transaction_type: "income" | "expense"
```

### RPC Functions

- `increment_whatsapp_message(p_user_id)` - Increment WhatsApp message counter, check limits
- `reset_whatsapp_messages_if_needed(p_user_id)` - Reset counter at month start

## React Query Hooks

All hooks use TanStack Query for caching and are located in `src/lib/hooks/`.

| Hook | Purpose |
|------|---------|
| `useTransactions(month)` | CRUD for transactions, filter by month |
| `useMonthlySummary(month)` | Monthly summary (income, expenses, balance) |
| `useInvestments()` | CRUD for investments |
| `useRecurringTemplates()` | CRUD for recurring templates, generate monthly |
| `useBankAccounts()` | CRUD for bank accounts |
| `useCreditCards()` | CRUD for credit cards |
| `useCategoryBudgets()` | CRUD for category budgets |
| `useCategorySpending(month)` | Spending breakdown by category |
| `useMonthlyHistory(months)` | Historical data for charts |
| `useSubscription()` | Subscription status and WhatsApp usage |
| `useWhatsAppLink()` | WhatsApp linking status and verification |
| `useMediaQuery(query)` | Responsive breakpoint detection |

## Stripe Integration

### Plans

| Plan | Price | WhatsApp Limit |
|------|-------|----------------|
| Free | R$ 0 | 30 msgs/month |
| Pro | R$ 19,90/month | Unlimited |
| Pro Annual | R$ 179,90/year | Unlimited |

### API Routes

- `POST /api/stripe/checkout` - Create checkout session for plan upgrade
- `POST /api/stripe/portal` - Redirect to Stripe customer portal
- `POST /api/stripe/webhook` - Handle Stripe events (checkout.session.completed, customer.subscription.updated, etc.)

### Key Files

- `lib/stripe/client.ts` - Stripe SDK initialization
- `lib/stripe/plans.ts` - Plan definitions, pricing, limits
- `lib/utils/check-limits.ts` - Check if user can use WhatsApp

## WhatsApp Integration

The WhatsApp integration runs as a separate microservice in `whatsapp-service/`. It allows users to log transactions via text, audio, or image messages.

### Linking Flow

1. User goes to Settings > WhatsApp in the app
2. Enters phone number and clicks "Vincular"
3. App generates 6-character verification code (stored in `user_whatsapp_links`)
4. User sends code to WhatsApp bot
5. Service validates code and links `whatsapp_lid` to user

### Usage Limits

- Tracked in `subscriptions.whatsapp_messages_used`
- Reset monthly via `subscriptions.whatsapp_messages_reset_at`
- Free plan: 30 messages/month
- Pro plans: Unlimited

## Key Patterns

### Currency Formatting

```typescript
import { formatCurrency } from '@/lib/utils/currency'

formatCurrency(1234.56) // "R$ 1.234,56"
```

Use `.currency` CSS class for tabular number display.

### Supabase Queries

```typescript
// Client-side
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server-side (API routes, Server Components)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

All tables have RLS enabled - queries automatically filter by authenticated user.

### Transaction Status

- `planned` - Expected transaction (not yet completed)
- `completed` - Transaction has occurred

### Category Mapping

Use `getCategoryLabel(category)` and `getCategoryIcon(category)` from `@/lib/utils/categories` for display.

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=https://meubolso.app
```

## Mobile-First Design

- Bottom navigation on mobile (`md:hidden`), sidebar on desktop
- Sheets for forms instead of modals on mobile
- Safe area padding for notched devices
- Touch-friendly tap targets (min 44px)
- Responsive components using `useMediaQuery`

## Related Projects

- `whatsapp-service/` - WhatsApp integration microservice (see its own CLAUDE.md)
