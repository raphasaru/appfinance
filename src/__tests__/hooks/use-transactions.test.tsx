import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createWrapper, createTestQueryClient } from '../mocks/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { ErrorMessages } from '@/lib/errors'

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

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useCompleteTransaction,
  useUncompleteTransaction,
  useDeleteTransaction,
  useBatchCompleteTransactions,
} from '@/lib/hooks/use-transactions'

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockTransactions, error: null })
    mockQueryResult.single.mockResolvedValue({ data: mockTransactions[0], error: null })
    mockQueryResult.eq.mockReturnThis()
    mockQueryResult.in.mockResolvedValue({ error: null })
  })

  it('fetches transactions for month', async () => {
    const { result } = renderHook(() => useTransactions(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveLength(2)
  })

  it('filters by date range', async () => {
    renderHook(() => useTransactions(new Date(2024, 0, 15)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockQueryResult.gte).toHaveBeenCalledWith('due_date', '2024-01-01')
      expect(mockQueryResult.lte).toHaveBeenCalledWith('due_date', '2024-01-31')
    })
  })

  it('orders by due_date ascending', async () => {
    renderHook(() => useTransactions(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockQueryResult.order).toHaveBeenCalledWith('due_date', { ascending: true })
    })
  })
})

describe('useCreateTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.single.mockResolvedValue({ data: mockTransactions[0], error: null })
  })

  it('creates transaction', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

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
    expect(mockQueryResult.insert).toHaveBeenCalled()
  })

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
})

describe('useCompleteTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.eq.mockResolvedValue({ error: null })
  })

  it('marks transaction as completed', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCompleteTransaction(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('tx-1')
    })

    expect(mockQueryResult.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        completed_date: expect.any(String),
      })
    )
    expect(mockQueryResult.eq).toHaveBeenCalledWith('id', 'tx-1')
  })
})

describe('useUncompleteTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.eq.mockResolvedValue({ error: null })
  })

  it('marks transaction as planned', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useUncompleteTransaction(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('tx-1')
    })

    expect(mockQueryResult.update).toHaveBeenCalledWith({
      status: 'planned',
      completed_date: null,
    })
  })
})

describe('useDeleteTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.eq.mockResolvedValue({ error: null })
  })

  it('deletes transaction', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useDeleteTransaction(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('tx-1')
    })

    expect(mockQueryResult.delete).toHaveBeenCalled()
    expect(mockQueryResult.eq).toHaveBeenCalledWith('id', 'tx-1')
  })
})

describe('useBatchCompleteTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.in.mockResolvedValue({ error: null })
  })

  it('completes multiple transactions', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useBatchCompleteTransactions(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(['tx-1', 'tx-2'])
    })

    expect(mockQueryResult.update).toHaveBeenCalled()
    expect(mockQueryResult.in).toHaveBeenCalledWith('id', ['tx-1', 'tx-2'])
  })

  it('does nothing for empty array', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useBatchCompleteTransactions(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync([])
    })

    expect(mockQueryResult.update).not.toHaveBeenCalled()
  })
})
