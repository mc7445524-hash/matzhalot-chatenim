/**
 * Presence — tracks which users are currently online using Supabase Realtime presence.
 * Returns a list of {email} for each connected client.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OnlineUser {
  email: string;
  userId: string;
  joinedAt: string;
}

export function useOnlineUsers(currentEmail: string | null, currentUserId: string | null) {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!currentEmail || !currentUserId) return;

    const channel = supabase.channel(`online-users-${currentUserId}-${Math.random().toString(36).slice(2)}`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<OnlineUser>();
        const all: OnlineUser[] = [];
        const seen = new Set<string>();
        for (const key of Object.keys(state)) {
          for (const meta of state[key]) {
            if (!seen.has(meta.userId)) {
              seen.add(meta.userId);
              all.push(meta);
            }
          }
        }
        setUsers(all);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            email: currentEmail,
            userId: currentUserId,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentEmail, currentUserId]);

  return users;
}
