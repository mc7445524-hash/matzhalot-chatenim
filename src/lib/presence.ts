/**
 * Presence — tracks which users are currently online using Supabase Realtime presence.
 * Returns a list of {email} for each connected client.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OnlineUser {
  email: string;
  /** What the person calls themselves, when they have set it. The email is
   *  kept as a fallback and as the thing that is actually unique. */
  displayName?: string | null;
  userId: string;
  joinedAt: string;
}

export function useOnlineUsers(
  currentEmail: string | null,
  currentUserId: string | null,
  currentDisplayName?: string | null,
) {
  const [users, setUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    if (!currentEmail || !currentUserId) return;

    // One room for everybody. Presence is only shared between clients on the
    // same channel name, so a name carrying the user's own id put each person
    // alone in a room of their own and everyone saw a list of one.
    const channel = supabase.channel("online-users", {
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
            displayName: currentDisplayName ?? null,
            userId: currentUserId,
            joinedAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentEmail, currentUserId, currentDisplayName]);

  return users;
}
