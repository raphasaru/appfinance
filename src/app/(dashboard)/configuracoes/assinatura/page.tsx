"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { toast } from "sonner"
import { CreditCard, Loader2 } from "lucide-react"
import { BillingSettings } from "@/components/subscription/billing-settings"
import { useRefreshSubscription } from "@/lib/hooks/use-subscription"

function SubscriptionPageContent() {
  const searchParams = useSearchParams()
  const success = searchParams.get("success")
  const refreshSubscription = useRefreshSubscription()

  useEffect(() => {
    if (success) {
      // Refresh subscription data after successful checkout
      refreshSubscription.mutate()
      toast.success("Assinatura ativada com sucesso! Bem-vindo ao plano Pro.")
    }
  }, [success])

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">Assinatura</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Gerencie seu plano e método de pagamento.
      </p>

      <BillingSettings />
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SubscriptionPageContent />
    </Suspense>
  )
}
