"use client"

import { Wallet, TrendingUp, MessageSquare, Shield } from "lucide-react"

interface StepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: StepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Wallet className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Bem-vindo ao KYN App!</h1>
        <p className="text-muted-foreground">
          Vamos configurar sua conta em alguns passos rápidos
        </p>
      </div>

      <div className="space-y-4">
        <FeatureCard
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          title="Controle suas finanças"
          description="Registre receitas e despesas facilmente"
        />
        <FeatureCard
          icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
          title="Integração com WhatsApp"
          description="Lance transações por mensagem de texto ou áudio"
        />
        <FeatureCard
          icon={<Shield className="h-5 w-5 text-purple-500" />}
          title="Seus dados são seguros"
          description="Armazenamento criptografado e privado"
        />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Você pode pular este setup e configurar depois
      </p>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
