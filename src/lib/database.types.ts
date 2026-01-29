export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          balance: number
          bank_name: string | null
          color: string | null
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          bank_name?: string | null
          color?: string | null
          created_at?: string
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          bank_name?: string | null
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      category_budgets: {
        Row: {
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          id: string
          monthly_budget: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          id?: string
          monthly_budget?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          id?: string
          monthly_budget?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_cards: {
        Row: {
          closing_day: number
          color: string | null
          created_at: string
          credit_limit: number
          current_bill: number
          due_day: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closing_day: number
          color?: string | null
          created_at?: string
          credit_limit?: number
          current_bill?: number
          due_day: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closing_day?: number
          color?: string | null
          created_at?: string
          credit_limit?: number
          current_bill?: number
          due_day?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_fixed: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_fixed?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_fixed?: boolean | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
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
      oauth_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string | null
          seller_id: string
          updated_at: string | null
          user_nickname: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token?: string | null
          seller_id: string
          updated_at?: string | null
          user_nickname?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string | null
          seller_id?: string
          updated_at?: string | null
          user_nickname?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_bank_account_id: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_step: number | null
          preferred_currency: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_bank_account_id?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_currency?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_bank_account_id?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_currency?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_bank_account_id_fkey"
            columns: ["default_bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          plan: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
          whatsapp_messages_reset_at: string | null
          whatsapp_messages_used: number | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_messages_reset_at?: string | null
          whatsapp_messages_used?: number | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          plan?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          whatsapp_messages_reset_at?: string | null
          whatsapp_messages_used?: number | null
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          quantity: number
          transaction_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          quantity?: number
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          quantity?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          category: Database["public"]["Enums"]["expense_category"] | null
          completed_date: string | null
          created_at: string | null
          credit_card_id: string | null
          custom_category_id: string | null
          description: string
          due_date: string
          id: string
          installment_number: number | null
          is_recurring: boolean | null
          notes: string | null
          parent_transaction_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          recurring_day: number | null
          source: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          total_installments: number | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          completed_date?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          custom_category_id?: string | null
          description: string
          due_date: string
          id?: string
          installment_number?: number | null
          is_recurring?: boolean | null
          notes?: string | null
          parent_transaction_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          recurring_day?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          total_installments?: number | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"] | null
          completed_date?: string | null
          created_at?: string | null
          credit_card_id?: string | null
          custom_category_id?: string | null
          description?: string
          due_date?: string
          id?: string
          installment_number?: number | null
          is_recurring?: boolean | null
          notes?: string | null
          parent_transaction_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          recurring_day?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          total_installments?: number | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_custom_category_id_fkey"
            columns: ["custom_category_id"]
            isOneToOne: false
            referencedRelation: "custom_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_parent_transaction_id_fkey"
            columns: ["parent_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_whatsapp_links: {
        Row: {
          created_at: string | null
          id: string
          phone_number: string
          user_id: string
          verification_code: string | null
          verification_expires_at: string | null
          verified_at: string | null
          whatsapp_lid: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_number: string
          user_id: string
          verification_code?: string | null
          verification_expires_at?: string | null
          verified_at?: string | null
          whatsapp_lid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_number?: string
          user_id?: string
          verification_code?: string | null
          verification_expires_at?: string | null
          verified_at?: string | null
          whatsapp_lid?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_whatsapp_transaction: {
        Args: {
          p_amount: number
          p_category: string
          p_description: string
          p_due_date: string
          p_status?: string
          p_type: string
          p_user_id: string
        }
        Returns: Json
      }
      increment_whatsapp_message: {
        Args: { p_user_id: string }
        Returns: {
          messages_limit: number
          messages_used: number
          success: boolean
        }[]
      }
      reset_whatsapp_messages_if_needed: {
        Args: { p_user_id: string }
        Returns: {
          messages_limit: number
          messages_used: number
          needs_reset: boolean
        }[]
      }
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
      payment_method:
        | "pix"
        | "cash"
        | "debit"
        | "credit"
        | "transfer"
        | "boleto"
      transaction_status: "planned" | "completed"
      transaction_type: "income" | "expense"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      expense_category: [
        "fixed_housing",
        "fixed_utilities",
        "fixed_subscriptions",
        "fixed_personal",
        "fixed_taxes",
        "variable_credit",
        "variable_food",
        "variable_transport",
        "variable_other",
      ],
      payment_method: ["pix", "cash", "debit", "credit", "transfer", "boleto"],
      transaction_status: ["planned", "completed"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
