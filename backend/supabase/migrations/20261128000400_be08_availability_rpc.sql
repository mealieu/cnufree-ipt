-- ============================================================================
-- [BE-08] Availability & Overlap Engine PostgreSQL RPC Function (JOINs + RLS)
-- Migration: 20261128000400_be08_availability_rpc.sql
--
-- Provides a high-efficiency PostgreSQL JOIN query for fetching friends'
-- schedules for a target date (recurring + date-specific) filtered by group
-- membership, block lists, and field-level masking from [BE-09].
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_friends_schedules_for_date(
  p_date DATE,
  p_group_id UUID DEFAULT NULL,
  p_friend_ids UUID[] DEFAULT NULL
)
RETURNS TABLE (
  friend_id UUID,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  avatar_url TEXT,
  schedule_visibility TEXT,
  access_level TEXT,
  can_view_schedule BOOLEAN,
  has_any_schedule BOOLEAN,
  group_ids UUID[],
  schedules_json JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_viewer_id UUID := auth.uid();
  v_target_dow SMALLINT := EXTRACT(DOW FROM p_date)::SMALLINT;
BEGIN
  IF v_viewer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH my_friends AS (
    SELECT
      CASE
        WHEN f.user_id_1 = v_viewer_id THEN f.user_id_2
        ELSE f.user_id_1
      END AS fid
    FROM public.friendships f
    WHERE f.user_id_1 = v_viewer_id OR f.user_id_2 = v_viewer_id
  ),
  group_filtered AS (
    SELECT DISTINCT mf.fid
    FROM my_friends mf
    WHERE (
      p_group_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.friend_groups fg
        INNER JOIN public.friend_group_members fgm
          ON fgm.group_id = fg.id
        WHERE fg.id = p_group_id
          AND fg.owner_id = v_viewer_id
          AND fgm.member_id = mf.fid
      )
    )
    AND (
      p_friend_ids IS NULL
      OR mf.fid = ANY(p_friend_ids)
    )
    AND NOT public.is_blocked_between(mf.fid, v_viewer_id)
  ),
  friend_access AS (
    SELECT
      gf.fid,
      p.full_name,
      p.first_name,
      p.last_name,
      p.username,
      p.avatar_url,
      p.schedule_visibility,
      public.get_schedule_access_level(gf.fid, v_viewer_id) AS resolved_access
    FROM group_filtered gf
    INNER JOIN public.profiles p
      ON p.id = gf.fid
  ),
  friend_groups_agg AS (
    SELECT
      fgm.member_id,
      COALESCE(array_agg(fg.id ORDER BY fg.name), ARRAY[]::UUID[]) AS gids
    FROM public.friend_group_members fgm
    INNER JOIN public.friend_groups fg
      ON fg.id = fgm.group_id
    WHERE fg.owner_id = v_viewer_id
    GROUP BY fgm.member_id
  ),
  schedule_presence AS (
    SELECT
      fa.fid,
      EXISTS (
        SELECT 1
        FROM public.schedules s
        WHERE s.user_id = fa.fid
      ) AS has_sched
    FROM friend_access fa
  ),
  day_schedules AS (
    SELECT
      s.user_id,
      jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'title', CASE
            WHEN fa.resolved_access IN ('free_only', 'busy_only') THEN
              CASE WHEN s.is_busy THEN 'Busy' ELSE 'Free' END
            ELSE s.title
          END,
          'day_of_week', s.day_of_week,
          'specific_date', s.specific_date,
          'start_time', s.start_time::TEXT,
          'end_time', s.end_time::TEXT,
          'room', CASE
            WHEN fa.resolved_access IN ('free_only', 'busy_only') THEN NULL
            ELSE s.room
          END,
          'notes', CASE
            WHEN fa.resolved_access IN ('free_only', 'busy_only') THEN NULL
            ELSE s.notes
          END,
          'is_busy', s.is_busy,
          'is_private', (fa.resolved_access IN ('free_only', 'busy_only'))
        )
        ORDER BY s.start_time ASC, s.end_time ASC
      ) AS items
    FROM public.schedules s
    INNER JOIN friend_access fa
      ON fa.fid = s.user_id
    WHERE fa.resolved_access IN ('full_view', 'free_only', 'busy_only')
      AND (
        s.specific_date = p_date
        OR (s.specific_date IS NULL AND s.day_of_week = v_target_dow)
      )
    GROUP BY s.user_id
  )
  SELECT
    fa.fid AS friend_id,
    fa.full_name,
    fa.first_name,
    fa.last_name,
    fa.username,
    fa.avatar_url,
    fa.schedule_visibility,
    fa.resolved_access AS access_level,
    (fa.resolved_access IN ('full_view', 'free_only', 'busy_only')) AS can_view_schedule,
    CASE
      WHEN fa.resolved_access IN ('full_view', 'free_only', 'busy_only')
        THEN COALESCE(sp.has_sched, false)
      ELSE false
    END AS has_any_schedule,
    COALESCE(fga.gids, ARRAY[]::UUID[]) AS group_ids,
    COALESCE(ds.items, '[]'::jsonb) AS schedules_json
  FROM friend_access fa
  LEFT JOIN friend_groups_agg fga
    ON fga.member_id = fa.fid
  LEFT JOIN schedule_presence sp
    ON sp.fid = fa.fid
  LEFT JOIN day_schedules ds
    ON ds.user_id = fa.fid
  ORDER BY fa.full_name ASC, fa.username ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_friends_schedules_for_date(DATE, UUID, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_friends_schedules_for_date(DATE, UUID, UUID[]) TO authenticated;
