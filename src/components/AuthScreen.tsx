import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import ringsIcon from "@/assets/rings-icon.png";

type Mode = "signin" | "signup" | "forgot";

export default function AuthScreen() {
  const { signIn, signUp, signOut, session, profileStatus, isAdmin } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const isPendingSession = !!session && !isAdmin && profileStatus !== "approved";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [blockedMsg, setBlockedMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const reason = sessionStorage.getItem("forced_signout_reason");
      if (reason) {
        setBlockedMsg(reason);
        sessionStorage.removeItem("forced_signout_reason");
      }
    } catch { /* noop */ }
  }, []);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
    if (m !== "signin") setBlockedMsg(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBlockedMsg(null);
    setLoading(true);

    if (mode === "signin") {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) setError(err);
    } else if (mode === "signup") {
      const { error: err, pending } = await signUp(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else if (pending) {
        setInfo("בקשתך נשלחה למנהל לאישור. תוכל להיכנס עם המייל והסיסמה רק לאחר שתאושר.");
        setMode("signin");
        setPassword("");
      }
    } else {
      // forgot — use Supabase built-in reset (no Edge Function needed)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      if (resetError) {
        setError(`שגיאה: ${resetError.message}`);
      } else {
        setInfo("נשלח אליך מייל לאיפוס סיסמה. בדוק את תיבת הדואר (כולל ספאם).");
        setMode("signin");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <img src={ringsIcon} alt="" width={56} height={56} className="mx-auto" />
          <h1 className="text-2xl font-bold">קול מצהלות חתנים</h1>
          <p className="text-sm text-muted-foreground">
            {isPendingSession
              ? "החשבון שלך ממתין לאישור"
              : mode === "signin"
              ? "התחבר כדי לגשת למערכת"
              : mode === "signup"
              ? "צור חשבון חדש"
              : "שחזור סיסמה דרך המנהל"}
          </p>
        </div>

        {isPendingSession && (
          <div className="space-y-3">
            <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-3 rounded">
              <strong>חשבונך ממתין לאישור מנהל.</strong>
              <div className="mt-1">אנא המתן — תקבל גישה לאחר שהמנהל יאשר את הבקשה. אין לך גישה לאתר עד אז.</div>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={signOut}>
              יציאה
            </Button>
          </div>
        )}

        {!isPendingSession && (<>
        {blockedMsg && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 px-3 py-2 rounded">
            {blockedMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">כתובת מייל</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              className="text-left"
              autoComplete="email"
            />
          </div>

          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                dir="ltr"
                className="text-left"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
          )}

          {mode === "forgot" && (
            <p className="text-xs text-muted-foreground">
              נשלח אליך למייל סיסמה זמנית. היכנס איתה ושנה אותה דרך תפריט הפרופיל.
            </p>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
              {error}
            </div>
          )}
          {info && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded">
              {info}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "טוען..."
              : mode === "signin"
              ? "התחבר"
              : mode === "signup"
              ? "הרשם"
              : "שלח בקשה למנהל"}
          </Button>
        </form>

        <div className="text-center text-sm space-y-2">
          {mode === "signin" && (
            <>
              <div>
                אין לך חשבון?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-primary hover:underline font-medium"
                >
                  הרשמה
                </button>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => { switchMode("forgot"); setPassword(""); }}
                  className="inline-block px-4 py-2 rounded-md border border-primary/30 text-primary hover:bg-primary/5 font-semibold text-sm"
                >
                  שכחתי סיסמה — קבלת סיסמה חדשה במייל
                </button>
              </div>
            </>
          )}
          {mode === "signup" && (
            <div>
              כבר יש לך חשבון?{" "}
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-primary hover:underline font-medium"
              >
                התחבר
              </button>
            </div>
          )}
          {mode === "forgot" && (
            <div>
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="text-primary hover:underline font-medium"
              >
                חזרה להתחברות
              </button>
            </div>
          )}
        </div>
        </>)}
      </Card>
    </div>
  );
}
