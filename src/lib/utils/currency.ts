const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return BRL.format(value);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  return parseFloat(normalized) || 0;
}

export function formatCurrencyInput(value: string): string {
  const numbers = value.replace(/\D/g, "");
  const amount = parseInt(numbers, 10) / 100;
  if (isNaN(amount)) return "";
  return BRL.format(amount);
}
