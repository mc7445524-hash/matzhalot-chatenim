import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRoute, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookRequest, WebhookError } from "@lovable.dev/webhooks-js";
import { Html, Head, Preview, Body, Container, Heading, Text, Section, render, Link as Link$1, Button } from "@react-email/components";
import { sendLovableEmail, parseEmailWebhookPayload } from "@lovable.dev/email-js";
function createSupabaseClient() {
  const SUPABASE_URL = "https://vggltzctdheulyunfjzn.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZ2x0emN0ZGhldWx5dW5manpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQ5MDAsImV4cCI6MjEwNjgwMDkwMH0.K63w-CGxkM_eoWIZuRC2k2igMJUNvXGQswQ7LwaXTAA";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const AuthContext = createContext(null);
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileStatus, setProfileStatus] = useState("unknown");
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayName, setDisplayName] = useState(null);
  const [registering, setRegistering] = useState(false);
  const loadProfile = async (uid) => {
    if (!uid) {
      setProfileStatus("unknown");
      setIsAdmin(false);
      setDisplayName(null);
      return;
    }
    const { data, error } = await supabase.from("profiles").select("status, is_admin, display_name").eq("id", uid).maybeSingle();
    if (error || !data) {
      setProfileStatus("unknown");
      setIsAdmin(false);
      setDisplayName(null);
      return;
    }
    setProfileStatus(data.status ?? "pending");
    setIsAdmin(!!data.is_admin);
    setDisplayName(data.display_name ?? null);
  };
  const forceSignOut = async (reason) => {
    try {
      sessionStorage.setItem(
        "forced_signout_reason",
        reason === "rejected" ? "הגישה שלך לאתר בוטלה על ידי המנהל." : "הגישה שלך הושעתה ומחכה לאישור המנהל."
      );
    } catch {
    }
    await supabase.auth.signOut();
    window.location.reload();
  };
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setTimeout(() => {
        loadProfile(newSession?.user?.id);
      }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => setLoading(false));
      if (!data.session) setLoading(false);
    }).catch(() => setLoading(false));
    return () => sub.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) return;
    let cancelled = false;
    const checkStatus = async () => {
      const { data } = await supabase.from("profiles").select("status, is_admin, display_name").eq("id", uid).maybeSingle();
      if (cancelled || !data) return;
      const status = data.status ?? "pending";
      setProfileStatus(status);
      setIsAdmin(!!data.is_admin);
      setDisplayName(data.display_name ?? null);
      if (!data.is_admin && status !== "approved") {
        forceSignOut(status === "rejected" ? "rejected" : "pending");
      }
    };
    const channel = supabase.channel(`profile-status-${uid}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
      (payload) => {
        const newRow = payload.new ?? {};
        if (newRow.display_name !== void 0) setDisplayName(newRow.display_name ?? null);
        if (newRow.status) setProfileStatus(newRow.status);
        if (typeof newRow.is_admin === "boolean") setIsAdmin(newRow.is_admin);
        if (!newRow.is_admin && newRow.status && newRow.status !== "approved") {
          forceSignOut(newRow.status === "rejected" ? "rejected" : "pending");
        }
      }
    ).subscribe();
    const interval = setInterval(checkStatus, 5e3);
    const onVisibility = () => {
      if (document.visibilityState === "visible") checkStatus();
    };
    document.addEventListener("visibilitychange", onVisibility);
    checkStatus();
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const uid = data.user?.id;
    if (uid) {
      const { data: profile } = await supabase.from("profiles").select("status, is_admin").eq("id", uid).maybeSingle();
      const status = profile?.status ?? "pending";
      const admin = !!profile?.is_admin;
      if (!admin && status !== "approved") {
        await supabase.auth.signOut();
        return {
          error: status === "rejected" ? "הגישה שלך לאתר נדחתה / בוטלה על ידי המנהל." : "החשבון שלך ממתין לאישור המנהל. תקבל גישה לאחר שהמנהל יאשר את הבקשה."
        };
      }
    }
    return { error: null };
  };
  const signUp = async (email, password) => {
    setRegistering(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` }
    });
    if (error) {
      setRegistering(false);
      return { error: error.message };
    }
    const newUserId = data.user?.id;
    await supabase.auth.signOut();
    if (newUserId) {
      try {
        const { error: invErr } = await supabase.functions.invoke("notify-admin-signup", {
          body: { user_id: newUserId, email }
        });
        if (invErr) console.warn("notify-admin-signup error", invErr);
      } catch (e) {
        console.warn("notify-admin-signup failed", e);
      }
    }
    setRegistering(false);
    return { error: null, pending: true };
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfileStatus("unknown");
    setIsAdmin(false);
    setDisplayName(null);
    const keysToClear = [
      "bachurim",
      "incomes",
      "expenses",
      "debts",
      "askanimIncomes",
      "basketProducts",
      "globalSettings",
      "fundraisers",
      "expense_cats_salim",
      "expense_cats_amuta"
    ];
    keysToClear.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {
      }
    });
    window.location.reload();
  };
  const refreshProfile = async () => {
    await loadProfile(session?.user?.id);
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: {
    session,
    user: session?.user ?? null,
    loading,
    profileStatus,
    isAdmin,
    displayName,
    registering,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }, children });
}
async function fetchBachurim() {
  const { data: rows, error } = await supabase.from("bachurim").select("*");
  if (error) {
    console.error("fetchBachurim", error);
    return [];
  }
  const { data: outingRows, error: oErr } = await supabase.from("outings").select("*");
  if (oErr) console.error("fetchOutings", oErr);
  const outingsMap = /* @__PURE__ */ new Map();
  for (const o of outingRows || []) {
    const list = outingsMap.get(o.bachur_id) || [];
    list.push({
      id: o.id,
      name: o.name,
      date: o.date,
      amount: Number(o.amount),
      paymentMethod: o.payment_method,
      paymentMethodDetail: o.payment_method_detail || void 0
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
    marriedDate: r.married_date || void 0,
    receivedBasket: r.received_basket,
    basketDate: r.basket_date || void 0,
    basketCostAtTime: r.basket_cost_at_time != null ? Number(r.basket_cost_at_time) : void 0,
    inAskanim: r.in_askanim,
    closed: r.closed
  }));
}
async function saveBachurimToDb(bachurim) {
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
    closed: b.closed
  }));
  const { error } = await supabase.from("bachurim").insert(bachurRows);
  if (error) console.error("saveBachurim", error);
  const outingRows = bachurim.flatMap(
    (b) => b.outings.map((o) => ({
      id: o.id,
      bachur_id: b.id,
      name: o.name,
      date: o.date,
      amount: o.amount,
      payment_method: o.paymentMethod,
      payment_method_detail: o.paymentMethodDetail || null
    }))
  );
  if (outingRows.length > 0) {
    for (let i = 0; i < outingRows.length; i += 500) {
      const batch = outingRows.slice(i, i + 500);
      const { error: oErr } = await supabase.from("outings").insert(batch);
      if (oErr) console.error("saveOutings batch", oErr);
    }
  }
}
async function fetchIncomes() {
  const { data, error } = await supabase.from("incomes").select("*");
  if (error) {
    console.error("fetchIncomes", error);
    return [];
  }
  return (data || []).map((r) => ({
    id: r.id,
    description: r.description,
    amount: Number(r.amount),
    date: r.date,
    category: r.category || void 0,
    target: r.target || void 0,
    recognized: r.recognized,
    recognizedDate: r.recognized_date || void 0,
    auto: r.auto || false,
    fundraiser: r.fundraiser || void 0
  }));
}
async function saveIncomesToDb(incomes) {
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
    fundraiser: i.fundraiser || null
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("incomes").insert(rows.slice(i, i + 500));
    if (error) console.error("saveIncomes", error);
  }
}
async function fetchExpenses() {
  const { data, error } = await supabase.from("expenses").select("*");
  if (error) {
    console.error("fetchExpenses", error);
    return [];
  }
  return (data || []).map((r) => ({
    id: r.id,
    amount: Number(r.amount),
    date: r.date,
    category: r.category,
    subCategory: r.sub_category,
    notes: r.notes,
    contactPerson: r.contact_person,
    recognized: r.recognized,
    recognizedDate: r.recognized_date || void 0,
    auto: r.auto || false
  }));
}
async function saveExpensesToDb(expenses) {
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
    auto: e.auto || false
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("expenses").insert(rows.slice(i, i + 500));
    if (error) console.error("saveExpenses", error);
  }
}
async function fetchDebts() {
  const { data, error } = await supabase.from("debts").select("*");
  if (error) {
    console.error("fetchDebts", error);
    return [];
  }
  return (data || []).map((r) => ({
    id: r.id,
    date: r.date,
    name: r.name,
    amount: Number(r.amount),
    notes: r.notes,
    returned: r.returned,
    returnedAmount: r.returned_amount != null ? Number(r.returned_amount) : void 0,
    returnedVia: r.returned_via || void 0,
    returnedDate: r.returned_date || void 0
  }));
}
async function saveDebtsToDb(debts) {
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
    returned_date: d.returnedDate || null
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("debts").insert(rows.slice(i, i + 500));
    if (error) console.error("saveDebts", error);
  }
}
async function fetchAskanimIncomes() {
  const { data, error } = await supabase.from("askanim_incomes").select("*");
  if (error) {
    console.error("fetchAskanimIncomes", error);
    return [];
  }
  return (data || []).map((r) => ({
    id: r.id,
    bachurId: r.bachur_id,
    bachurName: r.bachur_name,
    date: r.date,
    amount: Number(r.amount),
    notes: r.notes
  }));
}
async function saveAskanimIncomesToDb(incomes) {
  await supabase.from("askanim_incomes").delete().neq("id", "___never___");
  if (incomes.length === 0) return;
  const rows = incomes.map((i) => ({
    id: i.id,
    bachur_id: i.bachurId,
    bachur_name: i.bachurName,
    date: i.date,
    amount: i.amount,
    notes: i.notes
  }));
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from("askanim_incomes").insert(rows.slice(i, i + 500));
    if (error) console.error("saveAskanimIncomes", error);
  }
}
async function fetchBasketProducts() {
  const { data, error } = await supabase.from("basket_products").select("*");
  if (error) {
    console.error("fetchBasketProducts", error);
    return [];
  }
  return (data || []).map((r) => ({
    id: r.id,
    name: r.name,
    cost: Number(r.cost)
  }));
}
async function saveBasketProductsToDb(products) {
  await supabase.from("basket_products").delete().neq("id", "___never___");
  if (products.length === 0) return;
  const rows = products.map((p) => ({ id: p.id, name: p.name, cost: p.cost }));
  const { error } = await supabase.from("basket_products").insert(rows);
  if (error) console.error("saveBasketProducts", error);
}
async function fetchGlobalSettings() {
  const defaults = {
    basketCost: 6e3,
    basketCostHistory: [],
    minimumForBasket: 5e3,
    lastClassUpgrade: null,
    classUpgradeHistory: []
  };
  const { data, error } = await supabase.from("global_settings").select("*");
  if (error || !data || data.length === 0) return defaults;
  const map = new Map(data.map((r) => [r.key, r.value]));
  return {
    basketCost: map.get("basketCost") ?? defaults.basketCost,
    basketCostHistory: map.get("basketCostHistory") ?? defaults.basketCostHistory,
    minimumForBasket: map.get("minimumForBasket") ?? defaults.minimumForBasket,
    lastClassUpgrade: map.get("lastClassUpgrade") ?? defaults.lastClassUpgrade,
    classUpgradeHistory: map.get("classUpgradeHistory") ?? defaults.classUpgradeHistory
  };
}
async function saveGlobalSettingsToDb(settings) {
  const entries = [
    { key: "basketCost", value: settings.basketCost },
    { key: "basketCostHistory", value: settings.basketCostHistory },
    { key: "minimumForBasket", value: settings.minimumForBasket },
    { key: "lastClassUpgrade", value: settings.lastClassUpgrade },
    { key: "classUpgradeHistory", value: settings.classUpgradeHistory }
  ];
  for (const entry of entries) {
    await supabase.from("global_settings").upsert(
      { key: entry.key, value: entry.value, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
      { onConflict: "key" }
    );
  }
}
async function fetchFundraisers() {
  const { data, error } = await supabase.from("fundraisers").select("*");
  if (error || !data || data.length === 0) {
    return ["שמואל זאב נוטביץ", "יענקי הלר", "עסקנים", "שונות"];
  }
  return data.map((r) => r.name);
}
async function saveFundraisersToDb(names) {
  await supabase.from("fundraisers").delete().neq("id", "___never___");
  if (names.length === 0) return;
  const rows = names.map((n) => ({ id: crypto.randomUUID(), name: n }));
  const { error } = await supabase.from("fundraisers").insert(rows);
  if (error) console.error("saveFundraisers", error);
}
async function fetchExpenseCategories() {
  const { data, error } = await supabase.from("expense_categories").select("*");
  if (error || !data || data.length === 0) {
    return {
      salim: ["גור", "דקל", 'חכ"ם', "אוצרות ההלבשה", "אותיות", "פרוכטר", "גפנרס", "שונות"],
      amuta: ["משרד", "פרויקט עסקנים", "משכורת", "פעילות", "טלמרקטינג", "שונות"]
    };
  }
  return {
    salim: data.filter((r) => r.type === "salim").map((r) => r.name),
    amuta: data.filter((r) => r.type === "amuta").map((r) => r.name)
  };
}
async function saveExpenseCategoriesToDb(salim, amuta) {
  await supabase.from("expense_categories").delete().neq("id", "___never___");
  const rows = [
    ...salim.map((n) => ({ id: crypto.randomUUID(), type: "salim", name: n })),
    ...amuta.map((n) => ({ id: crypto.randomUUID(), type: "amuta", name: n }))
  ];
  if (rows.length === 0) return;
  const { error } = await supabase.from("expense_categories").insert(rows);
  if (error) console.error("saveExpenseCategories", error);
}
async function addActivityLog(actionType, details, amount) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("activity_log").insert({
    user_id: user?.id ?? null,
    user_email: user?.email ?? null,
    action_type: actionType,
    details,
    amount: amount ?? null
  });
  if (error) console.error("addActivityLog", error);
}
async function fetchActivityLog() {
  const { data, error } = await supabase.from("activity_log").select("id, user_email, action_type, details, amount, created_at").order("created_at", { ascending: false }).limit(500);
  if (error) {
    console.error("fetchActivityLog", error);
    return [];
  }
  return data ?? [];
}
const defaultSettings = {
  basketCost: 6e3,
  basketCostHistory: [],
  minimumForBasket: 5e3,
  lastClassUpgrade: null,
  classUpgradeHistory: []
};
const DataContext = createContext(null);
function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
function DataProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [bachurim, _setBachurim] = useState([]);
  const [incomes, _setIncomes] = useState([]);
  const [expenses, _setExpenses] = useState([]);
  const [debts, _setDebts] = useState([]);
  const [askanimIncomes, _setAskanimIncomes] = useState([]);
  const [basketProducts, _setBasketProducts] = useState([]);
  const [globalSettings, _setGlobalSettings] = useState(defaultSettings);
  const [fundraisers, _setFundraisers] = useState([]);
  const [catsSalim, _setCatsSalim] = useState([]);
  const [catsAmuta, _setCatsAmuta] = useState([]);
  const loadAll = useCallback(async () => {
    try {
      const [b, i, e, d, ai, bp, gs, fr, cats] = await Promise.all([
        fetchBachurim(),
        fetchIncomes(),
        fetchExpenses(),
        fetchDebts(),
        fetchAskanimIncomes(),
        fetchBasketProducts(),
        fetchGlobalSettings(),
        fetchFundraisers(),
        fetchExpenseCategories()
      ]);
      _setBachurim(b);
      _setIncomes(i);
      _setExpenses(e);
      _setDebts(d);
      _setAskanimIncomes(ai);
      _setBasketProducts(bp);
      _setGlobalSettings(gs);
      _setFundraisers(fr);
      _setCatsSalim(cats.salim);
      _setCatsAmuta(cats.amuta);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAll();
  }, [loadAll]);
  useEffect(() => {
    const SYNCED = /* @__PURE__ */ new Set([
      "bachurim",
      "incomes",
      "expenses",
      "debts",
      "askanimIncomes",
      "basketProducts",
      "globalSettings",
      "fundraisers",
      "expense_cats_salim",
      "expense_cats_amuta"
    ]);
    let timer = null;
    const onStorage = (e) => {
      if (!e.key || !SYNCED.has(e.key)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        loadAll();
      }, 150);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      if (timer) clearTimeout(timer);
    };
  }, [loadAll]);
  const setBachurim = useCallback((data) => {
    _setBachurim(data);
    saveBachurimToDb(data).catch(console.error);
  }, []);
  const setIncomes = useCallback((data) => {
    _setIncomes(data);
    saveIncomesToDb(data).catch(console.error);
  }, []);
  const setExpenses = useCallback((data) => {
    _setExpenses(data);
    saveExpensesToDb(data).catch(console.error);
  }, []);
  const setDebts = useCallback((data) => {
    _setDebts(data);
    saveDebtsToDb(data).catch(console.error);
  }, []);
  const setAskanimIncomes = useCallback((data) => {
    _setAskanimIncomes(data);
    saveAskanimIncomesToDb(data).catch(console.error);
  }, []);
  const setBasketProducts = useCallback((data) => {
    _setBasketProducts(data);
    saveBasketProductsToDb(data).catch(console.error);
  }, []);
  const setGlobalSettings = useCallback((data) => {
    _setGlobalSettings(data);
    saveGlobalSettingsToDb(data).catch(console.error);
  }, []);
  const setFundraisers = useCallback((data) => {
    _setFundraisers(data);
    saveFundraisersToDb(data).catch(console.error);
  }, []);
  const setExpenseCategories = useCallback((salim, amuta) => {
    _setCatsSalim(salim);
    _setCatsAmuta(amuta);
    saveExpenseCategoriesToDb(salim, amuta).catch(console.error);
  }, []);
  const resetAll = useCallback(async () => {
    _setBachurim([]);
    _setIncomes([]);
    _setExpenses([]);
    _setDebts([]);
    _setAskanimIncomes([]);
    _setBasketProducts([]);
    _setGlobalSettings(defaultSettings);
    _setFundraisers([]);
    _setCatsSalim([]);
    _setCatsAmuta([]);
    await Promise.all([
      saveBachurimToDb([]),
      saveIncomesToDb([]),
      saveExpensesToDb([]),
      saveDebtsToDb([]),
      saveAskanimIncomesToDb([]),
      saveBasketProductsToDb([]),
      saveGlobalSettingsToDb(defaultSettings),
      saveFundraisersToDb([]),
      saveExpenseCategoriesToDb([], [])
    ]);
  }, []);
  return /* @__PURE__ */ jsx(
    DataContext.Provider,
    {
      value: {
        loading,
        bachurim,
        incomes,
        expenses,
        debts,
        askanimIncomes,
        basketProducts,
        globalSettings,
        fundraisers,
        expenseCategoriesSalim: catsSalim,
        expenseCategoriesAmuta: catsAmuta,
        setBachurim,
        setIncomes,
        setExpenses,
        setDebts,
        setAskanimIncomes,
        setBasketProducts,
        setGlobalSettings,
        setFundraisers,
        setExpenseCategories,
        refresh: loadAll,
        resetAll
      },
      children
    }
  );
}
const appCss = "/assets/styles-BpiFGRjW.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
const Route$9 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Joyful Vessels is a Hebrew-language management app for a non-profit organization." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Joyful Vessels is a Hebrew-language management app for a non-profit organization." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      { name: "twitter:description", content: "Joyful Vessels is a Hebrew-language management app for a non-profit organization." }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "he", dir: "rtl", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(DataProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }) });
}
const $$splitComponentImporter = () => import("./index-B4FKZ30R.js");
const Route$8 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  head: () => ({
    meta: [{
      title: "קול מצהלות חתנים – מערכת ניהול עמותה"
    }, {
      name: "description",
      content: "מערכת ניהול לעמותת קול מצהלות חתנים – ניהול בחורים, הכנסות, הוצאות ודוחות"
    }]
  })
});
function redactEmail$2(email) {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}
const Route$7 = createFileRoute("/email/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const supabaseUrl = "https://vggltzctdheulyunfjzn.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        if (!token) {
          return Response.json({ error: "Token is required" }, { status: 400 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: tokenRecord, error: lookupError } = await supabase2.from("email_unsubscribe_tokens").select("*").eq("token", token).maybeSingle();
        if (lookupError || !tokenRecord) {
          return Response.json({ error: "Invalid or expired token" }, { status: 404 });
        }
        if (tokenRecord.used_at) {
          return Response.json({ valid: false, reason: "already_unsubscribed" });
        }
        return Response.json({ valid: true });
      },
      POST: async ({ request }) => {
        const supabaseUrl = "https://vggltzctdheulyunfjzn.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        const url = new URL(request.url);
        let token = url.searchParams.get("token");
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("application/x-www-form-urlencoded")) {
          const formText = await request.text();
          const params = new URLSearchParams(formText);
          if (!params.get("List-Unsubscribe")) {
            const formToken = params.get("token");
            if (formToken) {
              token = formToken;
            }
          }
        } else {
          try {
            const body = await request.json();
            if (body.token) {
              token = body.token;
            }
          } catch {
          }
        }
        if (!token) {
          return Response.json({ error: "Token is required" }, { status: 400 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: tokenRecord, error: lookupError } = await supabase2.from("email_unsubscribe_tokens").select("*").eq("token", token).maybeSingle();
        if (lookupError || !tokenRecord) {
          return Response.json({ error: "Invalid or expired token" }, { status: 404 });
        }
        if (tokenRecord.used_at) {
          return Response.json({ success: false, reason: "already_unsubscribed" });
        }
        const { data: updated, error: updateError } = await supabase2.from("email_unsubscribe_tokens").update({ used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("token", token).is("used_at", null).select().maybeSingle();
        if (updateError) {
          console.error("Failed to mark token as used", { error: updateError, token });
          return Response.json({ error: "Failed to process unsubscribe" }, { status: 500 });
        }
        if (!updated) {
          return Response.json({ success: false, reason: "already_unsubscribed" });
        }
        const { error: suppressError } = await supabase2.from("suppressed_emails").upsert(
          { email: tokenRecord.email.toLowerCase(), reason: "unsubscribe" },
          { onConflict: "email" }
        );
        if (suppressError) {
          console.error("Failed to suppress email", {
            error: suppressError,
            email_redacted: redactEmail$2(tokenRecord.email)
          });
          return Response.json({ error: "Failed to process unsubscribe" }, { status: 500 });
        }
        console.log("Email unsubscribed", {
          email_redacted: redactEmail$2(tokenRecord.email)
        });
        return Response.json({ success: true });
      }
    }
  }
});
function parseSuppressionPayload(body) {
  const parsed = JSON.parse(body);
  if (!parsed.data) {
    throw new Error("Missing data field in payload");
  }
  const data = parsed.data;
  if (!data.email || !data.reason) {
    throw new Error("Missing required fields: email, reason");
  }
  return data;
}
function mapReasonToStatus(reason) {
  switch (reason) {
    case "bounce":
      return "bounced";
    case "complaint":
      return "complained";
    default:
      return "suppressed";
  }
}
function mapReasonToMessage(reason) {
  switch (reason) {
    case "bounce":
      return "Permanent bounce — email address is invalid or rejected";
    case "complaint":
      return "Spam complaint — recipient marked email as spam";
    case "unsubscribe":
      return "Recipient unsubscribed";
    default:
      return "Email suppressed";
  }
}
const Route$6 = createFileRoute("/lovable/email/suppression")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        const supabaseUrl = "https://vggltzctdheulyunfjzn.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        let payload;
        try {
          const verified = await verifyWebhookRequest({
            req: request,
            secret: apiKey,
            parser: parseSuppressionPayload
          });
          payload = verified.payload;
        } catch (error) {
          if (error instanceof WebhookError) {
            switch (error.code) {
              case "invalid_signature":
                console.error("Invalid webhook signature");
                return Response.json({ error: "Invalid signature" }, { status: 401 });
              case "stale_timestamp":
                console.error("Stale webhook timestamp");
                return Response.json({ error: "Stale timestamp" }, { status: 401 });
              case "invalid_payload":
              case "invalid_json":
                console.error("Invalid payload", { code: error.code });
                return Response.json({ error: "Invalid payload" }, { status: 400 });
              default:
                console.error("Webhook verification failed", {
                  code: error.code,
                  message: error.message
                });
                return Response.json({ error: "Verification failed" }, { status: 401 });
            }
          }
          console.error("Unexpected error during verification", { error });
          return Response.json({ error: "Internal error" }, { status: 500 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const normalizedEmail = payload.email.toLowerCase();
        const { error: suppressError } = await supabase2.from("suppressed_emails").upsert(
          {
            email: normalizedEmail,
            reason: payload.reason,
            metadata: payload.metadata ?? null
          },
          { onConflict: "email" }
        );
        if (suppressError) {
          console.error("Failed to upsert suppressed email", {
            error: suppressError,
            email_redacted: normalizedEmail[0] + "***@" + normalizedEmail.split("@")[1]
          });
          return Response.json({ error: "Failed to write suppression" }, { status: 500 });
        }
        const sendLogStatus = mapReasonToStatus(payload.reason);
        const sendLogMessage = mapReasonToMessage(payload.reason);
        const { error: insertError } = await supabase2.from("email_send_log").insert({
          message_id: payload.message_id ?? null,
          template_name: "system",
          recipient_email: normalizedEmail,
          status: sendLogStatus,
          error_message: sendLogMessage,
          metadata: payload.metadata ?? null
        });
        if (insertError) {
          console.warn("Failed to insert email_send_log", {
            error: insertError
          });
        }
        console.log("Suppression processed", {
          email_redacted: normalizedEmail[0] + "***@" + normalizedEmail.split("@")[1],
          reason: payload.reason,
          is_retry: payload.is_retry,
          retry_count: payload.retry_count,
          has_message_id: !!payload.message_id
        });
        return Response.json({ success: true });
      }
    }
  }
});
const SITE_NAME$5 = "קול מצהלות חתנים";
const PasswordResetUserEmail = ({ tempPassword }) => /* @__PURE__ */ jsxs(Html, { lang: "he", dir: "rtl", children: [
  /* @__PURE__ */ jsx(Head, {}),
  /* @__PURE__ */ jsxs(Preview, { children: [
    "סיסמה זמנית למערכת ",
    SITE_NAME$5
  ] }),
  /* @__PURE__ */ jsx(Body, { style: main$7, children: /* @__PURE__ */ jsxs(Container, { style: container$7, children: [
    /* @__PURE__ */ jsxs(Heading, { style: h1$7, children: [
      "סיסמה זמנית למערכת ",
      SITE_NAME$5
    ] }),
    /* @__PURE__ */ jsx(Text, { style: text$7, children: "קיבלנו בקשה לאיפוס הסיסמה שלך. הסיסמה הזמנית שלך:" }),
    /* @__PURE__ */ jsx(Section, { style: codeBox, children: /* @__PURE__ */ jsx(Text, { style: code, children: tempPassword ?? "------" }) }),
    /* @__PURE__ */ jsx(Text, { style: text$7, children: "היכנס למערכת עם הסיסמה הזמנית, ולאחר מכן תוכל לשנות אותה לסיסמה חדשה דרך תפריט הפרופיל." }),
    /* @__PURE__ */ jsx(Text, { style: footer$6, children: "אם לא ביקשת לאפס את הסיסמה — פנה למנהל המערכת מיד." })
  ] }) })
] });
const template$1 = {
  component: PasswordResetUserEmail,
  subject: `סיסמה זמנית למערכת ${SITE_NAME$5}`,
  displayName: "Password reset (user)",
  previewData: { tempPassword: "Abc123XyZ789" }
};
const main$7 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$7 = { padding: "24px", maxWidth: "560px", margin: "0 auto" };
const h1$7 = { fontSize: "22px", fontWeight: "bold", color: "#111111", margin: "0 0 20px" };
const text$7 = { fontSize: "14px", color: "#444444", lineHeight: "1.6", margin: "0 0 16px" };
const codeBox = { background: "#f3f4f6", borderRadius: "8px", padding: "14px 18px", textAlign: "center", margin: "20px 0" };
const code = { fontFamily: "monospace", fontSize: "22px", fontWeight: "bold", letterSpacing: "2px", color: "#111111", margin: 0, direction: "ltr" };
const footer$6 = { fontSize: "12px", color: "#888888", margin: "24px 0 0" };
const SITE_NAME$4 = "קול מצהלות חתנים";
const PasswordResetAdminEmail = ({ userEmail, tempPassword, requestedAt }) => /* @__PURE__ */ jsxs(Html, { lang: "he", dir: "rtl", children: [
  /* @__PURE__ */ jsx(Head, {}),
  /* @__PURE__ */ jsxs(Preview, { children: [
    "בקשת איפוס סיסמה: ",
    userEmail ?? ""
  ] }),
  /* @__PURE__ */ jsx(Body, { style: main$6, children: /* @__PURE__ */ jsxs(Container, { style: container$6, children: [
    /* @__PURE__ */ jsx(Heading, { style: h1$6, children: "בקשת איפוס סיסמה" }),
    /* @__PURE__ */ jsxs(Text, { style: text$6, children: [
      "המשתמש הבא ביקש לאפס את הסיסמה שלו במערכת ",
      SITE_NAME$4,
      ":"
    ] }),
    /* @__PURE__ */ jsxs(Section, { style: row, children: [
      /* @__PURE__ */ jsx(Text, { style: label, children: "מייל:" }),
      /* @__PURE__ */ jsx(Text, { style: value, children: userEmail ?? "" })
    ] }),
    /* @__PURE__ */ jsxs(Section, { style: row, children: [
      /* @__PURE__ */ jsx(Text, { style: label, children: "תאריך:" }),
      /* @__PURE__ */ jsx(Text, { style: value, children: requestedAt ?? "" })
    ] }),
    /* @__PURE__ */ jsxs(Section, { style: row, children: [
      /* @__PURE__ */ jsx(Text, { style: label, children: "סיסמה זמנית:" }),
      /* @__PURE__ */ jsx(Text, { style: codeValue, children: tempPassword ?? "" })
    ] }),
    /* @__PURE__ */ jsx(Text, { style: text$6, children: "הסיסמה הישנה כבר לא תקפה. הסיסמה הזמנית פעילה עד שהמשתמש או המנהל יחליפו אותה." })
  ] }) })
] });
const template = {
  component: PasswordResetAdminEmail,
  subject: (d) => `בקשת איפוס סיסמה: ${d.userEmail ?? ""}`,
  displayName: "Password reset (admin)",
  previewData: { userEmail: "user@example.com", tempPassword: "Abc123XyZ789", requestedAt: (/* @__PURE__ */ new Date()).toLocaleString("he-IL") }
};
const main$6 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$6 = { padding: "24px", maxWidth: "560px", margin: "0 auto" };
const h1$6 = { fontSize: "22px", fontWeight: "bold", color: "#111111", margin: "0 0 20px" };
const text$6 = { fontSize: "14px", color: "#444444", lineHeight: "1.6", margin: "0 0 16px" };
const row = { borderBottom: "1px solid #eee", padding: "8px 0", margin: 0 };
const label = { display: "inline", fontSize: "14px", fontWeight: "bold", color: "#111111", margin: 0 };
const value = { display: "inline", fontSize: "14px", color: "#444444", margin: "0 0 0 8px", direction: "ltr" };
const codeValue = { display: "inline", fontFamily: "monospace", fontSize: "16px", fontWeight: "bold", color: "#111111", margin: "0 0 0 8px", direction: "ltr" };
const TEMPLATES = {
  "password-reset-user": template$1,
  "password-reset-admin": template
};
const SITE_NAME$3 = "קול מצהלות חתנים";
const SENDER_DOMAIN$2 = "notify.asher-weinberger.com";
const FROM_DOMAIN$2 = "notify.asher-weinberger.com";
const ADMIN_EMAIL = "aw169729@gmail.com";
function genPassword(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}
async function enqueueTemplateEmail(params) {
  const { supabase: supabase2, templateName, to, data } = params;
  const entry = TEMPLATES[templateName];
  if (!entry) throw new Error(`Template not found: ${templateName}`);
  const element = React.createElement(entry.component, data);
  const html = await render(element);
  const text2 = await render(element, { plainText: true });
  const subject = typeof entry.subject === "function" ? entry.subject(data) : entry.subject;
  const messageId = crypto.randomUUID();
  await supabase2.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: to,
    status: "pending"
  });
  const { error } = await supabase2.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: `${SITE_NAME$3} <noreply@${FROM_DOMAIN$2}>`,
      sender_domain: SENDER_DOMAIN$2,
      subject,
      html,
      text: text2,
      purpose: "transactional",
      label: templateName,
      idempotency_key: messageId,
      queued_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  if (error) throw new Error(`enqueue failed: ${error.message}`);
}
const Route$5 = createFileRoute("/api/public/request-password-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = "https://vggltzctdheulyunfjzn.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ ok: false, error: "שגיאה פנימית" }, { status: 500 });
        }
        let email;
        try {
          const body = await request.json();
          email = String(body.email ?? "").trim();
        } catch {
          return Response.json({ ok: false, error: "בקשה לא תקינה" }, { status: 400 });
        }
        if (!email) {
          return Response.json({ ok: false, error: "מייל חסר" }, { status: 400 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: profile, error: pErr } = await supabase2.from("profiles").select("id, status, email").ilike("email", email).maybeSingle();
        if (pErr) {
          console.error("profile lookup failed", pErr);
          return Response.json({ ok: false, error: "שגיאה פנימית" }, { status: 500 });
        }
        if (!profile) {
          return Response.json({ ok: false, error: "מייל זה לא נמצא במערכת." });
        }
        if (profile.status !== "approved") {
          return Response.json({ ok: false, error: "החשבון אינו פעיל. פנה למנהל." });
        }
        const tempPassword = genPassword(12);
        const { error: upErr } = await supabase2.auth.admin.updateUserById(
          profile.id,
          { password: tempPassword }
        );
        if (upErr) {
          console.error("updateUserById failed", upErr);
          return Response.json({ ok: false, error: "שגיאה באיפוס הסיסמה" }, { status: 500 });
        }
        const userEmail = profile.email;
        const requestedAt = (/* @__PURE__ */ new Date()).toLocaleString("he-IL");
        try {
          await enqueueTemplateEmail({
            supabase: supabase2,
            templateName: "password-reset-user",
            to: userEmail,
            data: { tempPassword }
          });
          await enqueueTemplateEmail({
            supabase: supabase2,
            templateName: "password-reset-admin",
            to: ADMIN_EMAIL,
            data: { userEmail, tempPassword, requestedAt }
          });
        } catch (e) {
          console.error("Failed to enqueue password reset emails", e);
          return Response.json(
            { ok: false, error: "שליחת המייל נכשלה." },
            { status: 500 }
          );
        }
        return Response.json({ ok: true });
      }
    }
  }
});
const SITE_NAME$2 = "kol-mitzalot-chatanim";
const SENDER_DOMAIN$1 = "notify.asher-weinberger.com";
const FROM_DOMAIN$1 = "notify.asher-weinberger.com";
function redactEmail$1(email) {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const Route$4 = createFileRoute("/lovable/email/transactional/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = "https://vggltzctdheulyunfjzn.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user }, error: authError } = await supabase2.auth.getUser(token);
        if (authError || !user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        let templateName;
        let recipientEmail;
        let idempotencyKey;
        let messageId;
        let templateData = {};
        try {
          const body = await request.json();
          templateName = body.templateName || body.template_name;
          recipientEmail = body.recipientEmail || body.recipient_email;
          messageId = crypto.randomUUID();
          idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId;
          if (body.templateData && typeof body.templateData === "object") {
            templateData = body.templateData;
          }
        } catch {
          return Response.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
          );
        }
        if (!templateName) {
          return Response.json(
            { error: "templateName is required" },
            { status: 400 }
          );
        }
        const template2 = TEMPLATES[templateName];
        if (!template2) {
          console.error("Template not found in registry", { templateName });
          return Response.json(
            {
              error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`
            },
            { status: 404 }
          );
        }
        const effectiveRecipient = template2.to || recipientEmail;
        if (!effectiveRecipient) {
          return Response.json(
            {
              error: "recipientEmail is required (unless the template defines a fixed recipient)"
            },
            { status: 400 }
          );
        }
        const { data: suppressed, error: suppressionError } = await supabase2.from("suppressed_emails").select("id").eq("email", effectiveRecipient.toLowerCase()).maybeSingle();
        if (suppressionError) {
          console.error("Suppression check failed — refusing to send", {
            error: suppressionError,
            recipient_redacted: redactEmail$1(effectiveRecipient)
          });
          return Response.json(
            { error: "Failed to verify suppression status" },
            { status: 500 }
          );
        }
        if (suppressed) {
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "suppressed"
          });
          console.log("Email suppressed", {
            templateName,
            recipient_redacted: redactEmail$1(effectiveRecipient)
          });
          return Response.json({ success: false, reason: "email_suppressed" });
        }
        const normalizedEmail = effectiveRecipient.toLowerCase();
        let unsubscribeToken;
        const { data: existingToken, error: tokenLookupError } = await supabase2.from("email_unsubscribe_tokens").select("token, used_at").eq("email", normalizedEmail).maybeSingle();
        if (tokenLookupError) {
          console.error("Token lookup failed", {
            error: tokenLookupError,
            email_redacted: redactEmail$1(normalizedEmail)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "failed",
            error_message: "Failed to look up unsubscribe token"
          });
          return Response.json(
            { error: "Failed to prepare email" },
            { status: 500 }
          );
        }
        if (existingToken && !existingToken.used_at) {
          unsubscribeToken = existingToken.token;
        } else if (!existingToken) {
          unsubscribeToken = generateToken();
          const { error: tokenError } = await supabase2.from("email_unsubscribe_tokens").upsert(
            { token: unsubscribeToken, email: normalizedEmail },
            { onConflict: "email", ignoreDuplicates: true }
          );
          if (tokenError) {
            console.error("Failed to create unsubscribe token", {
              error: tokenError
            });
            await supabase2.from("email_send_log").insert({
              message_id: messageId,
              template_name: templateName,
              recipient_email: effectiveRecipient,
              status: "failed",
              error_message: "Failed to create unsubscribe token"
            });
            return Response.json(
              { error: "Failed to prepare email" },
              { status: 500 }
            );
          }
          const { data: storedToken, error: reReadError } = await supabase2.from("email_unsubscribe_tokens").select("token").eq("email", normalizedEmail).maybeSingle();
          if (reReadError || !storedToken) {
            console.error("Failed to read back unsubscribe token after upsert", {
              error: reReadError,
              email_redacted: redactEmail$1(normalizedEmail)
            });
            await supabase2.from("email_send_log").insert({
              message_id: messageId,
              template_name: templateName,
              recipient_email: effectiveRecipient,
              status: "failed",
              error_message: "Failed to confirm unsubscribe token storage"
            });
            return Response.json(
              { error: "Failed to prepare email" },
              { status: 500 }
            );
          }
          unsubscribeToken = storedToken.token;
        } else {
          console.warn("Unsubscribe token already used but email not suppressed", {
            email_redacted: redactEmail$1(normalizedEmail)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "suppressed",
            error_message: "Unsubscribe token used but email missing from suppressed list"
          });
          return Response.json({ success: false, reason: "email_suppressed" });
        }
        const element = React.createElement(template2.component, templateData);
        const html = await render(element);
        const plainText = await render(element, { plainText: true });
        const resolvedSubject = typeof template2.subject === "function" ? template2.subject(templateData) : template2.subject;
        await supabase2.from("email_send_log").insert({
          message_id: messageId,
          template_name: templateName,
          recipient_email: effectiveRecipient,
          status: "pending"
        });
        const { error: enqueueError } = await supabase2.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: effectiveRecipient,
            from: `${SITE_NAME$2} <noreply@${FROM_DOMAIN$1}>`,
            sender_domain: SENDER_DOMAIN$1,
            subject: resolvedSubject,
            html,
            text: plainText,
            purpose: "transactional",
            label: templateName,
            idempotency_key: idempotencyKey,
            unsubscribe_token: unsubscribeToken,
            queued_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
        if (enqueueError) {
          console.error("Failed to enqueue email", {
            error: enqueueError,
            templateName,
            recipient_redacted: redactEmail$1(effectiveRecipient)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "failed",
            error_message: "Failed to enqueue email"
          });
          return Response.json(
            { error: "Failed to enqueue email" },
            { status: 500 }
          );
        }
        console.log("Transactional email enqueued", {
          templateName,
          recipient_redacted: redactEmail$1(effectiveRecipient)
        });
        return Response.json({ success: true, queued: true });
      }
    }
  }
});
const Route$3 = createFileRoute("/lovable/email/transactional/preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace(/^Bearer\s+/i, "");
        if (token !== apiKey) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const templateNames = Object.keys(TEMPLATES);
        const results = [];
        for (const name of templateNames) {
          const entry = TEMPLATES[name];
          const displayName = entry.displayName || name;
          if (!entry.previewData) {
            results.push({
              templateName: name,
              displayName,
              subject: "",
              html: "",
              status: "preview_data_required"
            });
            continue;
          }
          try {
            const html = await render(
              React.createElement(entry.component, entry.previewData)
            );
            const resolvedSubject = typeof entry.subject === "function" ? entry.subject(entry.previewData) : entry.subject;
            results.push({
              templateName: name,
              displayName,
              subject: resolvedSubject,
              html,
              status: "ready"
            });
          } catch (err) {
            console.error("Failed to render template for preview", {
              template: name,
              error: err
            });
            results.push({
              templateName: name,
              displayName,
              subject: "",
              html: "",
              status: "render_failed",
              errorMessage: err instanceof Error ? err.message : String(err)
            });
          }
        }
        return Response.json({ templates: results });
      }
    }
  }
});
const MAX_RETRIES = 5;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_SEND_DELAY_MS = 200;
const DEFAULT_AUTH_TTL_MINUTES = 15;
const DEFAULT_TRANSACTIONAL_TTL_MINUTES = 60;
function isRateLimited(error) {
  if (error && typeof error === "object" && "status" in error) {
    return error.status === 429;
  }
  return error instanceof Error && error.message.includes("429");
}
function isForbidden(error) {
  if (error && typeof error === "object" && "status" in error) {
    return error.status === 403;
  }
  return error instanceof Error && error.message.includes("403");
}
function getRetryAfterSeconds(error) {
  if (error && typeof error === "object" && "retryAfterSeconds" in error) {
    return error.retryAfterSeconds ?? 60;
  }
  return 60;
}
async function moveToDlq(supabase2, queue, msg, reason) {
  const payload = msg.message;
  await supabase2.from("email_send_log").insert({
    message_id: payload.message_id,
    template_name: payload.label || queue,
    recipient_email: payload.to,
    status: "dlq",
    error_message: reason
  });
  const { error } = await supabase2.rpc("move_to_dlq", {
    source_queue: queue,
    dlq_name: `${queue}_dlq`,
    message_id: msg.msg_id,
    payload
  });
  if (error) {
    console.error("Failed to move message to DLQ", { queue, msg_id: msg.msg_id, reason, error });
  }
}
const Route$2 = createFileRoute("/lovable/email/queue/process")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        const supabaseUrl = "https://vggltzctdheulyunfjzn.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        if (token !== supabaseServiceKey) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: state } = await supabase2.from("email_send_state").select("retry_after_until, batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes").single();
        if (state?.retry_after_until && new Date(state.retry_after_until) > /* @__PURE__ */ new Date()) {
          return Response.json({ skipped: true, reason: "rate_limited" });
        }
        const batchSize = state?.batch_size ?? DEFAULT_BATCH_SIZE;
        const sendDelayMs = state?.send_delay_ms ?? DEFAULT_SEND_DELAY_MS;
        const ttlMinutes = {
          auth_emails: state?.auth_email_ttl_minutes ?? DEFAULT_AUTH_TTL_MINUTES,
          transactional_emails: state?.transactional_email_ttl_minutes ?? DEFAULT_TRANSACTIONAL_TTL_MINUTES
        };
        let totalProcessed = 0;
        for (const queue of ["auth_emails", "transactional_emails"]) {
          const { data: messages, error: readError } = await supabase2.rpc("read_email_batch", {
            queue_name: queue,
            batch_size: batchSize,
            vt: 30
          });
          if (readError) {
            console.error("Failed to read email batch", { queue, error: readError });
            continue;
          }
          if (!messages?.length) continue;
          const messageIds = Array.from(
            new Set(
              messages.map(
                (msg) => msg?.message?.message_id && typeof msg.message.message_id === "string" ? msg.message.message_id : null
              ).filter((id) => Boolean(id))
            )
          );
          const failedAttemptsByMessageId = /* @__PURE__ */ new Map();
          if (messageIds.length > 0) {
            const { data: failedRows, error: failedRowsError } = await supabase2.from("email_send_log").select("message_id").in("message_id", messageIds).eq("status", "failed");
            if (failedRowsError) {
              console.error("Failed to load failed-attempt counters", {
                queue,
                error: failedRowsError
              });
            } else {
              for (const row2 of failedRows ?? []) {
                const messageId = row2?.message_id;
                if (typeof messageId !== "string" || !messageId) continue;
                failedAttemptsByMessageId.set(
                  messageId,
                  (failedAttemptsByMessageId.get(messageId) ?? 0) + 1
                );
              }
            }
          }
          for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const payload = msg.message;
            const failedAttempts = payload?.message_id && typeof payload.message_id === "string" ? failedAttemptsByMessageId.get(payload.message_id) ?? 0 : msg.read_ct ?? 0;
            const queuedAt = payload.queued_at ?? msg.enqueued_at;
            if (queuedAt) {
              const ageMs = Date.now() - new Date(queuedAt).getTime();
              const maxAgeMs = ttlMinutes[queue] * 60 * 1e3;
              if (ageMs > maxAgeMs) {
                console.warn("Email expired (TTL exceeded)", {
                  queue,
                  msg_id: msg.msg_id,
                  queued_at: queuedAt,
                  ttl_minutes: ttlMinutes[queue]
                });
                await moveToDlq(supabase2, queue, msg, `TTL exceeded (${ttlMinutes[queue]} minutes)`);
                continue;
              }
            }
            if (failedAttempts >= MAX_RETRIES) {
              await moveToDlq(supabase2, queue, msg, `Max retries (${MAX_RETRIES}) exceeded (attempted ${failedAttempts} times)`);
              continue;
            }
            if (payload.message_id) {
              const { data: alreadySent } = await supabase2.from("email_send_log").select("id").eq("message_id", payload.message_id).eq("status", "sent").maybeSingle();
              if (alreadySent) {
                console.warn("Skipping duplicate send (already sent)", {
                  queue,
                  msg_id: msg.msg_id,
                  message_id: payload.message_id
                });
                const { error: dupDelError } = await supabase2.rpc("delete_email", {
                  queue_name: queue,
                  message_id: msg.msg_id
                });
                if (dupDelError) {
                  console.error("Failed to delete duplicate message from queue", { queue, msg_id: msg.msg_id, error: dupDelError });
                }
                continue;
              }
            }
            try {
              await sendLovableEmail(
                {
                  run_id: payload.run_id,
                  to: payload.to,
                  from: payload.from,
                  sender_domain: payload.sender_domain,
                  subject: payload.subject,
                  html: payload.html,
                  text: payload.text,
                  purpose: payload.purpose,
                  label: payload.label,
                  idempotency_key: payload.idempotency_key,
                  unsubscribe_token: payload.unsubscribe_token,
                  message_id: payload.message_id
                },
                { apiKey, sendUrl: process.env.LOVABLE_SEND_URL }
              );
              await supabase2.from("email_send_log").insert({
                message_id: payload.message_id,
                template_name: payload.label || queue,
                recipient_email: payload.to,
                status: "sent"
              });
              const { error: delError } = await supabase2.rpc("delete_email", {
                queue_name: queue,
                message_id: msg.msg_id
              });
              if (delError) {
                console.error("Failed to delete sent message from queue", { queue, msg_id: msg.msg_id, error: delError });
              }
              totalProcessed++;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              console.error("Email send failed", {
                queue,
                msg_id: msg.msg_id,
                read_ct: msg.read_ct,
                failed_attempts: failedAttempts,
                error: errorMsg
              });
              if (isRateLimited(error)) {
                await supabase2.from("email_send_log").insert({
                  message_id: payload.message_id,
                  template_name: payload.label || queue,
                  recipient_email: payload.to,
                  status: "failed",
                  error_message: errorMsg.slice(0, 1e3)
                });
                const retryAfterSecs = getRetryAfterSeconds(error);
                await supabase2.from("email_send_state").update({
                  retry_after_until: new Date(
                    Date.now() + retryAfterSecs * 1e3
                  ).toISOString(),
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                }).eq("id", 1);
                return Response.json({ processed: totalProcessed, stopped: "rate_limited" });
              }
              if (isForbidden(error)) {
                await moveToDlq(supabase2, queue, msg, errorMsg.slice(0, 1e3));
                return Response.json({ processed: totalProcessed, stopped: "forbidden" });
              }
              await supabase2.from("email_send_log").insert({
                message_id: payload.message_id,
                template_name: payload.label || queue,
                recipient_email: payload.to,
                status: "failed",
                error_message: errorMsg.slice(0, 1e3)
              });
              if (payload?.message_id && typeof payload.message_id === "string") {
                failedAttemptsByMessageId.set(payload.message_id, failedAttempts + 1);
              }
            }
            if (i < messages.length - 1) {
              await new Promise((r) => setTimeout(r, sendDelayMs));
            }
          }
        }
        return Response.json({ processed: totalProcessed });
      }
    }
  }
});
const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl
}) => /* @__PURE__ */ jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsx(Head, {}),
  /* @__PURE__ */ jsxs(Preview, { children: [
    "Confirm your email for ",
    siteName
  ] }),
  /* @__PURE__ */ jsx(Body, { style: main$5, children: /* @__PURE__ */ jsxs(Container, { style: container$5, children: [
    /* @__PURE__ */ jsx(Heading, { style: h1$5, children: "Confirm your email" }),
    /* @__PURE__ */ jsxs(Text, { style: text$5, children: [
      "Thanks for signing up for",
      " ",
      /* @__PURE__ */ jsx(Link$1, { href: siteUrl, style: link$2, children: /* @__PURE__ */ jsx("strong", { children: siteName }) }),
      "!"
    ] }),
    /* @__PURE__ */ jsxs(Text, { style: text$5, children: [
      "Please confirm your email address (",
      /* @__PURE__ */ jsx(Link$1, { href: `mailto:${recipient}`, style: link$2, children: recipient }),
      ") by clicking the button below:"
    ] }),
    /* @__PURE__ */ jsx(Button, { style: button$4, href: confirmationUrl, children: "Verify Email" }),
    /* @__PURE__ */ jsx(Text, { style: footer$5, children: "If you didn't create an account, you can safely ignore this email." })
  ] }) })
] });
const main$5 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$5 = { padding: "20px 25px" };
const h1$5 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$5 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const link$2 = { color: "inherit", textDecoration: "underline" };
const button$4 = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$5 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl
}) => /* @__PURE__ */ jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsx(Head, {}),
  /* @__PURE__ */ jsxs(Preview, { children: [
    "You've been invited to join ",
    siteName
  ] }),
  /* @__PURE__ */ jsx(Body, { style: main$4, children: /* @__PURE__ */ jsxs(Container, { style: container$4, children: [
    /* @__PURE__ */ jsx(Heading, { style: h1$4, children: "You've been invited" }),
    /* @__PURE__ */ jsxs(Text, { style: text$4, children: [
      "You've been invited to join",
      " ",
      /* @__PURE__ */ jsx(Link$1, { href: siteUrl, style: link$1, children: /* @__PURE__ */ jsx("strong", { children: siteName }) }),
      ". Click the button below to accept the invitation and create your account."
    ] }),
    /* @__PURE__ */ jsx(Button, { style: button$3, href: confirmationUrl, children: "Accept Invitation" }),
    /* @__PURE__ */ jsx(Text, { style: footer$4, children: "If you weren't expecting this invitation, you can safely ignore this email." })
  ] }) })
] });
const main$4 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$4 = { padding: "20px 25px" };
const h1$4 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$4 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const link$1 = { color: "inherit", textDecoration: "underline" };
const button$3 = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$4 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const MagicLinkEmail = ({
  siteName,
  confirmationUrl
}) => /* @__PURE__ */ jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsx(Head, {}),
  /* @__PURE__ */ jsxs(Preview, { children: [
    "Your login link for ",
    siteName
  ] }),
  /* @__PURE__ */ jsx(Body, { style: main$3, children: /* @__PURE__ */ jsxs(Container, { style: container$3, children: [
    /* @__PURE__ */ jsx(Heading, { style: h1$3, children: "Your login link" }),
    /* @__PURE__ */ jsxs(Text, { style: text$3, children: [
      "Click the button below to log in to ",
      siteName,
      ". This link will expire shortly."
    ] }),
    /* @__PURE__ */ jsx(Button, { style: button$2, href: confirmationUrl, children: "Log In" }),
    /* @__PURE__ */ jsx(Text, { style: footer$3, children: "If you didn't request this link, you can safely ignore this email." })
  ] }) })
] });
const main$3 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$3 = { padding: "20px 25px" };
const h1$3 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$3 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const button$2 = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$3 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const RecoveryEmail = ({
  siteName,
  confirmationUrl
}) => /* @__PURE__ */ jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsx(Head, {}),
  /* @__PURE__ */ jsxs(Preview, { children: [
    "Reset your password for ",
    siteName
  ] }),
  /* @__PURE__ */ jsx(Body, { style: main$2, children: /* @__PURE__ */ jsxs(Container, { style: container$2, children: [
    /* @__PURE__ */ jsx(Heading, { style: h1$2, children: "Reset your password" }),
    /* @__PURE__ */ jsxs(Text, { style: text$2, children: [
      "We received a request to reset your password for ",
      siteName,
      ". Click the button below to choose a new password."
    ] }),
    /* @__PURE__ */ jsx(Button, { style: button$1, href: confirmationUrl, children: "Reset Password" }),
    /* @__PURE__ */ jsx(Text, { style: footer$2, children: "If you didn't request a password reset, you can safely ignore this email. Your password will not be changed." })
  ] }) })
] });
const main$2 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$2 = { padding: "20px 25px" };
const h1$2 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$2 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const button$1 = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$2 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl
}) => /* @__PURE__ */ jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsx(Head, {}),
  /* @__PURE__ */ jsxs(Preview, { children: [
    "Confirm your email change for ",
    siteName
  ] }),
  /* @__PURE__ */ jsx(Body, { style: main$1, children: /* @__PURE__ */ jsxs(Container, { style: container$1, children: [
    /* @__PURE__ */ jsx(Heading, { style: h1$1, children: "Confirm your email change" }),
    /* @__PURE__ */ jsxs(Text, { style: text$1, children: [
      "You requested to change your email address for ",
      siteName,
      " from",
      " ",
      /* @__PURE__ */ jsx(Link$1, { href: `mailto:${oldEmail}`, style: link, children: oldEmail }),
      " ",
      "to",
      " ",
      /* @__PURE__ */ jsx(Link$1, { href: `mailto:${newEmail}`, style: link, children: newEmail }),
      "."
    ] }),
    /* @__PURE__ */ jsx(Text, { style: text$1, children: "Click the button below to confirm this change:" }),
    /* @__PURE__ */ jsx(Button, { style: button, href: confirmationUrl, children: "Confirm Email Change" }),
    /* @__PURE__ */ jsx(Text, { style: footer$1, children: "If you didn't request this change, please secure your account immediately." })
  ] }) })
] });
const main$1 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$1 = { padding: "20px 25px" };
const h1$1 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$1 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const link = { color: "inherit", textDecoration: "underline" };
const button = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$1 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const ReauthenticationEmail = ({ token }) => /* @__PURE__ */ jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsx(Head, {}),
  /* @__PURE__ */ jsx(Preview, { children: "Your verification code" }),
  /* @__PURE__ */ jsx(Body, { style: main, children: /* @__PURE__ */ jsxs(Container, { style: container, children: [
    /* @__PURE__ */ jsx(Heading, { style: h1, children: "Confirm reauthentication" }),
    /* @__PURE__ */ jsx(Text, { style: text, children: "Use the code below to confirm your identity:" }),
    /* @__PURE__ */ jsx(Text, { style: codeStyle, children: token }),
    /* @__PURE__ */ jsx(Text, { style: footer, children: "This code will expire shortly. If you didn't request this, you can safely ignore this email." })
  ] }) })
] });
const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const codeStyle = {
  fontFamily: "Courier, monospace",
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 30px"
};
const footer = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const EMAIL_SUBJECTS = {
  signup: "Confirm your email",
  invite: "You've been invited",
  magiclink: "Your login link",
  recovery: "Reset your password",
  email_change: "Confirm your new email",
  reauthentication: "Your verification code"
};
const EMAIL_TEMPLATES$1 = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail
};
const SITE_NAME$1 = "kol-mitzalot-chatanim";
const SENDER_DOMAIN = "notify.asher-weinberger.com";
const ROOT_DOMAIN = "asher-weinberger.com";
const FROM_DOMAIN = "notify.asher-weinberger.com";
function redactEmail(email) {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}
const Route$1 = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          console.error("LOVABLE_API_KEY not configured");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        let payload;
        let run_id = "";
        try {
          const verified = await verifyWebhookRequest({
            req: request,
            secret: apiKey,
            parser: parseEmailWebhookPayload
          });
          payload = verified.payload;
          run_id = payload.run_id;
        } catch (error) {
          if (error instanceof WebhookError) {
            switch (error.code) {
              case "invalid_signature":
              case "missing_timestamp":
              case "invalid_timestamp":
              case "stale_timestamp":
                console.error("Invalid webhook signature", { error: error.message });
                return Response.json(
                  { error: "Invalid signature" },
                  { status: 401 }
                );
              case "invalid_payload":
              case "invalid_json":
                console.error("Invalid webhook payload", { error: error.message });
                return Response.json(
                  { error: "Invalid webhook payload" },
                  { status: 400 }
                );
            }
          }
          console.error("Webhook verification failed", { error });
          return Response.json(
            { error: "Invalid webhook payload" },
            { status: 400 }
          );
        }
        if (!run_id) {
          console.error("Webhook payload missing run_id");
          return Response.json(
            { error: "Invalid webhook payload" },
            { status: 400 }
          );
        }
        if (payload.version !== "1") {
          console.error("Unsupported payload version", { version: payload.version, run_id });
          return Response.json(
            { error: `Unsupported payload version: ${payload.version}` },
            { status: 400 }
          );
        }
        const emailType = payload.data.action_type;
        console.log("Received auth event", {
          emailType,
          email_redacted: redactEmail(payload.data.email),
          run_id
        });
        const EmailTemplate = EMAIL_TEMPLATES$1[emailType];
        if (!EmailTemplate) {
          console.error("Unknown email type", { emailType, run_id });
          return Response.json(
            { error: `Unknown email type: ${emailType}` },
            { status: 400 }
          );
        }
        const templateProps = {
          siteName: SITE_NAME$1,
          siteUrl: `https://${ROOT_DOMAIN}`,
          recipient: payload.data.email,
          confirmationUrl: payload.data.url,
          token: payload.data.token,
          email: payload.data.email,
          oldEmail: payload.data.old_email,
          newEmail: payload.data.new_email
        };
        const element = React.createElement(EmailTemplate, templateProps);
        const html = await render(element);
        const text2 = await render(element, { plainText: true });
        const supabaseUrl = "https://vggltzctdheulyunfjzn.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          console.error("Missing Supabase environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const messageId = crypto.randomUUID();
        await supabase2.from("email_send_log").insert({
          message_id: messageId,
          template_name: emailType,
          recipient_email: payload.data.email,
          status: "pending"
        });
        const { error: enqueueError } = await supabase2.rpc("enqueue_email", {
          queue_name: "auth_emails",
          payload: {
            run_id,
            message_id: messageId,
            to: payload.data.email,
            from: `${SITE_NAME$1} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject: EMAIL_SUBJECTS[emailType] || "Notification",
            html,
            text: text2,
            purpose: "transactional",
            label: emailType,
            queued_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
        if (enqueueError) {
          console.error("Failed to enqueue auth email", { error: enqueueError, run_id, emailType });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: emailType,
            recipient_email: payload.data.email,
            status: "failed",
            error_message: "Failed to enqueue email"
          });
          return Response.json(
            { error: "Failed to enqueue email" },
            { status: 500 }
          );
        }
        console.log("Auth email enqueued", {
          emailType,
          email_redacted: redactEmail(payload.data.email),
          run_id
        });
        return Response.json({ success: true, queued: true });
      }
    }
  }
});
const EMAIL_TEMPLATES = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail
};
const SITE_NAME = "kol-mitzalot-chatanim";
const SAMPLE_PROJECT_URL = "https://kol-mitzalot-chatanim.lovable.app";
const SAMPLE_EMAIL = "user@example.test";
const SAMPLE_DATA = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  email_change: {
    siteName: SITE_NAME,
    oldEmail: SAMPLE_EMAIL,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  reauthentication: {
    token: "123456"
  }
};
const Route = createFileRoute("/lovable/email/auth/preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        let type;
        try {
          const body = await request.json();
          type = body.type;
        } catch {
          return Response.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
          );
        }
        const EmailTemplate = EMAIL_TEMPLATES[type];
        if (!EmailTemplate) {
          return Response.json(
            { error: `Unknown email type: ${type}` },
            { status: 400 }
          );
        }
        const sampleData = SAMPLE_DATA[type] || {};
        const html = await render(React.createElement(EmailTemplate, sampleData));
        return new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
    }
  }
});
const IndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$9
});
const EmailUnsubscribeRoute = Route$7.update({
  id: "/email/unsubscribe",
  path: "/email/unsubscribe",
  getParentRoute: () => Route$9
});
const LovableEmailSuppressionRoute = Route$6.update({
  id: "/lovable/email/suppression",
  path: "/lovable/email/suppression",
  getParentRoute: () => Route$9
});
const ApiPublicRequestPasswordResetRoute = Route$5.update({
  id: "/api/public/request-password-reset",
  path: "/api/public/request-password-reset",
  getParentRoute: () => Route$9
});
const LovableEmailTransactionalSendRoute = Route$4.update({
  id: "/lovable/email/transactional/send",
  path: "/lovable/email/transactional/send",
  getParentRoute: () => Route$9
});
const LovableEmailTransactionalPreviewRoute = Route$3.update({
  id: "/lovable/email/transactional/preview",
  path: "/lovable/email/transactional/preview",
  getParentRoute: () => Route$9
});
const LovableEmailQueueProcessRoute = Route$2.update({
  id: "/lovable/email/queue/process",
  path: "/lovable/email/queue/process",
  getParentRoute: () => Route$9
});
const LovableEmailAuthWebhookRoute = Route$1.update({
  id: "/lovable/email/auth/webhook",
  path: "/lovable/email/auth/webhook",
  getParentRoute: () => Route$9
});
const LovableEmailAuthPreviewRoute = Route.update({
  id: "/lovable/email/auth/preview",
  path: "/lovable/email/auth/preview",
  getParentRoute: () => Route$9
});
const rootRouteChildren = {
  IndexRoute,
  EmailUnsubscribeRoute,
  ApiPublicRequestPasswordResetRoute,
  LovableEmailSuppressionRoute,
  LovableEmailAuthPreviewRoute,
  LovableEmailAuthWebhookRoute,
  LovableEmailQueueProcessRoute,
  LovableEmailTransactionalPreviewRoute,
  LovableEmailTransactionalSendRoute
};
const routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({
  error,
  reset
}) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  fetchIncomes as a,
  fetchExpenses as b,
  fetchDebts as c,
  fetchAskanimIncomes as d,
  saveIncomesToDb as e,
  fetchBachurim as f,
  saveExpensesToDb as g,
  saveDebtsToDb as h,
  saveAskanimIncomesToDb as i,
  supabase as j,
  useData as k,
  fetchActivityLog as l,
  fetchBasketProducts as m,
  fetchGlobalSettings as n,
  fetchFundraisers as o,
  fetchExpenseCategories as p,
  saveGlobalSettingsToDb as q,
  saveExpenseCategoriesToDb as r,
  saveBachurimToDb as s,
  addActivityLog as t,
  useAuth as u,
  saveFundraisersToDb as v,
  saveBasketProductsToDb as w,
  router as x
};
