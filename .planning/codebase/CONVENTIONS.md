# Coding Conventions

**Analysis Date:** 2026-01-31

## Naming Patterns

**Files:**
- Components (React): PascalCase with `.tsx` extension (e.g., `SummaryCards.tsx`, `CreditCardForm.tsx`)
- Utilities/Helpers: kebab-case with `.ts` extension (e.g., `check-limits.ts`, `payment-methods.ts`)
- Hooks: kebab-case with `use-` prefix (e.g., `use-transactions.ts`, `use-credit-cards.ts`)
- API routes: lowercase with hyphens in path structure (e.g., `/api/stripe/webhook/route.ts`)
- Test files: same name as source with `.test.ts` or `.test.tsx` suffix, located in `src/__tests__/`

**Functions:**
- camelCase for all function declarations (both regular and exported)
- Exported hook functions: `useHookName` pattern (e.g., `useTransactions`, `useCreditCards`, `useCreateTransaction`)
- Utility functions: descriptive camelCase (e.g., `formatCurrency`, `parseCurrency`, `checkWhatsAppLimit`)
- Internal helpers: camelCase (e.g., `createTestQueryClient`, `renderWithProviders`)

**Variables:**
- camelCase for all variables and constants (e.g., `totalIncome`, `isLoading`, `mockTransactions`)
- Database/schema-related: snake_case when matching DB columns (e.g., `user_id`, `due_date`, `payment_method`)
- React component props: camelCase (e.g., `totalIncome`, `isLoading`, `onSuccess`)

**Types & Interfaces:**
- PascalCase for type/interface names (e.g., `SummaryCardsProps`, `WhatsAppLimitResult`, `ErrorMessageKey`)
- Use `type` for simple type aliases, `interface` for object shapes
- Props interfaces: `{ComponentName}Props` pattern (e.g., `SummaryCardsProps`)
- Generic types from database: `Tables<'table_name'>`, `TablesInsert<'table_name'>`, `TablesUpdate<'table_name'>`

## Code Style

**Formatting:**
- No `.prettierrc` file; relies on ESLint defaults
- TypeScript target: ES2017
- Module resolution: bundler
- Path alias: `@/*` maps to `./src/*`

**Linting:**
- ESLint v9 with Next.js core-web-vitals config
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Config file: `eslint.config.mjs`
- Run with: `npm run lint`

**Language & Locale:**
- Portuguese (pt-BR) for all user-facing strings (labels, messages, errors)
- English for code comments and technical documentation
- Currency formatting: BRL with pt-BR locale via `Intl.NumberFormat`

## Import Organization

**Order:**
1. Node.js/Next.js built-ins (`import { headers } from 'next/headers'`, `import { NextRequest }`)
2. External packages (`import React`, `import { useQuery }`, `import Stripe`)
3. Type imports from external packages (`import type { Database }`)
4. Absolute imports using `@/*` alias (`import { formatCurrency } from '@/lib/utils/currency'`)
5. Relative imports (minimal usage, prefer absolute imports)
6. Type imports from project (`import type { Transaction }`)

**Path Aliases:**
- `@/*` → `src/*` - Used for all absolute imports
- Common: `@/lib`, `@/components`, `@/app`

**Import Style:**
- Named imports preferred over default (e.g., `import { useQuery }` not `import useQuery`)
- Type imports marked with `type` keyword: `import type { Database }`
- Library imports at top, organized by domain

## Error Handling

**Patterns:**
- Centralized error messages in `src/lib/errors.ts`
- `ErrorMessages` object with uppercase keys for error constants (e.g., `ErrorMessages.NOT_AUTHENTICATED`)
- `AppError` custom class wraps errors with typed key (e.g., `throw new AppError(ErrorMessages.TRANSACTION_CREATE_FAILED)`)
- Error helper function `getErrorMessage(error)` maps errors to Portuguese messages
- Async functions throw/reject on error, caller handles with try-catch or .catch()

**Example:**
```typescript
// Define error
export const ErrorMessages = {
  NOT_AUTHENTICATED: 'Você precisa estar logado...',
} as const

// Use in code
if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED)

// Catch and display
try {
  await mutation()
} catch (error) {
  const msg = getErrorMessage(error)
  toast.error(msg)
}
```

