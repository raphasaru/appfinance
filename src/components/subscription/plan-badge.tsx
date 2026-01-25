"use client"

import { Badge } from "@/components/ui/badge"
import { Crown, User } from "lucide-react"
import { useSubscription } from "@/lib/hooks/use-subscription"
import { isPremiumPlan } from "@/lib/stripe/plans"
import { cn } from "@/lib/utils"
import type { SubscriptionPlan } from "@/lib/database.types"

interface PlanBadgeProps {
  plan?: SubscriptionPlan | null
  showIcon?: boolean
  className?: string
}

export function PlanBadge({ plan: propPlan, showIcon = true, className }: PlanBadgeProps) {
  const { data: subscription } = useSubscription()
  const plan = propPlan ?? (subscription?.plan as SubscriptionPlan) ?? 'free'
  const isPremium = isPremiumPlan(plan)

  return (
    <Badge
      variant={isPremium ? "default" : "secondary"}
      className={cn(className)}
    >
      {showIcon && (
        isPremium ? (
          <Crown className="h-3 w-3 mr-1" />
        ) : (
          <User className="h-3 w-3 mr-1" />
        )
      )}
      {isPremium ? "Pro" : "Free"}
    </Badge>
  )
}
