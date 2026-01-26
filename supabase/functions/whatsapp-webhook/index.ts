import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// WAHA Configuration
const WAHA_URL = Deno.env.get("WAHA_URL") || "http://31.97.160.106:3008";
const WAHA_API_KEY = Deno.env.get("WAHA_API_KEY") || "minha-chave-secreta-123";
const WAHA_SESSION = "default";

async function sendWhatsAppMessage(to: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_API_KEY,
      },
      body: JSON.stringify({
        session: WAHA_SESSION,
        chatId: to,
        text: text,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send WhatsApp message:", await response.text());
      return false;
    }

    console.log("WhatsApp message sent to " + to);
    return true;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    const event = body.event;
    const payload = body.payload || body;

    if (event && event !== "message" && event !== "message.any") {
      return new Response(
        JSON.stringify({ success: true, message: "Event ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract sender ID (could be phone@c.us or LID@lid)
    let senderId = "";
    const fromLocations = [
      payload?.from,
      payload?.sender?.id,
      payload?.key?.remoteJid,
      body?.from,
    ];

    for (const loc of fromLocations) {
      if (loc && typeof loc === "string") {
        senderId = loc;
        break;
      }
    }

    // Extract message text
    let messageText = "";
    const textLocations = [
      payload?.body,
      payload?.text,
      payload?.message?.conversation,
      payload?.message?.extendedTextMessage?.text,
      body?.body,
      body?.text,
    ];

    for (const loc of textLocations) {
      if (loc && typeof loc === "string") {
        messageText = loc;
        break;
      }
    }

    // Detect message type (text, audio, image)
    type MessageType = "text" | "audio" | "image" | "unknown";
    let messageType: MessageType = "unknown";

    // Check for audio message
    const hasAudio = payload?.message?.audioMessage ||
      payload?.message?.pttMessage ||
      payload?.hasMedia && payload?.mimetype?.startsWith("audio/") ||
      payload?.mediaType === "audio";

    // Check for image message
    const hasImage = payload?.message?.imageMessage ||
      payload?.hasMedia && payload?.mimetype?.startsWith("image/") ||
      payload?.mediaType === "image";

    if (messageText) {
      messageType = "text";
    } else if (hasAudio) {
      messageType = "audio";
    } else if (hasImage) {
      messageType = "image";
    }

    // Ignore messages without processable content
    if (messageType === "unknown") {
      return new Response(
        JSON.stringify({ success: true, message: "No processable content" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Message type: " + messageType + ", from " + senderId);

    console.log("Message from " + senderId + ": " + (messageText || `[${messageType}]`));

    // Check if this is a verification code (6 alphanumeric characters) - only for text messages
    const verificationCodeRegex = /^[A-Z0-9]{6}$/i;
    const trimmedMessage = messageText?.trim().toUpperCase() || "";

    if (messageType === "text" && verificationCodeRegex.test(trimmedMessage)) {
      console.log("Detected verification code: " + trimmedMessage);
      const result = await handleVerification(supabase, senderId, trimmedMessage);
      console.log("Verification result: " + JSON.stringify(result));

      // Send confirmation message back to user
      if (result.success) {
        await sendWhatsAppMessage(
          senderId,
          "✅ *WhatsApp vinculado com sucesso!*\n\n" +
          "Agora você pode enviar suas transações por aqui. Exemplos:\n\n" +
          "💸 _\"gastei 50 no uber\"_\n" +
          "💰 _\"recebi 3000 de salário\"_\n" +
          "🎤 _Envie um áudio descrevendo a transação_\n" +
          "📸 _Envie foto de cupom fiscal_\n\n" +
          "As transações serão lançadas automaticamente no app Meu Bolso."
        );
      } else {
        await sendWhatsAppMessage(
          senderId,
          "❌ " + result.message + "\n\nAcesse o app Meu Bolso para gerar um novo código."
        );
      }

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For non-verification messages, check if sender is verified
    const phoneOrLid = senderId.replace(/@.*$/, "");

    const { data: link } = await supabase
      .from("user_whatsapp_links")
      .select("user_id, verified_at, whatsapp_lid")
      .or("phone_number.eq." + phoneOrLid + ",whatsapp_lid.eq." + senderId)
      .maybeSingle();

    if (!link || !link.verified_at) {
      console.log("Unverified sender: " + senderId);
      // Silently ignore messages from unverified numbers
      return new Response(
        JSON.stringify({ success: false, error: "Number not verified" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = link.user_id;

    // Check current usage limit (without incrementing - trigger will handle that when transaction is created)
    const { data: limitData } = await supabase
      .rpc('reset_whatsapp_messages_if_needed', { p_user_id: userId });

    const limitResult = limitData?.[0];
    const messagesUsed = limitResult?.messages_used || 0;
    const messagesLimit = limitResult?.messages_limit || 30;

    // Check if user is at limit BEFORE processing
    if (messagesUsed >= messagesLimit) {
      console.log("User " + userId + " at WhatsApp limit: " + messagesUsed + "/" + messagesLimit);
      const upgradeUrl = Deno.env.get("APP_URL") || "https://fin.prizely.com.br";
      await sendWhatsAppMessage(
        senderId,
        "⚠️ *Limite de transações atingido*\n\n" +
        "Você criou " + messagesUsed + " de " + messagesLimit + " transações via WhatsApp este mês.\n\n" +
        "Para continuar usando o WhatsApp ilimitado, faça upgrade para o plano Pro:\n" +
        "👉 " + upgradeUrl + "/pricing\n\n" +
        "Seu limite será renovado no primeiro dia do próximo mês."
      );
      return new Response(
        JSON.stringify({ success: false, error: "Limit reached", messagesUsed, messagesLimit }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User " + userId + " usage: " + messagesUsed + "/" + messagesLimit);

    // TODO: Process transaction with AI based on message type
    // When create_whatsapp_transaction is called, the trigger will automatically
    // increment the usage counter because source='whatsapp'
    console.log("Verified user sent " + messageType + ": " + (messageText || "[media]"));

    // For now, acknowledge receipt based on message type
    let ackMessage = "";
    if (messageType === "text") {
      ackMessage = "📝 Mensagem recebida! (Processamento de transações em breve)";
    } else if (messageType === "audio") {
      ackMessage = "🎤 Áudio recebido! (Processamento de transações em breve)";
    } else if (messageType === "image") {
      ackMessage = "📸 Imagem recebida! (Processamento de transações em breve)";
    }

    await sendWhatsAppMessage(senderId, ackMessage);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Message received",
        userId: userId,
        messageType: messageType,
        text: messageText || null,
        messagesUsed,
        messagesLimit,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleVerification(
  supabase: ReturnType<typeof createClient>,
  senderId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  console.log("Verification attempt - Sender: " + senderId + ", Code: " + code);

  const { data: link, error: findError } = await supabase
    .from("user_whatsapp_links")
    .select("*")
    .eq("verification_code", code)
    .is("verified_at", null)
    .maybeSingle();

  if (findError) {
    console.error("Error finding verification:", findError);
    return { success: false, message: "Erro ao buscar código" };
  }

  if (!link) {
    console.log("No pending verification for code: " + code);
    return { success: false, message: "Código inválido ou já utilizado" };
  }

  if (link.verification_expires_at) {
    const expiresAt = new Date(link.verification_expires_at);
    if (expiresAt < new Date()) {
      console.log("Code expired");
      return { success: false, message: "Código expirado" };
    }
  }

  const { error: updateError } = await supabase
    .from("user_whatsapp_links")
    .update({
      verified_at: new Date().toISOString(),
      whatsapp_lid: senderId,
      verification_code: null,
      verification_expires_at: null,
    })
    .eq("id", link.id);

  if (updateError) {
    console.error("Error updating:", updateError);
    return { success: false, message: "Erro ao verificar" };
  }

  console.log("Successfully verified! Sender: " + senderId);
  return { success: true, message: "WhatsApp vinculado com sucesso!" };
}
