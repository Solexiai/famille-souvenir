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
      audit_logs: {
        Row: {
          action: string
          circle_id: string | null
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          circle_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          circle_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_members: {
        Row: {
          circle_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          default_sharing: string
          id: string
          marketing_consent: boolean
          privacy_accepted: boolean
          privacy_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          default_sharing?: string
          id?: string
          marketing_consent?: boolean
          privacy_accepted?: boolean
          privacy_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          default_sharing?: string
          id?: string
          marketing_consent?: boolean
          privacy_accepted?: boolean
          privacy_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      family_circles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          circle_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          circle_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Update: {
          circle_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          author_id: string
          caption: string | null
          circle_id: string
          created_at: string
          id: string
          media_url: string | null
          type: Database["public"]["Enums"]["memory_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["memory_visibility"]
        }
        Insert: {
          author_id: string
          caption?: string | null
          circle_id: string
          created_at?: string
          id?: string
          media_url?: string | null
          type?: Database["public"]["Enums"]["memory_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["memory_visibility"]
        }
        Update: {
          author_id?: string
          caption?: string | null
          circle_id?: string
          created_at?: string
          id?: string
          media_url?: string | null
          type?: Database["public"]["Enums"]["memory_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["memory_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "memories_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          language: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          language?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          language?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_documents: {
        Row: {
          category: string | null
          circle_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          label: string
          uploaded_by: string
          visibility: Database["public"]["Enums"]["vault_visibility"]
        }
        Insert: {
          category?: string | null
          circle_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          label: string
          uploaded_by: string
          visibility?: Database["public"]["Enums"]["vault_visibility"]
        }
        Update: {
          category?: string | null
          circle_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          label?: string
          uploaded_by?: string
          visibility?: Database["public"]["Enums"]["vault_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "vault_documents_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_circle_role: {
        Args: { _circle_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_circle_role: {
        Args: {
          _circle_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_circle_manager: {
        Args: { _circle_id: string; _user_id: string }
        Returns: boolean
      }
      is_circle_member: {
        Args: { _circle_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "owner"
        | "family_manager"
        | "contributor"
        | "viewer"
        | "family_member"
        | "heir"
        | "proposed_executor"
        | "verified_executor"
      checklist_category:
        | "legal"
        | "identity"
        | "financial"
        | "insurance"
        | "property"
        | "digital_estate"
        | "final_wishes"
        | "contacts"
        | "executor_readiness"
      checklist_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "needs_review"
        | "blocked"
      death_status: "not_reported" | "reported" | "manually_verified"
      document_visibility:
        | "private_owner"
        | "managers_only"
        | "family_circle"
        | "heirs_only"
        | "executor_workspace"
        | "verified_executor_only"
      documentary_status:
        | "unknown"
        | "declared"
        | "located"
        | "professionally_confirmed"
      dossier_readiness_status:
        | "initial"
        | "in_progress"
        | "partial"
        | "ready_for_professional_review"
        | "executor_ready"
      family_label:
        | "protected_person"
        | "family_manager_label"
        | "caregiver"
        | "heir_label"
        | "trusted_contact"
        | "proposed_executor_label"
        | "testament_named_executor"
        | "external_professional"
      governance_area:
        | "documents"
        | "legal_follow_up"
        | "insurance"
        | "finances"
        | "digital_assets"
        | "property"
        | "medical_directives"
        | "funeral_wishes"
        | "notary_contact"
      governance_status:
        | "assigned"
        | "in_progress"
        | "completed"
        | "needs_attention"
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      memory_type: "photo" | "video" | "audio" | "text"
      memory_visibility: "circle" | "managers" | "private"
      vault_visibility: "owner" | "managers" | "circle"
      verification_status:
        | "unreviewed"
        | "identified"
        | "needs_update"
        | "needs_professional_review"
        | "document_verified"
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
      app_role: [
        "owner",
        "family_manager",
        "contributor",
        "viewer",
        "family_member",
        "heir",
        "proposed_executor",
        "verified_executor",
      ],
      checklist_category: [
        "legal",
        "identity",
        "financial",
        "insurance",
        "property",
        "digital_estate",
        "final_wishes",
        "contacts",
        "executor_readiness",
      ],
      checklist_status: [
        "not_started",
        "in_progress",
        "completed",
        "needs_review",
        "blocked",
      ],
      death_status: ["not_reported", "reported", "manually_verified"],
      document_visibility: [
        "private_owner",
        "managers_only",
        "family_circle",
        "heirs_only",
        "executor_workspace",
        "verified_executor_only",
      ],
      documentary_status: [
        "unknown",
        "declared",
        "located",
        "professionally_confirmed",
      ],
      dossier_readiness_status: [
        "initial",
        "in_progress",
        "partial",
        "ready_for_professional_review",
        "executor_ready",
      ],
      family_label: [
        "protected_person",
        "family_manager_label",
        "caregiver",
        "heir_label",
        "trusted_contact",
        "proposed_executor_label",
        "testament_named_executor",
        "external_professional",
      ],
      governance_area: [
        "documents",
        "legal_follow_up",
        "insurance",
        "finances",
        "digital_assets",
        "property",
        "medical_directives",
        "funeral_wishes",
        "notary_contact",
      ],
      governance_status: [
        "assigned",
        "in_progress",
        "completed",
        "needs_attention",
      ],
      invitation_status: ["pending", "accepted", "declined", "expired"],
      memory_type: ["photo", "video", "audio", "text"],
      memory_visibility: ["circle", "managers", "private"],
      vault_visibility: ["owner", "managers", "circle"],
      verification_status: [
        "unreviewed",
        "identified",
        "needs_update",
        "needs_professional_review",
        "document_verified",
      ],
    },
  },
} as const
