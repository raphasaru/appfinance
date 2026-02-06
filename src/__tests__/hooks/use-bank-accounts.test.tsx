import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createWrapper, createTestQueryClient } from '../mocks/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { ErrorMessages } from '@/lib/errors'

const mockAccounts = [
  {
    id: 'acc-1',
    user_id: 'test-user-id',
    name: 'Nubank',
    type: 'checking',
    balance: 1000,
    bank_name: 'Nubank',
    color: '#8B5CF6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-2',
    user_id: 'test-user-id',
    name: 'Itaú',
    type: 'savings',
    balance: 5000,
    bank_name: 'Itaú',
    color: '#F97316',
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
  useBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
} from '@/lib/hooks/use-bank-accounts'

describe('useBankAccounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockAccounts, error: null })
    mockQueryResult.single.mockResolvedValue({ data: mockAccounts[0], error: null })
  })

  it('fetches bank accounts', async () => {
    const { result } = renderHook(() => useBankAccounts(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].name).toBe('Nubank')
  })

  it('returns empty array when no accounts', async () => {
    mockQueryResult.order.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useBankAccounts(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual([])
  })

  it('handles error', async () => {
    mockQueryResult.order.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    })

    const { result } = renderHook(() => useBankAccounts(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useCreateBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockAccounts, error: null })
    mockQueryResult.single.mockResolvedValue({ data: mockAccounts[0], error: null })
  })

  it('creates bank account', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateBankAccount(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'New Account',
        type: 'checking',
        balance: 500,
      } as any)
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('bank_accounts')
    expect(mockQueryResult.insert).toHaveBeenCalled()
  })

  it('requires authentication', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useCreateBankAccount(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        name: 'Test',
        type: 'checking',
      })
    ).rejects.toThrow(ErrorMessages.NOT_AUTHENTICATED)
  })
})

describe('useUpdateBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockAccounts, error: null })
    mockQueryResult.single.mockResolvedValue({ data: { ...mockAccounts[0], balance: 2000 }, error: null })
  })

  it('updates bank account', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useUpdateBankAccount(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        id: 'acc-1',
        balance: 2000,
      } as any)
    })

    expect(mockQueryResult.update).toHaveBeenCalled()
    expect(mockQueryResult.eq).toHaveBeenCalledWith('id', 'acc-1')
  })
})

describe('useDeleteBankAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockAccounts, error: null })
    mockQueryResult.eq.mockResolvedValue({ error: null })
  })

  it('deletes bank account', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useDeleteBankAccount(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('acc-1')
    })

    expect(mockQueryResult.delete).toHaveBeenCalled()
    expect(mockQueryResult.eq).toHaveBeenCalledWith('id', 'acc-1')
  })
})
