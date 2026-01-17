import { ExpenseCategory } from "@/lib/utils/categories";

// Initial data extracted from CSV spreadsheet
export const initialTemplates = [
  // Income
  {
    description: "Salário",
    amount: 6000,
    type: "income" as const,
    category: null,
    day_of_month: 5,
  },
  // Fixed Housing
  {
    description: "Aluguel",
    amount: 2000,
    type: "expense" as const,
    category: "fixed_housing" as ExpenseCategory,
    day_of_month: 10,
  },
  {
    description: "Condomínio",
    amount: 300,
    type: "expense" as const,
    category: "fixed_housing" as ExpenseCategory,
    day_of_month: 10,
  },
  // Fixed Utilities
  {
    description: "Internet",
    amount: 130,
    type: "expense" as const,
    category: "fixed_utilities" as ExpenseCategory,
    day_of_month: 15,
  },
  {
    description: "Luz",
    amount: 100,
    type: "expense" as const,
    category: "fixed_utilities" as ExpenseCategory,
    day_of_month: 20,
  },
  {
    description: "Gás",
    amount: 50,
    type: "expense" as const,
    category: "fixed_utilities" as ExpenseCategory,
    day_of_month: 25,
  },
  // Fixed Subscriptions
  {
    description: "Apple iCloud",
    amount: 60,
    type: "expense" as const,
    category: "fixed_subscriptions" as ExpenseCategory,
    day_of_month: 5,
  },
  {
    description: "ChatGPT",
    amount: 100,
    type: "expense" as const,
    category: "fixed_subscriptions" as ExpenseCategory,
    day_of_month: 1,
  },
  {
    description: "Academia",
    amount: 160,
    type: "expense" as const,
    category: "fixed_subscriptions" as ExpenseCategory,
    day_of_month: 5,
  },
  // Fixed Personal
  {
    description: "Suplementos",
    amount: 240,
    type: "expense" as const,
    category: "fixed_personal" as ExpenseCategory,
    day_of_month: 15,
  },
  {
    description: "Barbeiro",
    amount: 100,
    type: "expense" as const,
    category: "fixed_personal" as ExpenseCategory,
    day_of_month: 15,
  },
  {
    description: "Celular",
    amount: 50,
    type: "expense" as const,
    category: "fixed_personal" as ExpenseCategory,
    day_of_month: 10,
  },
  {
    description: "Gato",
    amount: 100,
    type: "expense" as const,
    category: "fixed_personal" as ExpenseCategory,
    day_of_month: 1,
  },
  // Fixed Taxes
  {
    description: "DAS",
    amount: 80,
    type: "expense" as const,
    category: "fixed_taxes" as ExpenseCategory,
    day_of_month: 20,
  },
  // Variable Credit
  {
    description: "Fatura Cartão",
    amount: 350,
    type: "expense" as const,
    category: "variable_credit" as ExpenseCategory,
    day_of_month: 10,
  },
  // Variable Food
  {
    description: "Alimentação (Almoço)",
    amount: 1000,
    type: "expense" as const,
    category: "variable_food" as ExpenseCategory,
    day_of_month: 1,
  },
  {
    description: "Alimentação (Outros)",
    amount: 400,
    type: "expense" as const,
    category: "variable_food" as ExpenseCategory,
    day_of_month: 1,
  },
  // Variable Transport
  {
    description: "Combustível",
    amount: 250,
    type: "expense" as const,
    category: "variable_transport" as ExpenseCategory,
    day_of_month: 1,
  },
];
