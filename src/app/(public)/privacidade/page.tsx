import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Política de Privacidade | Meu Bolso",
  description: "Política de privacidade e proteção de dados do Meu Bolso",
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-16">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-muted-foreground mb-8">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <p className="text-muted-foreground leading-relaxed">
              Esta Política de Privacidade descreve como o Meu Bolso coleta, usa e protege seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Dados Coletados</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Coletamos os seguintes tipos de dados:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Dados de cadastro:</strong> nome, e-mail</li>
              <li><strong>Dados financeiros:</strong> transações, contas bancárias, cartões, orçamentos (inseridos por você)</li>
              <li><strong>Dados de uso:</strong> logs de acesso, preferências</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pelo Stripe, não armazenamos dados de cartão</li>
              <li><strong>Dados de WhatsApp:</strong> número de telefone (quando vinculado) e mensagens para registro de transações</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Finalidade do Uso</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">Seus dados são utilizados para:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Fornecer e melhorar nossos serviços de gestão financeira</li>
              <li>Processar transações e pagamentos de assinatura</li>
              <li>Enviar comunicações sobre sua conta e atualizações do serviço</li>
              <li>Processar mensagens de WhatsApp para registro automático de transações</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Base Legal</h2>
            <p className="text-muted-foreground leading-relaxed">
              O tratamento de seus dados é realizado com base em: (i) execução de contrato para prestação do serviço; (ii) consentimento para funcionalidades opcionais como WhatsApp; (iii) legítimo interesse para melhorias e segurança; (iv) cumprimento de obrigação legal quando aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Seus dados podem ser compartilhados com:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Supabase:</strong> infraestrutura de banco de dados e autenticação</li>
              <li><strong>Stripe:</strong> processamento de pagamentos</li>
              <li><strong>Vercel:</strong> hospedagem da aplicação</li>
              <li><strong>WhatsApp/Meta:</strong> para funcionalidade de mensagens (quando ativado)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Todos os parceiros são selecionados por seus padrões de segurança e privacidade. Não vendemos seus dados a terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Como titular de dados, você tem direito a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Acesso:</strong> solicitar cópia dos seus dados</li>
              <li><strong>Correção:</strong> corrigir dados incompletos ou desatualizados</li>
              <li><strong>Exclusão:</strong> solicitar a remoção dos seus dados</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
              <li><strong>Revogação:</strong> retirar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> opor-se ao tratamento em determinadas situações</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Para exercer seus direitos, entre em contato pelo e-mail dpo@meubolso.app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Seus dados são mantidos enquanto sua conta estiver ativa. Após solicitação de exclusão ou encerramento da conta, os dados são removidos em até 30 dias, exceto quando houver obrigação legal de retenção. Dados de transações financeiras podem ser mantidos por até 5 anos para fins fiscais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Segurança</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas técnicas e organizacionais para proteger seus dados, incluindo: criptografia em trânsito (TLS) e em repouso, autenticação segura, controle de acesso, monitoramento de segurança e backups regulares. Apesar dos esforços, nenhum sistema é 100% seguro, e você é responsável por proteger suas credenciais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies essenciais para funcionamento da plataforma (autenticação e preferências). Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Transferência Internacional</h2>
            <p className="text-muted-foreground leading-relaxed">
              Alguns de nossos parceiros podem processar dados fora do Brasil. Nestes casos, garantimos que as transferências ocorram com salvaguardas adequadas conforme exigido pela LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Alterações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política pode ser atualizada. Alterações significativas serão comunicadas por e-mail ou notificação na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contato e DPO</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões sobre privacidade ou para exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <p className="text-muted-foreground mt-2">
              E-mail: dpo@meubolso.app
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Ao usar o Meu Bolso, você concorda com esta política de privacidade e nossos{" "}
            <Link href="/termos" className="text-primary hover:underline">
              Termos de Uso
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
