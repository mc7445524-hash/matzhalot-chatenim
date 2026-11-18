import { supabase } from "@/integrations/supabase/client";
import { isDemo } from "@/lib/demoMode";

/** In demo mode this whole layer is backed by the in-memory store that
 *  demoMode installs over localStorage, so the context-driven screens and
 *  the localStorage-driven ones read and write the same data — and none of
 *  it reaches Supabase. */
function demoRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function demoWrite(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

/** Share of the minimum at which a bachur counts as "קרוב לסל".
 *  Defined once so the dashboard, the bachurim list and the reports
 *  cannot drift apart and label the same bachur differently. */
export const CLOSE_TO_BASKET_RATIO = 0.8;

// ─── Types (matching existing app types) ─────────────────────
export interface Outing {
  id: string;
  name: string;
  date: string;
  amount: number;
  paymentMethod: string;
  paymentMethodDetail?: string;
}

export interface Bachur {
  id: string;
  sku: string;
  name: string;
  classLevel: string;
  joinDate: string;
  outings: Outing[];
  married: boolean;
  marriedDate?: string;
  receivedBasket: boolean;
  basketDate?: string;
  basketCostAtTime?: number;
  /** What the basket was made of on the day this bachur received it, with
   *  each shop's share. The products and their prices go on changing after
   *  that, so without this snapshot an invoice from last March would be
   *  checked against a price that did not exist then. */
  basketBreakdownAtTime?: BasketShare[];
  inAskanim: boolean;
  closed: boolean;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
  target?: string;
  recognized: boolean;
  recognizedDate?: string;
  auto?: boolean;
  fundraiser?: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  subCategory: string;
  notes: string;
  contactPerson: string;
  recognized: boolean;
  recognizedDate?: string;
  auto?: boolean;
  /** Set on an expense that pays a shop for baskets: which product (shop)
   *  it is for, and which bachurim it settles. The gap is the difference
   *  between the sum those bachurim locked and what was actually paid —
   *  a discount keeps it, a debt still owes it. */
  basketProductId?: string;
  basketBachurIds?: string[];
  basketGapKind?: "discount" | "debt";
  basketGapAmount?: number;
  /** Path inside the private "invoices" bucket. Set once the file is uploaded. */
  invoicePath?: string;
  invoiceFileName?: string;
  invoiceFileType?: string;
  /** Data URL of a freshly picked file, before it reaches storage. Never persisted. */
  invoiceFileData?: string;
}

export interface Debt {
  id: string;
  date: string;
  name: string;
  amount: number;
  notes: string;
  returned: boolean;
  returnedAmount?: number;
  returnedVia?: string;
  returnedDate?: string;
}

export interface AskanimIncome {
  id: string;
  bachurId: string;
  bachurName: string;
  date: string;
  amount: number;
  notes: string;
}

/** One shop's share of a basket, as it stood when a basket was handed over. */
export interface BasketShare {
  productId: string;
  name: string;
  cost: number;
}

export interface BasketProduct {
  id: string;
  name: string;
  cost: number;
  /** Every price change, newest first. */
  costHistory: { date: string; oldCost: number; newCost: number }[];
  /** False once the product is taken out of the basket. It stays on the
   *  list while bachurim who locked it are still owed to that shop, and is
   *  removed for good once the last of them is settled. */
  active: boolean;
}

export interface GlobalSettingsData {
  basketCost: number;
  basketCostHistory: { date: string; oldCost: number; newCost: number }[];
  minimumForBasket: number;
  /** Every change of the minimum, oldest last. The minimum decides who is
   *  eligible for a basket, so a report about last month has to be read
   *  against the minimum that was in force then and not against today's. */
  minimumHistory: { date: string; oldMin: number; newMin: number }[];
  /** What was in the bank on the day the books were opened. Money that came
   *  in before the system did is otherwise invisible, and every figure that
   *  asks how much the amuta really holds would start out wrong. */
  openingBalance: number;
  openingBalanceDate?: string;
  /** What the bank actually says today, typed in by hand. It is never used in
   *  any calculation — it exists only so the books can be held up against
   *  reality and a shortfall noticed instead of assumed away. */
  actualBank?: number;
  actualBankDate?: string;
  /** What the books said minus what the bank said, at the moment it was
   *  read. The live bank figure is derived from this, so every entry moves
   *  it on its own and the reading never has to be typed again. */
  bankGap?: number;
  lastClassUpgrade: { date: string; type: string } | null;
  classUpgradeHistory: { date: string; type: string }[];
}

// ─── Fetch functions ─────────────────────────────────────────

export async function fetchBachurim(): Promise<Bachur[]> {
  if (isDemo()) return demoRead<Bachur[]>("bachurim", []);
  const { data: rows, error } = await supabase.from("bachurim").select("*");
  if (error) { console.error("fetchBachurim", error); return []; }

  const { data: outingRows, error: oErr } = await supabase.from("outings").select("*");
  if (oErr) console.error("fetchOutings", oErr);

  const outingsMap = new Map<string, Outing[]>();
  for (const o of outingRows || []) {
    const list = outingsMap.get(o.bachur_id) || [];
    list.push({
      id: o.id,
      name: o.name,
      date: o.date,
      amount: Number(o.amount),
      paymentMethod: o.payment_method,
      paymentMethodDetail: o.payment_method_detail || undefined,
    });
    outingsMap.set(o.bachur_id, list);
  }

  return (rows || []).map((r) => ({
    id: r.id,
    sku: r.sku,
    name: r.name,
    classLevel: r.class_level,
    joinDate: r.join_date,
    outings: outingsMap.get(r.id) || [],
    married: r.married,
    marriedDate: r.married_date || undefined,
    receivedBasket: r.received_basket,
    basketDate: r.basket_date || undefined,
    basketCostAtTime: r.basket_cost_at_time != null ? Number(r.basket_cost_at_time) : undefined,
    basketBreakdownAtTime: (r.basket_breakdown_at_time as BasketShare[]) ?? undefined,
    inAskanim: r.in_askanim,
    closed: r.closed,
  }));
}

export async function saveBachurimToDb(bachurim: Bachur[]): Promise<void> {
  if (isDemo()) return demoWrite("bachurim", bachurim);
  // Delete all then re-insert (simple approach for full-sync)
  await supabase.from("outings").delete().neq("id", "___never___");
  await supabase.from("bachurim").delete().neq("id", "___never___");

  if (bachurim.length === 0) return;

  const bachurRows = bachurim.map((b) => ({
    id: b.id,
    sku: b.sku,
    name: b.name,
    class_level: b.classLevel,
    join_date: b.joinDate,
    married: b.married,
    married_date: b.marriedDate || null,
    received_basket: b.receivedBasket,
    basket_date: b.basketDate || null,
    basket_cost_at_time: b.basketCostAtTime ?? null,
    basket_breakdown_at_time: b.basketBreakdownAtTime ?? null,
    in_askanim: b.inAskanim,
    closed: b.closed,
  }));

  const { error } = await supabase.from("bachurim").insert(bachurRows);
  if (error) console.error("saveBachurim", error);

  const outingRows = bachurim.flatMap((b) =>
    b.outings.map((o) => ({
      id: o.id,
      bachur_id: b.id,
      name: o.name,
      date: o.date,
      amount: o.amount,
      payment_method: o.paymentMethod,
      payment_method_detail: o.paymentMethodDetail || null,
    }))
  );

  if (outingRows.length > 0) {
    // Insert in batches of 500
    for (let i = 0; i < outingRows.length; i += 500) {
      const batch = outingRows.slice(i, i + 500);
      const { error: oErr } = await supabase.from("outings").insert(batch);
      if (oErr) console.error("saveOutings batch", oErr);
    }
  }
}

export async function fetchIncomes(): Promise<Income[]> {
  if (isDemo()) return demoRead<Income[]>("incomes", []);
  const { data, error } = await supabase.from("incomes").select("*");
  if (error) { console.error("fetchIncomes", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    description: r.description,
    amount: Number(r.amount),
    date: r.date,
    category: r.category || undefined,
    target: r.target || undefined,
    recognized: r.recognized,
    recognizedDate: r.recognized_date || undefined,
    auto: r.auto || false,
    fundraiser: r.fundraiser || undefined,
  }));
}

