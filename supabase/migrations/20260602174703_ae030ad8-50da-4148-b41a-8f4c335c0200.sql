
-- Conversations
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('dm','group')),
  name text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversation members
CREATE TABLE public.conversation_members (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_members TO authenticated;
GRANT ALL ON public.conversation_members TO service_role;

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  attachment_url text,
  attachment_type text CHECK (attachment_type IN ('image','audio')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at);
CREATE INDEX idx_conv_members_user ON public.conversation_members(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Helper: is the user a member of a conversation (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_conversation_member(_conv_id uuid, _uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = _conv_id AND user_id = _uid
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_conversation_member(uuid, uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_conversation_member(uuid, uuid) TO authenticated;

-- Helper: creator of a conversation
CREATE OR REPLACE FUNCTION public.conversation_creator(_conv_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT created_by FROM public.conversations WHERE id = _conv_id;
$$;

REVOKE EXECUTE ON FUNCTION public.conversation_creator(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.conversation_creator(uuid) TO authenticated;

-- RLS: conversations
CREATE POLICY "Members can view their conversations"
ON public.conversations FOR SELECT TO authenticated
USING (public.is_conversation_member(id, auth.uid()));

CREATE POLICY "Approved users can create conversations"
ON public.conversations FOR INSERT TO authenticated
WITH CHECK (is_approved_user(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Creator can update conversation"
ON public.conversations FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creator can delete conversation"
ON public.conversations FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- RLS: conversation_members
CREATE POLICY "Members can view membership of their conversations"
ON public.conversation_members FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id, auth.uid()));

-- Creator can add anyone; or a user can add themselves only via creator action
-- To keep it simple: only creator can insert members; creator inserts themselves too on conversation creation
CREATE POLICY "Creator can add members"
ON public.conversation_members FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user(auth.uid())
  AND public.conversation_creator(conversation_id) = auth.uid()
);

-- A member can update their own last_read_at
CREATE POLICY "Member can update own membership"
ON public.conversation_members FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Creator can remove members; users can remove themselves
CREATE POLICY "Creator or self can delete membership"
ON public.conversation_members FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  OR public.conversation_creator(conversation_id) = auth.uid()
);

-- RLS: messages
CREATE POLICY "Members can view messages"
ON public.messages FOR SELECT TO authenticated
USING (public.is_conversation_member(conversation_id, auth.uid()));

CREATE POLICY "Members can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  is_approved_user(auth.uid())
  AND sender_id = auth.uid()
  AND public.is_conversation_member(conversation_id, auth.uid())
);

CREATE POLICY "Sender can delete own messages"
ON public.messages FOR DELETE TO authenticated
USING (sender_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;

-- Allow approved users to view all profiles (needed to pick chat partners)
CREATE POLICY "Approved users can view all profiles for chat"
ON public.profiles FOR SELECT TO authenticated
USING (is_approved_user(auth.uid()));
