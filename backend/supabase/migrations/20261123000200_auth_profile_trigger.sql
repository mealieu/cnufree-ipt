-- ============================================================================
-- [BE-03] Supabase Auth Signup Trigger -> Auto-create public.profiles row
-- Migration: 20261123000200_auth_profile_trigger.sql
--
-- Ensures every newly registered auth.users record safely receives a valid
-- public.profiles row matching username constraints (^[a-zA-Z0-9_]{3,30}$)
-- without ever failing signup on missing metadata or username collisions.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_email TEXT;
  v_raw_username TEXT;
  v_sanitized_base TEXT;
  v_id_suffix TEXT;
  v_final_username TEXT;
BEGIN
  v_email := COALESCE(NULLIF(trim(NEW.email), ''), NEW.id::text || '@users.cnufree.local');

  v_first_name := COALESCE(
    NULLIF(trim(v_meta->>'first_name'), ''),
    NULLIF(trim(v_meta->>'given_name'), ''),
    ''
  );
  v_last_name := COALESCE(
    NULLIF(trim(v_meta->>'last_name'), ''),
    NULLIF(trim(v_meta->>'family_name'), ''),
    ''
  );
  v_full_name := COALESCE(
    NULLIF(trim(v_meta->>'full_name'), ''),
    NULLIF(trim(v_meta->>'name'), ''),
    NULLIF(trim(concat_ws(' ', NULLIF(v_first_name, ''), NULLIF(v_last_name, ''))), ''),
    split_part(v_email, '@', 1)
  );

  -- Backfill first_name / last_name when only full_name was supplied
  IF v_first_name = '' AND v_full_name <> '' THEN
    v_first_name := split_part(v_full_name, ' ', 1);
  END IF;
  IF v_last_name = '' AND position(' ' IN v_full_name) > 0 THEN
    v_last_name := trim(substring(v_full_name FROM position(' ' IN v_full_name) + 1));
  END IF;

  v_avatar_url := NULLIF(trim(v_meta->>'avatar_url'), '');

  -- Build a guaranteed valid username matching ^[a-zA-Z0-9_]{3,30}$
  v_raw_username := COALESCE(
    NULLIF(trim(v_meta->>'username'), ''),
    NULLIF(trim(v_meta->>'preferred_username'), ''),
    split_part(v_email, '@', 1),
    'user'
  );
  v_sanitized_base := regexp_replace(v_raw_username, '[^a-zA-Z0-9_]', '_', 'g');
  v_sanitized_base := regexp_replace(v_sanitized_base, '^_+|_+$', '', 'g');
  IF length(v_sanitized_base) < 3 THEN
    v_sanitized_base := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 6);
  END IF;
  v_sanitized_base := left(v_sanitized_base, 30);

  -- Deterministic short suffix from NEW.id to resolve collisions or missing username
  v_id_suffix := '_' || substr(replace(NEW.id::text, '-', ''), 1, 6);

  IF NULLIF(trim(v_meta->>'username'), '') IS NULL THEN
    v_final_username := left(v_sanitized_base, 23) || v_id_suffix;
  ELSIF EXISTS (
    SELECT 1 FROM public.profiles p WHERE lower(p.username) = lower(v_sanitized_base)
  ) THEN
    v_final_username := left(v_sanitized_base, 23) || v_id_suffix;
  ELSE
    v_final_username := v_sanitized_base;
  END IF;

  -- Final collision safety net
  IF EXISTS (
    SELECT 1 FROM public.profiles p WHERE lower(p.username) = lower(v_final_username)
  ) THEN
    v_final_username := 'u_' || substr(replace(NEW.id::text, '-', ''), 1, 12);
  END IF;

  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    full_name,
    username,
    email,
    avatar_url
  )
  VALUES (
    NEW.id,
    v_first_name,
    v_last_name,
    v_full_name,
    v_final_username,
    v_email,
    v_avatar_url
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
