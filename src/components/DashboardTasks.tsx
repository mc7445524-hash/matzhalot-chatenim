import { useEffect, useState } from "react";
import { AlertTriangle, CalendarDays, CalendarClock, Circle, Loader } from "lucide-react";
import { useNavigation } from "@/contexts/NavigationContext";
import { fetchTasks, type Task } from "@/lib/tasks";

function iso(d: Date) {
  return d.toISOString().split("T")[0];
}

/** Task counts on the dashboard, each one a shortcut into the board. */
export default function DashboardTasks() {
  const { setActiveTab } = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchTasks().then((t) => {
      if (!alive) return;
      setTasks(t);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  if (loading) return null;

  const today = iso(new Date());
  const tomorrow = iso(new Date(Date.now() + 86400000));
  const live = tasks.filter((t) => t.status !== "done");

  const cards = [
    {
      key: "overdue",
      label: "באיחור",
      value: live.filter((t) => t.dueDate && t.dueDate < today).length,
      icon: AlertTriangle,
      cls: "border-red-200 bg-red-50 text-red-700",
      iconCls: "text-red-500",
    },
    {
      key: "today",
      label: "להיום",
      value: live.filter((t) => t.dueDate === today).length,
      icon: CalendarDays,
      cls: "border-amber-200 bg-amber-50 text-amber-700",
      iconCls: "text-amber-500",
    },
    {
      key: "upcoming",
      label: "מחר והלאה",
      value: live.filter((t) => t.dueDate && t.dueDate >= tomorrow).length,
      icon: CalendarClock,
      cls: "border-sky-200 bg-sky-50 text-sky-700",
      iconCls: "text-sky-500",
    },
    {
      key: "open",
      label: "לביצוע",
      value: tasks.filter((t) => t.status === "open").length,
      icon: Circle,
      cls: "border-slate-200 bg-slate-50 text-slate-700",
      iconCls: "text-slate-400",
    },
    {
      key: "in_progress",
      label: "בתהליך",
      value: tasks.filter((t) => t.status === "in_progress").length,
      icon: Loader,
      cls: "border-indigo-200 bg-indigo-50 text-indigo-700",
      iconCls: "text-indigo-500",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-lg font-semibold">משימות</h3>
        <button
          onClick={() => setActiveTab("tasks")}
          className="text-sm text-primary hover:underline"
        >
          לכל המשימות ←
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => setActiveTab("tasks")}
              className={`rounded-xl border p-4 text-right transition hover:shadow-sm ${c.cls}`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${c.iconCls}`} />
                <span className="text-xs font-medium">{c.label}</span>
              </div>
              <p className="text-3xl font-bold mt-2">{c.value}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
