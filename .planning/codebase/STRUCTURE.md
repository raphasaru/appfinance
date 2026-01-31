# Codebase Structure

**Analysis Date:** 2026-01-31

## Directory Layout

```
src/
├── app/                              # Next.js App Router pages & API
│   ├── (auth)/                       # Auth pages (group, not in URL)
│   │   ├── login/page.tsx            # Login form
│   │   ├── cadastro/page.tsx         # Signup form
│   │   ├── esqueci-senha/page.tsx    # Password reset request
│   │   └── redefinir-senha/page.tsx  # Password reset form
│   ├── (dashboard)/                  # Protected app pages (group)
│   │   ├── layout.tsx                # Sidebar + bottom nav + QueryProvider
│   │   ├── dashboard/page.tsx        # Main overview
│   │   ├── transacoes/page.tsx       # Transaction list & management
│   │   ├── carteira/page.tsx         # Bank accounts & credit cards
│   │   ├── orcamento/page.tsx        # Budget management by category
│   │   ├── relatorios/page.tsx       # Reports & analytics
│   │   ├── historico/page.tsx        # Historical data & charts
│   │   ├── recorrentes/page.tsx      # Recurring transaction templates
│   │   ├── perfil/page.tsx           # User profile settings
│   │   ├── configuracoes/            # Settings
│   │   │   ├── assinatura/page.tsx   # Subscription & billing
│   │   │   ├── categorias/page.tsx   # Custom category management
│   │   │   ├── whatsapp/page.tsx     # WhatsApp linking
│   │   │   └── layout.tsx            # Settings sub-layout
│   │   └── onboarding/page.tsx       # Multi-step onboarding wizard
│   ├── (public)/                     # Public pages (group, not in URL)
│   │   ├── privacidade/page.tsx      # Privacy policy
│   │   └── termos/page.tsx           # Terms of service
│   ├── api/                          # API routes
│   │   └── stripe/                   # Stripe integration
│   │       ├── checkout/route.ts     # Create checkout session
│   │       ├── portal/route.ts       # Redirect to customer portal
│   │       └── webhook/route.ts      # Process Stripe events
│   ├── auth/                         # Supabase auth callback
│   │   └── callback/route.ts         # Handle auth redirect
│   ├── pricing/page.tsx              # Public pricing page
│   ├── layout.tsx                    # Root layout (fonts, Toaster, PWA)
│   ├── page.tsx                      # Landing page (/)
│   ├── error.tsx                     # Global error boundary
│   └── not-found.tsx                 # 404 page
├── components/                       # Reusable React components
│   ├── ui/                           # Shadcn base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── sheet.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── label.tsx
│   │   ├── checkbox.tsx
│   │   ├── switch.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── separator.tsx
│   │   ├── avatar.tsx
│   │   ├── collapsible.tsx
│   │   ├── form.tsx
│   │   └── sonner.tsx                # Toast notifications
│   ├── layout/                       # App shell components
│   │   ├── sidebar.tsx               # Desktop navigation sidebar
│   │   ├── bottom-nav.tsx            # Mobile bottom navigation
│   │   └── header.tsx                # Mobile header
│   ├── dashboard/                    # Dashboard-specific components
│   │   ├── page-header.tsx           # Title + month selector + actions
│   │   ├── month-selector.tsx        # Month picker control
│   │   ├── hero-balance-card.tsx     # Large balance display
│   │   ├── summary-cards.tsx         # Income/expense overview (desktop)
│   │   ├── summary-card.tsx          # Single summary card
│   │   ├── transactions-list.tsx     # Pending & completed sections
│   │   └── quick-actions.tsx         # Shortcuts to common actions
│   ├── transactions/                 # Transaction list & forms
│   │   ├── transaction-card.tsx      # Single transaction display
│   │   └── transaction-form.tsx      # Add/edit transaction form
│   ├── wallet/                       # Bank & credit card components
│   │   ├── bank-account-card.tsx     # Account display
│   │   ├── bank-account-form.tsx     # Add/edit account form
│   │   ├── credit-card-card.tsx      # Card display
│   │   └── credit-card-form.tsx      # Add/edit card form
│   ├── budget/                       # Budget management
│   │   └── budget-edit-sheet.tsx     # Inline budget editor
│   ├── reports/                      # Analytics components
│   │   └── category-budget-card.tsx  # Category spending vs budget
│   ├── subscription/                 # Billing & plan components
│   │   ├── billing-settings.tsx      # Subscription management UI
│   │   ├── plan-badge.tsx            # Current plan indicator
│   │   └── usage-meter.tsx           # WhatsApp message usage bar
│   ├── pricing/                      # Pricing page components
│   │   ├── pricing-card.tsx          # Single plan card
│   │   ├── pricing-table.tsx         # Plans comparison
│   │   └── upgrade-modal.tsx         # Upgrade confirmation
│   ├── landing/                      # Landing page sections
│   │   ├── header.tsx                # Nav + CTA
│   │   ├── hero.tsx                  # Main headline section
│   │   ├── features.tsx              # Feature cards
│   │   ├── how-it-works.tsx          # Steps section
│   │   ├── pricing-section.tsx       # Pricing cards
│   │   ├── cta-final.tsx             # Final CTA
│   │   └── footer.tsx                # Footer with links
│   ├── onboarding/                   # Onboarding wizard steps
│   │   ├── onboarding-wizard.tsx     # Main wizard container
│   │   ├── category-step.tsx         # Category setup
│   │   ├── account-step.tsx          # Bank account setup
│   │   ├── whatsapp-step.tsx         # WhatsApp linking
│   │   └── [other steps]
│   └── providers/                    # Context/provider wrappers
│       └── query-provider.tsx        # TanStack Query setup
├── lib/                              # Business logic & utilities
│   ├── supabase/                     # Database clients
│   │   ├── client.ts                 # Browser client (createBrowserClient)
│   │   └── server.ts                 # Server client (createServerClient)
│   ├── stripe/                       # Payment configuration
│   │   ├── client.ts                 # Stripe SDK initialization
│   │   └── plans.ts                  # Plan definitions & helpers
│   ├── hooks/                        # React Query hooks (TanStack Query)
│   │   ├── use-transactions.ts       # CRUD + batch operations
│   │   ├── use-summary.ts            # Monthly/period summary calculations
│   │   ├── use-profile.ts            # User profile & onboarding
│   │   ├── use-bank-accounts.ts      # Bank account CRUD
│   │   ├── use-credit-cards.ts       # Credit card CRUD
│   │   ├── use-category-budgets.ts   # Budget CRUD
│   │   ├── use-recurring.ts          # Recurring template CRUD
│   │   ├── use-custom-categories.ts  # Custom category CRUD
│   │   ├── use-subscription.ts       # Subscription & usage tracking
│   │   ├── use-whatsapp.ts           # WhatsApp linking status
│   │   ├── use-history.ts            # Historical data for charts
│   │   ├── use-transaction-items.ts  # Transaction sub-items (optional)
│   │   └── use-media-query.ts        # Responsive breakpoint detection
│   ├── utils/                        # Helper functions & constants
│   │   ├── currency.ts               # formatCurrency(), parseCurrency()
│   │   ├── categories.ts             # Category labels, icons, helpers
│   │   ├── payment-methods.ts        # Payment method config
│   │   ├── credit-card.ts            # Installment date calculations
│   │   ├── check-limits.ts           # WhatsApp limit checking
│   │   └── cn.ts                     # classnames utility (clsx/cn)
│   ├── database.types.ts             # Supabase auto-generated types
│   └── errors.ts                     # Error messages & AppError class
├── __tests__/                        # Test files
│   ├── components/                   # Component tests
│   ├── hooks/                        # Hook tests
│   ├── utils/                        # Utility tests
│   └── mocks/                        # Mock data & providers
└── middleware.ts                     # Request-level auth & routing

globals.css, tailwind.config.ts, tsconfig.json (in root)
```

