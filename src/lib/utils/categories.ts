import { Enums, Tables } from "@/lib/database.types";

export type ExpenseCategory = Enums<"expense_category">;
export type CustomCategory = Tables<"custom_categories">;

export const categoryLabels: Record<ExpenseCategory, string> = {
  fixed_housing: "Moradia",
  fixed_utilities: "Contas",
  fixed_subscriptions: "Assinaturas",
  fixed_personal: "Pessoal",
  fixed_taxes: "Impostos",
  variable_credit: "Cartão",
  variable_food: "Alimentação",
  variable_transport: "Transporte",
  variable_other: "Outros",
};

export const categoryIcons: Record<ExpenseCategory, string> = {
  fixed_housing: "Home",
  fixed_utilities: "Zap",
  fixed_subscriptions: "CreditCard",
  fixed_personal: "User",
  fixed_taxes: "FileText",
  variable_credit: "CreditCard",
  variable_food: "UtensilsCrossed",
  variable_transport: "Car",
  variable_other: "MoreHorizontal",
};

export function getCategoryLabel(category: ExpenseCategory | null): string {
  if (!category) return "Sem categoria";
  return categoryLabels[category] || category;
}

export function getCategoryLabelWithCustom(
  category: ExpenseCategory | null,
  customCategoryId: string | null,
  customCategories: CustomCategory[]
): string {
  if (customCategoryId) {
    const custom = customCategories.find(c => c.id === customCategoryId);
    return custom?.name || "Categoria personalizada";
  }
  return getCategoryLabel(category);
}

export function getCategoryColor(
  category: ExpenseCategory | null,
  customCategoryId: string | null,
  customCategories: CustomCategory[]
): string | null {
  if (customCategoryId) {
    const custom = customCategories.find(c => c.id === customCategoryId);
    return custom?.color || null;
  }
  return null;
}
