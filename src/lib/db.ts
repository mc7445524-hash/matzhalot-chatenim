import { supabase } from "@/integrations/supabase/client";

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

export interface BasketProduct {
  id: string;
  name: string;
  cost: number;
}

export interface GlobalSettingsData {
  basketCost: number;
  basketCostHistory: { date: string; oldCost: number; newCost: number }[];
  minimumForBasket: number;
  lastClassUpgrade: { date: string; type: string } | null;
  classUpgradeHistory: { date: string; type: string }[];
}

// ─── Fetch functions ─────────────────────────────────────────

export async function fetchBachurim(): Promise<Bachur[]> {
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
    inAskanim: r.in_askanim,
    closed: r.closed,
  }));
}

export async function saveBachurimToDb(bachurim: Bachur[]): Promise<void> {
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
  const { data, error } = await supabase.from("expenses").select("*");
  if (error) { console.error("fetchExpenses", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    date: r.date,
    category: r.category,
    subCategory: r.sub_category,
    notes: r.notes,
    contactPerson: r.contact_person,
    recognized: r.recognized,
    recognizedDate: r.recognized_date || undefined,
    auto: r.auto || false,
  }));
}

export async function saveExpensesToDb(expenses: Expense[]): Promise<void> {
  await supabase.from("expenses").delete().neq("id", "___never___");
  if (expenses.length === 0) return;
  const rows = expenses.map((e) => ({
    id: e.id,
    amount: e.amount,
    date: e.date,
    category: e.category,
    sub_category: e.subCategory,
    notes: e.notes,
    contact_person: e.contactPerson,
    recognized: e.recognized,
    recognized_date: e.recognizedDate || null,
    auto: e.auto || false,
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("expenses").insert(rows.slice(i, i + 500));
    if (error) console.error("saveExpenses", error);
  }
}

export async function fetchDebts(): Promise<Debt[]> {
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
  const { data, error } = await supabase.from("basket_products").select("*");
  if (error) { console.error("fetchBasketProducts", error); return []; }
  return (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    cost: Number(r.cost),
  }));
}

export async function saveBasketProductsToDb(products: BasketProduct[]): Promise<void> {
  await supabase.from("basket_products").delete().neq("id", "___never___");
  if (products.length === 0) return;
  const rows = products.map((p) => ({ id: p.id, name: p.name, cost: p.cost }));
  const { error } = await supabase.from("basket_products").insert(rows);
  if (error) console.error("saveBasketProducts", error);
}

export async function fetchGlobalSettings(): Promise<GlobalSettingsData> {
  const defaults: GlobalSettingsData = {
    basketCost: 6000,
    basketCostHistory: [],
    minimumForBasket: 5000,
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
    lastClassUpgrade: (map.get("lastClassUpgrade") as any) ?? defaults.lastClassUpgrade,
    classUpgradeHistory: (map.get("classUpgradeHistory") as any[]) ?? defaults.classUpgradeHistory,
  };
}

export async function saveGlobalSettingsToDb(settings: GlobalSettingsData): Promise<void> {
  const entries = [
    { key: "basketCost", value: settings.basketCost },
    { key: "basketCostHistory", value: settings.basketCostHistory },
    { key: "minimumForBasket", value: settings.minimumForBasket },
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

export async function fetchFundraisers(): Promise<string[]> {
  const { data, error } = await supabase.from("fundraisers").select("*");
  if (error || !data || data.length === 0) {
    return ["שמואל זאב נוטביץ", "יענקי הלר", "עסקנים", "שונות"];
  }
  return data.map((r) => r.name);
}

export async function saveFundraisersToDb(names: string[]): Promise<void> {
  await supabase.from("fundraisers").delete().neq("id", "___never___");
  if (names.length === 0) return;
  const rows = names.map((n) => ({ id: crypto.randomUUID(), name: n }));
  const { error } = await supabase.from("fundraisers").insert(rows);
  if (error) console.error("saveFundraisers", error);
}

export async function fetchExpenseCategories(): Promise<{ salim: string[]; amuta: string[] }> {
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
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, user_email, action_type, details, amount, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) { console.error("fetchActivityLog", error); return []; }
  return (data ?? []) as ActivityLogEntry[];
}