## Directory Purposes

**src/app:**
Next.js App Router pages and API routes. Organized in route groups `(auth)`, `(dashboard)`, `(public)` for semantic grouping. Each folder = URL segment.

**src/app/(auth):**
Authentication flows: login, signup, password reset. No layout wrapper. Middleware redirects authenticated users to /dashboard.

**src/app/(dashboard):**
Protected app area. Layout wraps all with Sidebar/BottomNav and QueryProvider. Middleware enforces auth + onboarding completion.

**src/app/api/stripe:**
Webhook receiver for Stripe events. POST /api/stripe/webhook processes subscription updates, checkout completions, payment failures.

**src/components:**
Reusable UI components. Organized by domain (dashboard, transactions, wallet, etc.). Shadcn components in `ui/` (copy-paste, not npm).

**src/lib/hooks:**
React Query hooks for all data operations. One file per domain (transactions, accounts, etc.). Encapsulate Supabase queries + mutations + invalidation logic.

**src/lib/utils:**
Pure functions and constants. No React. Currency formatting, category mappings, validation helpers, date calculations.

**src/lib/supabase:**
Clients for browser and server contexts. Manages authentication, cookies, type safety via Database types.

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Landing page (public)
- `src/app/(dashboard)/dashboard/page.tsx`: Main app overview (protected)
- `src/app/(auth)/login/page.tsx`: Login form
- `src/app/(dashboard)/onboarding/page.tsx`: First-time setup wizard

