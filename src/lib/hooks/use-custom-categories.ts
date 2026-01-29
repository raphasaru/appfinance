"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert } from "@/lib/database.types";
import { useSubscription } from "./use-subscription";
import { isPremiumPlan } from "@/lib/stripe/plans";

export type CustomCategory = Tables<"custom_categories">;
export type CustomCategoryInsert = Omit<TablesInsert<"custom_categories">, "user_id">;

export function useCustomCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["custom-categories"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("custom_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as CustomCategory[];
    },
  });
}

export function useCreateCustomCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { data: subscription } = useSubscription();

  return useMutation({
    mutationFn: async (category: CustomCategoryInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Check if user is Pro
      const plan = subscription?.plan ?? "free";
      if (!isPremiumPlan(plan)) {
        throw new Error("Categorias personalizadas são exclusivas para usuários Pro");
      }

      const { data, error } = await supabase
        .from("custom_categories")
        .insert({
          ...category,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Já existe uma categoria com esse nome");
        }
        throw error;
      }

      return data as CustomCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-categories"] });
    },
  });
}

export function useUpdateCustomCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CustomCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from("custom_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Já existe uma categoria com esse nome");
        }
        throw error;
      }

      return data as CustomCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-categories"] });
    },
  });
}

export function useDeleteCustomCategory() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("custom_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// Hook to check if user can create custom categories
export function useCanCreateCustomCategory() {
  const { data: subscription, isLoading } = useSubscription();
  const plan = subscription?.plan ?? "free";

  return {
    canCreate: isPremiumPlan(plan),
    isLoading,
    plan,
  };
}
