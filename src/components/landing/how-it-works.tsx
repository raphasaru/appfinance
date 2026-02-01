import { UserPlus, Smartphone, MessageCircle, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "1",
    title: "Crie sua conta",
    description: "Cadastre-se em segundos com seu e-mail",
  },
  {
    icon: Smartphone,
    step: "2",
    title: "Vincule seu WhatsApp",
    description: "Conecte seu número para enviar transações",
  },
  {
    icon: MessageCircle,
    step: "3",
    title: "Envie seus gastos",
    description: "Texto, áudio ou foto - a IA faz o resto",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground">
            Comece a usar em menos de 2 minutos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-border" />
              )}
              <div className="relative inline-flex">
                <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
              </div>
              <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
