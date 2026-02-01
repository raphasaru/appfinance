import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  getFaturaMonth,
  getDueDate,
  getInstallmentDueDates,
  isDueSoon,
  isOverdue,
} from '@/lib/utils/credit-card'

describe('credit-card utils', () => {
  describe('getFaturaMonth', () => {
    it('returns same month if purchase before closing date', () => {
      const card = { closing_day: 15, due_day: 25 }
      const purchaseDate = new Date(2024, 0, 10) // Jan 10

      expect(getFaturaMonth(purchaseDate, card)).toBe('2024-01')
    })

    it('returns next month if purchase after closing date', () => {
      const card = { closing_day: 15, due_day: 25 }
      const purchaseDate = new Date(2024, 0, 20) // Jan 20, after closing

      expect(getFaturaMonth(purchaseDate, card)).toBe('2024-02')
    })

    it('returns same month if purchase on closing date', () => {
      const card = { closing_day: 15, due_day: 25 }
      const purchaseDate = new Date(2024, 0, 15) // Jan 15, on closing day

      expect(getFaturaMonth(purchaseDate, card)).toBe('2024-01')
    })

    it('handles year transition', () => {
      const card = { closing_day: 10, due_day: 20 }
      const purchaseDate = new Date(2024, 11, 20) // Dec 20, after closing

      expect(getFaturaMonth(purchaseDate, card)).toBe('2025-01')
    })
  })

  describe('getDueDate', () => {
    it('returns due date in same month as fatura', () => {
      const card = { closing_day: 15, due_day: 25 }
      const purchaseDate = new Date(2024, 0, 10) // Jan 10

      const dueDate = getDueDate(purchaseDate, card)

      expect(dueDate.getFullYear()).toBe(2024)
      expect(dueDate.getMonth()).toBe(0) // January
      expect(dueDate.getDate()).toBe(25)
    })

    it('returns due date in next month when purchase after closing', () => {
      const card = { closing_day: 10, due_day: 5 }
      const purchaseDate = new Date(2024, 0, 15) // Jan 15, after closing

      const dueDate = getDueDate(purchaseDate, card)

      expect(dueDate.getFullYear()).toBe(2024)
      expect(dueDate.getMonth()).toBe(1) // February
      expect(dueDate.getDate()).toBe(5)
    })
  })

  describe('getInstallmentDueDates', () => {
    it('returns correct number of due dates', () => {
      const card = { closing_day: 10, due_day: 20 }
      const purchaseDate = new Date(2024, 0, 5)

      const dueDates = getInstallmentDueDates(purchaseDate, card, 6)

      expect(dueDates).toHaveLength(6)
    })

    it('returns consecutive months', () => {
      const card = { closing_day: 10, due_day: 20 }
      const purchaseDate = new Date(2024, 0, 5)

      const dueDates = getInstallmentDueDates(purchaseDate, card, 3)

      expect(dueDates[0].getMonth()).toBe(0) // Jan
      expect(dueDates[1].getMonth()).toBe(1) // Feb
      expect(dueDates[2].getMonth()).toBe(2) // Mar
    })

    it('handles year transition across installments', () => {
      const card = { closing_day: 10, due_day: 20 }
      const purchaseDate = new Date(2024, 10, 5) // Nov 5

      const dueDates = getInstallmentDueDates(purchaseDate, card, 4)

      expect(dueDates[0].getFullYear()).toBe(2024)
      expect(dueDates[0].getMonth()).toBe(10) // Nov
      expect(dueDates[1].getMonth()).toBe(11) // Dec
      expect(dueDates[2].getFullYear()).toBe(2025)
      expect(dueDates[2].getMonth()).toBe(0) // Jan 2025
    })

    it('returns single date for 1 installment', () => {
      const card = { closing_day: 10, due_day: 20 }
      const purchaseDate = new Date(2024, 5, 5)

      const dueDates = getInstallmentDueDates(purchaseDate, card, 1)

      expect(dueDates).toHaveLength(1)
    })
  })

  describe('isDueSoon', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 0, 15)) // Jan 15, 2024
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns true if due date is within threshold', () => {
      const dueDate = new Date(2024, 0, 17) // Jan 17, 2 days away

      expect(isDueSoon(dueDate, 3)).toBe(true)
    })

    it('returns false if due date is past threshold', () => {
      const dueDate = new Date(2024, 0, 20) // Jan 20, 5 days away

      expect(isDueSoon(dueDate, 3)).toBe(false)
    })

    it('returns false if due date is in the past', () => {
      const dueDate = new Date(2024, 0, 10) // Jan 10, past

      expect(isDueSoon(dueDate, 3)).toBe(false)
    })

    it('accepts string date', () => {
      const dueDate = '2024-01-17'

      expect(isDueSoon(dueDate, 3)).toBe(true)
    })

    it('uses default threshold of 3 days', () => {
      const dueDate = new Date(2024, 0, 17)

      expect(isDueSoon(dueDate)).toBe(true)
    })

    it('returns true if due today', () => {
      const dueDate = new Date(2024, 0, 15)

      expect(isDueSoon(dueDate, 3)).toBe(true)
    })
  })

  describe('isOverdue', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2024, 0, 15)) // Jan 15, 2024
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns true if due date is in the past', () => {
      const dueDate = new Date(2024, 0, 10) // Jan 10

      expect(isOverdue(dueDate)).toBe(true)
    })

    it('returns false if due date is today', () => {
      const dueDate = new Date(2024, 0, 15) // Jan 15, today

      expect(isOverdue(dueDate)).toBe(false)
    })

    it('returns false if due date is in the future', () => {
      const dueDate = new Date(2024, 0, 20) // Jan 20

      expect(isOverdue(dueDate)).toBe(false)
    })

    it('accepts string date', () => {
      const dueDate = '2024-01-10'

      expect(isOverdue(dueDate)).toBe(true)
    })
  })
})