export async function saveIncomesToDb(incomes: Income[]): Promise<void> {
  if (isDemo()) return demoWrite("incomes", incomes);
  await supabase.from("incomes").delete().neq("id", "___never___");
  if (incomes.length === 0) return;
  const rows = incomes.map((i) => ({
    id: i.id,
    description: i.description,
    amount: i.amount,
    date: i.date,
    category: i.category || null,
    target: i.target || null,
    recognized: i.recognized,
    recognized_date: i.recognizedDate || null,
    auto: i.auto || false,
    fundraiser: i.fundraiser || null,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("incomes").insert(rows.slice(i, i + 500));
    if (error) console.error("saveIncomes", error);
  }
}

export async function fetchExpenses(): Promise<Expense[]> {
  if (isDemo()) return demoRead<Expense[]>("expenses", []);
  const { data, error } = await supabase.from("expenses").select("*");
  if (error) { console.error("fetchExpenses", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    date: r.date,
    category: r.category,
    subCategory: r.sub_category,
    basketProductId: r.basket_product_id || undefined,
    basketBachurIds: (r.basket_bachur_ids as string[]) ?? undefined,
    basketGapKind: (r.basket_gap_kind as "discount" | "debt") || undefined,
    basketGapAmount: r.basket_gap_amount != null ? Number(r.basket_gap_amount) : undefined,
    notes: r.notes,
    contactPerson: r.contact_person,
    recognized: r.recognized,
    recognizedDate: r.recognized_date || undefined,
    auto: r.auto || false,
    invoicePath: r.invoice_path || undefined,
    invoiceFileName: r.invoice_name || undefined,
    invoiceFileType: r.invoice_type || undefined,
  }));
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const [header, b64] = dataUrl.split(",");
    if (!b64) return null;
    const mime = header.match(/data:([^;]+)/)?.[1] || "application/octet-stream";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch { return null; }
}

/** Uploads a freshly picked invoice and returns its storage path. */
async function uploadInvoice(expenseId: string, e: Expense): Promise<string | undefined> {
  const blob = e.invoiceFileData ? dataUrlToBlob(e.invoiceFileData) : null;
  if (!blob) return undefined;
  const ext = (e.invoiceFileName?.split(".").pop() || "bin").toLowerCase();
  const path = `${expenseId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("invoices")
    .upload(path, blob, { contentType: blob.type || undefined, upsert: false });
  if (error) { console.error("uploadInvoice", error); return undefined; }
  return path;
}

/** Fetches an invoice back out of storage as a Blob. */
export async function downloadInvoice(path: string): Promise<Blob | null> {
  if (isDemo()) return null;
  const { data, error } = await supabase.storage.from("invoices").download(path);
  if (error) { console.error("downloadInvoice", error); return null; }
  return data;
}

export async function saveExpensesToDb(expenses: Expense[]): Promise<void> {
  if (isDemo()) return demoWrite("expenses", expenses);
  // Upload any newly picked invoice before touching the table, so a failed
  // upload can never leave a row pointing at a file that was never stored.
  const paths = new Map<string, string>();
  for (const e of expenses) {
    if (e.invoicePath || !e.invoiceFileData) continue;
    const path = await uploadInvoice(e.id, e);
    if (path) paths.set(e.id, path);
  }

  await supabase.from("expenses").delete().neq("id", "___never___");
  if (expenses.length === 0) return;
  const rows = expenses.map((e) => ({
    id: e.id,
    amount: e.amount,
    date: e.date,
    category: e.category,
    sub_category: e.subCategory,
    basket_product_id: e.basketProductId || null,
    basket_bachur_ids: e.basketBachurIds ?? null,
    basket_gap_kind: e.basketGapKind || null,
    basket_gap_amount: e.basketGapAmount ?? null,
    notes: e.notes,
    contact_person: e.contactPerson,
    recognized: e.recognized,
    recognized_date: e.recognizedDate || null,
    auto: e.auto || false,
    invoice_path: e.invoicePath || paths.get(e.id) || null,
    invoice_name: e.invoiceFileName || null,
    invoice_type: e.invoiceFileType || null,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("expenses").insert(rows.slice(i, i + 500));
    if (error) console.error("saveExpenses", error);
  }
}

export async function fetchDebts(): Promise<Debt[]> {
  if (isDemo()) return demoRead<Debt[]>("debts", []);
  const { data, error } = await supabase.from("debts").select("*");
  if (error) { console.error("fetchDebts", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    date: r.date,
    name: r.name,
    amount: Number(r.amount),
    notes: r.notes,
    returned: r.returned,
    returnedAmount: r.returned_amount != null ? Number(r.returned_amount) : undefined,
    returnedVia: r.returned_via || undefined,
    returnedDate: r.returned_date || undefined,
  }));
}

export async function saveDebtsToDb(debts: Debt[]): Promise<void> {
  if (isDemo()) return demoWrite("debts", debts);
  await supabase.from("debts").delete().neq("id", "___never___");
  if (debts.length === 0) return;
  const rows = debts.map((d) => ({
    id: d.id,
    date: d.date,
    name: d.name,
    amount: d.amount,
    notes: d.notes,
    returned: d.returned,
    returned_amount: d.returnedAmount ?? null,
    returned_via: d.returnedVia || null,
    returned_date: d.returnedDate || null,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("debts").insert(rows.slice(i, i + 500));
    if (error) console.error("saveDebts", error);
  }
}

export async function fetchAskanimIncomes(): Promise<AskanimIncome[]> {
  if (isDemo()) return demoRead<AskanimIncome[]>("askanimIncomes", []);
  const { data, error } = await supabase.from("askanim_incomes").select("*");
  if (error) { console.error("fetchAskanimIncomes", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    bachurId: r.bachur_id,
    bachurName: r.bachur_name,
    date: r.date,
    amount: Number(r.amount),
    notes: r.notes,
  }));
}

export async function saveAskanimIncomesToDb(incomes: AskanimIncome[]): Promise<void> {
  if (isDemo()) return demoWrite("askanimIncomes", incomes);
  await supabase.from("askanim_incomes").delete().neq("id", "___never___");
  if (incomes.length === 0) return;
  const rows = incomes.map((i) => ({
    id: i.id,
    bachur_id: i.bachurId,
    bachur_name: i.bachurName,
    date: i.date,
    amount: i.amount,
    notes: i.notes,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("askanim_incomes").insert(rows.slice(i, i + 500));
    if (error) console.error("saveAskanimIncomes", error);
  }
}

export async function fetchBasketProducts(): Promise<BasketProduct[]> {
  if (isDemo()) return demoRead<BasketProduct[]>("basketProducts", []);
  const { data, error } = await supabase.from("basket_products").select("*");
  if (error) { console.error("fetchBasketProducts", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    cost: Number(r.cost),
    costHistory: (r.cost_history as any[]) ?? [],
    // Rows written before this column existed come back null, and those
    // products are all still in the basket.
    active: r.active !== false,
  }));
}

export async function saveBasketProductsToDb(products: BasketProduct[]): Promise<void> {
  if (isDemo()) return demoWrite("basketProducts", products);
  await supabase.from("basket_products").delete().neq("id", "___never___");
  if (products.length === 0) return;
  const rows = products.map((p) => ({
    id: p.id, name: p.name, cost: p.cost,
    cost_history: p.costHistory ?? [],
    active: p.active !== false,
  }));
  const { error } = await supabase.from("basket_products").insert(rows);
  if (error) console.error("saveBasketProducts", error);
}

export async function fetchGlobalSettings(): Promise<GlobalSettingsData> {
  if (isDemo()) return demoRead<GlobalSettingsData>("globalSettings", {} as GlobalSettingsData);
  const defaults: GlobalSettingsData = {
    basketCost: 6000,
    basketCostHistory: [],
    minimumForBasket: 5000,
    minimumHistory: [],
    openingBalance: 0,
    openingBalanceDate: undefined,
    lastClassUpgrade: null,
    classUpgradeHistory: [],
  };
  const { data, error } = await supabase.from("global_settings").select("*");
  if (error || !data || data.length === 0) return defaults;

  const map = new Map(data.map((r) => [r.key, r.value]));
  return {
    basketCost: (map.get("basketCost") as number) ?? defaults.basketCost,
    basketCostHistory: (map.get("basketCostHistory") as any[]) ?? defaults.basketCostHistory,
    minimumForBasket: (map.get("minimumForBasket") as number) ?? defaults.minimumForBasket,
    minimumHistory: (map.get("minimumHistory") as any[]) ?? defaults.minimumHistory,
    openingBalance: (map.get("openingBalance") as number) ?? defaults.openingBalance,
    openingBalanceDate: (map.get("openingBalanceDate") as string) ?? undefined,
    actualBank: (map.get("actualBank") as number) ?? undefined,
    actualBankDate: (map.get("actualBankDate") as string) ?? undefined,
    bankGap: (map.get("bankGap") as number) ?? undefined,
    lastClassUpgrade: (map.get("lastClassUpgrade") as any) ?? defaults.lastClassUpgrade,
    classUpgradeHistory: (map.get("classUpgradeHistory") as any[]) ?? defaults.classUpgradeHistory,
  };
}

export async function saveGlobalSettingsToDb(settings: GlobalSettingsData): Promise<void> {
  if (isDemo()) return demoWrite("globalSettings", settings);
  const entries = [
    { key: "basketCost", value: settings.basketCost },
    { key: "basketCostHistory", value: settings.basketCostHistory },
    { key: "minimumForBasket", value: settings.minimumForBasket },
    { key: "minimumHistory", value: settings.minimumHistory },
    { key: "openingBalance", value: settings.openingBalance },
    { key: "openingBalanceDate", value: settings.openingBalanceDate ?? null },
    { key: "actualBank", value: settings.actualBank ?? null },
    { key: "actualBankDate", value: settings.actualBankDate ?? null },
    { key: "bankGap", value: settings.bankGap ?? null },
    { key: "lastClassUpgrade", value: settings.lastClassUpgrade },
    { key: "classUpgradeHistory", value: settings.classUpgradeHistory },
  ];
  for (const entry of entries) {
    await supabase.from("global_settings").upsert(
      { key: entry.key, value: entry.value as any, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  }
}

/** Has this project ever had its localStorage carried up to Supabase?
 *
 *  Without this flag an empty cloud is indistinguishable from a cloud that
 *  was never filled, so clearing the data and reloading would hand the old
 *  rows straight back from whatever browser still had a copy. Once the flag
 *  is set, empty means empty. */
export async function fetchMigrationDone(): Promise<boolean> {
  if (isDemo()) return true;
  const { data, error } = await supabase
    .from("global_settings").select("value").eq("key", "migrationDone").maybeSingle();
  if (error || !data) return false;
  return data.value === true;
}

export async function markMigrationDone(): Promise<void> {
  if (isDemo()) return;
  await supabase.from("global_settings").upsert(
    { key: "migrationDone", value: true as any, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  );
}

export async function fetchFundraisers(): Promise<string[]> {
  if (isDemo()) return demoRead<string[]>("fundraisers", []);
  const { data, error } = await supabase.from("fundraisers").select("*");
  if (error || !data || data.length === 0) {
    return ["שמואל זאב נוטביץ", "יענקי הלר", "עסקנים", "שונות"];
  }
  return data.map((r) => r.name);
}

export async function saveFundraisersToDb(names: string[]): Promise<void> {
  if (isDemo()) return demoWrite("fundraisers", names);
  await supabase.from("fundraisers").delete().neq("id", "___never___");
  if (names.length === 0) return;
  const rows = names.map((n) => ({ id: crypto.randomUUID(), name: n }));
  const { error } = await supabase.from("fundraisers").insert(rows);
  if (error) console.error("saveFundraisers", error);
}

export async function fetchExpenseCategories(): Promise<{ salim: string[]; amuta: string[] }> {
  if (isDemo()) return { salim: demoRead<string[]>("expense_cats_salim", []), amuta: demoRead<string[]>("expense_cats_amuta", []) };
  const { data, error } = await supabase.from("expense_categories").select("*");
  if (error || !data || data.length === 0) {
    return {
      salim: ["גור", "דקל", 'חכ"ם', "אוצרות ההלבשה", "אותיות", "פרוכטר", "גפנרס", "שונות"],
      amuta: ["משרד", "פרויקט עסקנים", "משכורת", "פעילות", "טלמרקטינג", "שונות"],
    };
  }
  return {
    salim: data.filter((r) => r.type === "salim").map((r) => r.name),
    amuta: data.filter((r) => r.type === "amuta").map((r) => r.name),
  };
}

export async function saveExpenseCategoriesToDb(salim: string[], amuta: string[]): Promise<void> {
  if (isDemo()) { demoWrite("expense_cats_salim", salim); return demoWrite("expense_cats_amuta", amuta); }
  await supabase.from("expense_categories").delete().neq("id", "___never___");
  const rows = [
    ...salim.map((n) => ({ id: crypto.randomUUID(), type: "salim", name: n })),
    ...amuta.map((n) => ({ id: crypto.randomUUID(), type: "amuta", name: n })),
  ];
  if (rows.length === 0) return;
  const { error } = await supabase.from("expense_categories").insert(rows);
  if (error) console.error("saveExpenseCategories", error);
}

// ─── Activity Log ─────────────────────────────────────────────
export interface ActivityLogEntry {
  id: string;
  user_email: string | null;
  action_type: string;
  details: string;
  amount: number | null;
  created_at: string;
}

export async function addActivityLog(
  actionType: string,
  details: string,
  amount?: number,
): Promise<void> {
  if (isDemo()) return;
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("activity_log").insert({
    user_id: user?.id ?? null,
    user_email: user?.email ?? null,
    action_type: actionType,
    details,
    amount: amount ?? null,
  });
  if (error) console.error("addActivityLog", error);
}

export async function fetchActivityLog(): Promise<ActivityLogEntry[]> {
  if (isDemo()) return [];
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, user_email, action_type, details, amount, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) { console.error("fetchActivityLog", error); return []; }
  return (data ?? []) as ActivityLogEntry[];
}
