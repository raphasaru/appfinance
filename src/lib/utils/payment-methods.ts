import { Database } from '@/lib/database.types'
import {
  Banknote,
  CreditCard,
  QrCode,
  ArrowLeftRight,
  FileText,
  Wallet
} from 'lucide-react'

export type PaymentMethod = Database['public']['Enums']['payment_method']

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, {
  label: string
  icon: typeof CreditCard
  color: string
}> = {
  pix: {
    label: 'Pix',
    icon: QrCode,
    color: 'text-teal-500',
  },
  cash: {
    label: 'Dinheiro',
    icon: Banknote,
    color: 'text-green-500',
  },
  debit: {
    label: 'Débito',
    icon: Wallet,
    color: 'text-blue-500',
  },
  credit: {
    label: 'Crédito',
    icon: CreditCard,
    color: 'text-purple-500',
  },
  transfer: {
    label: 'Transferência',
    icon: ArrowLeftRight,
    color: 'text-orange-500',
  },
  boleto: {
    label: 'Boleto',
    icon: FileText,
    color: 'text-gray-500',
  },
}

export function getPaymentMethodLabel(method: PaymentMethod | null): string {
  if (!method) return ''
  return PAYMENT_METHOD_CONFIG[method]?.label ?? method
}

export function getPaymentMethodIcon(method: PaymentMethod | null) {
  if (!method) return null
  return PAYMENT_METHOD_CONFIG[method]?.icon ?? null
}

export function getPaymentMethodColor(method: PaymentMethod | null): string {
  if (!method) return ''
  return PAYMENT_METHOD_CONFIG[method]?.color ?? ''
}
