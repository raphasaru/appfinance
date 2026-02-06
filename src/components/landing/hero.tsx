import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mic, Camera, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MessageCircle className="h-4 w-4" />
            Integração WhatsApp
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Controle suas finanças pelo{" "}
            <span className="text-primary">WhatsApp</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Registre gastos enviando mensagem de texto, áudio ou foto.
            Simples assim. Sem apps complicados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/cadastro">
                Começar grátis
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span>Texto</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              <span>Áudio</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              <span>Foto</span>
            </div>
          </div>
        </div>

        {/* Mock WhatsApp conversation */}
        <div className="mt-16 max-w-md mx-auto">
          <div className="bg-card border rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-primary px-4 py-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-semibold">KA</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">KYN App</p>
                <p className="text-white/70 text-xs">online</p>
              </div>
            </div>
            <div className="p-4 space-y-3 bg-[#e5ddd5] dark:bg-muted/50 min-h-[200px]">
              <div className="flex justify-end">
                <div className="bg-[#dcf8c6] dark:bg-primary/20 px-3 py-2 rounded-lg max-w-[80%]">
                  <p className="text-sm text-foreground">Almocei 45 reais no restaurante</p>
                  <p className="text-[10px] text-muted-foreground text-right mt-1">12:30</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white dark:bg-card px-3 py-2 rounded-lg max-w-[80%]">
                  <p className="text-sm text-foreground">✅ Registrado! Despesa de R$ 45,00 em Alimentação</p>
                  <p className="text-[10px] text-muted-foreground mt-1">12:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
