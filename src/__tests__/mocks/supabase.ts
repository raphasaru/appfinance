import { vi } from 'vitest'

export interface MockSupabaseQuery {
  select: ReturnType<typeof vi.fn>
  insert: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  gte: ReturnType<typeof vi.fn>
  lte: ReturnType<typeof vi.fn>
  in: ReturnType<typeof vi.fn>
  order: ReturnType<typeof vi.fn>
  single: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
  rpc: ReturnType<typeof vi.fn>
}

export function createMockSupabaseClient(overrides: Partial<{
  data: unknown
  error: unknown
  user: unknown
}> = {}) {
  const mockQuery: MockSupabaseQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: overrides.data ?? [], error: overrides.error ?? null }),
    single: vi.fn().mockResolvedValue({ data: overrides.data ?? null, error: overrides.error ?? null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: overrides.data ?? null, error: overrides.error ?? null }),
    rpc: vi.fn().mockResolvedValue({ data: overrides.data ?? null, error: overrides.error ?? null }),
  }

  return {
    from: vi.fn(() => mockQuery),
    rpc: mockQuery.rpc,
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: overrides.user ?? { id: 'test-user-id' } },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: overrides.user ?? { id: 'test-user-id' } } },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    _mockQuery: mockQuery,
  }
}

export const mockSupabaseClient = createMockSupabaseClient()

// Mock the createClient function
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))
