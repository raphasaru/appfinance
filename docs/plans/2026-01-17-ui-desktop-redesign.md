# UI Desktop Redesign - Meu Bolso

**Data**: 2026-01-17
**Status**: Aprovado

## Resumo

Redesign da interface do Meu Bolso para ter uma experiência desktop dedicada, mantendo responsividade com mobile. Inclui correção de bug no formulário de edição de transações.

## Decisões de Design

### Layout Desktop
- **Sidebar fixa à esquerda** (~240px)
- **Conteúdo em grid de cards** aproveitando espaço horizontal
- **Modal centralizado** para formulários (vs Sheet bottom no mobile)

### Estilo Visual
- **Clean e minimalista**
- Muito espaço em branco
- Tipografia clara com hierarquia forte
- Similar a: Linear, Stripe, Notion

## Estrutura de Layout

### Mobile (< 768px)
- Header fixo no topo
- Conteúdo em coluna única
- Bottom navigation (4 itens)
- Formulários em Sheet (slide from bottom)

### Desktop (≥ 768px)
- Sidebar fixa à esquerda com navegação
- Header simplificado (seletor de mês + perfil)
- Grid de cards no conteúdo principal
- Formulários em Modal centralizado

## Sidebar Desktop

```
┌──────────────┐
│  Logo        │
│  Meu Bolso   │
├──────────────┤
│  Início      │
│  Transações  │
│  Histórico   │
│  Investim.   │
├──────────────┤
│  Recorrentes │
├──────────────┤
│  Sair        │
└──────────────┘
```

## Dashboard Desktop

Layout em grid:
- **Linha 1**: 3 cards (Receitas, Despesas, Saldo)
- **Linha 2**: 2 cards (Pendentes, Concluídas)

Botão "+ Nova" dentro do card de pendentes (não FAB flutuante).

## Páginas

### Transações
- Filtros em coluna à esquerda
- Lista de transações à direita

### Histórico
- Gráfico de barras (6 meses) em destaque
- Grid: Pie chart de categorias + Detalhes do mês

### Investimentos
- Grid de cards (3 colunas)
- Cada card mostra: nome, tipo, valor, quantidade

## Correção de Bug

### Problema
Formulário de edição não carrega dados corretos da transação clicada. O `useForm` usa `defaultValues` que são definidos apenas na montagem inicial.

### Solução
Usar `useEffect` para resetar o formulário quando `transaction` ou `open` mudar:

```typescript
useEffect(() => {
  if (open && transaction) {
    form.reset({
      description: transaction.description,
      amount: formatCurrencyInput(String(Number(transaction.amount) * 100)),
      type: transaction.type,
      category: transaction.category || undefined,
      due_date: transaction.due_date,
    });
  } else if (open && !transaction) {
    form.reset({
      description: "",
      amount: "",
      type: "expense",
      category: undefined,
      due_date: format(defaultDate, "yyyy-MM-dd"),
    });
  }
}, [open, transaction]);
```

## Paleta de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| Background | #FAFAFA | Fundo geral |
| Cards | #FFFFFF | Superfícies |
| Texto principal | #1A1A1A | Títulos e valores |
| Texto secundário | #6B7280 | Labels |
| Receita | #10B981 | Verde |
| Despesa | #EF4444 | Vermelho |
| Primária | #4A6741 | Botões/links |
| Bordas | #E5E7EB | Separadores |

## Tipografia

- Números: `Geist Mono` com `tabular-nums`
- Texto: `Geist Sans`
- Tamanhos: 14px, 16px, 20px, 24px, 32px

## Componentes

### Cards
- Borda: `1px solid #E5E7EB`
- Border-radius: `12px`
- Padding: `24px`
- Shadow: `shadow-sm`

### Botões
- Primário: Fundo sólido
- Secundário: Outline
- Border-radius: `8px`

### Inputs
- Altura: `44px`
- Borda clara, foco com ring primária
- Labels acima do input

## Implementação

### Arquivos a criar/modificar

1. `src/components/layout/sidebar.tsx` - Novo componente sidebar
2. `src/components/layout/desktop-layout.tsx` - Layout wrapper desktop
3. `src/app/(dashboard)/layout.tsx` - Integrar layouts responsivos
4. `src/components/transactions/transaction-form.tsx` - Corrigir bug + modal desktop
5. `src/components/ui/dialog.tsx` - Garantir modal funcionando
6. `src/app/(dashboard)/dashboard/page.tsx` - Grid de cards desktop
7. `src/app/(dashboard)/transacoes/page.tsx` - Layout duas colunas
8. `src/app/(dashboard)/historico/page.tsx` - Grid gráficos
9. `src/app/(dashboard)/investimentos/page.tsx` - Grid de cards
