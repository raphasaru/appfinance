import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrency, formatCurrencyInput } from '@/lib/utils/currency'

describe('currency utils', () => {
  describe('formatCurrency', () => {
    it('formats positive values correctly', () => {
      expect(formatCurrency(1234.56)).toBe('R$\u00A01.234,56')
    })

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('R$\u00A00,00')
    })

    it('formats negative values correctly', () => {
      expect(formatCurrency(-500.99)).toBe('-R$\u00A0500,99')
    })

    it('rounds to 2 decimal places', () => {
      expect(formatCurrency(100.999)).toBe('R$\u00A0101,00')
    })

    it('handles large values', () => {
      expect(formatCurrency(1000000.00)).toBe('R$\u00A01.000.000,00')
    })

    it('handles small decimals', () => {
      expect(formatCurrency(0.01)).toBe('R$\u00A00,01')
    })
  })

  describe('parseCurrency', () => {
    it('parses formatted BRL string', () => {
      expect(parseCurrency('R$ 1.234,56')).toBe(1234.56)
    })

    it('parses value with only decimal', () => {
      expect(parseCurrency('100,50')).toBe(100.50)
    })

    it('parses value without formatting', () => {
      expect(parseCurrency('1234')).toBe(1234)
    })

    it('returns 0 for empty string', () => {
      expect(parseCurrency('')).toBe(0)
    })

    it('returns 0 for invalid input', () => {
      expect(parseCurrency('abc')).toBe(0)
    })

    it('handles negative values', () => {
      expect(parseCurrency('-R$ 500,00')).toBe(-500)
    })

    it('handles values with spaces', () => {
      expect(parseCurrency('  R$ 100,00  ')).toBe(100)
    })
  })

  describe('formatCurrencyInput', () => {
    it('formats input as user types', () => {
      expect(formatCurrencyInput('100')).toBe('R$\u00A01,00')
    })

    it('formats larger amounts', () => {
      expect(formatCurrencyInput('12345')).toBe('R$\u00A0123,45')
    })

    it('returns empty string for empty input', () => {
      expect(formatCurrencyInput('')).toBe('')
    })

    it('ignores non-numeric characters', () => {
      expect(formatCurrencyInput('1a2b3')).toBe('R$\u00A01,23')
    })

    it('handles single digit', () => {
      expect(formatCurrencyInput('5')).toBe('R$\u00A00,05')
    })

    it('handles leading zeros correctly', () => {
      expect(formatCurrencyInput('0001')).toBe('R$\u00A00,01')
    })
  })
})
