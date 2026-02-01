import {
  MessageCircle,
  PiggyBank,
  Wallet,
  BarChart3,
  Mic,
  Camera,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MessageCircle,
    title: "WhatsApp Integrado",
    description:
      "Registre gastos enviando texto, áudio ou foto. A IA entende e categoriza automaticamente.",
  },
  {
    icon: PiggyBank,
    title: "Orçamento por Categoria",
    description:
      "Defina limites mensais para cada categoria e acompanhe em tempo real.",
  },
  {
    icon: Wallet,
    title: "Múltiplas Contas",
    description:
      "Gerencie contas correntes, poupanças e investimentos em um só lugar.",
  },
  {
    icon: CreditCard,
    title: "Cartões de Crédito",
    description:
      "Acompanhe o limite, fatura atual e data de vencimento de cada cartão.",
  },
  {
    icon: RefreshCw,
    title: "Recorrentes",
    description:
      "Configure despesas e receitas que se repetem todo mês automaticamente.",
  },
  {
    icon: BarChart3,
    title: "Gráficos e Relatórios",
    description:
      "Visualize para onde vai seu dinheiro com gráficos claros e intuitivos.",
  },
];

export function Features() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para organizar suas finanças
          </h2>
          <p className="text-lg text-muted-foreground">
            Simples de usar, completo onde importa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
