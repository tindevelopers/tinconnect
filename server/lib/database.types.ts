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
      tenants: {
        Row: {
          id: string
          name: string
          domain: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          name: string
          role: 'admin' | 'user' | 'guest'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id: string
          email: string
          name: string
          role?: 'admin' | 'user' | 'guest'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user' | 'guest'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      meetings: {
        Row: {
          id: string
          tenant_id: string
          title: string
          description: string | null
          host_id: string
          settings: Json
          status: 'scheduled' | 'active' | 'ended' | 'cancelled'
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          chime_meeting_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          title: string
          description?: string | null
          host_id: string
          settings?: Json
          status?: 'scheduled' | 'active' | 'ended' | 'cancelled'
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          chime_meeting_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          title?: string
          description?: string | null
          host_id?: string
          settings?: Json
          status?: 'scheduled' | 'active' | 'ended' | 'cancelled'
          scheduled_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          chime_meeting_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          name: string
          email: string
          role: 'host' | 'attendee'
          joined_at: string | null
          left_at: string | null
          is_present: boolean
          chime_attendee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          name: string
          email: string
          role?: 'host' | 'attendee'
          joined_at?: string | null
          left_at?: string | null
          is_present?: boolean
          chime_attendee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          name?: string
          email?: string
          role?: 'host' | 'attendee'
          joined_at?: string | null
          left_at?: string | null
          is_present?: boolean
          chime_attendee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      tenant_meetings: {
        Row: {
          id: string | null
          tenant_id: string | null
          title: string | null
          description: string | null
          host_id: string | null
          settings: Json | null
          status: 'scheduled' | 'active' | 'ended' | 'cancelled' | null
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          chime_meeting_id: string | null
          created_at: string | null
          updated_at: string | null
          tenant_name: string | null
          tenant_domain: string | null
          host_name: string | null
          host_email: string | null
          participant_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_meetings: {
        Args: {
          user_uuid?: string
        }
        Returns: {
          meeting_id: string
          title: string
          description: string | null
          status: 'scheduled' | 'active' | 'ended' | 'cancelled'
          scheduled_at: string | null
          started_at: string | null
          ended_at: string | null
          is_host: boolean
          participant_count: number
        }[]
      }
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      meeting_status: 'scheduled' | 'active' | 'ended' | 'cancelled'
      participant_role: 'host' | 'attendee'
      user_role: 'admin' | 'user' | 'guest'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for better TypeScript experience
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Meeting = Database['public']['Tables']['meetings']['Row']
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert']
export type MeetingUpdate = Database['public']['Tables']['meetings']['Update']

export type MeetingParticipant = Database['public']['Tables']['meeting_participants']['Row']
export type MeetingParticipantInsert = Database['public']['Tables']['meeting_participants']['Insert']
export type MeetingParticipantUpdate = Database['public']['Tables']['meeting_participants']['Update']

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']

export type TenantMeeting = Database['public']['Views']['tenant_meetings']['Row']

export type UserRole = Database['public']['Enums']['user_role']
export type MeetingStatus = Database['public']['Enums']['meeting_status']
export type ParticipantRole = Database['public']['Enums']['participant_role']
