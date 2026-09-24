/**
 * storageSync — Synchronizes localStorage with Supabase.
 *
 * Strategy:
 *   1. On bootstrap: pull all data from Supabase. If Supabase is empty for a
 *      table but localStorage has data, push localStorage → Supabase (one-time
 *      migration). Otherwise overwrite localStorage with Supabase data so all
 *      devices see the same source of truth.
 *   2. Patch localStorage.setItem so writes to known keys are debounced and
 *      flushed to Supabase automatically.
 *
 * This lets existing components keep using localStorage while data actually
 * lives in the cloud and is shared across all devices/browsers.
 */
import {
  fetchBachurim, saveBachurimToDb,
  fetchIncomes, saveIncomesToDb,
  fetchExpenses, saveExpensesToDb,
  fetchDebts, saveDebtsToDb,
  fetchAskanimIncomes, saveAskanimIncomesToDb,
  fetchBasketProducts, saveBasketProductsToDb,
  fetchGlobalSettings, saveGlobalSettingsToDb,
  fetchFundraisers, saveFundraisersToDb,
  fetchExpenseCategories, saveExpenseCategoriesToDb,
} from "@/lib/db";
import { addActivityLog } from "@/lib/db";

// Keys that are mirrored to Supabase
const SYNCED_KEYS = new Set([
  "bachurim",
  "incomes",
  "expenses",
  "debts",
  "askanimIncomes",
  "basketProducts",
  "globalSettings",
  "fundraisers",
  "expense_cats_salim",
  "expense_cats_amuta",
]);

// Debounce flushes per key
const flushTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const FLUSH_DELAY = 500;

// ─── Auto-detect changes and log them ─────────────────────────
const LOG_LABELS: Record<string, string> = {
  bachurim: "בחורים",
  incomes: "הכנסות",
  expenses: "הוצאות",
  debts: "חובות",
  askanimIncomes: "הכנסות עסקנים",
  basketProducts: "מוצרי סל",
  globalSettings: "הגדרות",
  fundraisers: "גיוס",
};

let logDebounce: ReturnType<typeof setTimeout> | null = null;
const pendingLogs: { key: string; oldLen: number; newLen: number }[] = [];

function detectAndLog(key: string, oldRaw: string | null, newRaw: string) {
  try {
    if (key === "globalSettings") {
      const oldObj = safeParse(oldRaw, {});
      const newObj = safeParse(newRaw, {});
      if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
        addActivityLog("שינוי הגדרות", "עדכון הגדרות מערכת").catch(console.error);
      }
      return;
    }
    const oldArr = safeParse<any[]>(oldRaw, []);
    const newArr = safeParse<any[]>(newRaw, []);
    const label = LOG_LABELS[key] || key;

    if (newArr.length > oldArr.length) {
      const diff = newArr.length - oldArr.length;
      const lastItem = newArr[newArr.length - 1];
      const name = lastItem?.name || lastItem?.description || "";
      const amount = lastItem?.amount;
      addActivityLog(
        `הוספה - ${label}`,
        name ? `${name}${diff > 1 ? ` (+${diff - 1} נוספים)` : ""}` : `${diff} רשומות חדשות`,
        amount,
      ).catch(console.error);
    } else if (newArr.length < oldArr.length) {
      const diff = oldArr.length - newArr.length;
      addActivityLog(`מחיקה - ${label}`, `${diff} רשומות נמחקו`).catch(console.error);
    } else if (JSON.stringify(oldArr) !== JSON.stringify(newArr)) {
      addActivityLog(`עדכון - ${label}`, `עדכון נתונים`).catch(console.error);
    }
  } catch { /* ignore parse errors */ }
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

async function flushKey(key: string) {
  try {
    const raw = localStorage.getItem(key);
    switch (key) {
      case "bachurim":
        await saveBachurimToDb(safeParse(raw, []));
        break;
      case "incomes":
        await saveIncomesToDb(safeParse(raw, []));
        break;
      case "expenses":
        await saveExpensesToDb(safeParse(raw, []));
        break;
      case "debts":
        await saveDebtsToDb(safeParse(raw, []));
        break;
      case "askanimIncomes":
        await saveAskanimIncomesToDb(safeParse(raw, []));
        break;
      case "basketProducts":
        await saveBasketProductsToDb(safeParse(raw, []));
        break;
      case "globalSettings":
        await saveGlobalSettingsToDb(safeParse(raw, {} as any));
        break;
      case "fundraisers":
        await saveFundraisersToDb(safeParse(raw, []));
        break;
      case "expense_cats_salim":
      case "expense_cats_amuta": {
        const salim = safeParse<string[]>(localStorage.getItem("expense_cats_salim"), []);
        const amuta = safeParse<string[]>(localStorage.getItem("expense_cats_amuta"), []);
        await saveExpenseCategoriesToDb(salim, amuta);
        break;
      }
    }
  } catch (err) {
    console.error("storageSync flush failed for", key, err);
  }
}

function scheduleFlush(key: string) {
  if (flushTimers[key]) clearTimeout(flushTimers[key]);
  flushTimers[key] = setTimeout(() => {
    delete flushTimers[key];
    flushKey(key);
  }, FLUSH_DELAY);
}

/**
 * Write to localStorage without triggering the Supabase sync.
 * Used by the realtime listener to apply remote changes locally.
 */
