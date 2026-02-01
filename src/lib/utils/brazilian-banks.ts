export const BRAZILIAN_BANKS = [
  { value: "nubank", label: "Nubank" },
  { value: "inter", label: "Inter" },
  { value: "c6", label: "C6 Bank" },
  { value: "itau", label: "Itaú" },
  { value: "bradesco", label: "Bradesco" },
  { value: "santander", label: "Santander" },
  { value: "bb", label: "Banco do Brasil" },
  { value: "caixa", label: "Caixa" },
  { value: "btg", label: "BTG Pactual" },
  { value: "picpay", label: "PicPay" },
  { value: "other", label: "Outro" },
] as const

export type BrazilianBank = typeof BRAZILIAN_BANKS[number]["value"]
