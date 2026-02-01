import { describe, it, expect } from 'vitest'
import {
  getCategoryLabel,
  getCategoryLabelWithCustom,
  getCategoryColor,
  categoryLabels,
  categoryIcons,
  type ExpenseCategory,
  type CustomCategory,
} from '@/lib/utils/categories'

describe('categories utils', () => {
  describe('getCategoryLabel', () => {
    it('returns correct label for each category', () => {
      expect(getCategoryLabel('fixed_housing')).toBe('Moradia')
      expect(getCategoryLabel('fixed_utilities')).toBe('Contas')
      expect(getCategoryLabel('fixed_subscriptions')).toBe('Assinaturas')
      expect(getCategoryLabel('fixed_personal')).toBe('Pessoal')
      expect(getCategoryLabel('fixed_taxes')).toBe('Impostos')
      expect(getCategoryLabel('variable_credit')).toBe('Cartão')
      expect(getCategoryLabel('variable_food')).toBe('Alimentação')
      expect(getCategoryLabel('variable_transport')).toBe('Transporte')
      expect(getCategoryLabel('variable_other')).toBe('Outros')
    })

    it('returns "Sem categoria" for null', () => {
      expect(getCategoryLabel(null)).toBe('Sem categoria')
    })

    it('returns category key for unknown category', () => {
      expect(getCategoryLabel('unknown' as ExpenseCategory)).toBe('unknown')
    })
  })

  describe('getCategoryLabelWithCustom', () => {
    const customCategories: CustomCategory[] = [
      {
        id: 'custom-1',
        name: 'Viagens',
        user_id: 'user-1',
        color: '#FF5733',
        icon: null,
        is_fixed: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'custom-2',
        name: 'Educação',
        user_id: 'user-1',
        color: '#33FF57',
        icon: null,
        is_fixed: true,
        created_at: new Date().toISOString(),
      },
    ]

    it('returns custom category name when customCategoryId matches', () => {
      expect(getCategoryLabelWithCustom(null, 'custom-1', customCategories)).toBe('Viagens')
    })

    it('returns "Categoria personalizada" for unknown custom category id', () => {
      expect(getCategoryLabelWithCustom(null, 'unknown-id', customCategories)).toBe('Categoria personalizada')
    })

    it('falls back to system category when no custom category', () => {
      expect(getCategoryLabelWithCustom('fixed_housing', null, customCategories)).toBe('Moradia')
    })

    it('prioritizes custom category over system category', () => {
      expect(getCategoryLabelWithCustom('fixed_housing', 'custom-2', customCategories)).toBe('Educação')
    })
  })

  describe('getCategoryColor', () => {
    const customCategories: CustomCategory[] = [
      {
        id: 'custom-1',
        name: 'Viagens',
        user_id: 'user-1',
        color: '#FF5733',
        icon: null,
        is_fixed: false,
        created_at: new Date().toISOString(),
      },
    ]

    it('returns custom category color', () => {
      expect(getCategoryColor(null, 'custom-1', customCategories)).toBe('#FF5733')
    })

    it('returns null for system categories', () => {
      expect(getCategoryColor('fixed_housing', null, customCategories)).toBeNull()
    })

    it('returns null for unknown custom category', () => {
      expect(getCategoryColor(null, 'unknown', customCategories)).toBeNull()
    })
  })

  describe('categoryLabels object', () => {
    it('has all expected categories', () => {
      const expectedCategories: ExpenseCategory[] = [
        'fixed_housing',
        'fixed_utilities',
        'fixed_subscriptions',
        'fixed_personal',
        'fixed_taxes',
        'variable_credit',
        'variable_food',
        'variable_transport',
        'variable_other',
      ]

      expectedCategories.forEach((cat) => {
        expect(categoryLabels[cat]).toBeDefined()
      })
    })
  })

  describe('categoryIcons object', () => {
    it('has icon for each category', () => {
      const categories = Object.keys(categoryLabels) as ExpenseCategory[]

      categories.forEach((cat) => {
        expect(categoryIcons[cat]).toBeDefined()
        expect(typeof categoryIcons[cat]).toBe('string')
      })
    })
  })
})
