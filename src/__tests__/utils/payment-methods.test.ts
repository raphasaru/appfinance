import { describe, it, expect } from 'vitest'
import {
  getPaymentMethodLabel,
  getPaymentMethodIcon,
  getPaymentMethodColor,
  PAYMENT_METHOD_CONFIG,
} from '@/lib/utils/payment-methods'
import type { PaymentMethod } from '@/lib/utils/payment-methods'

describe('payment-methods utils', () => {
  describe('getPaymentMethodLabel', () => {
    it('returns correct label for pix', () => {
      expect(getPaymentMethodLabel('pix')).toBe('Pix')
    })

    it('returns correct label for cash', () => {
      expect(getPaymentMethodLabel('cash')).toBe('Dinheiro')
    })

    it('returns correct label for debit', () => {
      expect(getPaymentMethodLabel('debit')).toBe('Débito')
    })

    it('returns correct label for credit', () => {
      expect(getPaymentMethodLabel('credit')).toBe('Crédito')
    })

    it('returns correct label for transfer', () => {
      expect(getPaymentMethodLabel('transfer')).toBe('Transferência')
    })

    it('returns correct label for boleto', () => {
      expect(getPaymentMethodLabel('boleto')).toBe('Boleto')
    })

    it('returns empty string for null', () => {
      expect(getPaymentMethodLabel(null)).toBe('')
    })
  })

  describe('getPaymentMethodIcon', () => {
    it('returns icon component for each method', () => {
      const methods: PaymentMethod[] = ['pix', 'cash', 'debit', 'credit', 'transfer', 'boleto']

      methods.forEach((method) => {
        const icon = getPaymentMethodIcon(method)
        expect(icon).not.toBeNull()
      })
    })

    it('returns null for null input', () => {
      expect(getPaymentMethodIcon(null)).toBeNull()
    })
  })

  describe('getPaymentMethodColor', () => {
    it('returns teal for pix', () => {
      expect(getPaymentMethodColor('pix')).toBe('text-teal-500')
    })

    it('returns green for cash', () => {
      expect(getPaymentMethodColor('cash')).toBe('text-green-500')
    })

    it('returns blue for debit', () => {
      expect(getPaymentMethodColor('debit')).toBe('text-blue-500')
    })

    it('returns purple for credit', () => {
      expect(getPaymentMethodColor('credit')).toBe('text-purple-500')
    })

    it('returns orange for transfer', () => {
      expect(getPaymentMethodColor('transfer')).toBe('text-orange-500')
    })

    it('returns gray for boleto', () => {
      expect(getPaymentMethodColor('boleto')).toBe('text-gray-500')
    })

    it('returns empty string for null', () => {
      expect(getPaymentMethodColor(null)).toBe('')
    })
  })

  describe('PAYMENT_METHOD_CONFIG', () => {
    it('has all required payment methods', () => {
      const expectedMethods: PaymentMethod[] = ['pix', 'cash', 'debit', 'credit', 'transfer', 'boleto']

      expectedMethods.forEach((method) => {
        expect(PAYMENT_METHOD_CONFIG[method]).toBeDefined()
        expect(PAYMENT_METHOD_CONFIG[method].label).toBeDefined()
        expect(PAYMENT_METHOD_CONFIG[method].icon).toBeDefined()
        expect(PAYMENT_METHOD_CONFIG[method].color).toBeDefined()
      })
    })

    it('all labels are non-empty strings', () => {
      Object.values(PAYMENT_METHOD_CONFIG).forEach((config) => {
        expect(typeof config.label).toBe('string')
        expect(config.label.length).toBeGreaterThan(0)
      })
    })
  })
})
