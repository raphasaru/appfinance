import { vi } from 'vitest'
import type Stripe from 'stripe'

export function createMockStripeClient() {
  return {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'https://billing.stripe.com/test',
        }),
      },
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        customer: 'cus_123',
        metadata: { user_id: 'test-user-id', plan_id: 'pro' },
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_123' }),
      retrieve: vi.fn().mockResolvedValue({ id: 'cus_123' }),
    },
    webhooks: {
      constructEvent: vi.fn((body, signature, secret) => {
        return JSON.parse(body) as Stripe.Event
      }),
    },
  }
}

export const mockStripeClient = createMockStripeClient()

vi.mock('@/lib/stripe/client', () => ({
  getStripe: () => mockStripeClient,
}))

// Mock Stripe webhook event factory
export function createMockStripeEvent(
  type: string,
  data: Record<string, unknown>
): Stripe.Event {
  return {
    id: 'evt_123',
    object: 'event',
    api_version: '2023-10-16',
    created: Math.floor(Date.now() / 1000),
    type,
    data: {
      object: data,
    },
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as unknown as Stripe.Event
}
