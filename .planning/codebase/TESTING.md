# Testing Patterns

**Analysis Date:** 2026-01-31

## Test Framework

**Runner:**
- Vitest v4.0.18
- Config: `vitest.config.ts`
- Environment: jsdom (browser-like DOM testing)
- Globals enabled: true (describe, it, expect available without imports)

**Assertion Library:**
- Vitest built-in `expect()` (compatible with Jest API)
- Additional assertions from `@testing-library/jest-dom`

**Run Commands:**
```bash
npm test              # Run all tests in watch mode
npm run test:run      # Run all tests once (CI mode)
npm run test:ui       # Run with interactive UI
npm run test:coverage # Run with coverage report
```

## Test File Organization

**Location:**
- Co-located in `src/__tests__/` directory structure
- Tests organized by domain: `src/__tests__/utils/`, `src/__tests__/hooks/`, `src/__tests__/components/`
- Mirrors src structure but separate directory for clarity

**Naming:**
- `*.test.ts` for TypeScript files (utilities, logic)
- `*.test.tsx` for React component files
- Filename matches source: `currency.ts` → `currency.test.ts`

**File Structure:**
```
src/__tests__/
├── setup.ts                    # Global test setup
├── mocks/                      # Shared mocks and utilities
│   ├── test-utils.tsx          # Custom render functions, query client factory
│   ├── supabase.ts             # Supabase mock setup
│   └── stripe.ts               # Stripe mock setup
├── utils/
│   ├── currency.test.ts
│   ├── check-limits.test.ts
│   ├── categories.test.ts
│   ├── credit-card.test.ts
│   └── plans.test.ts
├── hooks/
│   ├── use-transactions.test.tsx
│   ├── use-credit-cards.test.tsx
│   ├── use-subscription.test.ts
│   └── use-bank-accounts.test.tsx
└── components/
    ├── summary-cards.test.tsx
    ├── month-selector.test.tsx
    └── pricing-table.test.tsx
```

## Test Setup

**Setup File (`src/__tests__/setup.ts`):**
```typescript
// Global mocks for browser APIs and Next.js
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}))

// Mock ResizeObserver (used by Recharts)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

## Test Structure Patterns

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryCards } from '@/components/dashboard/summary-cards'

describe('SummaryCards', () => {
  const defaultProps = {
    totalIncome: 5000,
    totalExpenses: 2000,
    completedIncome: 3000,
    completedExpenses: 1500,
    balance: 3000,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all three cards', () => {
    render(<SummaryCards {...defaultProps} />)
    expect(screen.getByText('Receitas')).toBeInTheDocument()
  })

  it('displays total income formatted', () => {
    render(<SummaryCards {...defaultProps} />)
    expect(screen.getByText(/5\.000,00/)).toBeInTheDocument()
  })
})
```

**Test Structure:**
- Use `describe()` to group related tests by feature or component
- Use `beforeEach()` to reset state before each test (mock clearing, setup)
- Use `it()` with clear, descriptive test names
- One assertion concept per test
- Test naming pattern: "does X when Y" or "renders X"

**Async Testing Pattern:**
```typescript
import { renderHook, waitFor, act } from '@testing-library/react'

// For hooks
it('fetches transactions for month', async () => {
  const { result } = renderHook(() => useTransactions(new Date(2024, 0, 1)), {
    wrapper: createWrapper(),
  })

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true)
  })

  expect(result.current.data).toHaveLength(2)
})

// For mutations
it('creates transaction', async () => {
  const { result } = renderHook(() => useCreateTransaction(), { wrapper })

  await act(async () => {
    await result.current.mutateAsync({
      description: 'New Transaction',
      amount: 100,
      type: 'expense',
      due_date: '2024-01-15',
    })
  })

  expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
})
```

## Mocking Patterns

**Framework:** Vitest `vi` module

**Module Mocking:**
```typescript
// Mock entire module before imports
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

// Then import from the real location
import { useTransactions } from '@/lib/hooks/use-transactions'
```

**Mock Object Patterns:**

**Supabase Client Mock:**
```typescript
const mockQueryResult = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn(),
  single: vi.fn(),
}

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
  },
  from: vi.fn(() => mockQueryResult),
}
```

**Mutation Function Mock:**
```typescript
const mockMutateAsync = vi.fn()
vi.mock('@/lib/hooks/use-subscription', () => ({
  useSubscription: () => ({
    data: { plan: 'free' },
    isLoading: false,
  }),
  useCreateCheckout: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

// In test setup
mockMutateAsync.mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
```

**What to Mock:**
- External APIs and services (Supabase, Stripe, next/navigation)
- Browser APIs that don't exist in jsdom (ResizeObserver, window.matchMedia)
- Next.js specific hooks and modules
- Sibling modules you're testing (to isolate unit tests)

**What NOT to Mock:**
- Utility functions you're testing
- React hooks like useState, useCallback
- Date-fns functions (let them run)
- Your own business logic

## Fixtures and Factories

