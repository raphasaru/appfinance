import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '../mocks/test-utils'

const mockTransactions = [
  { amount: 5000, type: 'income', status: 'completed' },
  { amount: 1000, type: 'expense', status: 'completed' },
  { amount: 500, type: 'expense', status: 'planned' },
  { amount: 2000, type: 'income', status: 'planned' },
]

const mockQueryResult = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn(),
}

const mockSupabase = {
  from: vi.fn(() => mockQueryResult),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

import { useMonthlySummary } from '@/lib/hooks/use-summary'

describe('useMonthlySummary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQueryResult.lte.mockResolvedValue({ data: mockTransactions, error: null })
  })

  it('calculates total income correctly', async () => {
    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.totalIncome).toBe(7000) // 5000 + 2000
  })

  it('calculates total expenses correctly', async () => {
    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.totalExpenses).toBe(1500) // 1000 + 500
  })

  it('calculates completed income correctly', async () => {
    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.completedIncome).toBe(5000)
  })

  it('calculates completed expenses correctly', async () => {
    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.completedExpenses).toBe(1000)
  })

  it('calculates pending income correctly', async () => {
    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.pendingIncome).toBe(2000)
  })

  it('calculates pending expenses correctly', async () => {
    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.pendingExpenses).toBe(500)
  })

  it('calculates balance correctly', async () => {
    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.balance).toBe(5500) // 7000 - 1500
  })

  it('calculates completed balance correctly', async () => {
    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.completedBalance).toBe(4000) // 5000 - 1000
  })

  it('returns zeros for empty data', async () => {
    mockQueryResult.lte.mockResolvedValueOnce({ data: [], error: null })

    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({
      totalIncome: 0,
      totalExpenses: 0,
      completedIncome: 0,
      completedExpenses: 0,
      pendingIncome: 0,
      pendingExpenses: 0,
      balance: 0,
      completedBalance: 0,
    })
  })

  it('handles null data', async () => {
    mockQueryResult.lte.mockResolvedValueOnce({ data: null, error: null })

    const { result } = renderHook(() => useMonthlySummary(new Date(2024, 0, 1)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.balance).toBe(0)
  })

  it('uses correct date range for query', async () => {
    renderHook(() => useMonthlySummary(new Date(2024, 0, 15)), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockQueryResult.gte).toHaveBeenCalledWith('due_date', '2024-01-01')
      expect(mockQueryResult.lte).toHaveBeenCalledWith('due_date', '2024-01-31')
    })
  })
})
