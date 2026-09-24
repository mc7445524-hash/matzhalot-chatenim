
-- 1. Add status and is_admin to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check CHECK (status IN ('pending','approved','rejected'));

-- 2. Approval tokens table
CREATE TABLE IF NOT EXISTS public.approval_tokens (
  token uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);
ALTER TABLE public.approval_tokens ENABLE ROW LEVEL SECURITY;
-- No policies = no client access. Only service role / SECURITY DEFINER funcs can read.

-- 3. Security definer helpers
CREATE OR REPLACE FUNCTION public.is_approved_user(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _uid AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _uid AND is_admin = true AND status = 'approved'
  );
$$;

-- 4. Update handle_new_user trigger to set admin & status for known admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _is_admin boolean := (NEW.email = 'aw169729@gmail.com');
  _status text := CASE WHEN NEW.email = 'aw169729@gmail.com' THEN 'approved' ELSE 'pending' END;
BEGIN
  INSERT INTO public.profiles (id, email, status, is_admin)
  VALUES (NEW.id, NEW.email, _status, _is_admin)
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        is_admin = public.profiles.is_admin OR _is_admin,
        status = CASE WHEN _is_admin THEN 'approved' ELSE public.profiles.status END;

  -- Create an approval token only for non-admin pending users
  IF NOT _is_admin THEN
    INSERT INTO public.approval_tokens (user_id) VALUES (NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Ensure the auth trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill: ensure existing admin email is admin+approved, others stay approved (so we don't lock out current users)
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending' AND created_at < now();
UPDATE public.profiles SET is_admin = true, status = 'approved' WHERE email = 'aw169729@gmail.com';

-- 6. Replace permissive RLS on data tables with approved-only access
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'bachurim','incomes','expenses','debts','askanim_incomes',
    'basket_products','global_settings','fundraisers',
    'expense_categories','outings'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Auth read" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Auth delete" ON public.%I', t);

    EXECUTE format('CREATE POLICY "Approved read" ON public.%I FOR SELECT TO authenticated USING (public.is_approved_user(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Approved insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_approved_user(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Approved update" ON public.%I FOR UPDATE TO authenticated USING (public.is_approved_user(auth.uid())) WITH CHECK (public.is_approved_user(auth.uid()))', t);
    EXECUTE format('CREATE POLICY "Approved delete" ON public.%I FOR DELETE TO authenticated USING (public.is_approved_user(auth.uid()))', t);
  END LOOP;
END $$;

-- 7. Profiles RLS: users see own profile; admins see/update all
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "View own or admin views all" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin_user(auth.uid()));

CREATE POLICY "Insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin updates any, user updates own basic" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()) OR id = auth.uid())
  WITH CHECK (public.is_admin_user(auth.uid()) OR id = auth.uid());

-- 8. Admin approve/reject RPCs
CREATE OR REPLACE FUNCTION public.admin_set_user_status(_user_id uuid, _status text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _status NOT IN ('pending','approved','rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE public.profiles SET status = _status WHERE id = _user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid, text) TO authenticated;
