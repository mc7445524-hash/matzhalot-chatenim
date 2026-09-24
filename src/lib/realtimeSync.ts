/**
 * realtimeSync — Listens to Supabase Realtime changes on all synced tables
 * and updates localStorage so other open tabs/devices reflect changes
 * immediately, without a refresh.
 *
 * Strategy: when ANY change is detected on a watched table, refetch that
 * dataset from Supabase and write it to localStorage. We use the "skip sync"
 * write helper so the change isn't echoed back to the server.
 *
 * After updating localStorage, we dispatch a `storage` event so React
 * components in the same tab re-read their data.
 */
import { supabase } from "@/integrations/supabase/client";
import {
  fetchBachurim,
  fetchIncomes,
  fetchExpenses,
  fetchDebts,
  fetchAskanimIncomes,
  fetchBasketProducts,
  fetchGlobalSettings,
  fetchFundraisers,
  fetchExpenseCategories,
} from "@/lib/db";
import { writeWithoutSync } from "@/lib/storageSync";

type Refresher = () => Promise<void>;

const refreshers: Record<string, Refresher> = {
  bachurim: async () => {
    const data = await fetchBachurim();
    writeWithoutSync("bachurim", JSON.stringify(data));
  },
  outings: async () => {
    // outings are nested under bachurim in localStorage
    const data = await fetchBachurim();
    writeWithoutSync("bachurim", JSON.stringify(data));
  },
  incomes: async () => {
    const data = await fetchIncomes();
    writeWithoutSync("incomes", JSON.stringify(data));
  },
  expenses: async () => {
    const data = await fetchExpenses();
    writeWithoutSync("expenses", JSON.stringify(data));
  },
  debts: async () => {
    const data = await fetchDebts();
    writeWithoutSync("debts", JSON.stringify(data));
  },
  askanim_incomes: async () => {
    const data = await fetchAskanimIncomes();
    writeWithoutSync("askanimIncomes", JSON.stringify(data));
  },
  basket_products: async () => {
    const data = await fetchBasketProducts();
    writeWithoutSync("basketProducts", JSON.stringify(data));
  },
  global_settings: async () => {
    const data = await fetchGlobalSettings();
    writeWithoutSync("globalSettings", JSON.stringify(data));
  },
  fundraisers: async () => {
    const data = await fetchFundraisers();
    writeWithoutSync("fundraisers", JSON.stringify(data));
  },
  expense_categories: async () => {
    const data = await fetchExpenseCategories();
    writeWithoutSync("expense_cats_salim", JSON.stringify(data.salim));
    writeWithoutSync("expense_cats_amuta", JSON.stringify(data.amuta));
  },
};

// Debounce per table so a burst of changes triggers only one refetch.
const refreshTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const REFRESH_DELAY = 300;

function scheduleRefresh(table: string) {
  if (refreshTimers[table]) clearTimeout(refreshTimers[table]);
  refreshTimers[table] = setTimeout(async () => {
    delete refreshTimers[table];
    const fn = refreshers[table];
    if (!fn) return;
    try {
      await fn();
      // Notify same-tab listeners
      window.dispatchEvent(new StorageEvent("storage", { key: table }));
    } catch (err) {
      console.error(`[realtimeSync] refresh failed for ${table}`, err);
    }
  }, REFRESH_DELAY);
}

let started = false;

export function startRealtimeSync() {
  if (started) return;
  started = true;

  const channel = supabase.channel("app-realtime-sync");

  for (const table of Object.keys(refreshers)) {
    (channel as any).on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      () => scheduleRefresh(table),
    );
  }

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      console.log("[realtimeSync] connected");
    } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      console.warn("[realtimeSync] channel status:", status);
    }
  });
}
