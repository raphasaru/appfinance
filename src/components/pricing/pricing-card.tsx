"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Plan, formatPrice } from "@/lib/stripe/plans"

interface PricingCardProps {
  plan: Plan
  isCurrentPlan?: boolean
  onSelect?: () => void
  isLoading?: boolean
}

export function PricingCard({ plan, isCurrentPlan, onSelect, isLoading }: PricingCardProps) {
  const isPro = plan.id === 'pro' || plan.id === 'pro_annual'
  const isFree = plan.id === 'free'

  return (
    <Card className={cn(
      "relative flex flex-col",
      plan.popular && "border-primary shadow-lg"
    )}>
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Mais popular
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
            {!isFree && (
              <span className="text-muted-foreground">
                /{plan.interval === 'month' ? 'mês' : 'ano'}
              </span>
            )}
          </div>
          {plan.priceYearly && plan.interval === 'year' && (
            <p className="text-sm text-muted-foreground mt-1">
              Equivale a {formatPrice(plan.priceYearly / 12)}/mês
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {isCurrentPlan ? (
          <Button className="w-full" variant="outline" disabled>
            Plano atual
          </Button>
        ) : isFree ? (
          <Button className="w-full" variant="outline" disabled>
            Plano gratuito
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={onSelect}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Assinar agora"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
