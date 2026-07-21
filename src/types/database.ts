/**
 * Типы схемы Supabase (проект tanz-karta, roryjhgwvmdiopzsudgm).
 * Сгенерировано из живой схемы. Перегенерация: `npm run gen:types`
 * (локальный стек) или Supabase MCP `generate_typescript_types`.
 */

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
      bookings: {
        Row: {
          created_at: string
          event_id: string
          id: string
          session_id: string | null
          status: Database["public"]["Enums"]["booking_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "event_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          event_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          event_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      choreographer_subscriptions: {
        Row: {
          choreographer_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          choreographer_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          choreographer_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "choreographer_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      choreographers: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          center_lat: number
          center_lng: number
          country_code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          timezone: string
        }
        Insert: {
          center_lat: number
          center_lng: number
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          timezone: string
        }
        Update: {
          center_lat?: number
          center_lng?: number
          country_code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          timezone?: string
        }
        Relationships: []
      }
      dance_directions: {
        Row: {
          color_hex: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          color_hex: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          color_hex?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      event_interest_signals: {
        Row: {
          created_at: string
          event_id: string
          id: string
          occurred_on: string
          signal_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          occurred_on?: string
          signal_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          occurred_on?: string
          signal_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interest_signals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_interest_signals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sessions: {
        Row: {
          address: string
          city_id: string
          day_number: number
          ends_at: string | null
          event_id: string
          id: string
          lat: number
          lng: number
          starts_at: string
        }
        Insert: {
          address: string
          city_id?: string
          day_number: number
          ends_at?: string | null
          event_id: string
          id?: string
          lat: number
          lng: number
          starts_at: string
        }
        Update: {
          address?: string
          city_id?: string
          day_number?: number
          ends_at?: string | null
          event_id?: string
          id?: string
          lat?: number
          lng?: number
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_sessions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_restriction: string | null
          card_color: string | null
          choreographer_id: string | null
          contact_phone: string | null
          created_at: string
          created_by: string | null
          description: string | null
          direction_id: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_free: boolean
          marker_icon: Database["public"]["Enums"]["marker_icon"] | null
          moderation_reason: string | null
          photo_url: string | null
          price: number | null
          seats_taken: number
          seats_total: number | null
          status: Database["public"]["Enums"]["event_status"]
          title: string
        }
        Insert: {
          age_restriction?: string | null
          card_color?: string | null
          choreographer_id?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_free?: boolean
          marker_icon?: Database["public"]["Enums"]["marker_icon"] | null
          moderation_reason?: string | null
          photo_url?: string | null
          price?: number | null
          seats_taken?: number
          seats_total?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          title: string
        }
        Update: {
          age_restriction?: string | null
          card_color?: string | null
          choreographer_id?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_id?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_free?: boolean
          marker_icon?: Database["public"]["Enums"]["marker_icon"] | null
          moderation_reason?: string | null
          photo_url?: string | null
          price?: number | null
          seats_taken?: number
          seats_total?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_choreographer_id_fkey"
            columns: ["choreographer_id"]
            isOneToOne: false
            referencedRelation: "choreographers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "dance_directions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          title: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_directions: {
        Row: {
          direction_id: string
          profile_id: string
        }
        Insert: {
          direction_id: string
          profile_id: string
        }
        Update: {
          direction_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_directions_direction_id_fkey"
            columns: ["direction_id"]
            isOneToOne: false
            referencedRelation: "dance_directions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_directions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          card_color: string
          city: string | null
          city_id: string | null
          created_at: string
          email: string | null
          favorite_choreographer_id: string | null
          full_name: string | null
          id: string
          interested_in_champ: boolean
          interested_in_mc: boolean
          marker_icon: Database["public"]["Enums"]["marker_icon"]
          phone: string | null
          preferred_date: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          avatar_url?: string | null
          card_color?: string
          city?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          favorite_choreographer_id?: string | null
          full_name?: string | null
          id: string
          interested_in_champ?: boolean
          interested_in_mc?: boolean
          marker_icon?: Database["public"]["Enums"]["marker_icon"]
          phone?: string | null
          preferred_date?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          avatar_url?: string | null
          card_color?: string
          city?: string | null
          city_id?: string | null
          created_at?: string
          email?: string | null
          favorite_choreographer_id?: string | null
          full_name?: string | null
          id?: string
          interested_in_champ?: boolean
          interested_in_mc?: boolean
          marker_icon?: Database["public"]["Enums"]["marker_icon"]
          phone?: string | null
          preferred_date?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_favorite_choreographer_id_fkey"
            columns: ["favorite_choreographer_id"]
            isOneToOne: false
            referencedRelation: "choreographers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          event_id: string
          id: string
          rating: number | null
          text: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          rating?: number | null
          text?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          rating?: number | null
          text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          city_id: string
          created_at: string
          created_by: string | null
          description: string | null
          district: string | null
          equipment: string[] | null
          id: string
          lat: number | null
          lng: number | null
          metro: string | null
          moderation: Database["public"]["Enums"]["moderation_status"]
          name: string
          owner_contact: string | null
          photo_url: string | null
          rent_price: number | null
          size_capacity: string | null
          status: Database["public"]["Enums"]["venue_status"]
        }
        Insert: {
          address: string
          city_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          district?: string | null
          equipment?: string[] | null
          id?: string
          lat?: number | null
          lng?: number | null
          metro?: string | null
          moderation?: Database["public"]["Enums"]["moderation_status"]
          name: string
          owner_contact?: string | null
          photo_url?: string | null
          rent_price?: number | null
          size_capacity?: string | null
          status?: Database["public"]["Enums"]["venue_status"]
        }
        Update: {
          address?: string
          city_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          district?: string | null
          equipment?: string[] | null
          id?: string
          lat?: number | null
          lng?: number | null
          metro?: string | null
          moderation?: Database["public"]["Enums"]["moderation_status"]
          name?: string
          owner_contact?: string | null
          photo_url?: string | null
          rent_price?: number | null
          size_capacity?: string | null
          status?: Database["public"]["Enums"]["venue_status"]
        }
        Relationships: [
          {
            foreignKeyName: "venues_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      book_event: {
        Args: { p_event_id: string; p_session_id: string }
        Returns: Database["public"]["Enums"]["booking_status"]
      }
      cancel_booking: {
        Args: { p_event_id: string }
        Returns: Database["public"]["Enums"]["booking_status"]
      }
      create_event: {
        Args: { p_event: Json; p_sessions: Json }
        Returns: string
      }
      moderate_event: {
        Args: { p_decision: string; p_event_id: string; p_reason?: string }
        Returns: Database["public"]["Tables"]["events"]["Row"]
      }
    }
    Enums: {
      booking_status: "active" | "cancelled" | "attended"
      event_status: "pending" | "rejected" | "active" | "finished" | "cancelled"
      event_type: "masterclass" | "championship"
      marker_icon: "star" | "circle" | "square" | "diamond" | "heart"
      moderation_status: "pending" | "approved" | "rejected"
      user_role: "user" | "organizer" | "admin"
      venue_status: "free" | "occupied"
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
      booking_status: ["active", "cancelled", "attended"],
      event_status: ["pending", "rejected", "active", "finished", "cancelled"],
      event_type: ["masterclass", "championship"],
      marker_icon: ["star", "circle", "square", "diamond", "heart"],
      moderation_status: ["pending", "approved", "rejected"],
      user_role: ["user", "organizer", "admin"],
      venue_status: ["free", "occupied"],
    },
  },
} as const
