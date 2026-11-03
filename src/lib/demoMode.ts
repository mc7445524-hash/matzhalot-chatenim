/** Demo mode — a self-contained copy of the app running on invented data.
 *
 *  Reached at ?demo=1. It exists so the system can be shown to someone, or
 *  recorded, without exposing real names and sums and without a login.
 *
 *  The guarantee it has to make is that nothing it does can reach the real
 *  database, so it cuts the connection at both ends rather than trusting
 *  each caller to behave:
 *
 *    1. localStorage is replaced, for the synced keys only, by an in-memory
 *       store. Components keep calling getItem/setItem exactly as before,
 *       but nothing they write lands in the browser's real storage — so the
 *       sync has nothing to pick up, and a real session in the same browser
 *       keeps its cached data untouched.
 *    2. The Supabase client is swapped for a stub. Anything that still calls
 *       it — the activity log, tasks, chat, presence — talks to in-memory
 *       tables instead of the network.
 *
 *  Together those mean demo mode cannot write to Supabase even if some
 *  future code path forgets it exists.
 */
import { buildDemoData } from "@/lib/demoData";

const SYNCED_KEYS = [
  "bachurim", "incomes", "expenses", "debts", "askanimIncomes",
  "basketProducts", "globalSettings", "fundraisers",
  "expense_cats_salim", "expense_cats_amuta",
];

let demoFlag: boolean | null = null;

export function isDemo(): boolean {
  if (demoFlag !== null) return demoFlag;
  if (typeof window === "undefined") return false;
  try {
    const q = new URLSearchParams(window.location.search).get("demo");
    if (q === "1") sessionStorage.setItem("demo_mode", "1");
    if (q === "0") sessionStorage.removeItem("demo_mode");
    demoFlag = sessionStorage.getItem("demo_mode") === "1";
  } catch {
    demoFlag = false;
  }
  return demoFlag;
}

// ─── in-memory tables for whatever still calls Supabase ──────
const tables: Record<string, any[]> = {};

/** A thenable query builder. Enough of the Supabase surface for the calls
 *  this app makes; anything unrecognised resolves to an empty result rather
 *  than throwing, because in demo mode a missing feature should look empty,
 *  not break the page. */
function builder(name: string) {
  let rows = () => (tables[name] ||= []);
  const filters: ((r: any) => boolean)[] = [];
  let order: { col: string; asc: boolean } | null = null;
  let limit = 0;
  let single = false;
  let payload: any = null;
  let mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";

  const run = () => {
    const all = rows();
    if (mode === "insert" || mode === "upsert") {
      const items = (Array.isArray(payload) ? payload : [payload]).map((p) => ({
        id: p?.id ?? `demo-${name}-${Math.random().toString(36).slice(2, 9)}`,
        created_at: new Date().toISOString(),
        ...p,
      }));
      for (const it of items) {
        const i = all.findIndex((x) => x.id === it.id);
        i >= 0 ? (all[i] = { ...all[i], ...it }) : all.push(it);
      }
      return { data: single ? items[0] : items, error: null };
    }
    let out = all.filter((r) => filters.every((f) => f(r)));
    if (mode === "update") {
      for (const r of out) Object.assign(r, payload);
      return { data: out, error: null };
    }
    if (mode === "delete") {
      for (const r of out) {
        const i = all.indexOf(r);
        if (i >= 0) all.splice(i, 1);
      }
      return { data: out, error: null };
    }
    if (order) {
      const { col, asc } = order;
      out = [...out].sort((a, b) =>
        String(a?.[col] ?? "").localeCompare(String(b?.[col] ?? "")) * (asc ? 1 : -1)
      );
    }
    if (limit) out = out.slice(0, limit);
    return { data: single ? (out[0] ?? null) : out, error: null };
  };

  const api: any = {
    select() { if (mode === "select") mode = "select"; return api; },
    insert(p: any) { mode = "insert"; payload = p; return api; },
    upsert(p: any) { mode = "upsert"; payload = p; return api; },
    update(p: any) { mode = "update"; payload = p; return api; },
    delete() { mode = "delete"; return api; },
    eq(col: string, v: any) { filters.push((r) => r?.[col] === v); return api; },
    neq(col: string, v: any) { filters.push((r) => r?.[col] !== v); return api; },
    in(col: string, v: any[]) { filters.push((r) => v.includes(r?.[col])); return api; },
    gte(col: string, v: any) { filters.push((r) => r?.[col] >= v); return api; },
    lte(col: string, v: any) { filters.push((r) => r?.[col] <= v); return api; },
    is(col: string, v: any) { filters.push((r) => r?.[col] === v); return api; },
    not() { return api; },
    or() { return api; },
    order(col: string, o: any = {}) { order = { col, asc: o?.ascending !== false }; return api; },
    limit(n: number) { limit = n; return api; },
    range() { return api; },
    single() { single = true; return api; },
    maybeSingle() { single = true; return api; },
    then(res: any, rej: any) { return Promise.resolve(run()).then(res, rej); },
    catch(fn: any) { return Promise.resolve(run()).catch(fn); },
    finally(fn: any) { return Promise.resolve(run()).finally(fn); },
  };
  return api;
}

