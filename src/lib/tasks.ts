import { supabase } from "@/integrations/supabase/client";

export type TaskStatus = "open" | "in_progress" | "done";
export type TaskPriority = "low" | "normal" | "high";

export interface Employee {
  id: string;
  name: string;
  archivedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  dueTime?: string;
  durationMinutes?: number;
  completedAt?: string;
  assigneeId?: string;
  /** Targets the whole team; mutually exclusive with assigneeId. */
  assignAll?: boolean;
  bachurId?: string;
  createdAt: string;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  content: string;
  newDueDate?: string;
  authorEmail?: string;
  createdAt: string;
}

// ─── Employees ────────────────────────────────────────────────

export async function fetchEmployees(includeArchived = false): Promise<Employee[]> {
  let q = supabase.from("employees").select("*").order("name");
  if (!includeArchived) q = q.is("archived_at", null);
  const { data, error } = await q;
  if (error) { console.error("fetchEmployees", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    archivedAt: r.archived_at || undefined,
  }));
}

export async function addEmployee(name: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from("employees").insert({ name }).select().single();
  if (error) { console.error("addEmployee", error); return null; }
  return { id: data.id, name: data.name };
}

/** Archives rather than deletes, so existing tasks keep showing the name. */
export async function archiveEmployee(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("employees").update({ archived_at: new Date().toISOString() }).eq("id", id);
  if (error) { console.error("archiveEmployee", error); return false; }
  return true;
}

export async function restoreEmployee(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("employees").update({ archived_at: null }).eq("id", id);
  if (error) { console.error("restoreEmployee", error); return false; }
  return true;
}

// ─── Tasks ────────────────────────────────────────────────────

function toTask(r: Record<string, unknown>): Task {
  return {
    id: r.id as string,
    title: r.title as string,
    notes: (r.notes as string) || undefined,
    status: r.status as TaskStatus,
    priority: r.priority as TaskPriority,
    dueDate: (r.due_date as string) || undefined,
    dueTime: (r.due_time as string) || undefined,
    durationMinutes: (r.duration_minutes as number) ?? undefined,
    completedAt: (r.completed_at as string) || undefined,
    assigneeId: (r.assignee_id as string) || undefined,
    assignAll: (r.assign_all as boolean) || false,
    bachurId: (r.bachur_id as string) || undefined,
    createdAt: r.created_at as string,
  };
}

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks").select("*")
    .order("due_date", { nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchTasks", error); return []; }
  return (data || []).map(toTask);
}

type TaskInput = Omit<Task, "id" | "createdAt" | "completedAt">;

function toRow(t: Partial<TaskInput>) {
  const row: Record<string, unknown> = {};
  if (t.title !== undefined) row.title = t.title;
  if (t.notes !== undefined) row.notes = t.notes || null;
  if (t.status !== undefined) row.status = t.status;
  if (t.priority !== undefined) row.priority = t.priority;
  if (t.dueDate !== undefined) row.due_date = t.dueDate || null;
  if (t.dueTime !== undefined) row.due_time = t.dueTime || null;
  if (t.durationMinutes !== undefined) row.duration_minutes = t.durationMinutes || null;
  if (t.assigneeId !== undefined) row.assignee_id = t.assigneeId || null;
  if (t.assignAll !== undefined) row.assign_all = !!t.assignAll;
  if (t.bachurId !== undefined) row.bachur_id = t.bachurId || null;
  return row;
}

/** How many notes each task carries, so the board can flag them. */
export async function fetchUpdateCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("task_updates").select("task_id");
  if (error) { console.error("fetchUpdateCounts", error); return {}; }
  const counts: Record<string, number> = {};
  for (const r of data || []) counts[r.task_id] = (counts[r.task_id] || 0) + 1;
  return counts;
}

export async function createTask(t: TaskInput): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks").insert(toRow(t)).select().single();
  if (error) { console.error("createTask", error); return null; }
  return toTask(data);
}

export async function updateTask(id: string, patch: Partial<TaskInput>): Promise<boolean> {
  const { error } = await supabase
    .from("tasks")
    .update({ ...toRow(patch), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) { console.error("updateTask", error); return false; }
  return true;
}

/** completed_at drives the active-vs-archive split, so it moves with status. */
export async function setTaskStatus(id: string, status: TaskStatus): Promise<boolean> {
  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) { console.error("setTaskStatus", error); return false; }
  return true;
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) { console.error("deleteTask", error); return false; }
  return true;
}

// ─── Updates log ──────────────────────────────────────────────

export async function fetchTaskUpdates(taskId: string): Promise<TaskUpdate[]> {
  const { data, error } = await supabase
    .from("task_updates").select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchTaskUpdates", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    taskId: r.task_id,
    content: r.content,
    newDueDate: r.new_due_date || undefined,
    authorEmail: r.author_email || undefined,
    createdAt: r.created_at,
  }));
}

/** Adds a note; when newDueDate is given the task is postponed to it. */
export async function addTaskUpdate(
  taskId: string,
  content: string,
  newDueDate?: string,
): Promise<boolean> {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase.from("task_updates").insert({
    task_id: taskId,
    content,
    new_due_date: newDueDate || null,
    author_email: me.user?.email || null,
  });
  if (error) { console.error("addTaskUpdate", error); return false; }
  if (newDueDate) await updateTask(taskId, { dueDate: newDueDate });
  return true;
}
