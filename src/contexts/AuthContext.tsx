import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type ProfileStatus = "pending" | "approved" | "rejected" | "unknown";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profileStatus: ProfileStatus;
  isAdmin: boolean;
  displayName: string | null;
  registering: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; pending?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("unknown");
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const loadProfile = async (uid: string | undefined) => {
    if (!uid) { setProfileStatus("unknown"); setIsAdmin(false); setDisplayName(null); return; }
    const { data, error } = await supabase
      .from("profiles")
      .select("status, is_admin, display_name")
      .eq("id", uid)
      .maybeSingle();
    if (error || !data) { setProfileStatus("unknown"); setIsAdmin(false); setDisplayName(null); return; }
    setProfileStatus((data.status as ProfileStatus) ?? "pending");
    setIsAdmin(!!data.is_admin);
    setDisplayName((data as { display_name?: string | null }).display_name ?? null);
  };

  const forceSignOut = async (reason: "rejected" | "pending") => {
    try {
      sessionStorage.setItem(
        "forced_signout_reason",
        reason === "rejected"
          ? "הגישה שלך לאתר בוטלה על ידי המנהל."
          : "הגישה שלך הושעתה ומחכה לאישור המנהל."
      );
    } catch { /* noop */ }
    await supabase.auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    // Set up listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Defer profile fetch to avoid deadlocks inside the listener
      setTimeout(() => { loadProfile(newSession?.user?.id); }, 0);
    });
    // THEN check existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => setLoading(false));
      if (!data.session) setLoading(false);
    }).catch(() => setLoading(false));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Realtime + polling: kick out the user immediately if their status changes
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;

    let cancelled = false;

    const checkStatus = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("status, is_admin, display_name")
        .eq("id", uid)
        .maybeSingle();
      if (cancelled || !data) return;
      const status = (data.status as ProfileStatus) ?? "pending";
      setProfileStatus(status);
      setIsAdmin(!!data.is_admin);
      setDisplayName((data as { display_name?: string | null }).display_name ?? null);
      if (!data.is_admin && status !== "approved") {
        forceSignOut(status === "rejected" ? "rejected" : "pending");
      }
    };

    const channel = supabase
      .channel(`profile-status-${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
        (payload) => {
          const newRow = (payload.new ?? {}) as { status?: string; is_admin?: boolean; display_name?: string | null };
          if (newRow.display_name !== undefined) setDisplayName(newRow.display_name ?? null);
          if (newRow.status) setProfileStatus(newRow.status as ProfileStatus);
          if (typeof newRow.is_admin === "boolean") setIsAdmin(newRow.is_admin);
          if (!newRow.is_admin && newRow.status && newRow.status !== "approved") {
            forceSignOut(newRow.status === "rejected" ? "rejected" : "pending");
          }
        }
      )
      .subscribe();

    // Faster polling backup (5s) + immediate check on tab focus
    const interval = setInterval(checkStatus, 5000);
    const onVisibility = () => { if (document.visibilityState === "visible") checkStatus(); };
    document.addEventListener("visibilitychange", onVisibility);
    checkStatus();

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const uid = data.user?.id;
    if (uid) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, is_admin")
        .eq("id", uid)
        .maybeSingle();
      const status = (profile?.status as ProfileStatus) ?? "pending";
      const admin = !!profile?.is_admin;
      if (!admin && status !== "approved") {
        await supabase.auth.signOut();
        return {
          error:
            status === "rejected"
              ? "הגישה שלך לאתר נדחתה / בוטלה על ידי המנהל."
              : "החשבון שלך ממתין לאישור המנהל. תקבל גישה לאחר שהמנהל יאשר את הבקשה.",
        };
      }
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    setRegistering(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) {
      setRegistering(false);
      return { error: error.message };
    }
    const newUserId = data.user?.id;
    // Sign the user out FIRST — they cannot use the app until approved.
    // This prevents any flash of the protected app shell.
    await supabase.auth.signOut();
    // Notify admin AFTER sign-out (the edge function uses service-role and
    // does not depend on the client session).
    if (newUserId) {
      try {
        const { error: invErr } = await supabase.functions.invoke("notify-admin-signup", {
          body: { user_id: newUserId, email },
        });
        if (invErr) console.warn("notify-admin-signup error", invErr);
      } catch (e) {
        console.warn("notify-admin-signup failed", e);
      }
    }
    setRegistering(false);
    return { error: null, pending: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfileStatus("unknown");
    setIsAdmin(false);
    setDisplayName(null);
    // Clear all cached app data so next user starts fresh from cloud
    const keysToClear = [
      "bachurim", "incomes", "expenses", "debts", "askanimIncomes",
      "basketProducts", "globalSettings", "fundraisers",
      "expense_cats_salim", "expense_cats_amuta",
    ];
    keysToClear.forEach((k) => {
      try { localStorage.removeItem(k); } catch { /* noop */ }
    });
    window.location.reload();
  };

  const refreshProfile = async () => { await loadProfile(session?.user?.id); };

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, loading,
      profileStatus, isAdmin, displayName, registering,
      signIn, signUp, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
