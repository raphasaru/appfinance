import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { createWrapper } from '../mocks/test-utils'

// Mock supabase before importing hooks
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: {
        id: 'sub-1',
        user_id: 'test-user-id',
        plan: 'free',
        status: 'active',
        whatsapp_messages_used: 15,
        whatsapp_messages_reset_at: new Date().toISOString(),
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: null,
      },
      error: null,
    }),
  }),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

// Import after mocking
import { useSubscription, useWhatsappUsage } from '@/lib/hooks/use-subscription'

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches subscription data', async () => {
    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toMatchObject({
      user_id: 'test-user-id',
      plan: 'free',
    })
  })

  it('returns default free subscription when none exists', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.plan).toBe('free')
    expect(result.current.data?.whatsapp_messages_used).toBe(0)
  })

  it('returns null when user is not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const { result } = renderHook(() => useSubscription(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeNull()
  })
})

describe('useWhatsappUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: 'sub-1',
          user_id: 'test-user-id',
          plan: 'free',
          status: 'active',
          whatsapp_messages_used: 15,
          whatsapp_messages_reset_at: new Date().toISOString(),
        },
        error: null,
      }),
    })
  })

  it('calculates usage for free plan', async () => {
    const { result } = renderHook(() => useWhatsappUsage(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.used).toBe(15)
    expect(result.current.limit).toBe(30)
    expect(result.current.remaining).toBe(15)
    expect(result.current.isPremium).toBe(false)
    expect(result.current.isAtLimit).toBe(false)
  })

  it('shows unlimited for pro plan', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          plan: 'pro',
          whatsapp_messages_used: 100,
          whatsapp_messages_reset_at: new Date().toISOString(),
        },
        error: null,
      }),
    })

    const { result } = renderHook(() => useWhatsappUsage(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isPremium).toBe(true)
    expect(result.current.limit).toBe(Infinity)
    expect(result.current.isAtLimit).toBe(false)
  })

  it('detects when at limit', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          plan: 'free',
          whatsapp_messages_used: 30,
          whatsapp_messages_reset_at: new Date().toISOString(),
        },
        error: null,
      }),
    })

    const { result } = renderHook(() => useWhatsappUsage(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isAtLimit).toBe(true)
    expect(result.current.remaining).toBe(0)
  })

  it('calculates percentage correctly', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          plan: 'free',
          whatsapp_messages_used: 15, // 50%
          whatsapp_messages_reset_at: new Date().toISOString(),
        },
        error: null,
      }),
    })

    const { result } = renderHook(() => useWhatsappUsage(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.percentage).toBe(50)
  })
})
