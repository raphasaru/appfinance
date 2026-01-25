"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PricingCard } from "./pricing-card"
import { PLANS } from "@/lib/stripe/plans"
import { useCreateCheckout, useSubscription } from "@/lib/hooks/use-subscription"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SubscriptionPlan } from "@/lib/database.types"

interface PricingTableProps {
  showFreePlan?: boolean
}

export function PricingTable({ showFreePlan = true }: PricingTableProps) {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const router = useRouter()
  const { data: subscription } = useSubscription()
  const createCheckout = useCreateCheckout()

  const currentPlan = (subscription?.plan ?? 'free') as SubscriptionPlan

  const handleSelectPlan = async (planId: SubscriptionPlan) => {
    try {
      const result = await createCheckout.mutateAsync(planId)
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento")
    }
  }

  const visiblePlans = Object.values(PLANS).filter(plan => {
    if (!showFreePlan && plan.id === 'free') return false
    if (billingInterval === 'month' && plan.id === 'pro_annual') return false
    if (billingInterval === 'year' && plan.id === 'pro') return false
    return true
  })

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Tabs
          value={billingInterval}
          onValueChange={(v) => setBillingInterval(v as 'month' | 'year')}
        >
          <TabsList>
            <TabsTrigger value="month">Mensal</TabsTrigger>
            <TabsTrigger value="year">
              Anual <span className="ml-1 text-xs text-primary">-25%</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className={`grid gap-6 ${showFreePlan ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-md mx-auto'}`}>
        {visiblePlans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan === plan.id ||
              (currentPlan === 'pro' && plan.id === 'pro_annual') ||
              (currentPlan === 'pro_annual' && plan.id === 'pro')}
            onSelect={() => handleSelectPlan(plan.id)}
            isLoading={createCheckout.isPending}
          />
        ))}
      </div>
    </div>
  )
}
