/**
 * Generated-compatible Supabase Database TypeScript definitions for CNU Free.
 *
 * Keep synchronized with live Supabase Cloud migrations via:
 *   npm --prefix backend run db:types
 *
 * Covers [BE-02] core tables and supporting access-control tables.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ScheduleVisibility = 'only_me' | 'friends_only' | 'selected_friends';
export type ScheduleSource = 'manual' | 'ocr';
export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type NotificationCategory =
  | 'friend_request_received'
  | 'friend_request_accepted'
  | 'friend_schedule_updated';
export type SharedLinkPermission = 'full_schedule' | 'free_busy_only' | 'specific_hours';
export type ScheduleAccessLevel = 'full_view' | 'free_only' | 'busy_only';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          full_name: string;
          username: string;
          email: string;
          avatar_url: string | null;
          bio: string;
          schedule_visibility: ScheduleVisibility;
          notify_friend_requests: boolean;
          notify_request_accepted: boolean;
          notify_schedule_updates: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          bio?: string;
          schedule_visibility?: ScheduleVisibility;
          notify_friend_requests?: boolean;
          notify_request_accepted?: boolean;
          notify_schedule_updates?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          full_name?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          bio?: string;
          schedule_visibility?: ScheduleVisibility;
          notify_friend_requests?: boolean;
          notify_request_accepted?: boolean;
          notify_schedule_updates?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      schedules: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          day_of_week: number | null;
          specific_date: string | null;
          start_time: string;
          end_time: string;
          room: string | null;
          notes: string | null;
          is_busy: boolean;
          source: ScheduleSource;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          day_of_week?: number | null;
          specific_date?: string | null;
          start_time: string;
          end_time: string;
          room?: string | null;
          notes?: string | null;
          is_busy?: boolean;
          source?: ScheduleSource;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          day_of_week?: number | null;
          specific_date?: string | null;
          start_time?: string;
          end_time?: string;
          room?: string | null;
          notes?: string | null;
          is_busy?: boolean;
          source?: ScheduleSource;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'schedules_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      friend_requests: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          status: FriendRequestStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          status?: FriendRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          status?: FriendRequestStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friend_requests_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friend_requests_receiver_id_fkey';
            columns: ['receiver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      friendships: {
        Row: {
          id: string;
          user_id_1: string;
          user_id_2: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id_1: string;
          user_id_2: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id_1?: string;
          user_id_2?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friendships_user_id_1_fkey';
            columns: ['user_id_1'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friendships_user_id_2_fkey';
            columns: ['user_id_2'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      friend_groups: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friend_groups_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      friend_group_members: {
        Row: {
          group_id: string;
          member_id: string;
          added_at: string;
        };
        Insert: {
          group_id: string;
          member_id: string;
          added_at?: string;
        };
        Update: {
          group_id?: string;
          member_id?: string;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friend_group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'friend_groups';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friend_group_members_member_id_fkey';
            columns: ['member_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string | null;
          category: NotificationCategory;
          title: string;
          detail_text: string;
          is_read: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id?: string | null;
          category: NotificationCategory;
          title: string;
          detail_text: string;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          actor_id?: string | null;
          category?: NotificationCategory;
          title?: string;
          detail_text?: string;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      shared_links: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          permission: SharedLinkPermission;
          specific_hours: Json | null;
          expires_at: string;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          permission?: SharedLinkPermission;
          specific_hours?: Json | null;
          expires_at: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          permission?: SharedLinkPermission;
          specific_hours?: Json | null;
          expires_at?: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'shared_links_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      blocked_users: {
        Row: {
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: {
          blocker_id?: string;
          blocked_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blocked_users_blocker_id_fkey';
            columns: ['blocker_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blocked_users_blocked_id_fkey';
            columns: ['blocked_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      schedule_permissions: {
        Row: {
          id: string;
          owner_id: string;
          target_user_id: string | null;
          target_group_id: string | null;
          access_level: ScheduleAccessLevel;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          target_user_id?: string | null;
          target_group_id?: string | null;
          access_level?: ScheduleAccessLevel;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          target_user_id?: string | null;
          target_group_id?: string | null;
          access_level?: ScheduleAccessLevel;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'schedule_permissions_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_permissions_target_user_id_fkey';
            columns: ['target_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'schedule_permissions_target_group_id_fkey';
            columns: ['target_group_id'];
            isOneToOne: false;
            referencedRelation: 'friend_groups';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
