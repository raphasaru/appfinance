import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Termos de Uso | Meu Bolso",
  description: "Termos e condições de uso do Meu Bolso",
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-muted-foreground mb-8">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Definições</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Meu Bolso</strong> é uma plataforma de gestão financeira pessoal que permite o registro e acompanhamento de receitas, despesas e orçamentos.
              <strong> Usuário</strong> é toda pessoa física que se cadastra e utiliza os serviços da plataforma.
              <strong> Serviço</strong> compreende todas as funcionalidades oferecidas pelo Meu Bolso, incluindo integração com WhatsApp para registro de transações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar o Meu Bolso, você deve criar uma conta com informações verdadeiras e mantê-las atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso. Caso identifique uso não autorizado, notifique-nos imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Uso do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              O serviço deve ser utilizado apenas para fins de gestão financeira pessoal. É proibido usar a plataforma para atividades ilegais, fraudulentas ou que violem direitos de terceiros. O usuário é responsável por todos os dados inseridos na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Pagamentos e Assinatura</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Meu Bolso oferece planos gratuitos e pagos. Os pagamentos são processados via Stripe de forma segura. Assinaturas são renovadas automaticamente até que sejam canceladas. O cancelamento pode ser feito a qualquer momento, mantendo o acesso até o fim do período pago.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Integração WhatsApp</h2>
            <p className="text-muted-foreground leading-relaxed">
              A funcionalidade de registro via WhatsApp é opcional e requer vinculação do número de telefone. As mensagens enviadas são processadas apenas para registro de transações financeiras. O plano gratuito possui limite de 30 mensagens por mês.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo do Meu Bolso, incluindo marca, design e código, é protegido por direitos autorais. Os dados inseridos pelo usuário permanecem de sua propriedade. Ao usar o serviço, você concede ao Meu Bolso licença para processar seus dados conforme necessário para a prestação do serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O Meu Bolso é uma ferramenta de organização e não oferece consultoria financeira. Não nos responsabilizamos por decisões financeiras tomadas com base nas informações da plataforma. O serviço é fornecido "como está", sem garantias de disponibilidade ininterrupta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Rescisão</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você pode encerrar sua conta a qualquer momento. Podemos suspender ou encerrar contas que violem estes termos. Após o encerramento, seus dados serão retidos por 30 dias antes da exclusão permanente, salvo obrigação legal em contrário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Alterações nos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar estes termos periodicamente. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma. O uso continuado após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Lei Aplicável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de São Paulo, SP, com exclusão de qualquer outro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dúvidas sobre estes termos podem ser enviadas para contato@meubolso.app.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Ao usar o Meu Bolso, você concorda com estes termos de uso e nossa{" "}
            <Link href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
