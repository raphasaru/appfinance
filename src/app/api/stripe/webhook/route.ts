import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import type Stripe from 'stripe'

type SubscriptionPlan = 'pro' | 'pro_annual'

// Use service role client for webhook (no user auth)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const planId = session.metadata?.plan_id as SubscriptionPlan

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session')
    return
  }

  const subscriptionId = session.subscription as string

  // Get subscription details from Stripe
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)

  // Access current_period_end from the subscription object
  const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      plan: planId,
      status: 'active',
      current_period_end: new Date(periodEnd * 1000).toISOString(),
    }, {
      onConflict: 'user_id',
    })

  console.log(`Subscription activated for user ${userId}: ${planId}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id

  if (!userId) {
    if (!customerId) {
      console.error('Could not find customer ID for subscription update')
      return
    }

    // Try to find user by customer ID
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!existingSub?.user_id) {
      console.error('Could not find user for subscription update')
      return
    }

    await updateSubscription(existingSub.user_id, subscription)
  } else {
    await updateSubscription(userId, subscription)
  }
}

async function updateSubscription(userId: string, subscription: Stripe.Subscription) {
  const status = mapStripeStatus(subscription.status)
  const planId = subscription.metadata?.plan_id as SubscriptionPlan || 'pro'

  // Access current_period_end from the subscription object
  const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end

  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      plan: status === 'active' ? planId : 'free',
      status,
      current_period_end: new Date(periodEnd * 1000).toISOString(),
    })
    .eq('user_id', userId)

  console.log(`Subscription updated for user ${userId}: ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id

  if (!customerId) {
    console.error('Could not find customer ID for subscription deletion')
    return
  }

  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!existingSub?.user_id) {
    console.error('Could not find user for subscription deletion')
    return
  }

  await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
      current_period_end: null,
    })
    .eq('user_id', existingSub.user_id)

  console.log(`Subscription canceled for user ${existingSub.user_id}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string'
    ? invoice.customer
    : invoice.customer?.id

  if (!customerId) {
    console.error('Could not find customer ID for payment failure')
    return
  }

  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!existingSub?.user_id) {
    console.error('Could not find user for payment failure')
    return
  }

  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
    })
    .eq('user_id', existingSub.user_id)

  console.log(`Payment failed for user ${existingSub.user_id}`)
}

function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'past_due':
      return 'past_due'
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'canceled'
    default:
      return 'canceled'
  }
}
