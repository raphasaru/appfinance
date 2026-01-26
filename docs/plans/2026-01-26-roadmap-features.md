# Roadmap de Funcionalidades - Meu Bolso

> Documento de planejamento para desenvolvimento futuro do aplicativo Meu Bolso.
> Data: 26 de Janeiro de 2026
> Última atualização: 26 de Janeiro de 2026

---

## Índice

1. [Transações e Lançamentos](#1-transações-e-lançamentos)
2. [Integração WhatsApp](#2-integração-whatsapp)
3. [Relatórios](#3-relatórios)
4. [Interface e UX](#4-interface-e-ux)
5. [Onboarding](#5-onboarding)
6. [Recursos Premium](#6-recursos-premium)

---

## 1. Transações e Lançamentos

### 1.1 Desmarcar Pagos para Voltar a Pendentes ✅ CONCLUÍDO

**Complexidade:** Baixa

**Descrição:**
Permitir que o usuário reverta uma transação marcada como `completed` de volta para `planned`.

**Implementação:**
- ✅ Adicionar botão/ação no `TransactionCard` para reverter status
- ✅ Criar mutation `useUncompleteTransaction` em `use-transactions.ts`
- ✅ Atualizar `status` para `planned` e limpar `completed_date`
- ✅ Visual diferenciado: borda sólida (pago) vs tracejada (pendente)
- ✅ Badge "Pendente" para transações não pagas

**Arquivos afetados:**
- `src/lib/hooks/use-transactions.ts`
- `src/components/transactions/transaction-card.tsx`

---

### 1.2 Compras Parceladas com Forma de Pagamento

**Complexidade:** Alta

**Descrição:**
Permitir criar transações parceladas que geram automaticamente múltiplas prestações. Adicionar campo de forma de pagamento/recebimento nos lançamentos.

**Implementação:**

1. **Novo enum no banco:**
```sql
CREATE TYPE payment_method AS ENUM (
  'pix',
  'cash',
  'debit',
  'credit',
  'transfer',
  'boleto'
);
```

2. **Novos campos na tabela `transactions`:**
```sql
ALTER TABLE transactions ADD COLUMN payment_method payment_method;
ALTER TABLE transactions ADD COLUMN installment_number INT;
ALTER TABLE transactions ADD COLUMN total_installments INT;
ALTER TABLE transactions ADD COLUMN parent_transaction_id UUID REFERENCES transactions(id);
```

3. **Lógica de geração:**
- Ao criar transação parcelada, gerar N transações filhas
- Cada prestação tem `due_date` incrementada em 1 mês
- Campo `parent_transaction_id` agrupa as parcelas
- Exibir como "1/12", "2/12", etc.

**Arquivos afetados:**
- `src/lib/database.types.ts`
- `src/lib/hooks/use-transactions.ts`
- `src/components/transactions/transaction-form.tsx`
- `src/components/transactions/transaction-card.tsx`

**Dependências:** Nenhuma

---

### 1.3 Sub-itens em Lançamentos (Compras Detalhadas)

**Complexidade:** Média/Alta

**Descrição:**
Ao lançar uma compra com vários itens, permitir cadastrar como sub-itens daquela compra. Exemplo: "Compras no mercado, R$ 12,00, 3 itens" com detalhamento dos itens quando o usuário quiser ver.

**Implementação:**

1. **Nova tabela `transaction_items`:**
```sql
CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transaction items"
  ON transaction_items FOR ALL
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE user_id = auth.uid()
    )
  );
```

2. **UI:**
- Expandir `TransactionCard` para mostrar itens ao clicar
- Adicionar seção de itens no `TransactionForm`
- Mostrar badge com quantidade de itens

**Arquivos afetados:**
- `src/lib/database.types.ts`
- `src/lib/hooks/use-transactions.ts` (novo hook `useTransactionItems`)
- `src/components/transactions/transaction-form.tsx`
- `src/components/transactions/transaction-card.tsx`
- Novo: `src/components/transactions/transaction-items-list.tsx`

**Dependências:** Nenhuma

---

### 1.4 Lançamentos Direto no Cartão com Parcelas

**Complexidade:** Alta

**Descrição:**
Permitir vincular uma transação parcelada diretamente a um cartão de crédito, calculando em qual fatura cada parcela cairá.

**Implementação:**

1. **Novo campo na tabela `transactions`:**
```sql
ALTER TABLE transactions ADD COLUMN credit_card_id UUID REFERENCES credit_cards(id);
```

2. **Lógica:**
- Considerar data de fechamento do cartão para calcular fatura
- Distribuir parcelas nas faturas corretas
- Atualizar valor da fatura atual do cartão

3. **UI:**
- Select de cartão no `TransactionForm` quando `payment_method = 'credit'`
- Mostrar nome do cartão no `TransactionCard`

**Arquivos afetados:**
- `src/lib/database.types.ts`
- `src/lib/hooks/use-transactions.ts`
- `src/lib/hooks/use-credit-cards.ts`
- `src/components/transactions/transaction-form.tsx`

**Dependências:** 1.2 (Compras Parceladas)

---

### 1.5 Transações com Seleção de Conta

**Complexidade:** Média

**Descrição:**
Permitir selecionar em qual conta bancária a transação será registrada. Ter uma conta padrão configurável.

**Implementação:**

1. **Novos campos:**
```sql
-- Na tabela transactions
ALTER TABLE transactions ADD COLUMN bank_account_id UUID REFERENCES bank_accounts(id);

-- Na tabela profiles (conta padrão)
ALTER TABLE profiles ADD COLUMN default_bank_account_id UUID REFERENCES bank_accounts(id);
```

2. **UI:**
- Select de conta no `TransactionForm`
- Pré-selecionar conta padrão
- Configuração de conta padrão em Perfil ou Carteira

**Arquivos afetados:**
- `src/lib/database.types.ts`
- `src/lib/hooks/use-transactions.ts`
- `src/lib/hooks/use-bank-accounts.ts`
- `src/components/transactions/transaction-form.tsx`
- `src/app/(dashboard)/perfil/page.tsx`

**Dependências:** Nenhuma

---

### 1.6 Melhorar Dinâmica Pendente/Concluído

**Complexidade:** Média

**Descrição:**
Melhorar a gestão de transações futuras (planejadas) vs. realizadas. Possíveis melhorias:
- Separar visualmente na lista
- Filtros rápidos por status
- Ações em lote para marcar como concluído
- Notificações de transações pendentes próximas do vencimento

**Implementação:**

1. **UI melhorada:**
- Tabs ou toggle para filtrar Pendentes/Concluídas/Todas
- Destaque visual diferente para pendentes (ex: borda tracejada)
- Badge com contagem de pendentes

2. **Ações em lote:**
- Checkbox para selecionar múltiplas transações
- Botão "Marcar selecionadas como pagas"

3. **Alerta de vencimento:**
- Indicador visual para transações vencendo em 3 dias
- Possível notificação push (futuro)

**Arquivos afetados:**
- `src/app/(dashboard)/transacoes/page.tsx`
- `src/components/transactions/transaction-card.tsx`
- `src/lib/hooks/use-transactions.ts`

**Dependências:** 1.1 (Desmarcar Pagos)

---

## 2. Integração WhatsApp

### 2.1 Múltiplos Itens por Mensagem de Texto e Áudio

**Complexidade:** Média

**Descrição:**
Permitir que mensagens de texto e áudio lancem mais de um item por mensagem, como já ocorre quando é foto.

**Implementação:**

1. **Ajustar prompt do Gemini:**
- Retornar array de transações ao invés de objeto único
- Manter compatibilidade com mensagens de item único

2. **Ajustar processamento:**
- Iterar sobre array de transações retornadas
- Criar todas as transações no banco
- Retornar confirmação consolidada

**Arquivos afetados:**
- `whatsapp-service/src/prompts/extract.ts`
- `whatsapp-service/src/webhooks/waha.ts`
- `supabase/functions/whatsapp-webhook/index.ts`

**Dependências:** Nenhuma

---

### 2.2 Mensagem Consome Apenas 1 Uso

**Complexidade:** Baixa

**Descrição:**
Cada lançamento feito por mensagem no WhatsApp deve consumir apenas 1 uso de mensagem do plano, independente de quantos itens forem cadastrados.

**Implementação:**

1. **Ajustar lógica de incremento:**
- Chamar `increment_whatsapp_message` apenas uma vez por mensagem recebida
- Não incrementar por item criado

2. **Verificar RPC:**
- Garantir que `increment_whatsapp_message` é chamado antes do processamento
- Se limite atingido, não processar e retornar erro

**Arquivos afetados:**
- `whatsapp-service/src/webhooks/waha.ts`
- `supabase/functions/whatsapp-webhook/index.ts`

**Dependências:** 2.1 (Múltiplos Itens)

---

### 2.3 Mensagem de Limite Atingido ✅ CONCLUÍDO

**Complexidade:** Baixa

**Descrição:**
Retornar uma mensagem no WhatsApp quando o usuário atingir o limite de mensagens do plano.

**Implementação:**

1. **Mensagem de erro:**
```typescript
const LIMIT_MESSAGE = `⚠️ Você atingiu o limite de mensagens do seu plano este mês.

Para continuar usando o WhatsApp para lançar transações, faça upgrade para o plano Pro em: ${APP_URL}/pricing

Você ainda pode usar o app normalmente pelo navegador!`;
```

2. **Fluxo:**
- ✅ Verificar limite antes de processar
- ✅ Se limite atingido, enviar mensagem de limite com link para upgrade
- ✅ Não processar a mensagem

**Arquivos afetados:**
- `whatsapp-service/src/webhooks/waha.ts`
- `supabase/functions/whatsapp-webhook/index.ts`

**Dependências:** Nenhuma

---

### 2.4 Mostrar Itens no Relatório de Confirmação

**Complexidade:** Baixa

**Descrição:**
Mostrar itens repetidos também no relatório do WhatsApp, refletindo o que de fato está sendo lançado no sistema.

**Implementação:**

1. **Ajustar formatação da resposta:**
```typescript
// Exemplo de resposta com múltiplos itens
const formatConfirmation = (items: Transaction[]) => {
  if (items.length === 1) {
    return `✅ Lançado: ${items[0].description} - R$ ${items[0].amount}`;
  }
  
  const total = items.reduce((sum, i) => sum + i.amount, 0);
  const list = items.map(i => `  • ${i.description}: R$ ${i.amount}`).join('\n');
  
  return `✅ ${items.length} itens lançados:\n${list}\n\nTotal: R$ ${total}`;
};
```

**Arquivos afetados:**
- `whatsapp-service/src/utils/format.ts`
- `whatsapp-service/src/webhooks/waha.ts`
- `supabase/functions/whatsapp-webhook/index.ts`

**Dependências:** 2.1 (Múltiplos Itens)

---

## 3. Relatórios

### 3.1 Relatório de Períodos

**Complexidade:** Média

**Descrição:**
Criar relatório com filtros de período: hoje, ontem, últimos 3 dias, últimos 7 dias, mês atual, período personalizado.

**Implementação:**

1. **Novo componente `PeriodSelector`:**
```typescript
type Period = 
  | 'today'
  | 'yesterday'
  | 'last_3_days'
  | 'last_7_days'
  | 'this_month'
  | 'last_month'
  | 'custom';

interface PeriodSelectorProps {
  value: Period;
  onChange: (period: Period, dateRange?: { start: Date; end: Date }) => void;
}
```

2. **Novo hook `usePeriodSummary`:**
- Aceitar `startDate` e `endDate` ao invés de apenas `month`
- Calcular receitas, despesas e saldo do período

3. **UI:**
- Dropdown ou tabs para seleção rápida
- DatePicker para período personalizado
- Cards de resumo do período selecionado

**Arquivos afetados:**
- `src/app/(dashboard)/relatorios/page.tsx`
- `src/lib/hooks/use-summary.ts` (ou novo hook)
- Novo: `src/components/reports/period-selector.tsx`

**Dependências:** Nenhuma

---

### 3.2 Filtro por Contas e Cartões

**Complexidade:** Média

**Descrição:**
Permitir filtrar relatórios por conta bancária ou cartão de crédito específico.

**Implementação:**

1. **UI de filtros:**
- Multi-select de contas
- Multi-select de cartões
- Botão "Limpar filtros"

2. **Ajustar queries:**
- Adicionar `WHERE bank_account_id IN (...)` quando filtrado
- Adicionar `WHERE credit_card_id IN (...)` quando filtrado

3. **Totais por conta/cartão:**
- Exibir breakdown de gastos por conta
- Exibir breakdown de gastos por cartão

**Arquivos afetados:**
- `src/app/(dashboard)/relatorios/page.tsx`
- `src/lib/hooks/use-summary.ts`
- `src/lib/hooks/use-transactions.ts`

**Dependências:** 1.5 (Transações com Conta)

---

### 3.3 Gráfico de Pizza por Categorias ✅ CONCLUÍDO

**Complexidade:** Baixa

**Descrição:**
Adicionar gráfico de pizza mostrando distribuição de gastos por categoria.

**Implementação:**

1. ✅ **Usar Recharts PieChart:**
```typescript
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = {
  fixed_housing: '#3B82F6',
  fixed_utilities: '#F59E0B',
  // ... outras cores por categoria
};
```

2. ✅ **Dados:**
- Usar `useCategorySpending(month)` existente
- Formatar para estrutura do PieChart com percentuais

3. ✅ **Componente criado:** `CategoryPieChart` com:
- Gráfico de pizza donut
- Legenda com cores, percentuais e valores
- Total de gastos

**Arquivos afetados:**
- `src/app/(dashboard)/relatorios/page.tsx`
- ✅ Novo: `src/components/reports/category-pie-chart.tsx`

**Dependências:** Nenhuma

---

## 4. Interface e UX

### 4.1 Ordenação de Transações ✅ CONCLUÍDO

**Complexidade:** Baixa

**Descrição:**
Mostrar transações recentes primeiro por padrão. Adicionar filtro de ordenação: data (recente/antiga), alfabética (A-Z/Z-A), valor (maior/menor).

**Implementação:**

1. ✅ **Estado de ordenação:**
```typescript
type SortField = 'date' | 'description' | 'amount';
type SortOrder = 'asc' | 'desc';

const [sortField, setSortField] = useState<SortField>('date');
const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
```

2. ✅ **UI:**
- Dropdown de ordenação no header da lista (mobile e desktop)
- Labels em português: "Mais recentes", "Mais antigas", "A-Z", "Z-A", "Maior valor", "Menor valor"

3. ✅ **Ordenação:**
- Feita no frontend com `useMemo` para performance
- Ordenação por data usa comparação de timestamps
- Ordenação alfabética usa `localeCompare` com pt-BR

**Arquivos afetados:**
- `src/app/(dashboard)/transacoes/page.tsx`

**Dependências:** Nenhuma

---

### 4.2 Revisar Acentuação ✅ CONCLUÍDO

**Complexidade:** Baixa

**Descrição:**
Revisar todo o app para garantir que textos estão com acentuação correta em português.

**Implementação:**

1. ✅ **Áreas revisadas:**
- Labels de formulários
- Mensagens de erro/sucesso
- Títulos de páginas
- Textos de botões
- Placeholders
- Categorias e enums

2. ✅ **Correções feitas:**
- `src/app/(dashboard)/historico/page.tsx`:
  - "Nenhuma despesa neste mes" → "Nenhuma despesa neste mês"
  - "Resumo do Mes" → "Resumo do Mês"

**Arquivos afetados:**
- `src/app/(dashboard)/historico/page.tsx`

**Dependências:** Nenhuma

---

## 5. Onboarding

### 5.1 Fluxo de Onboarding para Novos Usuários

**Complexidade:** Alta

**Descrição:**
Criar fluxo guiado para novos usuários configurarem o app na primeira vez.

**Etapas:**
1. Boas-vindas
2. Cadastre suas contas bancárias
3. Cadastre seus cartões de crédito
4. Defina suas metas de orçamento por categoria
5. Configure suas receitas e despesas recorrentes
6. Vincule seu WhatsApp
7. Oferta do Plano Pro

**Implementação:**

1. **Novo campo no perfil:**
```sql
ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN onboarding_step INT DEFAULT 0;
```

2. **Novos componentes:**
```
src/components/onboarding/
├── onboarding-wizard.tsx      # Container principal
├── welcome-step.tsx           # Passo 1: Boas-vindas
├── accounts-step.tsx          # Passo 2: Contas
├── cards-step.tsx             # Passo 3: Cartões
├── budget-step.tsx            # Passo 4: Orçamento
├── recurring-step.tsx         # Passo 5: Recorrentes
├── whatsapp-step.tsx          # Passo 6: WhatsApp
├── pro-offer-step.tsx         # Passo 7: Oferta Pro
└── progress-indicator.tsx     # Indicador de progresso
```

3. **Lógica:**
- Verificar `onboarding_completed` no login
- Redirecionar para `/onboarding` se não completado
- Permitir pular etapas
- Salvar progresso para continuar depois

4. **Nova página:**
- `src/app/(dashboard)/onboarding/page.tsx`

**Arquivos afetados:**
- `src/lib/database.types.ts`
- `src/middleware.ts`
- Novos componentes em `src/components/onboarding/`
- Nova página `src/app/(dashboard)/onboarding/page.tsx`

**Dependências:** Nenhuma (mas usa funcionalidades existentes)

---

## 6. Recursos Premium

### 6.1 Categorias Personalizadas para Usuários Pro

**Complexidade:** Média

**Descrição:**
Permitir que usuários do plano Pro criem suas próprias categorias de despesas além das padrão.

**Implementação:**

1. **Nova tabela:**
```sql
CREATE TABLE custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  icon TEXT, -- emoji ou nome do ícone
  color TEXT, -- cor hex
  is_fixed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, name)
);

-- RLS
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own categories"
  ON custom_categories FOR ALL
  USING (user_id = auth.uid());
```

2. **Ajustar transactions:**
```sql
ALTER TABLE transactions ADD COLUMN custom_category_id UUID REFERENCES custom_categories(id);
```

3. **Lógica:**
- Se `custom_category_id` preenchido, usar categoria personalizada
- Senão, usar `category` (enum padrão)
- Verificar se usuário é Pro antes de permitir criar

4. **UI:**
- Seção de categorias em Configurações
- Seletor de categoria no form mostra padrão + personalizadas
- Badge "Pro" nas categorias personalizadas

**Arquivos afetados:**
- `src/lib/database.types.ts`
- `src/lib/utils/categories.ts`
- Novo: `src/lib/hooks/use-custom-categories.ts`
- `src/components/transactions/transaction-form.tsx`
- Novo: `src/app/(dashboard)/configuracoes/categorias/page.tsx`

**Dependências:** Nenhuma

---

## Ordem de Implementação Sugerida

### Fase 1 - Quick Wins (Baixa Complexidade) ✅ CONCLUÍDA (26/01/2026)
1. ✅ 4.2 - Revisar acentuação
2. ✅ 4.1 - Ordenação de transações
3. ✅ 1.1 - Desmarcar pagos
4. ✅ 2.3 - Mensagem de limite atingido
5. ✅ 3.3 - Gráfico de pizza
6. ✅ **BÔNUS:** Filtro de status (Todas/Pendentes/Concluídas) na Dashboard mobile

### Fase 2 - WhatsApp Completo
6. 2.1 - Múltiplos itens por mensagem
7. 2.2 - Mensagem consome 1 uso
8. 2.4 - Mostrar itens no relatório

### Fase 3 - Transações Avançadas
9. 1.5 - Transações com conta
10. 1.2 - Compras parceladas
11. 1.3 - Sub-itens em lançamentos
12. 1.4 - Lançamentos no cartão
13. 1.6 - Melhorar pendente/concluído

### Fase 4 - Relatórios
14. 3.1 - Relatório de períodos
15. 3.2 - Filtro por contas e cartões

### Fase 5 - Premium e Onboarding
16. 6.1 - Categorias personalizadas
17. 5.1 - Fluxo de onboarding

---

## Notas Técnicas

### Padrões a Seguir
- Mobile-first (Sheet no mobile, Dialog no desktop)
- React Query para estado do servidor
- Zod para validação de formulários
- Formatação de moeda com `formatCurrency()`
- Categorias com `getCategoryLabel()` e `getCategoryIcon()`

### Testes Recomendados
- Testar parcelamento com diferentes números de parcelas
- Testar limites do WhatsApp com conta free e pro
- Testar onboarding em diferentes tamanhos de tela
- Verificar RLS em todas as novas tabelas

### Migrações de Banco
Todas as alterações de schema devem ser feitas via migrações do Supabase:
```bash
supabase migration new nome_da_migracao
```