## Logging

**Framework:** Native `console` methods (no wrapper library)

**Patterns:**
- `console.error()` for errors and warnings (e.g., `console.error('Webhook signature verification failed:', err)`)
- Use sparingly - only for critical failures or debugging
- No console.log in production code
- Server-side code: errors logged for debugging, not exposed to client

**Example:**
```typescript
if (error) {
  console.error('Error checking WhatsApp limit:', error)
  // Handle gracefully...
}
```

## Comments

**When to Comment:**
- Function-level JSDoc comments for public functions (utilities, hooks, components)
- No inline comments for obvious code
- Comments for non-obvious logic or business rules
- TypeScript types and interfaces: brief JSDoc explaining purpose

**JSDoc/TSDoc:**
- Used on utility functions and exported functions
- Format: single-line `/** comment */` or multi-line with `/**` and `*/`
- Include parameter and return type info when complex
- Example in `src/lib/utils/check-limits.ts`:
  ```typescript
  /**
   * Check if a user can send WhatsApp messages based on their subscription.
   * Used by the WhatsApp service.
   */
  export async function checkWhatsAppLimit(...)
  ```

## Function Design

**Size:** Keep functions small and focused
- Hooks: 15-50 lines typical
- Utilities: 5-30 lines typical
- Components: 60-150 lines typical

**Parameters:**
- Named parameters preferred over positional for functions with 2+ params
- Object destructuring in parameters for complex shapes
- Use type annotations, no `any` type

**Return Values:**
- Always declare return type
- Use union types for conditional returns: `Promise<{ success: boolean; value: T }>`
- No implicit undefined returns - make optional explicit with `?` or return null

**Async Patterns:**
- `async/await` style (no `.then()` chaining)
- Errors propagate via throw, caller handles
- Example:
  ```typescript
  export async function checkWhatsAppLimit(...): Promise<WhatsAppLimitResult> {
    const { data, error } = await supabase.rpc(...)
    if (error) throw error
    return result
  }
  ```

## Module Design

**Exports:**
- Named exports only (no default exports except in Next.js pages)
- Export individual functions and types separately
- Barrel files (index.ts) not used; import from specific files

**Example:**
```typescript
// src/lib/utils/currency.ts
export function formatCurrency(value: number): string { ... }
export function parseCurrency(value: string): number { ... }

// Usage
import { formatCurrency, parseCurrency } from '@/lib/utils/currency'
```

**File Structure by Type:**

**Utilities (`src/lib/utils/`):**
- Pure functions, no side effects
- Single responsibility
- Examples: `currency.ts`, `categories.ts`, `check-limits.ts`

**Hooks (`src/lib/hooks/`):**
- React Query hooks for data fetching
- Custom React hooks for shared logic
- Pattern: one hook per file, related mutations as separate exports
- Example file: `use-transactions.ts` exports `useTransactions`, `useCreateTransaction`, `useUpdateTransaction`, etc.

**Components (`src/components/`):**
- Organized by feature/domain
- Subdirectories: `ui/`, `dashboard/`, `transactions/`, `wallet/`, etc.
- All client-side with `"use client"` directive

**Supabase Integration:**
- Client: `src/lib/supabase/client.ts` - client-side instance
- Server: `src/lib/supabase/server.ts` - server-side instance
- Database types auto-generated: `src/lib/database.types.ts`

## Specific Patterns

**React Query Integration:**
- Query key naming: kebab-case (e.g., `["credit-cards"]`, `["transactions", startDate]`)
- Invalidation on mutations: clear related query keys
- Type safety: extract database type with `Tables<'table_name'>`

**TypeScript in React:**
- Functional components with props interface
- Component return type implicit (not annotated)
- Props interface always defined, even for no props

**Stripe/Payment Code:**
- Webhook handlers: service-role client used for elevated permissions
- Type from Stripe SDK: `import type Stripe from 'stripe'`
- Environment variables with `!` non-null assertion where required

---

*Convention analysis: 2026-01-31*
