export const ErrorMessages = {
  NOT_AUTHENTICATED: 'Você precisa estar logado para realizar esta ação',
  TRANSACTION_CREATE_FAILED: 'Erro ao criar transação',
  TRANSACTION_UPDATE_FAILED: 'Erro ao atualizar transação',
  TRANSACTION_DELETE_FAILED: 'Erro ao excluir transação',
  BANK_ACCOUNT_CREATE_FAILED: 'Erro ao criar conta bancária',
  BANK_ACCOUNT_UPDATE_FAILED: 'Erro ao atualizar conta bancária',
  BANK_ACCOUNT_DELETE_FAILED: 'Erro ao excluir conta bancária',
  CREDIT_CARD_CREATE_FAILED: 'Erro ao criar cartão de crédito',
  CREDIT_CARD_UPDATE_FAILED: 'Erro ao atualizar cartão de crédito',
  CREDIT_CARD_DELETE_FAILED: 'Erro ao excluir cartão de crédito',
  BUDGET_UPDATE_FAILED: 'Erro ao atualizar orçamento',
  RECURRING_CREATE_FAILED: 'Erro ao criar recorrência',
  RECURRING_UPDATE_FAILED: 'Erro ao atualizar recorrência',
  RECURRING_DELETE_FAILED: 'Erro ao excluir recorrência',
  RECURRING_GENERATE_FAILED: 'Erro ao gerar transações recorrentes',
  GENERIC_ERROR: 'Ocorreu um erro inesperado',
} as const

export type ErrorMessageKey = keyof typeof ErrorMessages

export class AppError extends Error {
  constructor(
    public key: ErrorMessageKey,
    public originalError?: unknown
  ) {
    super(ErrorMessages[key])
    this.name = 'AppError'
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }
  if (error instanceof Error) {
    // Map known English messages to Portuguese
    if (error.message === 'Not authenticated') {
      return ErrorMessages.NOT_AUTHENTICATED
    }
    return error.message
  }
  return ErrorMessages.GENERIC_ERROR
}
