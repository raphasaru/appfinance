import { describe, it, expect } from 'vitest'
import {
  PLANS,
  FREE_WHATSAPP_LIMIT,
  getPlanByPriceId,
  getPlanById,
  isPremiumPlan,
  getWhatsappLimit,
  formatPrice,
  type SubscriptionPlan,
} from '@/lib/stripe/plans'

describe('plans utils', () => {
  describe('PLANS constant', () => {
    it('has free plan', () => {
      expect(PLANS.free).toBeDefined()
      expect(PLANS.free.id).toBe('free')
      expect(PLANS.free.price).toBe(0)
    })

    it('has pro plan', () => {
      expect(PLANS.pro).toBeDefined()
      expect(PLANS.pro.id).toBe('pro')
      expect(PLANS.pro.price).toBe(19.90)
      expect(PLANS.pro.interval).toBe('month')
    })

    it('has pro_annual plan', () => {
      expect(PLANS.pro_annual).toBeDefined()
      expect(PLANS.pro_annual.id).toBe('pro_annual')
      expect(PLANS.pro_annual.price).toBe(179.90)
      expect(PLANS.pro_annual.interval).toBe('year')
    })

    it('free plan has WhatsApp limit of 30', () => {
      expect(PLANS.free.whatsappLimit).toBe(30)
    })

    it('pro plans have unlimited WhatsApp', () => {
      expect(PLANS.pro.whatsappLimit).toBe('unlimited')
      expect(PLANS.pro_annual.whatsappLimit).toBe('unlimited')
    })
  })

  describe('FREE_WHATSAPP_LIMIT', () => {
    it('equals 30', () => {
      expect(FREE_WHATSAPP_LIMIT).toBe(30)
    })
  })

  describe('getPlanById', () => {
    it('returns correct plan for each id', () => {
      expect(getPlanById('free').id).toBe('free')
      expect(getPlanById('pro').id).toBe('pro')
      expect(getPlanById('pro_annual').id).toBe('pro_annual')
    })
  })

  describe('isPremiumPlan', () => {
    it('returns false for free plan', () => {
      expect(isPremiumPlan('free')).toBe(false)
    })

    it('returns true for pro plan', () => {
      expect(isPremiumPlan('pro')).toBe(true)
    })

    it('returns true for pro_annual plan', () => {
      expect(isPremiumPlan('pro_annual')).toBe(true)
    })

    it('returns false for null', () => {
      expect(isPremiumPlan(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isPremiumPlan(undefined)).toBe(false)
    })
  })

  describe('getWhatsappLimit', () => {
    it('returns FREE_WHATSAPP_LIMIT for free plan', () => {
      expect(getWhatsappLimit('free')).toBe(30)
    })

    it('returns Infinity for pro plan', () => {
      expect(getWhatsappLimit('pro')).toBe(Infinity)
    })

    it('returns Infinity for pro_annual plan', () => {
      expect(getWhatsappLimit('pro_annual')).toBe(Infinity)
    })

    it('returns FREE_WHATSAPP_LIMIT for null', () => {
      expect(getWhatsappLimit(null)).toBe(30)
    })
  })

  describe('formatPrice', () => {
    it('formats price in BRL', () => {
      const formatted = formatPrice(19.90)
      expect(formatted).toContain('19')
      expect(formatted).toContain('90')
    })

    it('formats zero price', () => {
      const formatted = formatPrice(0)
      expect(formatted).toContain('0')
    })

    it('formats large price', () => {
      const formatted = formatPrice(179.90)
      expect(formatted).toContain('179')
    })
  })
})
