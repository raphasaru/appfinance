"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Subscription, SubscriptionPlan } from "@/lib/database.types";
import { FREE_WHATSAPP_LIMIT, isPremiumPlan } from "@/lib/stripe/plans";

export function useSubscription() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // If no subscription exists, return a default free subscription
      if (!data) {
        return {
          id: '',
          user_id: user.id,
          plan: 'free' as SubscriptionPlan,
          status: 'active',
          whatsapp_messages_used: 0,
          whatsapp_messages_reset_at: new Date().toISOString(),
          stripe_customer_id: null,
          stripe_subscription_id: null,
          current_period_end: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Subscription;
      }

      return data as Subscription;
    },
  });
}

export function useWhatsappUsage() {
  const { data: subscription, isLoading } = useSubscription();

  const used = subscription?.whatsapp_messages_used ?? 0;
  const plan = (subscription?.plan ?? 'free') as SubscriptionPlan;
  const isPremium = isPremiumPlan(plan);
  const limit = isPremium ? Infinity : FREE_WHATSAPP_LIMIT;
  const remaining = Math.max(0, limit - used);
  const percentage = isPremium ? 0 : Math.min(100, (used / limit) * 100);
  const isAtLimit = !isPremium && used >= limit;

  // Check if reset is needed (next month)
  const resetAt = subscription?.whatsapp_messages_reset_at;
  const nextReset = resetAt ? getNextMonthReset(resetAt) : null;

  return {
    used,
    limit,
    remaining,
    percentage,
    isAtLimit,
    isPremium,
    plan,
    nextReset,
    isLoading,
  };
}

function getNextMonthReset(resetAt: string): Date {
  const lastReset = new Date(resetAt);
  const nextReset = new Date(lastReset);
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);
  return nextReset;
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (planId: SubscriptionPlan) => {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar checkout');
      }

      return response.json() as Promise<{ url: string }>;
    },
  });
}

export function useOpenPortal() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao abrir portal');
      }

      return response.json() as Promise<{ url: string }>;
    },
  });
}

export function useRefreshSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Just invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}
