import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PricingTable } from '@/components/pricing/pricing-table'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from '../mocks/test-utils'
import React from 'react'

// Mock the hooks
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

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('PricingTable', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    mockMutateAsync.mockResolvedValue({ url: 'https://checkout.stripe.com/test' })
  })

  it('renders billing interval tabs', () => {
    render(<PricingTable />, { wrapper })

    expect(screen.getByText('Mensal')).toBeInTheDocument()
    expect(screen.getByText(/Anual/)).toBeInTheDocument()
    expect(screen.getByText('-25%')).toBeInTheDocument()
  })

  it('shows free and pro monthly plans by default', () => {
    render(<PricingTable />, { wrapper })

    expect(screen.getByText('Grátis')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.queryByText('Pro Anual')).not.toBeInTheDocument()
  })

  it('has annual tab with discount badge', () => {
    render(<PricingTable />, { wrapper })

    // Year tab exists with discount badge
    const yearTab = screen.getByRole('tab', { name: /Anual.*-25%/ })
    expect(yearTab).toBeInTheDocument()
  })

  it('hides free plan when showFreePlan is false', () => {
    render(<PricingTable showFreePlan={false} />, { wrapper })

    expect(screen.queryByText('Grátis')).not.toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  it('calls checkout when selecting a plan', async () => {
    render(<PricingTable />, { wrapper })

    // Find the Pro plan's button
    const buttons = screen.getAllByRole('button')
    const proButton = buttons.find(btn =>
      btn.textContent?.includes('Fazer upgrade') ||
      btn.textContent?.includes('Começar')
    )

    if (proButton) {
      fireEvent.click(proButton)

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled()
      })
    }
  })

  it('displays free plan features', () => {
    render(<PricingTable />, { wrapper })

    expect(screen.getByText('Dashboard completo')).toBeInTheDocument()
    expect(screen.getByText('30 mensagens WhatsApp/mês')).toBeInTheDocument()
  })

  it('displays pro plan features', () => {
    render(<PricingTable />, { wrapper })

    expect(screen.getByText('WhatsApp ilimitado')).toBeInTheDocument()
    expect(screen.getByText('Suporte prioritário')).toBeInTheDocument()
  })
})
