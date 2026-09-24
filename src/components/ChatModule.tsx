import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnlineUsers } from "@/lib/presence";
import {
  type ChatMessage, type ChatUser, type Conversation, type ConversationMember,
  fetchChatUsers, fetchMyConversations, createDmConversation, createGroupConversation,
  fetchMessages, sendMessage, uploadChatMedia, getSignedMediaUrl,
  markConversationRead, addGroupMembers, removeGroupMember,
} from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus, Send, Image as ImageIcon, Mic, Square, Users, Trash2, UserPlus, ArrowRight,
  Check, CheckCheck, Clock, Smile, ArrowDown, X,
} from "lucide-react";
import { toast } from "sonner";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function initials(name: string | null | undefined, email: string): string {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL");
}

export default function ChatModule() {
  const { user } = useAuth();
  const myId = user?.id || "";

  const [users, setUsers] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [membersByConv, setMembersByConv] = useState<Record<string, ConversationMember[]>>({});
  const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>({});
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);

  const usersById = useMemo(() => {
    const m: Record<string, ChatUser> = {};
    for (const u of users) m[u.id] = u;
    return m;
  }, [users]);

  const loadAll = async () => {
    const [u, conv] = await Promise.all([fetchChatUsers(), fetchMyConversations()]);
    setUsers(u);
    setConversations(conv.conversations);
    setMembersByConv(conv.membersByConv);
  };

  useEffect(() => { loadAll(); }, []);

  // Realtime: refresh conversation list on changes + compute unread counts
  useEffect(() => {
    if (!myId) return;
    const ch = supabase
      .channel(`chat-list-${myId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, () => loadAll())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as ChatMessage;
        // only update if I'm a member (RLS filters but for safety)
        const members = membersByConv[msg.conversation_id];
        if (!members || !members.some((m) => m.user_id === myId)) return;
        if (msg.conversation_id === activeConvId) return; // viewing it now
        if (msg.sender_id === myId) return;
        setUnreadByConv((prev) => ({ ...prev, [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1 }));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [myId, membersByConv, activeConvId]);

  // Compute initial unread counts when conversations load
  useEffect(() => {
    (async () => {
      const counts: Record<string, number> = {};
      for (const conv of conversations) {
        const myMem = membersByConv[conv.id]?.find((m) => m.user_id === myId);
        if (!myMem) continue;
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .gt("created_at", myMem.last_read_at)
          .neq("sender_id", myId);
        if (count && count > 0) counts[conv.id] = count;
      }
      setUnreadByConv(counts);
    })();
  }, [conversations, membersByConv, myId]);

  const handleSelectConv = async (convId: string) => {
    setActiveConvId(convId);
    setUnreadByConv((p) => { const n = { ...p }; delete n[convId]; return n; });
    await markConversationRead(convId);
  };

  const conversationLabel = (conv: Conversation): string => {
    if (conv.type === "group") return conv.name || "קבוצה";
    const others = (membersByConv[conv.id] || []).filter((m) => m.user_id !== myId);
    const other = others[0];
    if (!other) return "שיחה";
    const u = usersById[other.user_id];
    return u?.display_name || u?.email || "משתמש";
  };

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  return (
    <div className="flex h-full gap-3 p-3 overflow-hidden" dir="rtl">
      {/* Conversation list */}
      <aside
        className={`w-full flex flex-col bg-card border rounded-lg ${
          activeConvId ? "hidden" : "flex"
        }`}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="font-semibold">שיחות</h2>
          <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default"><Plus className="w-4 h-4" /> חדש</Button>
            </DialogTrigger>
            <NewChatDialog
              users={users.filter((u) => u.id !== myId)}
              onCreated={async (convId) => {
                setNewChatOpen(false);
                await loadAll();
                handleSelectConv(convId);
              }}
            />
          </Dialog>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground text-center">אין שיחות עדיין. לחץ "חדש" כדי להתחיל.</div>
          )}
          {conversations.map((conv) => {
            const label = conversationLabel(conv);
            const unread = unreadByConv[conv.id] || 0;
            const isActive = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-accent text-right border-b ${
                  isActive ? "bg-accent" : ""
                }`}
              >
                <Avatar>
                  <AvatarFallback>
                    {conv.type === "group" ? <Users className="w-4 h-4" /> : initials(null, label)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">{label}</span>
                    {unread > 0 && <Badge variant="default">{unread}</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conv.type === "group" ? `${(membersByConv[conv.id] || []).length} משתתפים` : "שיחה אישית"}
                  </div>
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </aside>

      {/* Chat window */}
      <section className={`flex-1 flex-col bg-card border rounded-lg ${activeConvId ? "flex" : "hidden"}`}>
        {activeConv ? (
          <ChatWindow
            key={activeConv.id}
            conversation={activeConv}
            members={membersByConv[activeConv.id] || []}
            usersById={usersById}
            myId={myId}
            label={conversationLabel(activeConv)}
            onBack={() => setActiveConvId(null)}
            onMembersChanged={loadAll}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">בחר שיחה להתחיל</div>
        )}
      </section>
    </div>
  );
}

// ─── New Chat Dialog ─────────────────────────────────────────
function NewChatDialog({
  users, onCreated,
}: {
  users: ChatUser[];
  onCreated: (convId: string) => void;
}) {
  const [mode, setMode] = useState<"dm" | "group">("dm");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (mode === "dm") { n.clear(); n.add(id); return n; }
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const submit = async () => {
    if (selected.size === 0) { toast.error("בחר לפחות משתמש אחד"); return; }
    setBusy(true);
    try {
      let conv: { id: string } | null = null;
      if (mode === "dm") {
        const [otherId] = Array.from(selected);
        conv = await createDmConversation(otherId);
      } else {
        if (!groupName.trim()) { toast.error("הזן שם לקבוצה"); setBusy(false); return; }
        conv = await createGroupConversation(groupName.trim(), Array.from(selected));
      }
      if (!conv) { toast.error("שגיאה ביצירת שיחה"); return; }
      onCreated(conv.id);
    } finally { setBusy(false); }
  };

  return (
    <DialogContent dir="rtl" className="max-w-md">
      <DialogHeader><DialogTitle>שיחה חדשה</DialogTitle></DialogHeader>
      <div className="flex gap-2">
        <Button variant={mode === "dm" ? "default" : "outline"} size="sm" onClick={() => { setMode("dm"); setSelected(new Set()); }}>
          הודעה אישית
        </Button>
        <Button variant={mode === "group" ? "default" : "outline"} size="sm" onClick={() => { setMode("group"); setSelected(new Set()); }}>
          קבוצה
        </Button>
      </div>
      {mode === "group" && (
        <Input placeholder="שם הקבוצה" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
      )}
      <div className="text-sm text-muted-foreground">
        {mode === "dm" ? "בחר משתמש לשיחה" : `בחר משתתפים (${selected.size} נבחרו)`}
      </div>
      <ScrollArea className="h-64 border rounded-md">
        {users.length === 0 && <div className="p-4 text-sm text-muted-foreground">אין משתמשים נוספים</div>}
        {users.map((u) => {
          const isSel = selected.has(u.id);
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => toggle(u.id)}
              className={`w-full flex items-center gap-3 p-2 hover:bg-accent text-right ${isSel ? "bg-accent" : ""}`}
            >
              <Avatar><AvatarFallback>{initials(u.display_name, u.email)}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{u.display_name || u.email}</div>
                {u.display_name && <div className="text-xs text-muted-foreground truncate" dir="ltr">{u.email}</div>}
              </div>
              {isSel && <Badge>נבחר</Badge>}
            </button>
          );
        })}
      </ScrollArea>
      <DialogFooter>
        <Button onClick={submit} disabled={busy}>צור שיחה</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// ─── Chat Window ─────────────────────────────────────────────
function ChatWindow({
  conversation, members, usersById, myId, label, onBack, onMembersChanged,
}: {
  conversation: Conversation;
  members: ConversationMember[];
  usersById: Record<string, ChatUser>;
  myId: string;
  label: string;
  onBack: () => void;
  onMembersChanged: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const onlineList = useOnlineUsers(user?.email ?? null, user?.id ?? null);
  const onlineIds = useMemo(() => new Set(onlineList.map((u) => u.userId)), [onlineList]);

  // For DM: find the other user
  const otherUserId = conversation.type === "dm"
    ? members.find((m) => m.user_id !== myId)?.user_id ?? null
    : null;
  const isOtherOnline = otherUserId ? onlineIds.has(otherUserId) : false;

  // Earliest last_read_at among OTHER members → used to mark sent messages as read
  const othersMinLastRead = useMemo(() => {
    const others = members.filter((m) => m.user_id !== myId);
    if (others.length === 0) return null;
    let min = others[0].last_read_at;
    for (const m of others) if (m.last_read_at < min) min = m.last_read_at;
    return min;
  }, [members, myId]);

  // Load messages
  useEffect(() => {
    fetchMessages(conversation.id).then(setMessages);
  }, [conversation.id]);

  // Realtime subscribe
  useEffect(() => {
    const ch = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
        (payload) => {
          const oldMsg = payload.old as ChatMessage;
          setMessages((prev) => prev.filter((m) => m.id !== oldMsg.id));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [conversation.id]);

  // Typing indicator broadcast channel
  useEffect(() => {
    const ch = supabase.channel(`typing-${conversation.id}`, {
      config: { broadcast: { self: false } },
    });
    ch.on("broadcast", { event: "typing" }, (payload) => {
      const uid = (payload.payload as { userId?: string })?.userId;
      if (!uid || uid === myId) return;
      setTypingUsers((prev) => ({ ...prev, [uid]: Date.now() }));
    });
    ch.subscribe();
    typingChannelRef.current = ch;
    const interval = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const next: Record<string, number> = {};
        let changed = false;
        for (const [uid, t] of Object.entries(prev)) {
          if (now - t < 3500) next[uid] = t;
          else changed = true;
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(ch);
      typingChannelRef.current = null;
    };
  }, [conversation.id, myId]);

  const sendTyping = () => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    lastTypingSentRef.current = now;
    typingChannelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: myId },
    });
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Track scroll position for floating "scroll to bottom" button
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollDown(distance > 150);
    };
    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  // Initial scroll to bottom on conversation open
  useEffect(() => {
    const el = scrollRef.current;
    if (el && messages.length > 0) el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id]);

  // Mark read when messages change
  useEffect(() => {
    if (messages.length > 0) markConversationRead(conversation.id);
  }, [messages, conversation.id]);

  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    const tempId = `pending-${Date.now()}-${Math.random()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: myId,
      content: t,
      attachment_url: null,
      attachment_type: null,
      created_at: new Date().toISOString(),
    };
    setPendingIds((p) => new Set(p).add(tempId));
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    setText("");
    const msg = await sendMessage({ conversationId: conversation.id, content: t });
    setMessages((prev) => {
      const without = prev.filter((m) => m.id !== tempId);
      if (msg && !without.some((m) => m.id === msg.id)) return [...without, msg];
      return without;
    });
    setPendingIds((p) => { const n = new Set(p); n.delete(tempId); return n; });
    setSending(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("יש לבחור תמונה"); return; }
    if (file.size > MAX_FILE_SIZE) { toast.error("הקובץ חורג מ-10MB"); return; }
    setSending(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = await uploadChatMedia(conversation.id, file, ext);
    if (!path) { toast.error("העלאה נכשלה"); setSending(false); return; }
    const msg = await sendMessage({
      conversationId: conversation.id,
      attachmentUrl: path,
      attachmentType: "image",
    });
    if (msg) setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
    setSending(false);
  };

  const handleAudioRecorded = async (blob: Blob) => {
    if (blob.size > MAX_FILE_SIZE) { toast.error("ההקלטה חורגת מ-10MB"); return; }
    setSending(true);
    const path = await uploadChatMedia(conversation.id, blob, "webm");
    if (!path) { toast.error("העלאה נכשלה"); setSending(false); return; }
    const msg = await sendMessage({
      conversationId: conversation.id,
      attachmentUrl: path,
      attachmentType: "audio",
    });
    if (msg) setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
    setSending(false);
  };

  const handlePasteImage = async (blob: Blob, ext: string) => {
    if (blob.size > MAX_FILE_SIZE) { toast.error("התמונה חורגת מ-10MB"); return; }
    setSending(true);
    const path = await uploadChatMedia(conversation.id, blob, ext);
    if (!path) { toast.error("העלאה נכשלה"); setSending(false); return; }
    const msg = await sendMessage({
      conversationId: conversation.id,
      attachmentUrl: path,
      attachmentType: "image",
    });
    if (msg) setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
    setSending(false);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const ext = (file.type.split("/")[1] || "png").split("+")[0];
          handlePasteImage(file, ext);
          return;
        }
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      setText((t) => t + emoji);
      return;
    }
    const start = ta.selectionStart ?? text.length;
    const end = ta.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + emoji.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  // typing users → list of names (excluding me)
  const typingNames = Object.keys(typingUsers)
    .filter((uid) => uid !== myId)
    .map((uid) => usersById[uid]?.display_name || usersById[uid]?.email?.split("@")[0] || "מישהו");

  return (
    <>
      <div className="flex items-center gap-2 p-3 border-b bg-card">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="חזרה לרשימה">
          <ArrowRight className="w-4 h-4" />
        </Button>
        <div className="relative">
          <Avatar>
            <AvatarFallback>
              {conversation.type === "group" ? <Users className="w-4 h-4" /> : initials(null, label)}
            </AvatarFallback>
          </Avatar>
          {conversation.type === "dm" && isOtherOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-card" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{label}</div>
          <div className="text-xs text-muted-foreground truncate">
            {typingNames.length > 0
              ? <span className="text-primary">{typingNames[0]} מקליד<TypingDots /></span>
              : conversation.type === "group"
                ? `${members.length} משתתפים`
                : isOtherOnline ? "מחובר" : "לא מחובר"}
          </div>
        </div>
        {conversation.type === "group" && (
          <Dialog open={groupInfoOpen} onOpenChange={setGroupInfoOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon"><Users className="w-4 h-4" /></Button>
            </DialogTrigger>
            <GroupInfoDialog
              conversation={conversation}
              members={members}
              usersById={usersById}
              myId={myId}
              onChanged={() => { onMembersChanged(); }}
            />
          </Dialog>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 chat-pattern relative">
        {messages.map((m, idx) => {
          const isMe = m.sender_id === myId;
          const sender = usersById[m.sender_id];
          const showSender = conversation.type === "group" && !isMe &&
            (idx === 0 || messages[idx - 1].sender_id !== m.sender_id);
          const prevDate = idx > 0 ? formatDate(messages[idx - 1].created_at) : null;
          const curDate = formatDate(m.created_at);
          const showDate = prevDate !== curDate;
          const isPending = pendingIds.has(m.id);
          const isRead = isMe && !isPending && othersMinLastRead !== null && othersMinLastRead >= m.created_at;
          return (
            <div key={m.id}>
              {showDate && (
                <div className="text-center my-3">
                  <span className="text-xs bg-background/90 px-3 py-1 rounded-full text-muted-foreground shadow-sm">
                    {curDate}
                  </span>
                </div>
              )}
              <div className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                <div
                  className="max-w-[78%] rounded-2xl px-3 py-1.5 shadow-sm"
                  style={{
                    backgroundColor: isMe ? "var(--chat-sent)" : "var(--chat-received)",
                    color: isMe ? "var(--chat-sent-foreground)" : "var(--chat-received-foreground)",
                  }}
                >
                  {showSender && (
                    <div className="text-xs font-semibold mb-0.5" style={{ color: "var(--chat-read)" }}>
                      {sender?.display_name || sender?.email || "משתמש"}
                    </div>
                  )}
                  <MessageBody msg={m} onOpenImage={setLightboxUrl} />
                  <div className="flex items-center justify-end gap-1 mt-0.5 -mb-0.5 opacity-70">
                    <span className="text-[10px] tabular-nums">{formatTime(m.created_at)}</span>
                    {isMe && (
                      isPending ? (
                        <Clock className="w-3 h-3" />
                      ) : isRead ? (
                        <CheckCheck className="w-3.5 h-3.5" style={{ color: "var(--chat-read)" }} />
                      ) : (
                        <CheckCheck className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-sm text-muted-foreground gap-2 py-12">
            <div className="bg-background/80 rounded-full p-4 shadow-sm">
              <Send className="w-6 h-6 opacity-50" />
            </div>
            <div>אין הודעות עדיין</div>
            <div className="text-xs">כתוב הודעה כדי להתחיל</div>
          </div>
        )}
        {typingNames.length > 0 && (
          <div className="flex justify-end">
            <div className="rounded-lg px-3 py-2 shadow-sm" style={{ backgroundColor: "var(--chat-received)" }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {showScrollDown && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-20 left-3 z-10 bg-background border shadow-lg rounded-full p-2 hover:bg-accent"
          aria-label="גלול לתחתית"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      <div className="border-t p-2 flex items-end gap-1 bg-card">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={handleFile}
        />
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" type="button" disabled={sending} title="אימוג'י">
              <Smile className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto" align="start" side="top">
            <EmojiPicker
              theme={EmojiTheme.AUTO}
              onEmojiClick={(d) => { insertEmoji(d.emoji); setEmojiOpen(false); }}
              width={320}
              height={380}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost" size="icon" type="button"
          onClick={() => fileRef.current?.click()}
          disabled={sending}
          title="צרף תמונה"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
        <VoiceRecorder onRecorded={handleAudioRecorded} disabled={sending} />
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); sendTyping(); }}
          onPaste={onPaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          placeholder="הודעה..."
          rows={1}
          className="flex-1 resize-none min-h-[40px] max-h-32 rounded-full bg-background"
        />
        <Button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          size="icon"
          title="שלח"
          className="rounded-full"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Image lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={(o) => !o && setLightboxUrl(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-0">
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
          {lightboxUrl && (
            <img src={lightboxUrl} alt="תמונה" className="w-full h-auto max-h-[85vh] object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Typing dots animation ──────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex items-end gap-0.5 ms-1 align-middle">
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}

// ─── Message body ────────────────────────────────────────────
function MessageBody({ msg, onOpenImage }: { msg: ChatMessage; onOpenImage: (url: string) => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (msg.attachment_url) {
      getSignedMediaUrl(msg.attachment_url).then(setUrl);
    }
  }, [msg.attachment_url]);

  return (
    <div className="space-y-1">
      {msg.attachment_type === "image" && url && (
        <button type="button" onClick={() => onOpenImage(url)} className="block">
          <img src={url} alt="תמונה" className="rounded max-w-full max-h-64 object-contain cursor-zoom-in" />
        </button>
      )}
      {msg.attachment_type === "audio" && url && (
        <audio controls src={url} className="max-w-full h-10" />
      )}
      {msg.attachment_type && !url && (
        <div className="text-xs italic opacity-75">טוען קובץ...</div>
      )}
      {msg.content && <div className="whitespace-pre-wrap break-words">{msg.content}</div>}
    </div>
  );
}

// ─── Voice Recorder ──────────────────────────────────────────
function VoiceRecorder({ onRecorded, disabled }: { onRecorded: (blob: Blob) => void; disabled?: boolean }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        onRecorded(blob);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch (err) {
      console.error(err);
      toast.error("לא ניתן לגשת למיקרופון");
    }
  };

  const stop = (cancel = false) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const rec = recorderRef.current;
    if (!rec) return;
    if (cancel) {
      rec.onstop = null;
      try { rec.stop(); } catch { /* noop */ }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      chunksRef.current = [];
    } else {
      try { rec.stop(); } catch { /* noop */ }
    }
    recorderRef.current = null;
    setRecording(false);
    setElapsed(0);
  };

  useEffect(() => () => stop(true), []);

  if (!recording) {
    return (
      <Button variant="ghost" size="icon" type="button" onClick={start} disabled={disabled} title="הקלט הודעה קולית">
        <Mic className="w-5 h-5" />
      </Button>
    );
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <div className="flex items-center gap-1 px-2 bg-destructive/10 rounded-md">
      <Button variant="ghost" size="icon" type="button" onClick={() => stop(true)} title="בטל">
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
      <span className="text-xs tabular-nums text-destructive font-mono">● {mm}:{ss}</span>
      <Button variant="ghost" size="icon" type="button" onClick={() => stop(false)} title="סיים ושלח">
        <Square className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
}

// ─── Group Info Dialog ───────────────────────────────────────
function GroupInfoDialog({
  conversation, members, usersById, myId, onChanged,
}: {
  conversation: Conversation;
  members: ConversationMember[];
  usersById: Record<string, ChatUser>;
  myId: string;
  onChanged: () => void;
}) {
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const isCreator = conversation.created_by === myId;
  const memberIds = new Set(members.map((m) => m.user_id));

  useEffect(() => { fetchChatUsers().then(setAllUsers); }, []);

  const candidates = allUsers.filter((u) => !memberIds.has(u.id));

  const handleAdd = async () => {
    if (picked.size === 0) return;
    await addGroupMembers(conversation.id, Array.from(picked));
    setPicked(new Set());
    setPickerOpen(false);
    onChanged();
    toast.success("נוספו לקבוצה");
  };

  const handleRemove = async (uid: string) => {
    if (!isCreator && uid !== myId) return;
    await removeGroupMember(conversation.id, uid);
    onChanged();
  };

  return (
    <DialogContent dir="rtl" className="max-w-md">
      <DialogHeader><DialogTitle>{conversation.name || "קבוצה"}</DialogTitle></DialogHeader>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">חברי הקבוצה ({members.length})</span>
        {isCreator && (
          <Button size="sm" variant="outline" onClick={() => setPickerOpen((p) => !p)}>
            <UserPlus className="w-4 h-4" /> הוסף
          </Button>
        )}
      </div>
      {pickerOpen && (
        <div className="border rounded-md max-h-48 overflow-y-auto">
          {candidates.length === 0 && <div className="p-3 text-sm text-muted-foreground">אין משתמשים להוספה</div>}
          {candidates.map((u) => {
            const isSel = picked.has(u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setPicked((p) => { const n = new Set(p); if (n.has(u.id)) n.delete(u.id); else n.add(u.id); return n; })}
                className={`w-full flex items-center gap-2 p-2 hover:bg-accent text-right ${isSel ? "bg-accent" : ""}`}
              >
                <Avatar><AvatarFallback>{initials(u.display_name, u.email)}</AvatarFallback></Avatar>
                <span className="flex-1 truncate text-sm">{u.display_name || u.email}</span>
                {isSel && <Badge>נבחר</Badge>}
              </button>
            );
          })}
          <div className="p-2 border-t">
            <Button size="sm" onClick={handleAdd} disabled={picked.size === 0} className="w-full">הוסף נבחרים</Button>
          </div>
        </div>
      )}
      <ScrollArea className="h-64 border rounded-md">
        {members.map((m) => {
          const u = usersById[m.user_id];
          const canRemove = (isCreator && m.user_id !== conversation.created_by) || m.user_id === myId;
          return (
            <div key={m.user_id} className="flex items-center gap-2 p-2 border-b">
              <Avatar><AvatarFallback>{initials(u?.display_name, u?.email || "?")}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{u?.display_name || u?.email || "משתמש"}</div>
                {m.user_id === conversation.created_by && <div className="text-xs text-muted-foreground">יוצר הקבוצה</div>}
              </div>
              {canRemove && (
                <Button variant="ghost" size="icon" onClick={() => handleRemove(m.user_id)} title={m.user_id === myId ? "עזוב" : "הסר"}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}
      </ScrollArea>
    </DialogContent>
  );
}