/**
 * Map of table → field → original type.
 * Fields listed here will be encrypted before write and decrypted after read.
 */
export const ENCRYPTED_FIELDS: Record<
  string,
  Record<string, "number" | "string">
> = {
  transactions: {
    amount: "number",
    description: "string",
    notes: "string",
  },
  transaction_items: {
    amount: "number",
    description: "string",
  },
  bank_accounts: {
    balance: "number",
  },
  credit_cards: {
    credit_limit: "number",
    current_bill: "number",
  },
  recurring_templates: {
    amount: "number",
    description: "string",
  },
  financial_goals: {
    savings_goal: "number",
    invested_amount: "number",
    total_debts: "number",
    dollar_rate: "number",
    notes: "string",
  },
  investments: {
    average_price: "number",
    current_price: "number",
    quantity: "number",
    notes: "string",
  },
  investment_history: {
    price: "number",
    total_value: "number",
  },
  category_budgets: {
    monthly_budget: "number",
  },
};
