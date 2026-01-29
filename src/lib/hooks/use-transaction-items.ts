'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'

type TransactionItem = Database['public']['Tables']['transaction_items']['Row']
type TransactionItemInsert = Database['public']['Tables']['transaction_items']['Insert']

export function useTransactionItems(transactionId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['transaction-items', transactionId],
    queryFn: async () => {
      if (!transactionId) return []

      const { data, error } = await supabase
        .from('transaction_items')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as TransactionItem[]
    },
    enabled: !!transactionId,
  })
}

export function useCreateTransactionItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: TransactionItemInsert) => {
      const { data, error } = await supabase
        .from('transaction_items')
        .insert(item)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transaction-items', data.transaction_id] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useUpdateTransactionItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransactionItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('transaction_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transaction-items', data.transaction_id] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useDeleteTransactionItem() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, transactionId }: { id: string; transactionId: string }) => {
      const { error } = await supabase
        .from('transaction_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, transactionId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transaction-items', data.transactionId] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useBulkCreateTransactionItems() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (items: TransactionItemInsert[]) => {
      if (items.length === 0) return []

      const { data, error } = await supabase
        .from('transaction_items')
        .insert(items)
        .select()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['transaction-items', data[0].transaction_id] })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
      }
    },
  })
}
