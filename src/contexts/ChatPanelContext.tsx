import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChatPanelContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  unread: number;
}

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null);

export function useChatPanel(): ChatPanelContextValue {
  const ctx = useContext(ChatPanelContext);
  if (!ctx) throw new Error("useChatPanel must be used within ChatPanelProvider");
  return ctx;
}

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const myId = user?.id || "";
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Reset unread when panel opens
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  // Track incoming messages while panel is closed
  useEffect(() => {
    if (!myId) return;
    const ch = supabase
      .channel(`chat-panel-unread-${myId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as { sender_id: string };
        if (msg.sender_id === myId) return;
        setUnread((n) => n + 1);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [myId]);

  const value = useMemo(() => ({ open, setOpen, toggle, unread }), [open, toggle, unread]);
  return <ChatPanelContext.Provider value={value}>{children}</ChatPanelContext.Provider>;
}
