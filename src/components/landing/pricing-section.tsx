import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a organizar suas finanças",
    features: [
      "Transações ilimitadas",
      "Orçamento por categoria",
      "Múltiplas contas e cartões",
      "Gráficos e relatórios",
      "30 mensagens WhatsApp/mês",
    ],
    cta: "Começar grátis",
    href: "/cadastro",
    featured: false,
  },
  {
    name: "Pro",
    price: "R$ 19,90",
    period: "/mês",
    description: "Para quem quer o máximo do WhatsApp",
    features: [
      "Tudo do plano Free",
      "WhatsApp ilimitado",
      "Áudio e fotos no WhatsApp",
      "Suporte prioritário",
      "Novidades em primeira mão",
    ],
    cta: "Assinar Pro",
    href: "/cadastro?plan=pro",
    featured: true,
  },
];

export function PricingSection() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos simples e transparentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Comece grátis, upgrade quando precisar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.featured
                  ? "border-primary shadow-lg scale-[1.02]"
                  : "border-border"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Popular
                  </div>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className="w-full h-11"
                  variant={plan.featured ? "default" : "outline"}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Cancele a qualquer momento. Sem taxas escondidas.
        </p>
      </div>
    </section>
  );
}
