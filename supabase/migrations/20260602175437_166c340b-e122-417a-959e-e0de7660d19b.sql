
-- Atomic conversation creation functions (SECURITY DEFINER) to avoid RLS chicken-and-egg issues
CREATE OR REPLACE FUNCTION public.create_dm_conversation(_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _me uuid := auth.uid();
  _existing uuid;
  _new_id uuid;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_approved_user(_me) THEN RAISE EXCEPTION 'Not approved'; END IF;
  IF NOT public.is_approved_user(_other_user_id) THEN RAISE EXCEPTION 'Other user not approved'; END IF;
  IF _other_user_id = _me THEN RAISE EXCEPTION 'Cannot DM yourself'; END IF;

  -- find existing DM between the two users
  SELECT c.id INTO _existing
  FROM public.conversations c
  WHERE c.type = 'dm'
    AND EXISTS (SELECT 1 FROM public.conversation_members m WHERE m.conversation_id = c.id AND m.user_id = _me)
    AND EXISTS (SELECT 1 FROM public.conversation_members m WHERE m.conversation_id = c.id AND m.user_id = _other_user_id)
    AND (SELECT count(*) FROM public.conversation_members m WHERE m.conversation_id = c.id) = 2
  LIMIT 1;

  IF _existing IS NOT NULL THEN RETURN _existing; END IF;

  INSERT INTO public.conversations (type, created_by) VALUES ('dm', _me) RETURNING id INTO _new_id;
  INSERT INTO public.conversation_members (conversation_id, user_id) VALUES (_new_id, _me), (_new_id, _other_user_id);
  RETURN _new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_dm_conversation(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_dm_conversation(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_group_conversation(_name text, _member_ids uuid[])
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _me uuid := auth.uid();
  _new_id uuid;
  _uid uuid;
BEGIN
  IF _me IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.is_approved_user(_me) THEN RAISE EXCEPTION 'Not approved'; END IF;
  IF _name IS NULL OR length(trim(_name)) = 0 THEN RAISE EXCEPTION 'Group name required'; END IF;

  INSERT INTO public.conversations (type, name, created_by) VALUES ('group', _name, _me) RETURNING id INTO _new_id;
  INSERT INTO public.conversation_members (conversation_id, user_id) VALUES (_new_id, _me);

  FOREACH _uid IN ARRAY _member_ids LOOP
    IF _uid <> _me AND public.is_approved_user(_uid) THEN
      INSERT INTO public.conversation_members (conversation_id, user_id) VALUES (_new_id, _uid)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN _new_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_group_conversation(text, uuid[]) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_group_conversation(text, uuid[]) TO authenticated;
