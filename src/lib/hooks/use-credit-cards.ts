"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";
import { ErrorMessages } from "@/lib/errors";
import { useCrypto } from "@/components/providers/crypto-provider";

type CreditCard = Tables<"credit_cards">;

export function useCreditCards() {
  const supabase = createClient();
  const { decryptRows } = useCrypto();

  return useQuery({
    queryKey: ["credit-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_cards")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return decryptRows("credit_cards", data as CreditCard[]);
    },
  });
}

export function useCreateCreditCard() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow } = useCrypto();

  return useMutation({
    mutationFn: async (card: Omit<TablesInsert<"credit_cards">, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(ErrorMessages.NOT_AUTHENTICATED);

      const encrypted = await encryptRow("credit_cards", { ...card, user_id: user.id } as Record<string, unknown>);

      const { data, error } = await supabase
        .from("credit_cards")
        .insert(encrypted)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
}

export function useUpdateCreditCard() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const { encryptRow } = useCrypto();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"credit_cards"> & { id: string }) => {
      const encrypted = await encryptRow("credit_cards", updates as Record<string, unknown>);

      const { data, error } = await supabase
        .from("credit_cards")
        .update(encrypted)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
}

export function useDeleteCreditCard() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("credit_cards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
  });
}
