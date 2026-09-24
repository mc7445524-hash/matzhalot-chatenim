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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string
          amount: number | null
          created_at: string
          details: string
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          amount?: number | null
          created_at?: string
          details: string
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          amount?: number | null
          created_at?: string
          details?: string
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      approval_tokens: {
        Row: {
          created_at: string
          expires_at: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          token?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      askanim_incomes: {
        Row: {
          amount: number
          bachur_id: string
          bachur_name: string
          created_at: string
          date: string
          id: string
          notes: string
        }
        Insert: {
          amount?: number
          bachur_id: string
          bachur_name?: string
          created_at?: string
          date?: string
          id: string
          notes?: string
        }
        Update: {
          amount?: number
          bachur_id?: string
          bachur_name?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string
        }
        Relationships: []
      }
      bachurim: {
        Row: {
          basket_cost_at_time: number | null
          basket_date: string | null
          class_level: string
          closed: boolean
          created_at: string
          id: string
          in_askanim: boolean
          join_date: string
          married: boolean
          married_date: string | null
          name: string
          received_basket: boolean
          sku: string
        }
        Insert: {
          basket_cost_at_time?: number | null
          basket_date?: string | null
          class_level?: string
          closed?: boolean
          created_at?: string
          id: string
          in_askanim?: boolean
          join_date?: string
          married?: boolean
          married_date?: string | null
          name: string
          received_basket?: boolean
          sku: string
        }
        Update: {
          basket_cost_at_time?: number | null
          basket_date?: string | null
          class_level?: string
          closed?: boolean
          created_at?: string
          id?: string
          in_askanim?: boolean
          join_date?: string
          married?: boolean
          married_date?: string | null
          name?: string
          received_basket?: boolean
          sku?: string
        }
        Relationships: []
      }
      basket_products: {
        Row: {
          cost: number
          created_at: string
          id: string
          name: string
        }
        Insert: {
          cost?: number
          created_at?: string
          id: string
          name?: string
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      conversation_members: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name?: string | null
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string | null
          type?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          name: string
          notes: string
          returned: boolean
          returned_amount: number | null
          returned_date: string | null
          returned_via: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          id: string
          name?: string
          notes?: string
          returned?: boolean
          returned_amount?: number | null
          returned_date?: string | null
          returned_via?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          name?: string
          notes?: string
          returned?: boolean
          returned_amount?: number | null
          returned_date?: string | null
          returned_via?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          auto: boolean
          category: string
          contact_person: string
          created_at: string
          date: string
          id: string
          notes: string
          recognized: boolean
          recognized_date: string | null
          sub_category: string
        }
        Insert: {
          amount?: number
          auto?: boolean
          category?: string
          contact_person?: string
          created_at?: string
          date?: string
          id: string
          notes?: string
          recognized?: boolean
          recognized_date?: string | null
          sub_category?: string
        }
        Update: {
          amount?: number
          auto?: boolean
          category?: string
          contact_person?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string
          recognized?: boolean
          recognized_date?: string | null
          sub_category?: string
        }
        Relationships: []
      }
      fundraisers: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      incomes: {
        Row: {
          amount: number
          auto: boolean
          category: string | null
          created_at: string
          date: string
          description: string
          fundraiser: string | null
          id: string
          recognized: boolean
          recognized_date: string | null
          target: string | null
        }
        Insert: {
          amount?: number
          auto?: boolean
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          fundraiser?: string | null
          id: string
          recognized?: boolean
          recognized_date?: string | null
          target?: string | null
        }
        Update: {
          amount?: number
          auto?: boolean
          category?: string | null
          created_at?: string
          date?: string
          description?: string
          fundraiser?: string | null
          id?: string
          recognized?: boolean
          recognized_date?: string | null
          target?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      outings: {
        Row: {
          amount: number
          bachur_id: string
          created_at: string
          date: string
          id: string
          name: string
          payment_method: string
          payment_method_detail: string | null
        }
        Insert: {
          amount?: number
          bachur_id: string
          created_at?: string
          date?: string
          id: string
          name: string
          payment_method?: string
          payment_method_detail?: string | null
        }
        Update: {
          amount?: number
          bachur_id?: string
          created_at?: string
          date?: string
          id?: string
          name?: string
          payment_method?: string
          payment_method_detail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outings_bachur_id_fkey"
            columns: ["bachur_id"]
            isOneToOne: false
            referencedRelation: "bachurim"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_admin: boolean
          status: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_admin?: boolean
          status?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_admin?: boolean
          status?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_set_user_status: {
        Args: { _status: string; _user_id: string }
        Returns: undefined
      }
      conversation_creator: { Args: { _conv_id: string }; Returns: string }
      create_dm_conversation: {
        Args: { _other_user_id: string }
        Returns: string
      }
      create_group_conversation: {
        Args: { _member_ids: string[]; _name: string }
        Returns: string
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      is_admin_user: { Args: { _uid: string }; Returns: boolean }
      is_approved_user: { Args: { _uid: string }; Returns: boolean }
      is_conversation_member: {
        Args: { _conv_id: string; _uid: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
