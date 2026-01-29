import { addMonths, format, isAfter, isBefore, setDate } from 'date-fns'

interface CreditCard {
  closing_day: number
  due_day: number
}

/**
 * Calcula o mês da fatura para uma compra feita em determinada data
 * @param purchaseDate - Data da compra
 * @param card - Cartão de crédito com closing_day e due_day
 * @returns string no formato 'YYYY-MM' representando o mês da fatura
 */
export function getFaturaMonth(purchaseDate: Date, card: CreditCard): string {
  const closingDate = setDate(purchaseDate, card.closing_day)

  // Se a compra foi feita após o fechamento, vai para a fatura do próximo mês
  if (isAfter(purchaseDate, closingDate)) {
    const nextMonth = addMonths(purchaseDate, 1)
    return format(nextMonth, 'yyyy-MM')
  }

  return format(purchaseDate, 'yyyy-MM')
}

/**
 * Calcula a data de vencimento da fatura para uma compra
 * @param purchaseDate - Data da compra
 * @param card - Cartão de crédito com closing_day e due_day
 * @returns Date representando a data de vencimento
 */
export function getDueDate(purchaseDate: Date, card: CreditCard): Date {
  const faturaMonth = getFaturaMonth(purchaseDate, card)
  const [year, month] = faturaMonth.split('-').map(Number)

  // O vencimento é no mês da fatura
  const dueDate = new Date(year, month - 1, card.due_day)

  return dueDate
}

/**
 * Calcula as datas de vencimento para todas as parcelas
 * @param purchaseDate - Data da compra
 * @param card - Cartão de crédito
 * @param totalInstallments - Número total de parcelas
 * @returns Array de datas de vencimento
 */
export function getInstallmentDueDates(
  purchaseDate: Date,
  card: CreditCard,
  totalInstallments: number
): Date[] {
  const firstDueDate = getDueDate(purchaseDate, card)
  const dueDates: Date[] = []

  for (let i = 0; i < totalInstallments; i++) {
    dueDates.push(addMonths(firstDueDate, i))
  }

  return dueDates
}

/**
 * Verifica se uma transação está vencendo em X dias
 * @param dueDate - Data de vencimento
 * @param daysThreshold - Número de dias para considerar "vencendo"
 * @returns boolean
 */
export function isDueSoon(dueDate: Date | string, daysThreshold: number = 3): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const threshold = new Date(today)
  threshold.setDate(threshold.getDate() + daysThreshold)

  return !isBefore(due, today) && isBefore(due, threshold)
}

/**
 * Verifica se uma transação está vencida
 * @param dueDate - Data de vencimento
 * @returns boolean
 */
export function isOverdue(dueDate: Date | string): boolean {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return isBefore(due, today)
}