**Configuration:**
- `src/middleware.ts`: Auth + onboarding routing logic
- `src/app/layout.tsx`: Root layout (fonts, metadata, Toaster)
- `src/app/(dashboard)/layout.tsx`: Dashboard shell (Sidebar, BottomNav, QueryProvider)
- `src/lib/stripe/plans.ts`: Plan definitions & pricing
- `tailwind.config.ts`: Tailwind theme (colors, spacing, breakpoints)
- `tsconfig.json`: Path aliases (`@/` points to `src/`)

**Core Logic:**
- `src/lib/hooks/use-transactions.ts`: Transaction CRUD, installments, batch operations
- `src/lib/hooks/use-profile.ts`: User profile, onboarding state
- `src/lib/hooks/use-subscription.ts`: Plan + WhatsApp usage
- `src/app/api/stripe/webhook/route.ts`: Subscription sync from Stripe

**Testing:**
- `src/__tests__/components/`: Component snapshot & interaction tests
- `src/__tests__/hooks/`: Hook logic tests (mocked Supabase)
- `src/__tests__/utils/`: Pure function tests
- `src/__tests__/mocks/`: Mock data, query client setup

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- API routes: `route.ts` (Next.js convention)
- Components: PascalCase (e.g., `TransactionCard.tsx`)
- Hooks: `use-*.ts` (React Hook naming convention)
- Utils: camelCase (e.g., `currency.ts`, `categories.ts`)

**Directories:**
- Feature domains: kebab-case (e.g., `bank-accounts`, `credit-cards`, `category-budgets`)
- Grouped routes: `(parentheses)` for route groups (e.g., `(dashboard)`, `(auth)`)
- Nested features: Use feature folder (e.g., `components/transactions/`)

**Components:**
- Functional components: PascalCase (e.g., `function TransactionForm()`)
- Props interfaces: `{ComponentName}Props` (e.g., `TransactionFormProps`)
- Exports: Named export matching filename

**Hooks:**
- Query hook: `use{Domain}` (e.g., `useTransactions`, `useProfile`)
- Mutation hook: `use{Action}{Domain}` (e.g., `useCreateTransaction`, `useUpdateProfile`)
- Hook files: `use-kebab-case.ts`

**Constants & Utilities:**
- Enum-like objects: UPPER_CASE (e.g., `PAYMENT_METHOD_CONFIG`)
- Helper functions: camelCase (e.g., `formatCurrency`, `getCategoryLabel`)
- Type definitions: PascalCase (e.g., `Transaction`, `Profile`, `MonthlySummary`)

## Where to Add New Code

**New Feature (Domain):**
- Page: `src/app/(dashboard)/{domain}/page.tsx`
- Components: `src/components/{domain}/` (create folder if new)
- Hook: `src/lib/hooks/use-{domain}.ts` (if needs data fetching)
- Tests: `src/__tests__/{domain}/`

**New Component:**
- File: `src/components/{domain}/{component-name}.tsx`
- Props interface: Define at top of file (e.g., `interface TransactionCardProps`)
- Export: Named export matching filename
- Styling: Tailwind classes directly (no CSS files unless complex animations)

**New Hook:**
- File: `src/lib/hooks/use-{domain}.ts`
- Pattern: `useQuery()` for reads, `useMutation()` for writes
- Invalidation: Call `queryClient.invalidateQueries()` in `onSuccess`
- Error handling: Throw errors, let component show toast

**New Utility:**
- File: `src/lib/utils/{utility-name}.ts`
- Pattern: Pure functions only, no side effects
- Exports: Named exports for each function/constant
- Tests: `src/__tests__/utils/{utility-name}.test.ts`

**New API Route:**
- File: `src/app/api/{domain}/[segment]/route.ts`
- Pattern: One handler per HTTP method (export const GET, POST, etc.)
- Auth: Use server client or webhook signature verification
- Response: NextResponse.json() with 200/400/500 status

**Database Changes:**
- Schema: Edit in Supabase dashboard (not committed to repo)
- Types: Run `npx supabase gen types typescript > src/lib/database.types.ts`
- Sync to git: Commit updated `database.types.ts` for IDE autocomplete

## Special Directories

**src/__tests__/:**
- Purpose: Unit & integration tests
- Generated: No (hand-written)
- Committed: Yes
- Structure: Mirrors src/ layout (components/, hooks/, utils/, mocks/)
- Run: `npm test` (Vitest)

**public/:**
- Purpose: Static assets (images, icons, manifest)
- Generated: manifest.json auto-generated (but can be committed)
- Committed: Yes
- Contents: PWA icons (icon-192.png, icon-512.png), favicon.ico

**.env.local:**
- Purpose: Environment secrets (Supabase keys, Stripe keys, API URLs)
- Generated: No (manual setup)
- Committed: No (.gitignored)
- Required vars: See CLAUDE.md for full list

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignored)

**dist/ or .next/:**
- Purpose: Build output
- Generated: Yes (npm run build)
- Committed: No (.gitignored)
