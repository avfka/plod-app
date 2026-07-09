/**
 * Типы схемы Supabase. Написаны вручную в соответствии с supabase/migrations.
 * Когда подключён Supabase-проект — перегенерировать: `npm run gen:types`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'user' | 'organizer' | 'admin';
export type EventType = 'masterclass' | 'championship';
export type EventStatus = 'pending' | 'active' | 'finished' | 'cancelled';
export type BookingStatus = 'active' | 'cancelled' | 'attended';
export type VenueStatus = 'free' | 'occupied';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type MarkerIcon = 'star' | 'circle' | 'square' | 'diamond' | 'heart';

export type Database = {
  public: {
    Tables: {
      dance_directions: {
        Row: {
          id: string;
          name: string;
          slug: string;
          color_hex: string;
          is_active: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          color_hex: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          color_hex?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      choreographers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          is_verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          city: string | null;
          role: UserRole;
          card_color: string;
          marker_icon: MarkerIcon;
          preferred_date: string | null;
          interested_in_mc: boolean;
          interested_in_champ: boolean;
          favorite_choreographer_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          role?: UserRole;
          card_color?: string;
          marker_icon?: MarkerIcon;
          preferred_date?: string | null;
          interested_in_mc?: boolean;
          interested_in_champ?: boolean;
          favorite_choreographer_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          role?: UserRole;
          card_color?: string;
          marker_icon?: MarkerIcon;
          preferred_date?: string | null;
          interested_in_mc?: boolean;
          interested_in_champ?: boolean;
          favorite_choreographer_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profile_directions: {
        Row: {
          profile_id: string;
          direction_id: string;
        };
        Insert: {
          profile_id: string;
          direction_id: string;
        };
        Update: {
          profile_id?: string;
          direction_id?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          event_type: EventType;
          choreographer_id: string | null;
          direction_id: string | null;
          price: number | null;
          is_free: boolean;
          description: string | null;
          photo_url: string | null;
          contact_phone: string | null;
          age_restriction: string | null;
          seats_total: number | null;
          seats_taken: number;
          status: EventStatus;
          card_color: string | null;
          marker_icon: MarkerIcon | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          event_type?: EventType;
          choreographer_id?: string | null;
          direction_id?: string | null;
          price?: number | null;
          is_free?: boolean;
          description?: string | null;
          photo_url?: string | null;
          contact_phone?: string | null;
          age_restriction?: string | null;
          seats_total?: number | null;
          seats_taken?: number;
          status?: EventStatus;
          card_color?: string | null;
          marker_icon?: MarkerIcon | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          event_type?: EventType;
          choreographer_id?: string | null;
          direction_id?: string | null;
          price?: number | null;
          is_free?: boolean;
          description?: string | null;
          photo_url?: string | null;
          contact_phone?: string | null;
          age_restriction?: string | null;
          seats_total?: number | null;
          seats_taken?: number;
          status?: EventStatus;
          card_color?: string | null;
          marker_icon?: MarkerIcon | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      event_sessions: {
        Row: {
          id: string;
          event_id: string;
          day_number: number;
          starts_at: string;
          ends_at: string | null;
          address: string;
          lat: number;
          lng: number;
        };
        Insert: {
          id?: string;
          event_id: string;
          day_number: number;
          starts_at: string;
          ends_at?: string | null;
          address: string;
          lat: number;
          lng: number;
        };
        Update: {
          id?: string;
          event_id?: string;
          day_number?: number;
          starts_at?: string;
          ends_at?: string | null;
          address?: string;
          lat?: number;
          lng?: number;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          name: string;
          address: string;
          lat: number | null;
          lng: number | null;
          district: string | null;
          metro: string | null;
          photo_url: string | null;
          description: string | null;
          owner_contact: string | null;
          rent_price: number | null;
          size_capacity: string | null;
          equipment: string[] | null;
          status: VenueStatus;
          moderation: ModerationStatus;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          lat?: number | null;
          lng?: number | null;
          district?: string | null;
          metro?: string | null;
          photo_url?: string | null;
          description?: string | null;
          owner_contact?: string | null;
          rent_price?: number | null;
          size_capacity?: string | null;
          equipment?: string[] | null;
          status?: VenueStatus;
          moderation?: ModerationStatus;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          lat?: number | null;
          lng?: number | null;
          district?: string | null;
          metro?: string | null;
          photo_url?: string | null;
          description?: string | null;
          owner_contact?: string | null;
          rent_price?: number | null;
          size_capacity?: string | null;
          equipment?: string[] | null;
          status?: VenueStatus;
          moderation?: ModerationStatus;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          status: BookingStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          status?: BookingStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          status?: BookingStatus;
          created_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          event_id: string;
          rating: number | null;
          text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          rating?: number | null;
          text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_id?: string;
          rating?: number | null;
          text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          body: string | null;
          type: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          body?: string | null;
          type?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          body?: string | null;
          type?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          event_id: string;
          user_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string | null;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      choreographer_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          choreographer_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          choreographer_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          choreographer_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_organizer: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      can_see_event: {
        Args: { p_event_id: string };
        Returns: boolean;
      };
      can_chat: {
        Args: { p_event_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      event_type: EventType;
      event_status: EventStatus;
      booking_status: BookingStatus;
      venue_status: VenueStatus;
      moderation_status: ModerationStatus;
      marker_icon: MarkerIcon;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
