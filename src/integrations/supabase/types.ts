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
    PostgrestVersion: "17.1"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          created_at: string
          id: string
          last_seen_at: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen_at?: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen_at?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          summary: Json
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          summary?: Json
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          summary?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          failures: number
          key: string
          locked_until: string | null
          updated_at: string
        }
        Insert: {
          failures?: number
          key: string
          locked_until?: string | null
          updated_at?: string
        }
        Update: {
          failures?: number
          key?: string
          locked_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      moods: {
        Row: {
          color: string
          id: string
          name: string
          name_bn: string
          sort_order: number
        }
        Insert: {
          color: string
          id?: string
          name: string
          name_bn?: string
          sort_order?: number
        }
        Update: {
          color?: string
          id?: string
          name?: string
          name_bn?: string
          sort_order?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          address_encrypted: string
          created_at: string
          customer_name: string
          delivery_charge: number
          district: string
          id: string
          idempotency_key: string
          items: Json
          note: string
          order_number: number
          payment_method: string
          phone_encrypted: string
          public_token: string
          status: string
          total: number
          transaction_id: string | null
        }
        Insert: {
          address_encrypted: string
          created_at?: string
          customer_name: string
          delivery_charge: number
          district: string
          id?: string
          idempotency_key: string
          items: Json
          note?: string
          order_number?: never
          payment_method: string
          phone_encrypted: string
          public_token?: string
          status?: string
          total: number
          transaction_id?: string | null
        }
        Update: {
          address_encrypted?: string
          created_at?: string
          customer_name?: string
          delivery_charge?: number
          district?: string
          id?: string
          idempotency_key?: string
          items?: Json
          note?: string
          order_number?: never
          payment_method?: string
          phone_encrypted?: string
          public_token?: string
          status?: string
          total?: number
          transaction_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          accent_color: string | null
          bottle_image: string | null
          created_at: string
          deleted_at: string | null
          description: string
          description_bn: string
          gallery_images: Json
          id: string
          is_available: boolean
          is_published: boolean
          mood_id: string | null
          name: string
          name_bn: string
          notes: Json
          sizes: Json
          slug: string
          sort_order: number
          tagline: string
          texture_image: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          bottle_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          description_bn?: string
          gallery_images?: Json
          id?: string
          is_available?: boolean
          is_published?: boolean
          mood_id?: string | null
          name: string
          name_bn?: string
          notes?: Json
          sizes?: Json
          slug: string
          sort_order?: number
          tagline?: string
          texture_image?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          bottle_image?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          description_bn?: string
          gallery_images?: Json
          id?: string
          is_available?: boolean
          is_published?: boolean
          mood_id?: string | null
          name?: string
          name_bn?: string
          notes?: Json
          sizes?: Json
          slug?: string
          sort_order?: number
          tagline?: string
          texture_image?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "moods"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          is_public: boolean
          key: string
          value: Json
        }
        Insert: {
          is_public?: boolean
          key: string
          value: Json
        }
        Update: {
          is_public?: boolean
          key?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reserve_login_attempt: { Args: { p_key: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "manager" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["owner", "manager", "staff"],
    },
  },
} as const
