import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createWrapper, createTestQueryClient } from '../mocks/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { ErrorMessages } from '@/lib/errors'

const mockCards = [
  {
    id: 'card-1',
    user_id: 'test-user-id',
    name: 'Nubank Mastercard',
    credit_limit: 5000,
    current_bill: 1500,
    closing_day: 10,
    due_day: 20,
    color: '#8B5CF6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'card-2',
    user_id: 'test-user-id',
    name: 'Itaú Visa',
    credit_limit: 10000,
    current_bill: 3000,
    closing_day: 15,
    due_day: 25,
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
  useCreditCards,
  useCreateCreditCard,
  useUpdateCreditCard,
  useDeleteCreditCard,
} from '@/lib/hooks/use-credit-cards'

describe('useCreditCards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockCards, error: null })
    mockQueryResult.single.mockResolvedValue({ data: mockCards[0], error: null })
  })

  it('fetches credit cards', async () => {
    const { result } = renderHook(() => useCreditCards(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0].name).toBe('Nubank Mastercard')
  })

  it('returns empty array when no cards', async () => {
    mockQueryResult.order.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useCreditCards(), {
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

    const { result } = renderHook(() => useCreditCards(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useCreateCreditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockCards, error: null })
    mockQueryResult.single.mockResolvedValue({ data: mockCards[0], error: null })
  })

  it('creates credit card', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateCreditCard(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        name: 'New Card',
        credit_limit: 3000,
        closing_day: 5,
        due_day: 15,
      } as any)
    })

    expect(mockSupabase.from).toHaveBeenCalledWith('credit_cards')
    expect(mockQueryResult.insert).toHaveBeenCalled()
  })

  it('requires authentication', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useCreateCreditCard(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        name: 'Test Card',
        closing_day: 10,
        due_day: 20,
      })
    ).rejects.toThrow(ErrorMessages.NOT_AUTHENTICATED)
  })
})

describe('useUpdateCreditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockCards, error: null })
    mockQueryResult.single.mockResolvedValue({
      data: { ...mockCards[0], credit_limit: 8000 },
      error: null,
    })
  })

  it('updates credit card', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useUpdateCreditCard(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        id: 'card-1',
        credit_limit: 8000,
      } as any)
    })

    expect(mockQueryResult.update).toHaveBeenCalled()
    expect(mockQueryResult.eq).toHaveBeenCalledWith('id', 'card-1')
  })
})

describe('useDeleteCreditCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.order.mockResolvedValue({ data: mockCards, error: null })
    mockQueryResult.eq.mockResolvedValue({ error: null })
  })

  it('deletes credit card', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useDeleteCreditCard(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync('card-1')
    })

    expect(mockQueryResult.delete).toHaveBeenCalled()
    expect(mockQueryResult.eq).toHaveBeenCalledWith('id', 'card-1')
  })
})