**Test Data Pattern:**
```typescript
const mockTransactions = [
  {
    id: 'tx-1',
    user_id: 'test-user-id',
    description: 'Salário',
    amount: 5000,
    type: 'income',
    status: 'completed',
    due_date: '2024-01-05',
    category: null,
    payment_method: 'pix',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    user_id: 'test-user-id',
    description: 'Mercado',
    amount: 500,
    type: 'expense',
    status: 'completed',
    due_date: '2024-01-10',
    category: 'variable_food',
    payment_method: 'debit',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
```

**Factory Functions:**
```typescript
// src/__tests__/mocks/test-utils.tsx
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

export function createWrapper() {
  const queryClient = createTestQueryClient()
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient = createTestQueryClient(), ...options } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}
```

**Location:**
- Shared factories and utilities in `src/__tests__/mocks/`
- Test-specific fixtures defined in test files

## Coverage

**Requirements:** Not enforced (no coverage threshold in config)

**View Coverage:**
```bash
npm run test:coverage
```

**Coverage Settings (`vitest.config.ts`):**
- Provider: v8
- Reporters: text, json, html
- Include: `src/lib/**/*.ts`, `src/components/**/*.tsx`
- Exclude: test files, type definitions

**Coverage Output:**
- HTML report: auto-generated in coverage directory
- Text output: shown in terminal

## Test Types

**Unit Tests:**
- Utilities and pure functions (currency, categories, check-limits)
- Location: `src/__tests__/utils/`
- Scope: Single function, no side effects
- Approach: Test inputs → outputs, edge cases, error handling
- Example: `currency.test.ts` tests `formatCurrency`, `parseCurrency`, `formatCurrencyInput`

**Component Tests:**
- React components with props and state
- Location: `src/__tests__/components/`
- Scope: User interactions, rendering, conditional logic
- Approach: Render component, check DOM output, simulate user actions
- Tools: `@testing-library/react` (avoid `enzyme`, avoid implementation details)
- Example: `summary-cards.test.tsx` tests rendering, formatting, progress bars

**Hook Tests:**
- React Query hooks and custom hooks
- Location: `src/__tests__/hooks/`
- Scope: Hook lifecycle, queries, mutations, cache behavior
- Approach: Use `renderHook` with wrapper (QueryClientProvider)
- Pattern: Mock Supabase client, verify hook calls
- Example: `use-transactions.test.tsx` tests fetching, filtering, mutations

**No E2E Tests:**
- E2E tests not included in current setup
- Playwright or Cypress would be added if needed

## Common Patterns

**Error Handling Test:**
```typescript
it('requires authentication', async () => {
  mockSupabase.auth.getUser.mockResolvedValueOnce({
    data: { user: null },
    error: null,
  })

  const { result } = renderHook(() => useCreateTransaction(), {
    wrapper: createWrapper(),
  })

  await expect(
    result.current.mutateAsync({
      description: 'Test',
      amount: 100,
      type: 'expense',
      due_date: '2024-01-15',
    })
  ).rejects.toThrow(ErrorMessages.NOT_AUTHENTICATED)
})
```

**Environment Variable Stub:**
```typescript
import { beforeEach } from 'vitest'

beforeEach(() => {
  vi.unstubAllEnvs()
})

it('uses NEXT_PUBLIC_APP_URL when no baseUrl provided', () => {
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://meubolso.app')
  expect(getUpgradeUrl()).toBe('https://meubolso.app/pricing')
})
```

**Rendering with Props:**
```typescript
it('displays negative balance without plus sign', () => {
  render(<SummaryCards {...defaultProps} balance={-1000} />)
  expect(screen.getByText(/-.*1\.000,00/)).toBeInTheDocument()
  expect(screen.getByText('Negativo')).toBeInTheDocument()
})
```

**Testing Skeletons/Loading:**
```typescript
it('shows loading skeleton when isLoading', () => {
  const { container } = render(<SummaryCards {...defaultProps} isLoading />)
  const skeletons = container.querySelectorAll('.animate-pulse')
  expect(skeletons.length).toBe(3)
})

it('does not show content when loading', () => {
  render(<SummaryCards {...defaultProps} isLoading />)
  expect(screen.queryByText('Receitas')).not.toBeInTheDocument()
})
```

**Regex Pattern Matching:**
```typescript
// Test currency formatting with regex
expect(screen.getByText(/5\.000,00/)).toBeInTheDocument()

// Test elements with partial text
expect(screen.getByText(/Anual.*-25%/)).toBeInTheDocument()
```

## Mock Setup Lifecycle

**Before Each Test:**
```typescript
beforeEach(() => {
  vi.clearAllMocks()  // Clear all mock call history
  mockQueryResult.order.mockResolvedValue({ data: mockTransactions, error: null })
  mockQueryResult.single.mockResolvedValue({ data: mockTransactions[0], error: null })
  mockQueryResult.eq.mockReturnThis()  // For chaining
})
```

**Within Test:**
```typescript
// Override specific mock for this test
mockSupabase.auth.getUser.mockResolvedValueOnce({
  data: { user: null },
  error: null,
})
```

---

*Testing analysis: 2026-01-31*
