import { supabase } from "@/integrations/supabase/client";

export type ConversationType = "dm" | "group";

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  created_by: string;
  created_at: string;
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_type: "image" | "audio" | null;
  created_at: string;
}

export interface ChatUser {
  id: string;
  email: string;
  display_name: string | null;
}

export async function fetchChatUsers(): Promise<ChatUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .eq("status", "approved");
  if (error) { console.error("fetchChatUsers", error); return []; }
  return (data || []) as ChatUser[];
}

export async function fetchMyConversations(): Promise<{
  conversations: Conversation[];
  membersByConv: Record<string, ConversationMember[]>;
}> {
  const { data: myMemberships, error: mErr } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id, joined_at, last_read_at");
  if (mErr) { console.error("fetchMyConversations members", mErr); return { conversations: [], membersByConv: {} }; }

  const convIds = Array.from(new Set((myMemberships || []).map((m) => m.conversation_id)));
  if (convIds.length === 0) return { conversations: [], membersByConv: {} };

  const { data: convs, error: cErr } = await supabase
    .from("conversations")
    .select("*")
    .in("id", convIds)
    .order("created_at", { ascending: false });
  if (cErr) { console.error("fetchMyConversations convs", cErr); return { conversations: [], membersByConv: {} }; }

  const { data: allMembers, error: amErr } = await supabase
    .from("conversation_members")
    .select("*")
    .in("conversation_id", convIds);
  if (amErr) console.error("fetchMyConversations all members", amErr);

  const membersByConv: Record<string, ConversationMember[]> = {};
  for (const m of allMembers || []) {
    const list = membersByConv[m.conversation_id] || [];
    list.push(m as ConversationMember);
    membersByConv[m.conversation_id] = list;
  }

  return { conversations: (convs || []) as Conversation[], membersByConv };
}

export async function createDmConversation(otherUserId: string): Promise<Conversation | null> {
  const { data: convId, error } = await supabase.rpc("create_dm_conversation", {
    _other_user_id: otherUserId,
  });
  if (error || !convId) { console.error("createDm", error); return null; }
  const { data: conv } = await supabase.from("conversations").select("*").eq("id", convId as string).single();
  return (conv as Conversation) || null;
}

export async function createGroupConversation(name: string, memberIds: string[]): Promise<Conversation | null> {
  const { data: convId, error } = await supabase.rpc("create_group_conversation", {
    _name: name,
    _member_ids: memberIds,
  });
  if (error || !convId) { console.error("createGroup", error); return null; }
  const { data: conv } = await supabase.from("conversations").select("*").eq("id", convId as string).single();
  return (conv as Conversation) || null;
}

export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) { console.error("fetchMessages", error); return []; }
  return (data || []) as ChatMessage[];
}

export async function sendMessage(params: {
  conversationId: string;
  content?: string;
  attachmentUrl?: string;
  attachmentType?: "image" | "audio";
}): Promise<ChatMessage | null> {
  const { data: me } = await supabase.auth.getUser();
  const myId = me.user?.id;
  if (!myId) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      sender_id: myId,
      content: params.content || null,
      attachment_url: params.attachmentUrl || null,
      attachment_type: params.attachmentType || null,
    })
    .select()
    .single();
  if (error) { console.error("sendMessage", error); return null; }
  return data as ChatMessage;
}

export async function uploadChatMedia(
  conversationId: string,
  file: Blob,
  ext: string,
): Promise<string | null> {
  const filename = `${conversationId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("chat-media").upload(filename, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) { console.error("uploadChatMedia", error); return null; }
  return filename;
}

export async function getSignedMediaUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from("chat-media")
    .createSignedUrl(path, 3600);
  if (error) { console.error("getSignedMediaUrl", error); return null; }
  return data.signedUrl;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { data: me } = await supabase.auth.getUser();
  const myId = me.user?.id;
  if (!myId) return;
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", myId);
}

export async function addGroupMembers(conversationId: string, userIds: string[]): Promise<void> {
  const rows = userIds.map((uid) => ({ conversation_id: conversationId, user_id: uid }));
  const { error } = await supabase.from("conversation_members").insert(rows);
  if (error) console.error("addGroupMembers", error);
}

export async function removeGroupMember(conversationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("conversation_members")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
  if (error) console.error("removeGroupMember", error);
}