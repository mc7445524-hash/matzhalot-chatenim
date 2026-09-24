import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileRow {
  id: string;
  email: string;
  status: string;
  is_admin: boolean;
  created_at: string;
}

export default function UsersAdminModule() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, status, is_admin, created_at")
      .order("created_at", { ascending: false });
    if (!error && data) setRows(data as ProfileRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: "approved" | "rejected" | "pending") => {
    setBusy(id);
    const { error } = await supabase.rpc("admin_set_user_status", { _user_id: id, _status: status });
    setBusy(null);
    if (error) { alert("שגיאה: " + error.message); return; }
    await load();
  };

  if (!isAdmin) {
    return (
      <div className="p-6" dir="rtl">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">דף זה זמין רק למנהלים.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">ניהול משתמשים</h2>
        <Button variant="outline" size="sm" onClick={load}>רענן</Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">טוען...</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">אין משתמשים.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium" dir="ltr">{r.email}</span>
                  {r.is_admin && <Badge variant="default">מנהל</Badge>}
                  <Badge variant={
                    r.status === "approved" ? "default" :
                    r.status === "pending" ? "secondary" : "destructive"
                  }>
                    {r.status === "approved" ? "מאושר" : r.status === "pending" ? "ממתין" : "נדחה"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  נרשם: {new Date(r.created_at).toLocaleString("he-IL")}
                </span>
              </div>
              <div className="flex gap-2">
                {r.status !== "approved" && (
                  <Button size="sm" disabled={busy === r.id} onClick={() => setStatus(r.id, "approved")}>אשר</Button>
                )}
                {r.status !== "rejected" && !r.is_admin && (
                  <Button size="sm" variant="destructive" disabled={busy === r.id} onClick={() => setStatus(r.id, "rejected")}>דחה</Button>
                )}
                {r.status === "approved" && !r.is_admin && (
                  <Button size="sm" variant="outline" disabled={busy === r.id} onClick={() => setStatus(r.id, "pending")}>השעה</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}