import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MonthSelector } from '@/components/dashboard/month-selector'

describe('MonthSelector', () => {
  it('displays current month in Portuguese', () => {
    const date = new Date(2024, 0, 15) // Janeiro 2024

    render(
      <MonthSelector
        currentMonth={date}
        onMonthChange={vi.fn()}
      />
    )

    expect(screen.getByText(/janeiro 2024/i)).toBeInTheDocument()
  })

  it('navigates to previous month', () => {
    const date = new Date(2024, 5, 15) // Junho 2024
    const onMonthChange = vi.fn()

    render(
      <MonthSelector
        currentMonth={date}
        onMonthChange={onMonthChange}
      />
    )

    const prevButton = screen.getAllByRole('button')[0]
    fireEvent.click(prevButton)

    expect(onMonthChange).toHaveBeenCalledTimes(1)

    const calledDate = onMonthChange.mock.calls[0][0]
    expect(calledDate.getMonth()).toBe(4) // Maio
    expect(calledDate.getFullYear()).toBe(2024)
  })

  it('navigates to next month', () => {
    const date = new Date(2024, 5, 15) // Junho 2024
    const onMonthChange = vi.fn()

    render(
      <MonthSelector
        currentMonth={date}
        onMonthChange={onMonthChange}
      />
    )

    const nextButton = screen.getAllByRole('button')[1]
    fireEvent.click(nextButton)

    expect(onMonthChange).toHaveBeenCalledTimes(1)

    const calledDate = onMonthChange.mock.calls[0][0]
    expect(calledDate.getMonth()).toBe(6) // Julho
    expect(calledDate.getFullYear()).toBe(2024)
  })

  it('handles year transition to previous year', () => {
    const date = new Date(2024, 0, 15) // Janeiro 2024
    const onMonthChange = vi.fn()

    render(
      <MonthSelector
        currentMonth={date}
        onMonthChange={onMonthChange}
      />
    )

    const prevButton = screen.getAllByRole('button')[0]
    fireEvent.click(prevButton)

    const calledDate = onMonthChange.mock.calls[0][0]
    expect(calledDate.getMonth()).toBe(11) // Dezembro
    expect(calledDate.getFullYear()).toBe(2023)
  })

  it('handles year transition to next year', () => {
    const date = new Date(2024, 11, 15) // Dezembro 2024
    const onMonthChange = vi.fn()

    render(
      <MonthSelector
        currentMonth={date}
        onMonthChange={onMonthChange}
      />
    )

    const nextButton = screen.getAllByRole('button')[1]
    fireEvent.click(nextButton)

    const calledDate = onMonthChange.mock.calls[0][0]
    expect(calledDate.getMonth()).toBe(0) // Janeiro
    expect(calledDate.getFullYear()).toBe(2025)
  })

  it('renders navigation buttons', () => {
    render(
      <MonthSelector
        currentMonth={new Date(2024, 0, 15)}
        onMonthChange={vi.fn()}
      />
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('month label is capitalized', () => {
    render(
      <MonthSelector
        currentMonth={new Date(2024, 5, 15)}
        onMonthChange={vi.fn()}
      />
    )

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveClass('capitalize')
  })
})
