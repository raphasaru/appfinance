"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCompleteOnboarding, useUpdateOnboardingStep } from "@/lib/hooks/use-profile"
import { WelcomeStep } from "./welcome-step"
import { AccountsStep } from "./accounts-step"
import { CardsStep } from "./cards-step"
import { BudgetStep } from "./budget-step"
import { RecurringStep } from "./recurring-step"
import { WhatsAppStep } from "./whatsapp-step"
import { ProOfferStep } from "./pro-offer-step"

const STEPS = [
  { id: 0, component: WelcomeStep, title: "Boas-vindas" },
  { id: 1, component: AccountsStep, title: "Contas" },
  { id: 2, component: CardsStep, title: "Cartões" },
  { id: 3, component: BudgetStep, title: "Orçamento" },
  { id: 4, component: RecurringStep, title: "Recorrentes" },
  { id: 5, component: WhatsAppStep, title: "WhatsApp" },
  { id: 6, component: ProOfferStep, title: "Plano Pro" },
]

interface OnboardingWizardProps {
  initialStep?: number
}

export function OnboardingWizard({ initialStep = 0 }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(initialStep)
  const completeOnboarding = useCompleteOnboarding()
  const updateStep = useUpdateOnboardingStep()

  const progress = ((currentStep + 1) / STEPS.length) * 100
  const StepComponent = STEPS[currentStep].component
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === STEPS.length - 1

  const goToNextStep = async () => {
    if (isLastStep) {
      await completeOnboarding.mutateAsync()
      router.push("/dashboard")
    } else {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      await updateStep.mutateAsync(nextStep)
    }
  }

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipOnboarding = async () => {
    await completeOnboarding.mutateAsync()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {STEPS.length}
            </span>
            <button
              onClick={skipOnboarding}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular
            </button>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto px-4 py-6">
          <StepComponent onNext={goToNextStep} />
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 z-10 bg-background border-t safe-area-pb">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
            className={isFirstStep ? "invisible" : ""}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>

          <Button
            onClick={goToNextStep}
            disabled={completeOnboarding.isPending || updateStep.isPending}
          >
            {isLastStep ? "Começar" : "Próximo"}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
