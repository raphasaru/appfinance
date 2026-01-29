import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { PLANS, type Plan, type SubscriptionPlan } from '@/lib/stripe/plans'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { planId } = await request.json() as { planId: SubscriptionPlan }

    if (!planId || !['pro', 'pro_annual'].includes(planId)) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    const plan: Plan = PLANS[planId]

    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: 'Configuração de preço não encontrada' },
        { status: 500 }
      )
    }

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id

      // Save the customer ID
      await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
        }, {
          onConflict: 'user_id',
        })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fin.prizely.com.br'

    // Create checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/configuracoes/assinatura?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      locale: 'pt-BR',
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar sessão de checkout' },
      { status: 500 }
    )
  }
}
