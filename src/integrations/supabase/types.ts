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
      checklist_items: {
        Row: {
          assigned_to: string | null
          blocked_reason: string | null
          category: Database["public"]["Enums"]["checklist_category"]
          circle_id: string
          created_at: string
          description: string | null
          due_date: string | null
          evidence_note: string | null
          id: string
          linked_document_id: string | null
          requires_professional_review: boolean
          status: Database["public"]["Enums"]["checklist_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          blocked_reason?: string | null
          category?: Database["public"]["Enums"]["checklist_category"]
          circle_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          evidence_note?: string | null
          id?: string
          linked_document_id?: string | null
          requires_professional_review?: boolean
          status?: Database["public"]["Enums"]["checklist_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          blocked_reason?: string | null
          category?: Database["public"]["Enums"]["checklist_category"]
          circle_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          evidence_note?: string | null
          id?: string
          linked_document_id?: string | null
          requires_professional_review?: boolean
          status?: Database["public"]["Enums"]["checklist_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_items_linked_document_id_fkey"
            columns: ["linked_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
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
      documents: {
        Row: {
          category: string
          circle_id: string
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          id: string
          linked_responsible_member: string | null
          review_note: string | null
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          visibility: Database["public"]["Enums"]["document_visibility"]
        }
        Insert: {
          category?: string
          circle_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          linked_responsible_member?: string | null
          review_note?: string | null
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          visibility?: Database["public"]["Enums"]["document_visibility"]
        }
        Update: {
          category?: string
          circle_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          linked_responsible_member?: string | null
          review_note?: string | null
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          visibility?: Database["public"]["Enums"]["document_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
        ]
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
      executor_workspace_notes: {
        Row: {
          author_id: string
          circle_id: string
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          visibility_scope: string
        }
        Insert: {
          author_id: string
          circle_id: string
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          visibility_scope?: string
        }
        Update: {
          author_id?: string
          circle_id?: string
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          visibility_scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "executor_workspace_notes_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_circles: {
        Row: {
          beneficiary_designation_status: Database["public"]["Enums"]["documentary_status"]
          country_code: string | null
          country_group: string | null
          created_at: string
          critical_documents_status: string
          currency_code: string | null
          death_status: Database["public"]["Enums"]["death_status"]
          description: string | null
          dossier_readiness_status: Database["public"]["Enums"]["dossier_readiness_status"]
          id: string
          jurisdiction_pack: string | null
          legal_terms_pack: string | null
          mandate_status: Database["public"]["Enums"]["documentary_status"]
          name: string
          notary_status: Database["public"]["Enums"]["documentary_status"]
          owner_id: string
          region_code: string | null
          testament_status: Database["public"]["Enums"]["documentary_status"]
          updated_at: string
        }
        Insert: {
          beneficiary_designation_status?: Database["public"]["Enums"]["documentary_status"]
          country_code?: string | null
          country_group?: string | null
          created_at?: string
          critical_documents_status?: string
          currency_code?: string | null
          death_status?: Database["public"]["Enums"]["death_status"]
          description?: string | null
          dossier_readiness_status?: Database["public"]["Enums"]["dossier_readiness_status"]
          id?: string
          jurisdiction_pack?: string | null
          legal_terms_pack?: string | null
          mandate_status?: Database["public"]["Enums"]["documentary_status"]
          name: string
          notary_status?: Database["public"]["Enums"]["documentary_status"]
          owner_id: string
          region_code?: string | null
          testament_status?: Database["public"]["Enums"]["documentary_status"]
          updated_at?: string
        }
        Update: {
          beneficiary_designation_status?: Database["public"]["Enums"]["documentary_status"]
          country_code?: string | null
          country_group?: string | null
          created_at?: string
          critical_documents_status?: string
          currency_code?: string | null
          death_status?: Database["public"]["Enums"]["death_status"]
          description?: string | null
          dossier_readiness_status?: Database["public"]["Enums"]["dossier_readiness_status"]
          id?: string
          jurisdiction_pack?: string | null
          legal_terms_pack?: string | null
          mandate_status?: Database["public"]["Enums"]["documentary_status"]
          name?: string
          notary_status?: Database["public"]["Enums"]["documentary_status"]
          owner_id?: string
          region_code?: string | null
          testament_status?: Database["public"]["Enums"]["documentary_status"]
          updated_at?: string
        }
        Relationships: []
      }
      governance_responsibilities: {
        Row: {
          area: Database["public"]["Enums"]["governance_area"]
          circle_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          linked_checklist_item: string | null
          linked_document: string | null
          member_id: string
          note: string | null
          status: Database["public"]["Enums"]["governance_status"]
          title: string
          updated_at: string
        }
        Insert: {
          area: Database["public"]["Enums"]["governance_area"]
          circle_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_checklist_item?: string | null
          linked_document?: string | null
          member_id: string
          note?: string | null
          status?: Database["public"]["Enums"]["governance_status"]
          title: string
          updated_at?: string
        }
        Update: {
          area?: Database["public"]["Enums"]["governance_area"]
          circle_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          linked_checklist_item?: string | null
          linked_document?: string | null
          member_id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["governance_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "governance_responsibilities_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "family_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          circle_id: string
          city: string | null
          created_at: string
          email: string
          expires_at: string
          first_name: string | null
          id: string
          invitation_message: string | null
          invited_by: string
          last_name: string | null
          phone: string | null
          relationship_label: string | null
          resent_at: string | null
          resent_count: number
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          circle_id: string
          city?: string | null
          created_at?: string
          email: string
          expires_at?: string
          first_name?: string | null
          id?: string
          invitation_message?: string | null
          invited_by: string
          last_name?: string | null
          phone?: string | null
          relationship_label?: string | null
          resent_at?: string | null
          resent_count?: number
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Update: {
          circle_id?: string
          city?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          first_name?: string | null
          id?: string
          invitation_message?: string | null
          invited_by?: string
          last_name?: string | null
          phone?: string | null
          relationship_label?: string | null
          resent_at?: string | null
          resent_count?: number
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
      member_family_labels: {
        Row: {
          circle_id: string
          created_at: string
          id: string
          label: Database["public"]["Enums"]["family_label"]
          member_id: string
          note: string | null
        }
        Insert: {
          circle_id: string
          created_at?: string
          id?: string
          label: Database["public"]["Enums"]["family_label"]
          member_id: string
          note?: string | null
        }
        Update: {
          circle_id?: string
          created_at?: string
          id?: string
          label?: Database["public"]["Enums"]["family_label"]
          member_id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_family_labels_circle_id_fkey"
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
      notifications: {
        Row: {
          body: string | null
          circle_id: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          circle_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          circle_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          contact_preference: string | null
          country_code: string | null
          country_group: string | null
          created_at: string
          currency_code: string | null
          email: string
          first_name: string
          full_name: string
          id: string
          is_emergency_contact: boolean
          is_visible_to_family: boolean
          jurisdiction_pack: string | null
          language: string
          last_name: string
          notes: string | null
          phone: string | null
          preferred_language: string | null
          region_code: string | null
          relationship_label: string | null
          secondary_phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          contact_preference?: string | null
          country_code?: string | null
          country_group?: string | null
          created_at?: string
          currency_code?: string | null
          email?: string
          first_name?: string
          full_name?: string
          id?: string
          is_emergency_contact?: boolean
          is_visible_to_family?: boolean
          jurisdiction_pack?: string | null
          language?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          preferred_language?: string | null
          region_code?: string | null
          relationship_label?: string | null
          secondary_phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          contact_preference?: string | null
          country_code?: string | null
          country_group?: string | null
          created_at?: string
          currency_code?: string | null
          email?: string
          first_name?: string
          full_name?: string
          id?: string
          is_emergency_contact?: boolean
          is_visible_to_family?: boolean
          jurisdiction_pack?: string | null
          language?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          preferred_language?: string | null
          region_code?: string | null
          relationship_label?: string | null
          secondary_phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          cancelled_at: string | null
          created_at: string
          founder_discount_applied: boolean
          id: string
          plan: string
          renewal_date: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          founder_discount_applied?: boolean
          id?: string
          plan?: string
          renewal_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          cancelled_at?: string | null
          created_at?: string
          founder_discount_applied?: boolean
          id?: string
          plan?: string
          renewal_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          updated_at?: string
          user_id?: string
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
      can_access_executor_workspace: {
        Args: { _circle_id: string; _user_id: string }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
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
        | "not_started"
        | "assigned"
        | "in_progress"
        | "completed"
        | "blocked"
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
        "not_started",
        "assigned",
        "in_progress",
        "completed",
        "blocked",
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
