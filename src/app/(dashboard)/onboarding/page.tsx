"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { OnboardingWizard } from "@/components/onboarding"
import { useProfile } from "@/lib/hooks/use-profile"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: profile, isLoading } = useProfile()

  useEffect(() => {
    if (!isLoading && profile?.onboarding_completed) {
      router.replace("/dashboard")
    }
  }, [profile, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (profile?.onboarding_completed) {
    return null
  }

  return <OnboardingWizard initialStep={profile?.onboarding_step || 0} />
}
