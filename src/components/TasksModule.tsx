import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Users, X, MessageSquarePlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import {
  type Task, type TaskStatus, type TaskPriority, type Employee, type TaskUpdate,
  fetchTasks, createTask, updateTask, setTaskStatus, deleteTask,
  fetchEmployees, addEmployee, archiveEmployee,
  fetchTaskUpdates, addTaskUpdate, fetchUpdateCounts,
} from "@/lib/tasks";

/** Sentinel for the "whole team" option in the assignee dropdown. */
const ALL = "__all__";

const COLUMNS: { id: TaskStatus; label: string; tone: string }[] = [
  { id: "open",        label: "לביצוע",  tone: "border-slate-300" },
  { id: "in_progress", label: "בתהליך",  tone: "border-amber-400" },
  { id: "done",        label: "הושלם",   tone: "border-emerald-400" },
];

const PRIORITIES: { id: TaskPriority; label: string; cls: string }[] = [
  { id: "high",   label: "דחוף",  cls: "bg-red-100 text-red-700 border-red-200" },
  { id: "normal", label: "רגיל",  cls: "bg-slate-100 text-slate-600 border-slate-200" },
  { id: "low",    label: "נמוך",  cls: "bg-slate-50 text-slate-400 border-slate-200" },
];

function today() {
  return new Date().toISOString().split("T")[0];
}

/** Red once the due date has passed, amber on the day itself. */
function dueTone(t: Task) {
  if (!t.dueDate || t.status === "done") return "";
  if (t.dueDate < today()) return "text-red-600 font-semibold";
  if (t.dueDate === today()) return "text-amber-600 font-medium";
  return "text-muted-foreground";
}

