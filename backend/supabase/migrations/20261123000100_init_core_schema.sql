-- ============================================================================
-- [BE-02] Core PostgreSQL Relational Schema for CNU Free
-- Migration: 20261123000100_init_core_schema.sql
--
-- IMPORTANT RLS COORDINATION NOTE:
--   Row-Level Security (ALTER TABLE ... ENABLE ROW LEVEL SECURITY) is
--   intentionally NOT enabled in this migration so teammates implementing
--   [BE-04] through [BE-08] are not silently blocked by default deny-all rules.
--   All RLS policies and permission checks will be added in [BE-09].
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Shared trigger function to automatically maintain updated_at timestamps
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 1. profiles (1:1 extension of auth.users; aligned with src/types/profile.ts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$'),
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT NOT NULL DEFAULT '',
  schedule_visibility TEXT NOT NULL DEFAULT 'friends_only'
    CHECK (schedule_visibility IN ('only_me', 'friends_only', 'selected_friends')),
  notify_friend_requests BOOLEAN NOT NULL DEFAULT true,
  notify_request_accepted BOOLEAN NOT NULL DEFAULT true,
  notify_schedule_updates BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles (full_name);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. schedules (Recurring weekly & date-specific blocks; BE-05, BE-08, BE-10)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  specific_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  notes TEXT,
  is_busy BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'ocr')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_schedules_valid_time_range CHECK (end_time > start_time),
  CONSTRAINT chk_schedules_day_or_date CHECK (
    day_of_week IS NOT NULL OR specific_date IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_schedules_user_day_start
  ON public.schedules (user_id, day_of_week, start_time);

CREATE INDEX IF NOT EXISTS idx_schedules_user_date_start
  ON public.schedules (user_id, specific_date, start_time);

DROP TRIGGER IF EXISTS trg_schedules_updated_at ON public.schedules;
CREATE TRIGGER trg_schedules_updated_at
  BEFORE UPDATE ON public.schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. friend_requests (Unique partial index prevents duplicate pending requests)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_friend_requests_no_self CHECK (sender_id <> receiver_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_friend_requests_pending_pair
  ON public.friend_requests (sender_id, receiver_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver_status
  ON public.friend_requests (receiver_id, status);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_status
  ON public.friend_requests (sender_id, status);

DROP TRIGGER IF EXISTS trg_friend_requests_updated_at ON public.friend_requests;
CREATE TRIGGER trg_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. friendships (Canonical pair ordering user_id_1 < user_id_2)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_friendships_canonical_order CHECK (user_id_1 < user_id_2),
  CONSTRAINT uq_friendships_pair UNIQUE (user_id_1, user_id_2)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_1 ON public.friendships (user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user_2 ON public.friendships (user_id_2);

-- ----------------------------------------------------------------------------
-- 5. friend_groups
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_friend_groups_owner_name UNIQUE (owner_id, name)
);

CREATE INDEX IF NOT EXISTS idx_friend_groups_owner_id ON public.friend_groups (owner_id);

DROP TRIGGER IF EXISTS trg_friend_groups_updated_at ON public.friend_groups;
CREATE TRIGGER trg_friend_groups_updated_at
  BEFORE UPDATE ON public.friend_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. friend_group_members
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.friend_group_members (
  group_id UUID NOT NULL REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_group_members_member_id
  ON public.friend_group_members (member_id);

-- ----------------------------------------------------------------------------
-- 7. notifications (Aligned with src/types/notifications.ts & BE-11)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL
    CHECK (category IN (
      'friend_request_received',
      'friend_request_accepted',
      'friend_schedule_updated'
    )),
  title TEXT NOT NULL,
  detail_text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON public.notifications (user_id, is_read, created_at DESC);

-- ----------------------------------------------------------------------------
-- 8. shared_links (Aligned with src/types/profile.ts & BE-12)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  permission TEXT NOT NULL DEFAULT 'free_busy_only'
    CHECK (permission IN ('full_schedule', 'free_busy_only', 'specific_hours')),
  specific_hours JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shared_links_token ON public.shared_links (token);
CREATE INDEX IF NOT EXISTS idx_shared_links_user_enabled
  ON public.shared_links (user_id, is_enabled);

DROP TRIGGER IF EXISTS trg_shared_links_updated_at ON public.shared_links;
CREATE TRIGGER trg_shared_links_updated_at
  BEFORE UPDATE ON public.shared_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 9. Supporting Access-Control Tables for BE-04, BE-06, BE-09, PS-09 & PS-12
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blocked_users (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT chk_blocked_users_no_self CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id
  ON public.blocked_users (blocked_id);

CREATE TABLE IF NOT EXISTS public.schedule_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_group_id UUID REFERENCES public.friend_groups(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'free_only'
    CHECK (access_level IN ('full_view', 'free_only', 'busy_only')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_schedule_permissions_single_target CHECK (
    (target_user_id IS NOT NULL AND target_group_id IS NULL)
    OR (target_user_id IS NULL AND target_group_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_schedule_permissions_owner_id
  ON public.schedule_permissions (owner_id);
CREATE INDEX IF NOT EXISTS idx_schedule_permissions_target_user
  ON public.schedule_permissions (target_user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_permissions_target_group
  ON public.schedule_permissions (target_group_id);
