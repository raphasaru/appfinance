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

// Gemini API Configuration
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";
const GEMINI_MODEL = "gemini-1.5-flash";

// Expense categories mapping
const EXPENSE_CATEGORIES = {
  fixed_housing: ["aluguel", "condomínio", "condominio", "iptu", "prestação casa", "financiamento casa", "moradia"],
  fixed_utilities: ["luz", "água", "agua", "gás", "gas", "internet", "telefone", "celular", "energia", "conta de luz", "conta de água"],
  fixed_subscriptions: ["netflix", "spotify", "amazon", "disney", "hbo", "youtube", "assinatura", "streaming", "mensalidade"],
  fixed_personal: ["academia", "plano de saúde", "plano de saude", "seguro", "escola", "faculdade", "curso"],
  fixed_taxes: ["imposto", "taxa", "inss", "irpf", "ipva", "licenciamento"],
  variable_credit: ["cartão", "cartao", "fatura", "parcela"],
  variable_food: ["mercado", "supermercado", "restaurante", "lanche", "almoço", "almoco", "jantar", "café", "cafe", "comida", "ifood", "delivery", "padaria", "feira", "açougue", "acougue"],
  variable_transport: ["uber", "99", "gasolina", "combustível", "combustivel", "estacionamento", "pedágio", "pedagio", "ônibus", "onibus", "metrô", "metro", "transporte", "passagem"],
  variable_other: ["outros", "diversos", "compra", "presente", "roupa", "farmácia", "farmacia", "médico", "medico", "remédio", "remedio"],
};

// Transaction interface
interface ExtractedTransaction {
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string | null;
}

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