export default function TasksModule() {
  const { bachurim } = useData();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [updateCounts, setUpdateCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [staffOpen, setStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState("");

  const [logTarget, setLogTarget] = useState<Task | null>(null);
  const [logEntries, setLogEntries] = useState<TaskUpdate[]>([]);
  const [logText, setLogText] = useState("");
  const [logNewDate, setLogNewDate] = useState("");

  // form
  const [fTitle, setFTitle] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fDate, setFDate] = useState("");
  const [fTime, setFTime] = useState("");
  const [fPriority, setFPriority] = useState<TaskPriority>("normal");
  const [fAssignee, setFAssignee] = useState("");
  const [fBachur, setFBachur] = useState("");

  const refresh = useCallback(async () => {
    const [t, e, c] = await Promise.all([fetchTasks(), fetchEmployees(), fetchUpdateCounts()]);
    setTasks(t);
    setEmployees(e);
    setUpdateCounts(c);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const staffName = (id?: string) =>
    employees.find((e) => e.id === id)?.name || "";
  const bachurName = (id?: string) =>
    bachurim.find((b) => b.id === id)?.name || "";

  function openNew() {
    setEditTarget(null);
    setFTitle(""); setFNotes(""); setFDate(""); setFTime("");
    setFPriority("normal"); setFAssignee(""); setFBachur("");
    setEditOpen(true);
  }

  function openEdit(t: Task) {
    setEditTarget(t);
    setFTitle(t.title);
    setFNotes(t.notes || "");
    setFDate(t.dueDate || "");
    setFTime(t.dueTime || "");
    setFPriority(t.priority);
    setFAssignee(t.assignAll ? ALL : t.assigneeId || "");
    setFBachur(t.bachurId || "");
    setEditOpen(true);
  }

  async function handleSave() {
    if (!fTitle.trim()) { toast.error("יש להזין כותרת"); return; }
    const payload = {
      title: fTitle.trim(),
      notes: fNotes.trim(),
      status: editTarget?.status ?? ("open" as TaskStatus),
      priority: fPriority,
      dueDate: fDate,
      dueTime: fTime,
      assigneeId: fAssignee === ALL ? "" : fAssignee,
      assignAll: fAssignee === ALL,
      bachurId: fBachur,
    };
    const ok = editTarget
      ? await updateTask(editTarget.id, payload)
      : !!(await createTask(payload));
    if (!ok) { toast.error("השמירה נכשלה"); return; }
    toast.success(editTarget ? "המשימה עודכנה" : "המשימה נוספה");
    setEditOpen(false);
    refresh();
  }

  async function move(t: Task, status: TaskStatus) {
    if (!(await setTaskStatus(t.id, status))) { toast.error("העדכון נכשל"); return; }
    refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    if (!(await deleteTask(deleteTarget.id))) { toast.error("המחיקה נכשלה"); return; }
    toast.success("המשימה נמחקה");
    setDeleteTarget(null);
    refresh();
  }

  async function openLog(t: Task) {
    setLogTarget(t);
    setLogText(""); setLogNewDate("");
    setLogEntries(await fetchTaskUpdates(t.id));
  }

  async function saveLog() {
    if (!logTarget || !logText.trim()) return;
    if (!(await addTaskUpdate(logTarget.id, logText.trim(), logNewDate || undefined))) {
      toast.error("ההוספה נכשלה"); return;
    }
    toast.success(logNewDate ? "העדכון נשמר והמשימה נדחתה" : "העדכון נשמר");
    setLogText(""); setLogNewDate("");
    setLogEntries(await fetchTaskUpdates(logTarget.id));
    refresh();
  }

  async function handleAddStaff() {
    const name = newStaff.trim();
    if (!name) return;
    if (!(await addEmployee(name))) { toast.error("ההוספה נכשלה"); return; }
    setNewStaff("");
    setEmployees(await fetchEmployees());
  }

  async function handleRemoveStaff(id: string) {
    if (!(await archiveEmployee(id))) { toast.error("ההסרה נכשלה"); return; }
    setEmployees(await fetchEmployees());
    toast.success("העובד הוסר. המשימות וההיסטוריה שלו נשמרו");
  }

  const overdue = tasks.filter(
    (t) => t.status !== "done" && t.dueDate && t.dueDate < today()
  ).length;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold">משימות</h2>
          <p className="text-sm text-muted-foreground">
            {overdue > 0 ? `${overdue} משימות באיחור` : "אין משימות באיחור"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStaffOpen(true)}>
            <Users className="ml-1 h-4 w-4" />עובדים
          </Button>
          <Button onClick={openNew}>
            <Plus className="ml-1 h-4 w-4" />משימה חדשה
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">טוען…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="space-y-2">
                <div className={`flex items-center justify-between border-b-2 ${col.tone} pb-2`}>
                  <span className="font-semibold">{col.label}</span>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>

                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground py-6 text-center">אין משימות</p>
                )}

                {items.map((t) => (
                  <Card key={t.id} className="shadow-sm">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium flex-1">{t.title}</span>
                        <Badge
                          variant="outline"
                          className={PRIORITIES.find((p) => p.id === t.priority)?.cls}
                        >
                          {PRIORITIES.find((p) => p.id === t.priority)?.label}
                        </Badge>
                      </div>

                      {t.notes && (
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">{t.notes}</p>
                      )}

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {t.dueDate && (
                          <span className={dueTone(t)}>
                            {t.dueDate}{t.dueTime ? ` ${t.dueTime.slice(0, 5)}` : ""}
                          </span>
                        )}
                        {t.assignAll
                          ? <span className="font-medium text-indigo-600">כולם</span>
                          : t.assigneeId && <span className="text-muted-foreground">{staffName(t.assigneeId)}</span>}
                        {t.bachurId && <span className="text-primary">{bachurName(t.bachurId)}</span>}
                        {updateCounts[t.id] > 0 && (
                          <span className="flex items-center gap-1 text-sky-700 font-medium">
                            <MessageSquarePlus className="h-3 w-3" />
                            {updateCounts[t.id]} עדכונים
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {COLUMNS.filter((c) => c.id !== t.status).map((c) => (
                          <Button key={c.id} size="sm" variant="outline" className="h-7 text-xs"
                                  onClick={() => move(t, c.id)}>
                            {c.id === "done" ? <Check className="ml-1 h-3 w-3" /> : null}
                            {c.label}
                          </Button>
                        ))}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openLog(t)} title="עדכונים">
                          <MessageSquarePlus className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(t)} title="עריכה">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"
                                onClick={() => setDeleteTarget(t)} title="מחיקה">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Add / edit ─────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "עריכת משימה" : "משימה חדשה"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>כותרת</Label>
              <Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="מה צריך לעשות" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>תאריך יעד</Label>
                <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>שעה (לא חובה)</Label>
                <Input type="time" value={fTime} onChange={(e) => setFTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>דחיפות</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                        value={fPriority} onChange={(e) => setFPriority(e.target.value as TaskPriority)}>
                  {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label>אחראי</Label>
                <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                        value={fAssignee} onChange={(e) => setFAssignee(e.target.value)}>
                  <option value="">ללא</option>
                  <option value={ALL}>כולם</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>בחור קשור (לא חובה)</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                      value={fBachur} onChange={(e) => setFBachur(e.target.value)}>
                <option value="">ללא — משימה של העמותה</option>
                {bachurim.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label>הערות</Label>
              <Textarea value={fNotes} onChange={(e) => setFNotes(e.target.value)} placeholder="פרטים נוספים" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>ביטול</Button>
            <Button onClick={handleSave}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Update log ─────────────────────────────── */}
      <Dialog open={!!logTarget} onOpenChange={(o) => !o && setLogTarget(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>עדכונים — {logTarget?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea value={logText} onChange={(e) => setLogText(e.target.value)}
                      placeholder="מה התקדם? מה מעכב?" />
            <div className="space-y-1">
              <Label className="text-xs">דחיית תאריך יעד (לא חובה)</Label>
              <Input type="date" value={logNewDate} onChange={(e) => setLogNewDate(e.target.value)} />
            </div>
            <Button onClick={saveLog} className="w-full" disabled={!logText.trim()}>הוסף עדכון</Button>

            <div className="space-y-2 pt-2 border-t">
              {logEntries.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">אין עדכונים עדיין</p>
              )}
              {logEntries.map((u) => (
                <div key={u.id} className="text-sm border-r-2 border-muted pr-2">
                  <p className="whitespace-pre-wrap">{u.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(u.createdAt).toLocaleString("he-IL")}
                    {u.authorEmail ? ` · ${u.authorEmail}` : ""}
                    {u.newDueDate ? ` · נדחה ל-${u.newDueDate}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Employees ──────────────────────────────── */}
      <Dialog open={staffOpen} onOpenChange={setStaffOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>עובדים</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input value={newStaff} onChange={(e) => setNewStaff(e.target.value)}
                     placeholder="שם העובד"
                     onKeyDown={(e) => e.key === "Enter" && handleAddStaff()} />
              <Button onClick={handleAddStaff}><Plus className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-1">
              {employees.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">לא הוגדרו עובדים</p>
              )}
              {employees.map((e) => (
                <div key={e.id} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <span className="text-sm">{e.name}</span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive"
                          onClick={() => handleRemoveStaff(e.id)} title="הסר">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              הסרת עובד לא מוחקת אותו — המשימות וההיסטוריה שלו נשמרות.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את המשימה?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" תימחק יחד עם כל העדכונים שלה. לא ניתן לשחזר.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
