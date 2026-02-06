# KYN App - Roadmap

## ✅ Fase 3 - Transações Avançadas (Concluída)

### Migrações de Banco
- [x] `add_payment_method_and_installments` - payment_method enum, bank_account_id, credit_card_id, installments, parent_transaction_id
- [x] `create_transaction_items` - Tabela de sub-itens com RLS
- [x] `add_default_bank_account` - default_bank_account_id em profiles
- [x] `add_credit_card_closing_day` - closing_day em credit_cards

### Arquivos Criados
- [x] `src/lib/utils/payment-methods.ts` - Labels/ícones payment methods
- [x] `src/lib/utils/credit-card.ts` - Cálculo fatura, isDueSoon, isOverdue
- [x] `src/lib/hooks/use-transaction-items.ts` - CRUD sub-itens
- [x] `src/lib/hooks/use-profile.ts` - Fetch/update profile

### Arquivos Modificados
- [x] `src/lib/database.types.ts` - Regenerado
- [x] `src/lib/hooks/use-transactions.ts` - +useCreateInstallmentTransaction, +useBatchCompleteTransactions, +useBatchUncompleteTransactions
- [x] `src/components/transactions/transaction-form.tsx` - +payment_method, +bank_account, +credit_card, +parcelas, +sub-itens
- [x] `src/components/transactions/transaction-card.tsx` - +badge parcela, +ícone pagamento, +alerta vencimento, +expandir itens, +seleção
- [x] `src/app/(dashboard)/transacoes/page.tsx` - +filtro status, +batch selection, +badge pendentes
- [x] `src/components/wallet/credit-card-form.tsx` - +closing_day field
- [x] Shadcn: +collapsible, +checkbox

### Funcionalidades
- [x] 1.5 - Transações com seleção de conta
- [x] 1.2 - Compras parceladas com forma de pagamento
- [x] 1.3 - Sub-itens em lançamentos (auto-soma)
- [x] 1.4 - Lançamentos direto no cartão
- [x] 1.6 - Dinâmica pendente/concluído melhorada

---

## ✅ Fase MVP - Preparação para Lançamento (Concluída 29/01/2026)

### Remoção de Código
- [x] Deletado `src/app/(dashboard)/investimentos/` - página de investimentos
- [x] Deletado `src/lib/hooks/use-investments.ts` - hook de investimentos
- [x] Removidas mensagens de erro de investimentos em `src/lib/errors.ts`

### Landing Page
- [x] `src/components/landing/header.tsx` - Header com logo e CTAs
- [x] `src/components/landing/hero.tsx` - Hero com mock WhatsApp conversation
- [x] `src/components/landing/features.tsx` - 6 features cards
- [x] `src/components/landing/how-it-works.tsx` - 3 passos
- [x] `src/components/landing/pricing-section.tsx` - Free vs Pro cards
- [x] `src/components/landing/cta-final.tsx` - CTA final
- [x] `src/components/landing/footer.tsx` - Footer com links legais
- [x] `src/app/page.tsx` - Landing page pública

### Páginas Legais
- [x] `src/app/(public)/layout.tsx` - Layout público
- [x] `src/app/(public)/termos/page.tsx` - Termos de Uso (SaaS brasileiro)
- [x] `src/app/(public)/privacidade/page.tsx` - Política de Privacidade (LGPD)

### Páginas de Erro
- [x] `src/app/not-found.tsx` - 404 com links de navegação
- [x] `src/app/error.tsx` - Error boundary com retry

### Middleware
- [x] `src/middleware.ts` - Atualizado para rotas públicas (/, /pricing, /termos, /privacidade)

### Verificação
- [x] Build produção OK
- [x] 165 testes passando
- [x] Lint sem erros (apenas warnings)

---

## 🔲 Fase 4 - Próximas Features (Sugestão)

### Dashboard
- [ ] Widget de transações vencendo em 3 dias
- [ ] Resumo de fatura dos cartões
- [ ] Gráfico de gastos por forma de pagamento

### Carteira
- [ ] Visualizar fatura do cartão por mês
- [ ] Transferência entre contas

### Relatórios
- [ ] Relatório de parcelas futuras
- [ ] Exportação PDF/Excel

### Configurações
- [ ] Definir conta padrão para cada forma de pagamento

### Melhorias de UX
- [ ] Modo offline básico (PWA)
- [ ] Notificações push de transações pendentes
- [ ] Temas adicionais
