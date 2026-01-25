"use client"

import { Progress } from "@/components/ui/progress"
import { MessageSquare, Infinity } from "lucide-react"
import { useWhatsappUsage } from "@/lib/hooks/use-subscription"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface UsageMeterProps {
  showDetails?: boolean
  className?: string
}

export function UsageMeter({ showDetails = true, className }: UsageMeterProps) {
  const { used, limit, remaining, percentage, isPremium, nextReset, isLoading } = useWhatsappUsage()

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-2 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  const isWarning = !isPremium && percentage >= 80
  const isAtLimit = !isPremium && percentage >= 100

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Mensagens WhatsApp</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {isPremium ? (
            <span className="flex items-center gap-1">
              <Infinity className="h-4 w-4" />
              Ilimitado
            </span>
          ) : (
            <span>
              <span className={cn(
                "font-medium",
                isAtLimit && "text-destructive",
                isWarning && !isAtLimit && "text-orange-500"
              )}>
                {used}
              </span>
              /{limit}
            </span>
          )}
        </div>
      </div>

      {!isPremium && (
        <Progress
          value={percentage}
          className={cn(
            "h-2",
            isAtLimit && "[&>div]:bg-destructive",
            isWarning && !isAtLimit && "[&>div]:bg-orange-500"
          )}
        />
      )}

      {showDetails && !isPremium && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {isAtLimit
              ? "Limite atingido"
              : `${remaining} mensagens restantes`}
          </span>
          {nextReset && (
            <span>
              Renova em {format(nextReset, "d 'de' MMM", { locale: ptBR })}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
