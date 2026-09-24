import { useState, useEffect, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export default function UserProfileDialog({ open, onOpenChange }: Props) {
  const { user, displayName, refreshProfile } = useAuth();
  const [name, setName] = useState(displayName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setName(displayName ?? "");
      setNameMsg(null);
      setPwdMsg(null);
      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
    }
  }, [open, displayName]);

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingName(true);
    setNameMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() || null })
      .eq("id", user.id);
    setSavingName(false);
    if (error) {
      setNameMsg({ type: "err", text: "שגיאה בשמירה: " + error.message });
    } else {
      setNameMsg({ type: "ok", text: "השם נשמר בהצלחה" });
      await refreshProfile();
    }
  };

  const savePwd = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      setPwdMsg({ type: "err", text: "לא ניתן לזהות את המשתמש" });
      return;
    }
    if (!currentPwd) {
      setPwdMsg({ type: "err", text: "יש להזין את הסיסמה הנוכחית" });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: "err", text: "הסיסמה חייבת להכיל לפחות 6 תווים" });
      return;
    }
    if (newPwd !== newPwd2) {
      setPwdMsg({ type: "err", text: "הסיסמאות לא תואמות" });
      return;
    }
    setSavingPwd(true);
    setPwdMsg(null);
    // Verify current password by re-authenticating
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPwd,
    });
    if (signInErr) {
      setSavingPwd(false);
      setPwdMsg({ type: "err", text: "הסיסמה הנוכחית שגויה" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) {
      setPwdMsg({ type: "err", text: "שגיאה: " + error.message });
    } else {
      setPwdMsg({ type: "ok", text: "הסיסמה שונתה בהצלחה" });
      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>פרופיל המשתמש</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>

        <form onSubmit={saveName} className="space-y-3 border-b pb-4">
          <h3 className="font-medium text-sm">שם להצגה</h3>
          <div className="space-y-2">
            <Label htmlFor="profile-name">שם</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס שם להצגה"
            />
          </div>
          {nameMsg && (
            <div className={`text-sm px-3 py-2 rounded ${nameMsg.type === "ok" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-destructive bg-destructive/10"}`}>
              {nameMsg.text}
            </div>
          )}
          <Button type="submit" disabled={savingName} size="sm">
            {savingName ? "שומר..." : "שמור שם"}
          </Button>
        </form>

        <form onSubmit={savePwd} className="space-y-3">
          <h3 className="font-medium text-sm">שינוי סיסמה</h3>
          <div className="space-y-2">
            <Label htmlFor="cur-pwd">סיסמה נוכחית</Label>
            <Input
              id="cur-pwd"
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              dir="ltr"
              className="text-left"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pwd">סיסמה חדשה</Label>
            <Input
              id="new-pwd"
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              minLength={6}
              dir="ltr"
              className="text-left"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pwd2">אישור סיסמה חדשה</Label>
            <Input
              id="new-pwd2"
              type="password"
              value={newPwd2}
              onChange={(e) => setNewPwd2(e.target.value)}
              minLength={6}
              dir="ltr"
              className="text-left"
              autoComplete="new-password"
            />
          </div>
          {pwdMsg && (
            <div className={`text-sm px-3 py-2 rounded ${pwdMsg.type === "ok" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-destructive bg-destructive/10"}`}>
              {pwdMsg.text}
            </div>
          )}
          <Button type="submit" disabled={savingPwd} size="sm">
            {savingPwd ? "מעדכן..." : "שנה סיסמה"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
