import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaFinal() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Pronto para organizar suas finanças?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Comece agora gratuitamente. Sem cartão de crédito.
        </p>
        <Button asChild size="lg" className="h-12 px-8 text-base">
          <Link href="/cadastro">
            Criar conta grátis
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