export function writeWithoutSync(key: string, value: string) {
  // Use the original setter directly via the prototype to bypass our patch.
  const proto = Object.getPrototypeOf(localStorage);
  const original = proto.setItem ?? Storage.prototype.setItem;
  original.call(localStorage, key, value);
}

let patched = false;
function patchLocalStorage() {
  if (patched) return;
  patched = true;
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.setItem = function (key: string, value: string) {
    const oldRaw = localStorage.getItem(key);
    originalSetItem(key, value);
    if (SYNCED_KEYS.has(key)) {
      scheduleFlush(key);
      detectAndLog(key, oldRaw, value);
      // Notify same-tab listeners (DataContext, etc.) — the native `storage`
      // event only fires for OTHER tabs, so we dispatch one manually.
      try {
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch { /* older browsers */ }
    }
  };

  localStorage.removeItem = function (key: string) {
    originalRemoveItem(key);
    if (SYNCED_KEYS.has(key)) scheduleFlush(key);
  };
}

let bootstrapped = false;
let bootstrapPromise: Promise<void> | null = null;

export function bootstrapStorage(): Promise<void> {
  if (bootstrapped) return Promise.resolve();
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    // 1. Fetch everything from Supabase in parallel
    const [
      cloudBachurim, cloudIncomes, cloudExpenses, cloudDebts,
      cloudAskanimIncomes, cloudBasketProducts, cloudGlobalSettings,
      cloudFundraisers, cloudCats,
    ] = await Promise.all([
      fetchBachurim(),
      fetchIncomes(),
      fetchExpenses(),
      fetchDebts(),
      fetchAskanimIncomes(),
      fetchBasketProducts(),
      fetchGlobalSettings(),
      fetchFundraisers(),
      fetchExpenseCategories(),
    ]);

    // 2. For each key: if cloud is empty AND local has data, migrate local→cloud.
    //    Otherwise, write cloud data into localStorage (cloud is source of truth).
    const migrationPromises: Promise<void>[] = [];

    const syncOne = <T>(
      key: string,
      cloudData: T[],
      saver: (data: T[]) => Promise<void>,
    ) => {
      const localRaw = localStorage.getItem(key);
      const localData = safeParse<T[]>(localRaw, []);
      if (cloudData.length === 0 && localData.length > 0) {
        // Migrate local → cloud, keep local as-is
        migrationPromises.push(saver(localData));
        console.log(`[storageSync] Migrating ${localData.length} ${key} from localStorage → Supabase`);
      } else {
        localStorage.setItem(key, JSON.stringify(cloudData));
      }
    };

    syncOne("bachurim", cloudBachurim, saveBachurimToDb);
    syncOne("incomes", cloudIncomes, saveIncomesToDb);
    syncOne("expenses", cloudExpenses, saveExpensesToDb);
    syncOne("debts", cloudDebts, saveDebtsToDb);
    syncOne("askanimIncomes", cloudAskanimIncomes, saveAskanimIncomesToDb);
    syncOne("basketProducts", cloudBasketProducts, saveBasketProductsToDb);
    syncOne("fundraisers", cloudFundraisers, saveFundraisersToDb);

    // globalSettings — special (object, not array)
    {
      const localRaw = localStorage.getItem("globalSettings");
      const cloudIsDefault =
        cloudGlobalSettings.basketCost === 6000 &&
        cloudGlobalSettings.basketCostHistory.length === 0 &&
        cloudGlobalSettings.classUpgradeHistory.length === 0 &&
        cloudGlobalSettings.lastClassUpgrade === null;
      if (localRaw && cloudIsDefault) {
        const localSettings = safeParse(localRaw, cloudGlobalSettings);
        migrationPromises.push(saveGlobalSettingsToDb(localSettings as any));
        console.log("[storageSync] Migrating globalSettings from localStorage → Supabase");
      } else {
        localStorage.setItem("globalSettings", JSON.stringify(cloudGlobalSettings));
      }
    }

    // expense categories — combined
    {
      const localSalim = safeParse<string[]>(localStorage.getItem("expense_cats_salim"), []);
      const localAmuta = safeParse<string[]>(localStorage.getItem("expense_cats_amuta"), []);
      const cloudIsDefault =
        cloudCats.salim.length === 8 && cloudCats.amuta.length === 6 &&
        cloudCats.salim.includes("גור");
      const localHasData = localSalim.length > 0 || localAmuta.length > 0;
      if (localHasData && cloudIsDefault) {
        migrationPromises.push(
          saveExpenseCategoriesToDb(
            localSalim.length > 0 ? localSalim : cloudCats.salim,
            localAmuta.length > 0 ? localAmuta : cloudCats.amuta,
          )
        );
        console.log("[storageSync] Migrating expense categories from localStorage → Supabase");
      } else {
        localStorage.setItem("expense_cats_salim", JSON.stringify(cloudCats.salim));
        localStorage.setItem("expense_cats_amuta", JSON.stringify(cloudCats.amuta));
      }
    }

    if (migrationPromises.length > 0) {
      await Promise.all(migrationPromises);
    }

    // 3. Patch localStorage so future writes auto-sync
    patchLocalStorage();

    bootstrapped = true;
  })();

  return bootstrapPromise;
}
