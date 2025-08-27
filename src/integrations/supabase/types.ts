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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          available_times: string[] | null
          booking_conditions: string | null
          cancellation_policy: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          destination_id: string | null
          difficulty: string | null
          duration_hours: number | null
          duration_type: string | null
          equipment_provided: string[] | null
          highlights: string[] | null
          id: string
          included_services: string[] | null
          is_available: boolean | null
          is_featured: boolean | null
          max_group_size: number | null
          meeting_point: string | null
          min_age: number | null
          price: number
          provider_contact: string | null
          provider_name: string | null
          slug: string
          title: string
          updated_at: string
          what_to_bring: string[] | null
        }
        Insert: {
          available_times?: string[] | null
          booking_conditions?: string | null
          cancellation_policy?: string | null
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          duration_type?: string | null
          equipment_provided?: string[] | null
          highlights?: string[] | null
          id?: string
          included_services?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          max_group_size?: number | null
          meeting_point?: string | null
          min_age?: number | null
          price: number
          provider_contact?: string | null
          provider_name?: string | null
          slug: string
          title: string
          updated_at?: string
          what_to_bring?: string[] | null
        }
        Update: {
          available_times?: string[] | null
          booking_conditions?: string | null
          cancellation_policy?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          destination_id?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          duration_type?: string | null
          equipment_provided?: string[] | null
          highlights?: string[] | null
          id?: string
          included_services?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          max_group_size?: number | null
          meeting_point?: string | null
          min_age?: number | null
          price?: number
          provider_contact?: string | null
          provider_name?: string | null
          slug?: string
          title?: string
          updated_at?: string
          what_to_bring?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          best_season: string | null
          continent: string
          country: string
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_days: number | null
          excluded_services: string[] | null
          featured_image_url: string | null
          gallery_images: string[] | null
          highlights: string[] | null
          id: string
          included_services: string[] | null
          is_featured: boolean | null
          is_published: boolean | null
          itinerary: Json | null
          location_coordinates: unknown | null
          long_description: string | null
          max_group_size: number | null
          meta_description: string | null
          meta_title: string | null
          practical_info: Json | null
          price_from: number | null
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          best_season?: string | null
          continent: string
          country: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_days?: number | null
          excluded_services?: string[] | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          highlights?: string[] | null
          id?: string
          included_services?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          itinerary?: Json | null
          location_coordinates?: unknown | null
          long_description?: string | null
          max_group_size?: number | null
          meta_description?: string | null
          meta_title?: string | null
          practical_info?: Json | null
          price_from?: number | null
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          best_season?: string | null
          continent?: string
          country?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_days?: number | null
          excluded_services?: string[] | null
          featured_image_url?: string | null
          gallery_images?: string[] | null
          highlights?: string[] | null
          id?: string
          included_services?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          itinerary?: Json | null
          location_coordinates?: unknown | null
          long_description?: string | null
          max_group_size?: number | null
          meta_description?: string | null
          meta_title?: string | null
          practical_info?: Json | null
          price_from?: number | null
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          available_dates: string[] | null
          booking_conditions: string | null
          cancellation_policy: string | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          destination_id: string | null
          detailed_itinerary: Json | null
          difficulty: string | null
          duration_days: number
          group_size_max: number | null
          group_size_min: number | null
          highlights: string[] | null
          id: string
          included_services: string[] | null
          is_available: boolean | null
          is_featured: boolean | null
          original_price: number | null
          price: number
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          available_dates?: string[] | null
          booking_conditions?: string | null
          cancellation_policy?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          destination_id?: string | null
          detailed_itinerary?: Json | null
          difficulty?: string | null
          duration_days: number
          group_size_max?: number | null
          group_size_min?: number | null
          highlights?: string[] | null
          id?: string
          included_services?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          original_price?: number | null
          price: number
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          available_dates?: string[] | null
          booking_conditions?: string | null
          cancellation_policy?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          destination_id?: string | null
          detailed_itinerary?: Json | null
          difficulty?: string | null
          duration_days?: number
          group_size_max?: number | null
          group_size_min?: number | null
          highlights?: string[] | null
          id?: string
          included_services?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          original_price?: number | null
          price?: number
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
