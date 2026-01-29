"use client"

import { Crown, Check, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCreateCheckout } from "@/lib/hooks/use-subscription"
import { useWhatsappUsage } from "@/lib/hooks/use-subscription"

interface StepProps {
  onNext: () => void
}

const PRO_FEATURES = [
  "WhatsApp ilimitado",
  "Categorias personalizadas",
  "Relatórios avançados",
  "Suporte prioritário",
]

export function ProOfferStep({ onNext }: StepProps) {
  const { isPremium } = useWhatsappUsage()
  const createCheckout = useCreateCheckout()

  const handleUpgrade = async () => {
    try {
      const { url } = await createCheckout.mutateAsync("pro")
      window.location.href = url
    } catch (error) {
      // User will see the error in the UI
    }
  }

  if (isPremium) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold">Você já é Pro!</h2>
          <p className="text-sm text-muted-foreground">
            Aproveite todos os recursos premium do Meu Bolso
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Clique em "Começar" para acessar o app
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
        </div>
        <h2 className="text-xl font-semibold">Turbine seu controle financeiro</h2>
        <p className="text-sm text-muted-foreground">
          Desbloqueie recursos premium com o plano Pro
        </p>
      </div>

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">Plano Pro</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">R$ 19,90</p>
              <p className="text-xs text-muted-foreground">/mês</p>
            </div>
          </div>

          <div className="space-y-2">
            {PRO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            onClick={handleUpgrade}
            disabled={createCheckout.isPending}
          >
            <Crown className="h-4 w-4 mr-2" />
            Assinar Pro
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Você pode continuar com o plano gratuito e fazer upgrade depois
      </p>
    </div>
  )
}