// Extract transactions using Gemini AI
async function extractTransactionsWithAI(messageText: string): Promise<ExtractedTransaction[]> {
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not configured");
    return extractTransactionsFallback(messageText);
  }

  const prompt = `Você é um assistente financeiro. Analise a mensagem do usuário e extraia TODAS as transações financeiras mencionadas.

Para cada transação, retorne:
- description: descrição curta da transação
- amount: valor numérico (apenas números, sem R$)
- type: "income" para receitas (salário, freelance, venda, recebimento) ou "expense" para despesas (gastos, compras, pagamentos)
- category: uma das categorias abaixo (APENAS para despesas):
  - fixed_housing: moradia (aluguel, condomínio, IPTU)
  - fixed_utilities: contas (luz, água, gás, internet, telefone)
  - fixed_subscriptions: assinaturas (Netflix, Spotify, streaming)
  - fixed_personal: pessoal fixo (academia, plano de saúde, escola)
  - fixed_taxes: impostos e taxas
  - variable_credit: cartão de crédito
  - variable_food: alimentação (mercado, restaurante, delivery)
  - variable_transport: transporte (Uber, gasolina, estacionamento)
  - variable_other: outros gastos

IMPORTANTE:
- Se houver múltiplos itens, retorne TODOS separadamente
- Se o usuário mencionar "compras no mercado R$150 sendo R$50 de carne, R$30 de frutas e R$70 de limpeza", retorne 3 transações separadas
- Para receitas (income), category deve ser null
- Valores devem ser numéricos (50.00, não "R$ 50,00")
- Se não conseguir identificar, retorne array vazio []

Responda APENAS com um JSON array válido, sem texto adicional.

Mensagem do usuário: "${messageText}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return extractTransactionsFallback(messageText);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("Gemini response:", text);

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const transactions = JSON.parse(jsonText) as ExtractedTransaction[];

    // Validate and clean transactions
    return transactions
      .filter((t) => t.description && typeof t.amount === "number" && t.amount > 0)
      .map((t) => ({
        description: t.description.slice(0, 100),
        amount: Math.round(t.amount * 100) / 100,
        type: t.type === "income" ? "income" : "expense",
        category: t.type === "expense" ? (t.category || "variable_other") : null,
      }));
  } catch (error) {
    console.error("Error extracting with AI:", error);
    return extractTransactionsFallback(messageText);
  }
}

// Fallback extraction without AI
function extractTransactionsFallback(messageText: string): ExtractedTransaction[] {
  const transactions: ExtractedTransaction[] = [];
  const text = messageText.toLowerCase();

  // Split by " e " or "," to handle multiple items
  // Example: "gastei 50 no uber, 200 no mercado e recebi 500 de freelance"
  const segments = text.split(/\s+e\s+|\s*,\s*/);

  // Track context from previous segments
  let lastType: "income" | "expense" | null = null;

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    // Check if this segment has an explicit verb
    const hasExpenseVerb = /gastei|paguei|comprei|pagar|gastar/.test(trimmed);
    const hasIncomeVerb = /recebi|ganhei|entrou/.test(trimmed);

    // Determine transaction type
    let transactionType: "income" | "expense";
    if (hasIncomeVerb) {
      transactionType = "income";
      lastType = "income";
    } else if (hasExpenseVerb) {
      transactionType = "expense";
      lastType = "expense";
    } else if (lastType) {
      // Inherit from previous segment (e.g., "gastei 50 uber, 200 mercado")
      transactionType = lastType;
    } else {
      // Default to expense if no context
      transactionType = "expense";
    }

    // Extract amount and description
    // Pattern: "verb? amount preposition? description" or "amount preposition? description"
    const amountMatch = trimmed.match(/(?:r\$\s*)?(\d+(?:[.,]\d{2})?)/);
    if (!amountMatch) continue;

    const amount = parseFloat(amountMatch[1].replace(",", "."));
    if (amount <= 0) continue;

    // Get description by removing the verb, amount, and common prepositions
    let description = trimmed
      .replace(/gastei|paguei|comprei|pagar|gastar|recebi|ganhei|entrou/gi, "")
      .replace(/(?:r\$\s*)?\d+(?:[.,]\d{2})?\s*(?:reais|real)?/g, "")
      .replace(/^\s*(?:em|de|no|na|com|do|da)\s+/i, "")
      .replace(/\s+(?:em|de|no|na|com|do|da)\s+/gi, " ")
      .trim();

    // Clean up description
    if (description) {
      description = description.charAt(0).toUpperCase() + description.slice(1);
    } else {
      description = transactionType === "income" ? "Receita" : "Despesa";
    }

    transactions.push({
      description,
      amount,
      type: transactionType,
      category: transactionType === "expense" ? inferCategory(description) : null,
    });
  }

  return transactions;
}

// Infer category from description
function inferCategory(description: string): string {
  const text = description.toLowerCase();

  for (const [category, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }

  return "variable_other";
}

// Format currency for display
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Format confirmation message
function formatConfirmationMessage(transactions: ExtractedTransaction[]): string {
  if (transactions.length === 0) {
    return "❌ Não consegui identificar nenhuma transação na sua mensagem.\n\nExemplos de como enviar:\n💸 _\"gastei 50 no uber\"_\n💰 _\"recebi 3000 de salário\"_\n🛒 _\"mercado 200, padaria 30, farmácia 45\"_";
  }

  if (transactions.length === 1) {
    const t = transactions[0];
    const emoji = t.type === "income" ? "💰" : "💸";
    const typeLabel = t.type === "income" ? "Receita" : "Despesa";
    return `✅ ${emoji} *${typeLabel} registrada!*\n\n📝 ${t.description}\n💵 ${formatCurrency(t.amount)}`;
  }

  // Multiple transactions
  const incomeItems = transactions.filter((t) => t.type === "income");
  const expenseItems = transactions.filter((t) => t.type === "expense");

  const totalIncome = incomeItems.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenseItems.reduce((sum, t) => sum + t.amount, 0);

  let message = `✅ *${transactions.length} transações registradas!*\n`;

  if (expenseItems.length > 0) {
    message += `\n💸 *Despesas:*\n`;
    for (const t of expenseItems) {
      message += `  • ${t.description}: ${formatCurrency(t.amount)}\n`;
    }
    message += `  *Subtotal:* ${formatCurrency(totalExpenses)}\n`;
  }

  if (incomeItems.length > 0) {
    message += `\n💰 *Receitas:*\n`;
    for (const t of incomeItems) {
      message += `  • ${t.description}: ${formatCurrency(t.amount)}\n`;
    }
    message += `  *Subtotal:* ${formatCurrency(totalIncome)}\n`;
  }

  return message;
}

// Create transactions in the database
async function createTransactions(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  transactions: ExtractedTransaction[]
): Promise<{ success: boolean; created: number; error?: string }> {
  // Use Brasília timezone (UTC-3) to get correct local date
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

  const records = transactions.map((t) => ({
    user_id: userId,
    description: t.description,
    amount: t.amount,
    type: t.type,
    category: t.category,
    due_date: today,
    status: "completed",
    source: "whatsapp",
  }));

  const { data, error } = await supabase
    .from("transactions")
    .insert(records)
    .select();

  if (error) {
    console.error("Error creating transactions:", error);
    return { success: false, created: 0, error: error.message };
  }

  return { success: true, created: data?.length || 0 };
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
          "🛒 _\"mercado 200, padaria 30, farmácia 45\"_\n" +
          "🎤 _Envie um áudio descrevendo a transação_\n\n" +
          "As transações serão lançadas automaticamente no app KYN App."
        );
      } else {
        await sendWhatsAppMessage(
          senderId,
          "❌ " + result.message + "\n\nAcesse o app KYN App para gerar um novo código."
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

    // Check and increment usage limit - ONCE per message (not per transaction)
    // This implements requirement 2.2: "Mensagem Consome Apenas 1 Uso"
    const { data: limitData } = await supabase
      .rpc('increment_whatsapp_message', { p_user_id: userId });

    const limitResult = limitData?.[0];
    const canProceed = limitResult?.success ?? false;
    const messagesUsed = limitResult?.messages_used || 0;
    const messagesLimit = limitResult?.messages_limit || 30;

    // Check if user is at limit
    if (!canProceed) {
      console.log("User " + userId + " at WhatsApp limit: " + messagesUsed + "/" + messagesLimit);
      const upgradeUrl = Deno.env.get("APP_URL") || "https://fin.prizely.com.br";
      await sendWhatsAppMessage(
        senderId,
        "⚠️ *Limite de mensagens atingido*\n\n" +
        "Você usou " + messagesUsed + " de " + messagesLimit + " mensagens via WhatsApp este mês.\n\n" +
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

    // Process text messages
    if (messageType === "text" && messageText) {
      // Extract transactions using AI (supports multiple items per message - requirement 2.1)
      const transactions = await extractTransactionsWithAI(messageText);

      console.log("Extracted transactions:", JSON.stringify(transactions));

      if (transactions.length === 0) {
        // No transactions found - send help message
        await sendWhatsAppMessage(
          senderId,
          formatConfirmationMessage([])
        );
        return new Response(
          JSON.stringify({
            success: true,
            message: "No transactions extracted",
            userId,
            messagesUsed,
            messagesLimit,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create all transactions in the database
      const result = await createTransactions(supabase, userId, transactions);

      if (!result.success) {
        await sendWhatsAppMessage(
          senderId,
          "❌ Erro ao salvar transações. Por favor, tente novamente."
        );
        return new Response(
          JSON.stringify({ success: false, error: result.error }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Send formatted confirmation (requirement 2.4)
      await sendWhatsAppMessage(senderId, formatConfirmationMessage(transactions));

      return new Response(
        JSON.stringify({
          success: true,
          message: "Transactions created",
          transactionsCreated: result.created,
          transactions,
          userId,
          messagesUsed,
          messagesLimit,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Audio and image messages - not yet implemented
    if (messageType === "audio") {
      await sendWhatsAppMessage(
        senderId,
        "🎤 *Áudio recebido!*\n\nNo momento, apenas mensagens de texto são processadas.\n\nPor favor, envie sua transação por texto:\n💸 _\"gastei 50 no uber\"_"
      );
    } else if (messageType === "image") {
      await sendWhatsAppMessage(
        senderId,
        "📸 *Imagem recebida!*\n\nNo momento, apenas mensagens de texto são processadas.\n\nPor favor, envie sua transação por texto:\n💸 _\"gastei 50 no uber\"_"
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Message received",
        messageType,
        userId,
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