const noopChannel: any = {
  on() { return noopChannel; },
  subscribe(cb?: any) { cb?.("SUBSCRIBED"); return noopChannel; },
  unsubscribe() { return Promise.resolve("ok"); },
  track() { return Promise.resolve("ok"); },
  untrack() { return Promise.resolve("ok"); },
  presenceState() { return {}; },
  send() { return Promise.resolve("ok"); },
};

const DEMO_USER = {
  id: "demo-user", email: "demo@example.com",
  user_metadata: { full_name: "משתמש הדגמה" },
};
const DEMO_SESSION = { user: DEMO_USER, access_token: "demo" };

export const demoSupabase: any = {
  from: (name: string) => builder(name),
  rpc: () => Promise.resolve({ data: null, error: null }),
  channel: () => noopChannel,
  removeChannel: () => Promise.resolve("ok"),
  getChannels: () => [],
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: "demo" } }),
      download: () => Promise.resolve({ data: null, error: { message: "demo" } }),
      remove: () => Promise.resolve({ data: null, error: null }),
      list: () => Promise.resolve({ data: [], error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
      createSignedUrl: () => Promise.resolve({ data: null, error: { message: "demo" } }),
    }),
  },
  auth: {
    getSession: () => Promise.resolve({ data: { session: DEMO_SESSION }, error: null }),
    getUser: () => Promise.resolve({ data: { user: DEMO_USER }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithPassword: () => Promise.resolve({ data: { session: DEMO_SESSION }, error: null }),
    signUp: () => Promise.resolve({ data: { session: DEMO_SESSION }, error: null }),
  },
};

/** A standing mark that none of these numbers are real, so the demo can
 *  never be mistaken for the live system. */
function badge() {
  const draw = () => {
    if (!document.body || document.getElementById("demo-badge")) return;
    const el = document.createElement("div");
    el.id = "demo-badge";
    el.textContent = "אתר הדגמה — נתונים לדוגמה בלבד";
    el.setAttribute("style", [
      "position:fixed", "bottom:14px", "left:14px", "z-index:2147483000",
      "background:#b45309", "color:#fff", "font:600 13px 'Segoe UI',Arial",
      "padding:7px 14px", "border-radius:999px", "direction:rtl",
      "pointer-events:none", "box-shadow:0 2px 10px rgba(0,0,0,.25)",
    ].join(";"));
    document.body.appendChild(el);
  };
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", draw, { once: true })
    : draw();
}

// ─── install ─────────────────────────────────────────────────
let installed = false;

/** Must run before anything reads localStorage or Supabase. */
export function installDemoMode() {
  if (installed || !isDemo() || typeof window === "undefined") return;
  installed = true;

  const data = buildDemoData();
  const mem = new Map<string, string>();
  const put = (k: string, v: unknown) => mem.set(k, JSON.stringify(v));

  put("bachurim", data.bachurim);
  put("incomes", data.incomes);
  put("expenses", data.expenses);
  put("debts", data.debts);
  put("askanimIncomes", data.askanimIncomes);
  put("basketProducts", data.basketProducts);
  put("globalSettings", data.globalSettings);
  put("fundraisers", data.fundraisers);
  put("expense_cats_salim", data.expense_cats_salim);
  put("expense_cats_amuta", data.expense_cats_amuta);

  tables.tasks = data.tasks;
  tables.task_employees = data.employees;
  tables.employees = data.employees;
  tables.activity_log = [];
  tables.profiles = [{ id: DEMO_USER.id, email: DEMO_USER.email, status: "approved", role: "admin" }];

  const proto = Object.getPrototypeOf(window.localStorage);
  const realGet = proto.getItem.bind(window.localStorage);
  const realSet = proto.setItem.bind(window.localStorage);
  const realRemove = proto.removeItem.bind(window.localStorage);
  const owned = (k: string) => SYNCED_KEYS.includes(k);

  badge();

  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => (owned(k) ? mem.get(k) ?? null : realGet(k)),
      setItem: (k: string, v: string) => {
        if (owned(k)) {
          mem.set(k, v);
          // Components listen for this to re-read; the real storage event
          // never fires for same-tab writes.
          window.dispatchEvent(new StorageEvent("storage", { key: k, newValue: v }));
          return;
        }
        realSet(k, v);
      },
      removeItem: (k: string) => (owned(k) ? void mem.delete(k) : realRemove(k)),
      clear: () => mem.clear(),
      key: (i: number) => [...mem.keys()][i] ?? null,
      get length() { return mem.size; },
    },
  });
}
