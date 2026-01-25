"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"
import { PLANS, formatPrice } from "@/lib/stripe/plans"
import { useCreateCheckout } from "@/lib/hooks/use-subscription"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: "whatsapp_limit" | "feature"
}

export function UpgradeModal({ open, onOpenChange, reason = "feature" }: UpgradeModalProps) {
  const router = useRouter()
  const createCheckout = useCreateCheckout()
  const proPlan = PLANS.pro

  const handleUpgrade = async () => {
    try {
      const result = await createCheckout.mutateAsync('pro')
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento")
    }
  }

  const handleViewPlans = () => {
    onOpenChange(false)
    router.push('/pricing')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            {reason === "whatsapp_limit"
              ? "Limite de mensagens atingido"
              : "Desbloqueie recursos premium"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {reason === "whatsapp_limit"
              ? "Você atingiu o limite de 30 mensagens pelo WhatsApp este mês."
              : "Faça upgrade para o plano Pro e tenha acesso a todos os recursos."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold">Plano Pro</span>
              <span className="font-bold text-primary">{formatPrice(proPlan.price)}/mês</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                WhatsApp ilimitado
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Metas de economia
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Relatórios avançados
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                Exportação PDF
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleUpgrade} disabled={createCheckout.isPending}>
            {createCheckout.isPending ? "Processando..." : "Fazer upgrade agora"}
          </Button>
          <Button variant="ghost" onClick={handleViewPlans}>
            Ver todos os planos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
