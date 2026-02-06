"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PricingTable } from "@/components/pricing/pricing-table"
import { QueryProvider } from "@/components/providers/query-provider"
import { ArrowLeft, Wallet } from "lucide-react"

function PricingPageContent() {
  const searchParams = useSearchParams()
  const canceled = searchParams.get("canceled")

  useEffect(() => {
    if (canceled) {
      toast.info("Checkout cancelado. Você pode tentar novamente quando quiser.")
    }
  }, [canceled])

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">KYN App</h1>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Escolha o plano ideal para você
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Controle suas finanças pelo WhatsApp. Envie mensagens de texto, áudio ou foto de recibos e deixe a IA fazer o resto.
          </p>
        </div>

        <PricingTable showFreePlan />

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Todos os planos incluem 7 dias de garantia.</p>
          <p className="mt-1">
            Cancele a qualquer momento direto no portal de pagamento.
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Ainda não tem uma conta?
          </p>
          <Button variant="outline" asChild>
            <Link href="/cadastro">Criar conta grátis</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <QueryProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      }>
        <PricingPageContent />
      </Suspense>
    </QueryProvider>
  )
}
