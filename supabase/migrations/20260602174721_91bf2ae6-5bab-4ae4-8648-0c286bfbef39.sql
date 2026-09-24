
CREATE POLICY "Members can read chat media"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-media'
  AND public.is_conversation_member(((storage.foldername(name))[1])::uuid, auth.uid())
);

CREATE POLICY "Members can upload chat media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media'
  AND public.is_conversation_member(((storage.foldername(name))[1])::uuid, auth.uid())
  AND owner = auth.uid()
);

CREATE POLICY "Owner can delete chat media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'chat-media' AND owner = auth.uid());
