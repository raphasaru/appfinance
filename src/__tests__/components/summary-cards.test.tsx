import { describe, it, expect } from 'vitest'
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

  it('renders all three cards', () => {
    render(<SummaryCards {...defaultProps} />)

    expect(screen.getByText('Receitas')).toBeInTheDocument()
    expect(screen.getByText('Despesas')).toBeInTheDocument()
    expect(screen.getByText('Saldo Previsto')).toBeInTheDocument()
  })

  it('displays total income formatted', () => {
    render(<SummaryCards {...defaultProps} />)

    expect(screen.getByText(/5\.000,00/)).toBeInTheDocument()
  })

  it('displays total expenses formatted', () => {
    render(<SummaryCards {...defaultProps} />)

    expect(screen.getByText(/2\.000,00/)).toBeInTheDocument()
  })

  it('displays positive balance with plus sign', () => {
    render(<SummaryCards {...defaultProps} />)

    expect(screen.getByText(/\+.*3\.000,00/)).toBeInTheDocument()
    expect(screen.getByText('Positivo')).toBeInTheDocument()
  })

  it('displays negative balance without plus sign', () => {
    render(<SummaryCards {...defaultProps} balance={-1000} />)

    expect(screen.getByText(/-.*1\.000,00/)).toBeInTheDocument()
    expect(screen.getByText('Negativo')).toBeInTheDocument()
  })

  it('displays completed income text', () => {
    render(<SummaryCards {...defaultProps} />)

    expect(screen.getByText(/3\.000,00.*recebido/)).toBeInTheDocument()
  })

  it('displays completed expenses text', () => {
    render(<SummaryCards {...defaultProps} />)

    expect(screen.getByText(/1\.500,00.*pago/)).toBeInTheDocument()
  })

  it('calculates income progress percentage', () => {
    render(<SummaryCards {...defaultProps} />)

    // 3000/5000 = 60%
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('calculates expense progress percentage', () => {
    render(<SummaryCards {...defaultProps} />)

    // 1500/2000 = 75%
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows 0% when no income', () => {
    render(
      <SummaryCards
        {...defaultProps}
        totalIncome={0}
        completedIncome={0}
      />
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading', () => {
    const { container } = render(<SummaryCards {...defaultProps} isLoading />)

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBe(3)
  })

  it('does not show content when loading', () => {
    render(<SummaryCards {...defaultProps} isLoading />)

    expect(screen.queryByText('Receitas')).not.toBeInTheDocument()
    expect(screen.queryByText('Despesas')).not.toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(
      <SummaryCards
        totalIncome={0}
        totalExpenses={0}
        completedIncome={0}
        completedExpenses={0}
        balance={0}
      />
    )

    // Check that zero values are displayed
    expect(screen.getAllByText(/0,00/).length).toBeGreaterThanOrEqual(4)
  })
})
