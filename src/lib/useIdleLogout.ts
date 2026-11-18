/**
 * Signs the user out after a stretch of doing nothing, so an unattended
 * screen does not leave the amuta's books open to whoever walks past.
 *
 * A minute before it happens the user is warned, because being thrown out
 * mid-sentence with no notice is how people learn to distrust a system.
 */
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { isDemo } from "@/lib/demoMode";

const IDLE_MS = 10 * 60 * 1000;
const WARN_MS = 60 * 1000;
const CHECK_MS = 10 * 1000;

const ACTIVITY = [
  "mousemove", "mousedown", "keydown", "wheel", "touchstart", "scroll", "click",
] as const;

export function useIdleLogout(signOut: () => void | Promise<void>, enabled: boolean) {
  const lastActive = useRef(Date.now());
  const warned = useRef(false);
  const firing = useRef(false);

  useEffect(() => {
    // The demo site has nothing to protect and nobody to sign out.
    if (!enabled || isDemo()) return;

    const touch = () => {
      lastActive.current = Date.now();
      if (warned.current) {
        warned.current = false;
        toast.dismiss("idle-warning");
      }
    };
    for (const ev of ACTIVITY) {
      window.addEventListener(ev, touch, { passive: true });
    }
    // Coming back to the tab counts as being here.
    const onVisible = () => { if (!document.hidden) touch(); };
    document.addEventListener("visibilitychange", onVisible);

    const timer = setInterval(() => {
      const idle = Date.now() - lastActive.current;
      if (idle >= IDLE_MS) {
        if (firing.current) return;
        firing.current = true;
        toast.dismiss("idle-warning");
        // signOut reloads the page, so a toast would never be seen. The
        // reason is left where the sign-in screen can pick it up, in
        // sessionStorage so it dies with the tab and cannot resurface days
        // later as a mystery.
        try { sessionStorage.setItem("idleLogout", "1"); } catch { /* noop */ }
        void signOut();
        return;
      }
      if (idle >= IDLE_MS - WARN_MS && !warned.current) {
        warned.current = true;
        toast.warning("עוד דקה והמערכת תתנתק — הזיזו את העכבר כדי להישאר", {
          id: "idle-warning",
          duration: WARN_MS,
        });
      }
    }, CHECK_MS);

    return () => {
      for (const ev of ACTIVITY) window.removeEventListener(ev, touch);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, [signOut, enabled]);
}
