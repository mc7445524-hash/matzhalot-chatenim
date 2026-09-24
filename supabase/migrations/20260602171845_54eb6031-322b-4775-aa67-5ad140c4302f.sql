
-- 1) Fix activity_log: restrict to approved users
DROP POLICY IF EXISTS "Authenticated users can read activity log" ON public.activity_log;
DROP POLICY IF EXISTS "Authenticated users can insert activity log" ON public.activity_log;

CREATE POLICY "Approved users can read activity log"
  ON public.activity_log FOR SELECT
  TO authenticated
  USING (public.is_approved_user(auth.uid()));

CREATE POLICY "Approved users can insert activity log"
  ON public.activity_log FOR INSERT
  TO authenticated
  WITH CHECK (public.is_approved_user(auth.uid()) AND user_id = auth.uid());

-- 2) Fix profiles privilege escalation: prevent self-updating is_admin/status
DROP POLICY IF EXISTS "Admin updates any, user updates own basic" ON public.profiles;

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Users can update own profile non-privileged fields"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() AND NOT public.is_admin_user(auth.uid()))
  WITH CHECK (
    id = auth.uid()
    AND NOT public.is_admin_user(auth.uid())
    AND is_admin = (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid())
    AND status   = (SELECT p.status   FROM public.profiles p WHERE p.id = auth.uid())
  );

-- 3) Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_status(uuid, text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.admin_set_user_status(uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_approved_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_approved_user(uuid) TO authenticated;
