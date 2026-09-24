
CREATE TABLE public.activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action_type TEXT NOT NULL,
  details TEXT NOT NULL,
  amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read activity log"
  ON public.activity_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert activity log"
  ON public.activity_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
