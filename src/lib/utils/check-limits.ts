import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { FREE_WHATSAPP_LIMIT, isPremiumPlan, type SubscriptionPlan } from '@/lib/stripe/plans'

interface WhatsAppLimitResult {
  canSend: boolean
  messagesUsed: number
  messagesLimit: number
  plan: SubscriptionPlan
  isAtLimit: boolean
}

/**
 * Check if a user can send WhatsApp messages based on their subscription.
 * Used by the WhatsApp service.
 */
export async function checkWhatsAppLimit(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<WhatsAppLimitResult> {
  // Use the database function to check and reset if needed
  const { data, error } = await supabase
    .rpc('reset_whatsapp_messages_if_needed', { p_user_id: userId })

  if (error) {
    console.error('Error checking WhatsApp limit:', error)
    // Fail closed to prevent usage beyond limit
    return {
      canSend: false,
      messagesUsed: 0,
      messagesLimit: FREE_WHATSAPP_LIMIT,
      plan: 'free',
      isAtLimit: true,
    }
  }

  const result = data?.[0]
  if (!result) {
    return {
      canSend: true,
      messagesUsed: 0,
      messagesLimit: FREE_WHATSAPP_LIMIT,
      plan: 'free',
      isAtLimit: false,
    }
  }

  const messagesUsed = result.messages_used
  const messagesLimit = result.messages_limit
  const isPremium = messagesLimit > FREE_WHATSAPP_LIMIT
  const isAtLimit = messagesUsed >= messagesLimit

  return {
    canSend: !isAtLimit,
    messagesUsed,
    messagesLimit,
    plan: isPremium ? 'pro' : 'free',
    isAtLimit,
  }
}

/**
 * Increment the WhatsApp message count for a user.
 * Returns whether the message was successfully counted.
 */
export async function incrementWhatsAppMessage(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<{ success: boolean; messagesUsed: number; messagesLimit: number }> {
  const { data, error } = await supabase
    .rpc('increment_whatsapp_message', { p_user_id: userId })

  if (error) {
    console.error('Error incrementing WhatsApp message:', error)
    return { success: false, messagesUsed: 0, messagesLimit: FREE_WHATSAPP_LIMIT }
  }

  const result = data?.[0]
  if (!result) {
    return { success: true, messagesUsed: 0, messagesLimit: FREE_WHATSAPP_LIMIT }
  }

  return {
    success: result.success,
    messagesUsed: result.messages_used,
    messagesLimit: result.messages_limit,
  }
}

/**
 * Get the upgrade URL for the pricing page
 */
export function getUpgradeUrl(baseUrl?: string): string {
  const url = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://fin.prizely.com.br'
  return `${url}/pricing`
}

/**
 * Get the message to send when user hits the limit
 */
export function getLimitReachedMessage(messagesUsed: number): string {
  return `Você atingiu o limite de ${messagesUsed} mensagens pelo WhatsApp este mês.

Para continuar usando o WhatsApp ilimitado, faça upgrade para o plano Pro:
👉 ${getUpgradeUrl()}

Seu limite será renovado no primeiro dia do próximo mês.`
}
