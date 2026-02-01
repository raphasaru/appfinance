import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getUpgradeUrl,
  getLimitReachedMessage,
} from '@/lib/utils/check-limits'

describe('check-limits utils', () => {
  describe('getUpgradeUrl', () => {
    beforeEach(() => {
      vi.unstubAllEnvs()
    })

    it('returns provided baseUrl with /pricing', () => {
      expect(getUpgradeUrl('https://example.com')).toBe('https://example.com/pricing')
    })

    it('uses NEXT_PUBLIC_APP_URL when no baseUrl provided', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://meubolso.app')

      expect(getUpgradeUrl()).toBe('https://meubolso.app/pricing')
    })

    it('uses fallback when no baseUrl and no env var', () => {
      vi.stubEnv('NEXT_PUBLIC_APP_URL', '')

      expect(getUpgradeUrl()).toContain('/pricing')
    })
  })

  describe('getLimitReachedMessage', () => {
    it('includes messages used count', () => {
      const message = getLimitReachedMessage(30)

      expect(message).toContain('30')
    })

    it('includes upgrade URL', () => {
      const message = getLimitReachedMessage(30)

      expect(message).toContain('/pricing')
    })

    it('mentions WhatsApp', () => {
      const message = getLimitReachedMessage(30)

      expect(message).toContain('WhatsApp')
    })

    it('mentions Pro plan', () => {
      const message = getLimitReachedMessage(30)

      expect(message).toContain('Pro')
    })

    it('mentions renewal', () => {
      const message = getLimitReachedMessage(30)

      expect(message).toContain('mês')
    })
  })
})
