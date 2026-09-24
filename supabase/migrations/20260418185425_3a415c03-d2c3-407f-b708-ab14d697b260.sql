-- Profiles table to store user emails for "online users" indicator
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tighten RLS on data tables: only authenticated users can access
-- (currently all tables allow public access; replace with authenticated-only)
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['bachurim','outings','incomes','expenses','debts','askanim_incomes','basket_products','global_settings','fundraisers','expense_categories'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public read" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Public delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Auth read" ON public.%I FOR SELECT TO authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Auth insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "Auth update" ON public.%I FOR UPDATE TO authenticated USING (true)', t);
    EXECUTE format('CREATE POLICY "Auth delete" ON public.%I FOR DELETE TO authenticated USING (true)', t);
  END LOOP;
END $$;