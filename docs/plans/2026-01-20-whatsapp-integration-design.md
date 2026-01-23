# Integração WhatsApp - Meu Bolso

## Resumo

Integração com WhatsApp para lançamento de transações via texto, áudio e imagem de comprovantes, usando WAHA (API não oficial), Gemini para processamento de IA, e serviço Node.js em VPS própria.

## Decisões Tomadas

| Aspecto | Decisão |
|---------|---------|
| API WhatsApp | WAHA (não oficial, self-hosted) |
| IA | Google Gemini (multimodal) |
| Hospedagem | VPS própria (Docker) |
| Confirmação | Lançar direto + notificar |
| Autenticação | Cadastro prévio no app web |
| Volume esperado | 50+ mensagens/dia |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         VPS (Docker)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────────────────────────────┐   │
│  │    WAHA      │───▶│     Serviço Node.js (Webhook)        │   │
│  │  Container   │    │  - Recebe mensagens                  │   │
│  │  (WhatsApp)  │◀───│  - Processa com Gemini               │   │
│  └──────────────┘    │  - Salva no Supabase                 │   │
│                      │  - Responde confirmação              │   │
│                      └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │       Supabase          │
                    │  - transactions         │
                    │  - user_whatsapp_links  │
                    └─────────────────────────┘
```

## Fluxo de Mensagens

1. Usuário envia mensagem (texto/áudio/imagem)
2. WAHA recebe e envia webhook para Node.js
3. Node.js verifica se número está vinculado a um usuário
4. Envia para Gemini com prompt de extração
5. Gemini retorna JSON com dados extraídos
6. Insere no Supabase (tabela transactions)
7. Envia confirmação pelo WhatsApp

## Tipos de Entrada

| Tipo | Processamento |
|------|--------------|
| Texto | Gemini extrai: valor, descrição, tipo |
| Áudio | Gemini transcreve + extrai dados |
| Imagem | Gemini lê comprovante/nota fiscal |

## Schema do Banco

Nova tabela para vincular WhatsApp:

```sql
CREATE TABLE user_whatsapp_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phone_number)
);

-- RLS
ALTER TABLE user_whatsapp_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own links"
ON user_whatsapp_links
FOR ALL
USING (auth.uid() = user_id);
```

## Estrutura do Serviço (Novo Repositório)

```
whatsapp-service/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts              # Express server
    ├── config.ts             # Env vars
    ├── webhooks/
    │   └── waha.ts           # Handler de mensagens WAHA
    ├── services/
    │   ├── gemini.ts         # Integração Gemini API
    │   ├── supabase.ts       # Cliente Supabase (service role)
    │   └── waha.ts           # API do WAHA para enviar msgs
    └── prompts/
        └── extract.ts        # Prompt para extração de dados
```

## Prompt de Extração (Gemini)

```typescript
const EXTRACTION_PROMPT = `
Você é um assistente financeiro. Analise a entrada e extraia transações.

CATEGORIAS (expense_category):
- fixed_housing, fixed_utilities, fixed_subscriptions
- fixed_personal, fixed_taxes, variable_credit
- variable_food, variable_transport, variable_other

TIPOS: income | expense

Retorne JSON:
{
  "transactions": [{
    "description": "string",
    "amount": number,
    "type": "income" | "expense",
    "category": "categoria" | null
  }],
  "confidence": 0.0-1.0
}
`;
```

## Mudanças no App Web (Meu Bolso)

Nova página: `/configuracoes/whatsapp`
- Campo para cadastrar número de telefone
- Status de vinculação
- Botão para desvincular

Hooks necessários:
- `useWhatsAppLink()` - Buscar vínculo atual
- `useLinkWhatsApp()` - Criar vínculo
- `useUnlinkWhatsApp()` - Remover vínculo

## Docker Compose

```yaml
services:
  waha:
    image: devlikeapro/waha
    ports:
      - "3000:3000"
    environment:
      - WAHA_WEBHOOK_URL=http://app:4000/webhook
    volumes:
      - waha-data:/app/.waha

  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - waha

volumes:
  waha-data:
```

## Custos Estimados

| Componente | Custo |
|------------|-------|
| VPS Hetzner CX22 | ~€4/mês |
| Gemini API | ~$10-30/mês |
| WAHA | Gratuito |
| Supabase | Plano atual |

## Segurança

- Usar `SUPABASE_SERVICE_KEY` para bypass de RLS no serviço
- Validar números vinculados antes de processar
- Rate limiting no webhook
- Logs de auditoria para transações criadas via WhatsApp

## Próximos Passos

1. Criar migration para tabela `user_whatsapp_links`
2. Criar página de configurações no app web
3. Criar repositório `whatsapp-service`
4. Configurar WAHA e testar conexão
5. Implementar webhook handler
6. Integrar Gemini API
7. Testar fluxo completo
8. Deploy em VPS
