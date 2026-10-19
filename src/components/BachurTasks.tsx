import { useEffect, useState } from "react";
import { ClipboardList, ArrowLeft, Check, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigation } from "@/contexts/NavigationContext";
import {
  fetchTasks, fetchEmployees, setTaskStatus,
  type Task, type Employee,
} from "@/lib/tasks";

const STATUS_LABEL: Record<Task["status"], string> = {
  open: "לביצוע",
  in_progress: "בתהליך",
  done: "הושלם",
};

const STATUS_CLS: Record<Task["status"], string> = {
  open: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  done: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function today() {
  return new Date().toISOString().split("T")[0];
}

/** The tasks attached to one bachur, shown inside his detail panel. */
export default function BachurTasks({ bachurId }: { bachurId: string }) {
  const { navigateTo } = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchTasks(), fetchEmployees()]).then(([t, e]) => {
      if (!alive) return;
      setTasks(t.filter((x) => x.bachurId === bachurId));
      setEmployees(e);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [bachurId]);

  const staffName = (id?: string) => employees.find((e) => e.id === id)?.name || "";
  const open = tasks.filter((t) => t.status !== "done").length;

  async function move(id: string, status: Task["status"]) {
    if (!(await setTaskStatus(id, status))) { toast.error("העדכון נכשל"); return; }
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(status === "done" ? "המשימה הושלמה" : "המשימה בתהליך");
  }

  if (loading) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-semibold">משימות ({tasks.length})</h4>
        {open > 0 && <Badge variant="secondary">{open} פתוחות</Badge>}
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          אין משימות המקושרות לבחור זה. ניתן לקשר משימה מלשונית "משימות".
        </p>
      ) : (
        <div className="space-y-1">
          {tasks.map((t) => {
            const late = t.status !== "done" && t.dueDate && t.dueDate < today();
            return (
              <div key={t.id} className="border rounded-md px-3 py-2 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.dueDate && (
                        <span className={late ? "text-red-600 font-medium" : ""}>{t.dueDate}</span>
                      )}
                      {t.assignAll ? " · כולם" : t.assigneeId ? ` · ${staffName(t.assigneeId)}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${STATUS_CLS[t.status]} shrink-0`}>
                    {STATUS_LABEL[t.status]}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  {t.status !== "in_progress" && t.status !== "done" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => move(t.id, "in_progress")}>
                      <Play className="ml-1 h-3 w-3" />בתהליך
                    </Button>
                  )}
                  {t.status !== "done" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => move(t.id, "done")}>
                      <Check className="ml-1 h-3 w-3" />הושלם
                    </Button>
                  )}
                  {t.status === "done" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs"
                            onClick={() => move(t.id, "open")}>
                      החזר לביצוע
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-primary"
                          onClick={() => navigateTo("tasks", t.id, { edit: true })}>
                    פתח במשימות<ArrowLeft className="mr-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
