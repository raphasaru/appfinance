export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      financial_goals: {
        Row: {
          created_at: string | null
          dollar_rate: number | null
          id: string
          invested_amount: number | null
          month_year: string
          notes: string | null
          savings_goal: number | null
          total_debts: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dollar_rate?: number | null
          id?: string
          invested_amount?: number | null
          month_year: string
          notes?: string | null
          savings_goal?: number | null
          total_debts?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dollar_rate?: number | null
          id?: string
          invested_amount?: number | null
          month_year?: string
          notes?: string | null
          savings_goal?: number | null
          total_debts?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_history: {
        Row: {
          created_at: string | null
          id: string
          investment_id: string
          price: number
          recorded_at: string
          total_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          investment_id: string
          price: number
          recorded_at: string
          total_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          investment_id?: string
          price?: number
          recorded_at?: string
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "investment_history_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          average_price: number | null
          created_at: string | null
          currency: string | null
          current_price: number | null
          id: string
          name: string
          notes: string | null
          quantity: number | null
          ticker: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_price?: number | null
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          id?: string
          name: string
          notes?: string | null
          quantity?: number | null
          ticker?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_price?: number | null
          created_at?: string | null
          currency?: string | null
          current_price?: number | null
          id?: string
          name?: string
          notes?: string | null
          quantity?: number | null
          ticker?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          preferred_currency: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          preferred_currency?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          preferred_currency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_templates: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"] | null
          created_at: string | null
          day_of_month: number
          description: string
          id: string
          is_active: boolean | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string | null
          day_of_month: number
          description: string
          id?: string
          is_active?: boolean | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"] | null
          created_at?: string | null
          day_of_month?: number
          description?: string
          id?: string
          is_active?: boolean | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"] | null
          completed_date: string | null
          created_at: string | null
          description: string
          due_date: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          recurring_day: number | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: Database["public"]["Enums"]["expense_category"] | null
          completed_date?: string | null
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurring_day?: number | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"] | null
          completed_date?: string | null
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          recurring_day?: number | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      expense_category:
        | "fixed_housing"
        | "fixed_utilities"
        | "fixed_subscriptions"
        | "fixed_personal"
        | "fixed_taxes"
        | "variable_credit"
        | "variable_food"
        | "variable_transport"
        | "variable_other"
      transaction_status: "planned" | "completed"
      transaction_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
