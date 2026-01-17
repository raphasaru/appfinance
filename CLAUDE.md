# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meu Bolso** - A PWA for personal financial management built with Next.js 15 and Supabase.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Language**: Portuguese (pt-BR)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login and signup pages
│   ├── (dashboard)/      # Main app pages (protected)
│   │   ├── dashboard/    # Main overview
│   │   ├── transacoes/   # Transaction list
│   │   ├── historico/    # Charts and history
│   │   ├── investimentos/ # Investment portfolio
│   │   └── recorrentes/  # Recurring templates
│   └── auth/callback/    # Supabase auth callback
├── components/
│   ├── ui/               # Shadcn base components
│   ├── layout/           # Header, BottomNav
│   ├── dashboard/        # SummaryCard, MonthSelector
│   └── transactions/     # TransactionCard, TransactionForm
└── lib/
    ├── supabase/         # Supabase client (client.ts, server.ts)
    ├── hooks/            # React Query hooks
    ├── utils/            # Currency, categories helpers
    └── database.types.ts # Generated Supabase types
```

## Database Schema

- `profiles` - User profiles (extends auth.users)
- `transactions` - Income/expense records with status (planned/completed)
- `recurring_templates` - Monthly recurring transaction templates
- `financial_goals` - Monthly savings goals and debt tracking
- `investments` - Investment portfolio
- `investment_history` - Price history for investments

## Key Patterns

### Currency Formatting
Use `formatCurrency()` from `@/lib/utils/currency` for BRL formatting.
Use `.currency` CSS class for tabular number display.

### Supabase Queries
- Client-side: `createClient()` from `@/lib/supabase/client`
- Server-side: `createClient()` from `@/lib/supabase/server`
- All tables have RLS enabled - queries automatically filter by authenticated user

### Transaction Status
- `planned` - Expected transaction (not yet completed)
- `completed` - Transaction has occurred

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Mobile-First Design

- Bottom navigation on mobile (`md:hidden`)
- Sheets for forms instead of modals
- Safe area padding for notched devices
- Touch-friendly tap targets (min 44px)
