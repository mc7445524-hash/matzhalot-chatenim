
CREATE POLICY "Approved users can receive realtime broadcasts"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (public.is_approved_user(auth.uid()));
