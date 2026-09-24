-- Create bachurim table
CREATE TABLE public.bachurim (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  class_level TEXT NOT NULL DEFAULT '',
  join_date TEXT NOT NULL DEFAULT '',
  married BOOLEAN NOT NULL DEFAULT false,
  married_date TEXT,
  received_basket BOOLEAN NOT NULL DEFAULT false,
  basket_date TEXT,
  basket_cost_at_time NUMERIC,
  in_askanim BOOLEAN NOT NULL DEFAULT false,
  closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create outings table (nested in bachurim in localStorage)
CREATE TABLE public.outings (
  id TEXT PRIMARY KEY,
  bachur_id TEXT NOT NULL REFERENCES public.bachurim(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT '',
  payment_method_detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_outings_bachur_id ON public.outings(bachur_id);

-- Create incomes table
CREATE TABLE public.incomes (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  category TEXT,
  target TEXT,
  recognized BOOLEAN NOT NULL DEFAULT false,
  recognized_date TEXT,
  auto BOOLEAN NOT NULL DEFAULT false,
  fundraiser TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id TEXT PRIMARY KEY,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  sub_category TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  recognized BOOLEAN NOT NULL DEFAULT false,
  recognized_date TEXT,
  auto BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create debts table
CREATE TABLE public.debts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  returned BOOLEAN NOT NULL DEFAULT false,
  returned_amount NUMERIC,
  returned_via TEXT,
  returned_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create askanim_incomes table
CREATE TABLE public.askanim_incomes (
  id TEXT PRIMARY KEY,
  bachur_id TEXT NOT NULL,
  bachur_name TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create basket_products table
CREATE TABLE public.basket_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create global_settings table (key-value store)
CREATE TABLE public.global_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create fundraisers table
CREATE TABLE public.fundraisers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create expense_categories table
CREATE TABLE public.expense_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL CHECK (type IN ('salim', 'amuta')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.bachurim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.askanim_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.basket_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth in this app - shared data)
CREATE POLICY "Public read" ON public.bachurim FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.bachurim FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.bachurim FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.bachurim FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.outings FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.outings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.outings FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.outings FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.incomes FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.incomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.incomes FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.incomes FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.debts FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.debts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.debts FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.debts FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.askanim_incomes FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.askanim_incomes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.askanim_incomes FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.askanim_incomes FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.basket_products FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.basket_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.basket_products FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.basket_products FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.global_settings FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.global_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.global_settings FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.global_settings FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.fundraisers FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.fundraisers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.fundraisers FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.fundraisers FOR DELETE USING (true);

CREATE POLICY "Public read" ON public.expense_categories FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.expense_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.expense_categories FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.expense_categories FOR DELETE USING (true);