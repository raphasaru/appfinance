"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Tables } from "@/lib/database.types";

type WhatsAppLink = Tables<"user_whatsapp_links">;

// Generate a random 6-character alphanumeric code
function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars: I, O, 0, 1
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useWhatsAppLink() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["whatsapp-link"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_whatsapp_links")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as WhatsAppLink | null;
    },
  });
}

export function useLinkWhatsApp() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Normalize phone number (remove non-digits, ensure country code)
      const normalized = normalizePhoneNumber(phoneNumber);

      // Check if phone number is already used by another user
      const { data: existingLink } = await supabase
        .from("user_whatsapp_links")
        .select("user_id")
        .eq("phone_number", normalized)
        .maybeSingle();

      if (existingLink && existingLink.user_id !== user.id) {
        throw new Error("Este número já está vinculado a outra conta");
      }

      // Generate verification code with 1-hour expiry
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      // Use upsert to handle both new links and re-links
      const { data, error } = await supabase
        .from("user_whatsapp_links")
        .upsert({
          user_id: user.id,
          phone_number: normalized,
          verification_code: verificationCode,
          verification_expires_at: expiresAt,
          // Clear verification status for re-linking
          whatsapp_lid: null,
          verified_at: null,
        }, {
          onConflict: "user_id",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este número já está vinculado a outra conta");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-link"] });
    },
  });
}

export function useRegenerateVerificationCode() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      // Generate new verification code with 1-hour expiry
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from("user_whatsapp_links")
        .update({
          verification_code: verificationCode,
          verification_expires_at: expiresAt,
          // Clear LID to allow re-verification
          whatsapp_lid: null,
          verified_at: null,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-link"] });
    },
  });
}

export function useUnlinkWhatsApp() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("user_whatsapp_links")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-link"] });
    },
  });
}

function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");

  // If starts with 0, remove it
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // If doesn't start with country code, add Brazil's +55
  if (!digits.startsWith("55")) {
    digits = "55" + digits;
  }

  return digits;
}
