-- ============================================================================
-- [BE-09] Row-Level Security (RLS) Policies & Permission Helper Functions
-- Migration: 20261128000300_be09_rls_policies.sql
--
-- Enables RLS on all 10 core PostgreSQL tables and enforces:
--   - Ownership isolation on personal resources
--   - Bidirectional block-list enforcement (blocked_users)
--   - Schedule visibility rules (only_me, friends_only, selected_friends)
--   - Granular friend & group schedule permissions (full_view, free_only, busy_only)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SECURITY DEFINER Helper Functions (prevent cross-table RLS recursion)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_blocked_between(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN user_a IS NULL OR user_b IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.blocked_users b
      WHERE (b.blocker_id = user_a AND b.blocked_id = user_b)
         OR (b.blocker_id = user_b AND b.blocked_id = user_a)
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.are_friends(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN user_a IS NULL OR user_b IS NULL OR user_a = user_b THEN false
    WHEN public.is_blocked_between(user_a, user_b) THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.friendships f
      WHERE f.user_id_1 = LEAST(user_a, user_b)
        AND f.user_id_2 = GREATEST(user_a, user_b)
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.owns_friend_group(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_group_id IS NULL OR p_user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.friend_groups fg
      WHERE fg.id = p_group_id
        AND fg.owner_id = p_user_id
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_group_id IS NULL OR p_user_id IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.friend_group_members fgm
      WHERE fgm.group_id = p_group_id
        AND fgm.member_id = p_user_id
    )
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_schedule_access_level(
  p_owner_id UUID,
  p_viewer_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visibility TEXT;
  v_direct_access TEXT;
  v_group_access TEXT;
BEGIN
  IF p_owner_id IS NULL OR p_viewer_id IS NULL THEN
    RETURN 'none';
  END IF;

  IF p_owner_id = p_viewer_id THEN
    RETURN 'owner';
  END IF;

  IF public.is_blocked_between(p_owner_id, p_viewer_id) THEN
    RETURN 'blocked';
  END IF;

  SELECT p.schedule_visibility
  INTO v_visibility
  FROM public.profiles p
  WHERE p.id = p_owner_id;

  IF NOT FOUND THEN
    RETURN 'none';
  END IF;

  IF v_visibility = 'only_me' THEN
    RETURN 'restricted';
  END IF;

  IF NOT public.are_friends(p_owner_id, p_viewer_id) THEN
    RETURN 'restricted';
  END IF;

  -- Direct per-friend permission takes precedence over group permissions
  SELECT sp.access_level
  INTO v_direct_access
  FROM public.schedule_permissions sp
  WHERE sp.owner_id = p_owner_id
    AND sp.target_user_id = p_viewer_id
  LIMIT 1;

  IF v_direct_access IS NOT NULL THEN
    RETURN v_direct_access;
  END IF;

  -- Otherwise evaluate group-level permissions (most permissive wins)
  SELECT CASE MAX(
    CASE sp.access_level
      WHEN 'full_view' THEN 3
      WHEN 'free_only' THEN 2
      WHEN 'busy_only' THEN 1
      ELSE 0
    END
  )
    WHEN 3 THEN 'full_view'
    WHEN 2 THEN 'free_only'
    WHEN 1 THEN 'busy_only'
    ELSE NULL
  END
  INTO v_group_access
  FROM public.schedule_permissions sp
  INNER JOIN public.friend_group_members fgm
    ON fgm.group_id = sp.target_group_id
  WHERE sp.owner_id = p_owner_id
    AND sp.target_group_id IS NOT NULL
    AND fgm.member_id = p_viewer_id;

  IF v_group_access IS NOT NULL THEN
    RETURN v_group_access;
  END IF;

  IF v_visibility = 'friends_only' THEN
    RETURN 'full_view';
  END IF;

  -- selected_friends with no matching direct or group permission
  RETURN 'restricted';
END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_user_schedule(
  p_owner_id UUID,
  p_viewer_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_schedule_access_level(p_owner_id, p_viewer_id)
    IN ('owner', 'full_view', 'free_only', 'busy_only');
$$;

-- ----------------------------------------------------------------------------
-- [BE-09] get_user_schedule_access(p_target_user_id)
-- Evaluates block-list, friendship, visibility rule, and schedule presence
-- for auth.uid() -> p_target_user_id.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_schedule_access(
  p_target_user_id UUID
)
RETURNS TABLE (
  target_user_id UUID,
  profile_exists BOOLEAN,
  is_self BOOLEAN,
  is_blocked BOOLEAN,
  is_friend BOOLEAN,
  schedule_visibility TEXT,
  access_level TEXT,
  can_view_schedule BOOLEAN,
  has_any_schedule BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_id UUID := auth.uid();
  v_exists BOOLEAN := false;
  v_visibility TEXT := 'only_me';
  v_is_blocked BOOLEAN := false;
  v_is_friend BOOLEAN := false;
  v_access_level TEXT := 'none';
  v_can_view BOOLEAN := false;
  v_has_schedule BOOLEAN := false;
BEGIN
  IF v_viewer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT true, p.schedule_visibility
  INTO v_exists, v_visibility
  FROM public.profiles p
  WHERE p.id = p_target_user_id;

  IF NOT COALESCE(v_exists, false) THEN
    RETURN QUERY SELECT
      p_target_user_id,
      false,
      false,
      false,
      false,
      'only_me'::TEXT,
      'none'::TEXT,
      false,
      false;
    RETURN;
  END IF;

  IF p_target_user_id = v_viewer_id THEN
    SELECT EXISTS (
      SELECT 1 FROM public.schedules s WHERE s.user_id = p_target_user_id
    ) INTO v_has_schedule;

    RETURN QUERY SELECT
      p_target_user_id,
      true,
      true,
      false,
      false,
      v_visibility,
      'owner'::TEXT,
      true,
      v_has_schedule;
    RETURN;
  END IF;

  v_is_blocked := public.is_blocked_between(p_target_user_id, v_viewer_id);
  v_is_friend := public.are_friends(p_target_user_id, v_viewer_id);
  v_access_level := public.get_schedule_access_level(p_target_user_id, v_viewer_id);
  v_can_view := v_access_level IN ('owner', 'full_view', 'free_only', 'busy_only');

  IF v_can_view THEN
    SELECT EXISTS (
      SELECT 1 FROM public.schedules s WHERE s.user_id = p_target_user_id
    ) INTO v_has_schedule;
  END IF;

  RETURN QUERY SELECT
    p_target_user_id,
    true,
    false,
    v_is_blocked,
    v_is_friend,
    v_visibility,
    v_access_level,
    v_can_view,
    v_has_schedule;
END;
$$;

REVOKE ALL ON FUNCTION public.is_blocked_between(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.are_friends(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owns_friend_group(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_group_member(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_schedule_access_level(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_view_user_schedule(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_schedule_access(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_blocked_between(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_friends(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_friend_group(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_schedule_access_level(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_user_schedule(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_schedule_access(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- 2. Enable Row-Level Security on ALL 10 PostgreSQL Tables
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_permissions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. RLS Policies: public.profiles
-- ----------------------------------------------------------------------------
-- Authenticated users can view non-blocking profiles (and profiles they themselves blocked
-- so they can manage their blocked list). Anon can resolve public profile identifiers.
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
CREATE POLICY profiles_select_policy
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR auth.uid() IS NULL
    OR NOT EXISTS (
      SELECT 1
      FROM public.blocked_users b
      WHERE b.blocker_id = profiles.id
        AND b.blocked_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 4. RLS Policies: public.schedules
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS schedules_select_visible ON public.schedules;
CREATE POLICY schedules_select_visible
  ON public.schedules
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.can_view_user_schedule(user_id, auth.uid())
  );

DROP POLICY IF EXISTS schedules_insert_own ON public.schedules;
CREATE POLICY schedules_insert_own
  ON public.schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS schedules_update_own ON public.schedules;
CREATE POLICY schedules_update_own
  ON public.schedules
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS schedules_delete_own ON public.schedules;
CREATE POLICY schedules_delete_own
  ON public.schedules
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 5. RLS Policies: public.friend_requests
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS friend_requests_select_participant ON public.friend_requests;
CREATE POLICY friend_requests_select_participant
  ON public.friend_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS friend_requests_insert_sender ON public.friend_requests;
CREATE POLICY friend_requests_insert_sender
  ON public.friend_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id <> receiver_id
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  );

DROP POLICY IF EXISTS friend_requests_update_participant ON public.friend_requests;
CREATE POLICY friend_requests_update_participant
  ON public.friend_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (
    (auth.uid() = sender_id OR auth.uid() = receiver_id)
    AND NOT public.is_blocked_between(sender_id, receiver_id)
  );

DROP POLICY IF EXISTS friend_requests_delete_participant ON public.friend_requests;
CREATE POLICY friend_requests_delete_participant
  ON public.friend_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ----------------------------------------------------------------------------
-- 6. RLS Policies: public.friendships
-- ----------------------------------------------------------------------------
-- Authenticated users can read non-blocked friendships (needed for mutual-friends counts
-- in discovery/friends lists); writes are limited to participants when unblocked.
DROP POLICY IF EXISTS friendships_select_authenticated ON public.friendships;
CREATE POLICY friendships_select_authenticated
  ON public.friendships
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id_1
    OR auth.uid() = user_id_2
    OR (
      NOT public.is_blocked_between(user_id_1, auth.uid())
      AND NOT public.is_blocked_between(user_id_2, auth.uid())
    )
  );

DROP POLICY IF EXISTS friendships_insert_participant ON public.friendships;
CREATE POLICY friendships_insert_participant
  ON public.friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id_1 OR auth.uid() = user_id_2)
    AND NOT public.is_blocked_between(user_id_1, user_id_2)
  );

DROP POLICY IF EXISTS friendships_delete_participant ON public.friendships;
CREATE POLICY friendships_delete_participant
  ON public.friendships
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- ----------------------------------------------------------------------------
-- 7. RLS Policies: public.friend_groups
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS friend_groups_select_own ON public.friend_groups;
CREATE POLICY friend_groups_select_own
  ON public.friend_groups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS friend_groups_insert_own ON public.friend_groups;
CREATE POLICY friend_groups_insert_own
  ON public.friend_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS friend_groups_update_own ON public.friend_groups;
CREATE POLICY friend_groups_update_own
  ON public.friend_groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS friend_groups_delete_own ON public.friend_groups;
CREATE POLICY friend_groups_delete_own
  ON public.friend_groups
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 8. RLS Policies: public.friend_group_members
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS friend_group_members_select_owner_or_member ON public.friend_group_members;
CREATE POLICY friend_group_members_select_owner_or_member
  ON public.friend_group_members
  FOR SELECT
  TO authenticated
  USING (
    public.owns_friend_group(group_id, auth.uid())
    OR auth.uid() = member_id
  );

DROP POLICY IF EXISTS friend_group_members_insert_owner ON public.friend_group_members;
CREATE POLICY friend_group_members_insert_owner
  ON public.friend_group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.owns_friend_group(group_id, auth.uid())
    AND member_id <> auth.uid()
    AND NOT public.is_blocked_between(auth.uid(), member_id)
  );

DROP POLICY IF EXISTS friend_group_members_delete_owner_or_member ON public.friend_group_members;
CREATE POLICY friend_group_members_delete_owner_or_member
  ON public.friend_group_members
  FOR DELETE
  TO authenticated
  USING (
    public.owns_friend_group(group_id, auth.uid())
    OR auth.uid() = member_id
  );

-- ----------------------------------------------------------------------------
-- 9. RLS Policies: public.notifications
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_insert_actor_or_owner ON public.notifications;
CREATE POLICY notifications_insert_actor_or_owner
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id OR auth.uid() = actor_id)
    AND NOT public.is_blocked_between(user_id, COALESCE(actor_id, user_id))
  );

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;
CREATE POLICY notifications_delete_own
  ON public.notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 10. RLS Policies: public.shared_links
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS shared_links_select_own ON public.shared_links;
CREATE POLICY shared_links_select_own
  ON public.shared_links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS shared_links_insert_own ON public.shared_links;
CREATE POLICY shared_links_insert_own
  ON public.shared_links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS shared_links_update_own ON public.shared_links;
CREATE POLICY shared_links_update_own
  ON public.shared_links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS shared_links_delete_own ON public.shared_links;
CREATE POLICY shared_links_delete_own
  ON public.shared_links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 11. RLS Policies: public.blocked_users
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS blocked_users_select_participant ON public.blocked_users;
CREATE POLICY blocked_users_select_participant
  ON public.blocked_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

DROP POLICY IF EXISTS blocked_users_insert_blocker ON public.blocked_users;
CREATE POLICY blocked_users_insert_blocker
  ON public.blocked_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = blocker_id
    AND blocker_id <> blocked_id
  );

DROP POLICY IF EXISTS blocked_users_delete_blocker ON public.blocked_users;
CREATE POLICY blocked_users_delete_blocker
  ON public.blocked_users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- ----------------------------------------------------------------------------
-- 12. RLS Policies: public.schedule_permissions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS schedule_permissions_select_relevant ON public.schedule_permissions;
CREATE POLICY schedule_permissions_select_relevant
  ON public.schedule_permissions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id
    OR auth.uid() = target_user_id
    OR (
      target_group_id IS NOT NULL
      AND public.is_group_member(target_group_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS schedule_permissions_insert_owner ON public.schedule_permissions;
CREATE POLICY schedule_permissions_insert_owner
  ON public.schedule_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      target_user_id IS NULL
      OR NOT public.is_blocked_between(owner_id, target_user_id)
    )
    AND (
      target_group_id IS NULL
      OR public.owns_friend_group(target_group_id, owner_id)
    )
  );

DROP POLICY IF EXISTS schedule_permissions_update_owner ON public.schedule_permissions;
CREATE POLICY schedule_permissions_update_owner
  ON public.schedule_permissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS schedule_permissions_delete_owner ON public.schedule_permissions;
CREATE POLICY schedule_permissions_delete_owner
  ON public.schedule_permissions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
