"use client"

import { MessageSquare, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWhatsAppLink } from "@/lib/hooks/use-whatsapp"
import { useWhatsappUsage } from "@/lib/hooks/use-subscription"

interface StepProps {
  onNext: () => void
}

export function WhatsAppStep({ onNext }: StepProps) {
  const { data: link, isLoading } = useWhatsAppLink()
  const usage = useWhatsappUsage()

  const isLinked = link?.verified_at !== null

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/10 mb-2">
          <MessageSquare className="h-6 w-6 text-green-500" />
        </div>
        <h2 className="text-xl font-semibold">WhatsApp</h2>
        <p className="text-sm text-muted-foreground">
          Lance transações enviando mensagens de texto ou áudio
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isLinked && link ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">WhatsApp vinculado</p>
                  <p className="text-sm text-muted-foreground">{link.phone_number}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600">
                Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              WhatsApp não vinculado
            </p>
            <p className="text-xs text-muted-foreground">
              Vincule em Configurações → WhatsApp
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium">Como funciona:</p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              Envie "Mercado 150" para registrar uma despesa
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              Envie áudio descrevendo a transação
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              Envie foto de nota fiscal para lançar vários itens
            </li>
          </ul>
        </CardContent>
      </Card>

      {!usage.isPremium && (
        <p className="text-center text-xs text-muted-foreground">
          Plano gratuito: {usage.limit - usage.used} mensagens restantes este mês
        </p>
      )}
    </div>
  )
}
