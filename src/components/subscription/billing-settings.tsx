"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, ExternalLink, Calendar, AlertCircle } from "lucide-react"
import { useSubscription, useOpenPortal, useRefreshSubscription } from "@/lib/hooks/use-subscription"
import { PLANS, formatPrice, isPremiumPlan } from "@/lib/stripe/plans"
import { PlanBadge } from "./plan-badge"
import { UsageMeter } from "./usage-meter"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import type { SubscriptionPlan } from "@/lib/database.types"

export function BillingSettings() {
  const { data: subscription, isLoading } = useSubscription()
  const openPortal = useOpenPortal()
  const refreshSubscription = useRefreshSubscription()

  const plan = (subscription?.plan ?? 'free') as SubscriptionPlan
  const planDetails = PLANS[plan]
  const isPremium = isPremiumPlan(plan)
  const status = subscription?.status ?? 'active'
  const periodEnd = subscription?.current_period_end

  const handleOpenPortal = async () => {
    try {
      const result = await openPortal.mutateAsync()
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao abrir portal")
    }
  }

  const handleRefresh = async () => {
    await refreshSubscription.mutateAsync()
    toast.success("Status atualizado")
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Seu plano
                <PlanBadge plan={plan} />
              </CardTitle>
              <CardDescription>
                {planDetails.description}
              </CardDescription>
            </div>
            {isPremium && (
              <div className="text-right">
                <p className="text-2xl font-bold">{formatPrice(planDetails.price)}</p>
                <p className="text-sm text-muted-foreground">
                  /{planDetails.interval === 'month' ? 'mês' : 'ano'}
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'past_due' && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Pagamento pendente</p>
                <p className="text-sm text-muted-foreground">
                  Houve um problema com seu último pagamento. Atualize seus dados de pagamento para continuar usando o plano Pro.
                </p>
              </div>
            </div>
          )}

          {status === 'canceled' && isPremium && (
            <div className="flex items-start gap-2 rounded-lg border border-orange-500/50 bg-orange-500/10 p-4">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-500">Assinatura cancelada</p>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura foi cancelada mas você ainda tem acesso até o fim do período.
                </p>
              </div>
            </div>
          )}

          {isPremium && periodEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {status === 'canceled' ? 'Acesso até' : 'Próxima cobrança em'}{' '}
                {format(new Date(periodEnd), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          )}

          <Separator />

          <UsageMeter />

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row">
            {isPremium ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleOpenPortal}
                  disabled={openPortal.isPending}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {openPortal.isPending ? "Abrindo..." : "Gerenciar pagamento"}
                </Button>
                <Button variant="ghost" onClick={handleRefresh} disabled={refreshSubscription.isPending}>
                  {refreshSubscription.isPending ? "Atualizando..." : "Atualizar status"}
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/pricing">
                  Fazer upgrade para Pro
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!isPremium && (
        <Card>
          <CardHeader>
            <CardTitle>Por que fazer upgrade?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>WhatsApp ilimitado - registre gastos sem limites</li>
              <li>Metas de economia - acompanhe seus objetivos financeiros</li>
              <li>Relatórios avançados - insights detalhados sobre seus gastos</li>
              <li>Exportação PDF - baixe relatórios para compartilhar</li>
              <li>Suporte prioritário - atendimento mais rápido</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
