import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  type Bachur, type Income, type Expense, type Debt, type AskanimIncome,
  type BasketProduct, type GlobalSettingsData,
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

interface DataContextType {
  loading: boolean;
  bachurim: Bachur[];
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  askanimIncomes: AskanimIncome[];
  basketProducts: BasketProduct[];
  globalSettings: GlobalSettingsData;
  fundraisers: string[];
  expenseCategoriesSalim: string[];
  expenseCategoriesAmuta: string[];

  setBachurim: (data: Bachur[]) => void;
  setIncomes: (data: Income[]) => void;
  setExpenses: (data: Expense[]) => void;
  setDebts: (data: Debt[]) => void;
  setAskanimIncomes: (data: AskanimIncome[]) => void;
  setBasketProducts: (data: BasketProduct[]) => void;
  setGlobalSettings: (data: GlobalSettingsData) => void;
  setFundraisers: (data: string[]) => void;
  setExpenseCategories: (salim: string[], amuta: string[]) => void;

  refresh: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const defaultSettings: GlobalSettingsData = {
  basketCost: 6000,
  basketCostHistory: [],
  minimumForBasket: 5000,
  lastClassUpgrade: null,
  classUpgradeHistory: [],
};

const DataContext = createContext<DataContextType | null>(null);

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [bachurim, _setBachurim] = useState<Bachur[]>([]);
  const [incomes, _setIncomes] = useState<Income[]>([]);
  const [expenses, _setExpenses] = useState<Expense[]>([]);
  const [debts, _setDebts] = useState<Debt[]>([]);
  const [askanimIncomes, _setAskanimIncomes] = useState<AskanimIncome[]>([]);
  const [basketProducts, _setBasketProducts] = useState<BasketProduct[]>([]);
  const [globalSettings, _setGlobalSettings] = useState<GlobalSettingsData>(defaultSettings);
  const [fundraisers, _setFundraisers] = useState<string[]>([]);
  const [catsSalim, _setCatsSalim] = useState<string[]>([]);
  const [catsAmuta, _setCatsAmuta] = useState<string[]>([]);

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
        fetchExpenseCategories(),
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

  useEffect(() => { loadAll(); }, [loadAll]);

  // Listen for localStorage changes (cross-tab + realtime-sync dispatches)
  // so that modules which still write directly to localStorage stay in sync
  // with the DataContext state used by Dashboard etc.
  useEffect(() => {
    const SYNCED = new Set([
      "bachurim", "incomes", "expenses", "debts",
      "askanimIncomes", "basketProducts", "globalSettings",
      "fundraisers", "expense_cats_salim", "expense_cats_amuta",
    ]);
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !SYNCED.has(e.key)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { loadAll(); }, 150);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      if (timer) clearTimeout(timer);
    };
  }, [loadAll]);

  // Setters that also persist to Supabase
  const setBachurim = useCallback((data: Bachur[]) => {
    _setBachurim(data);
    saveBachurimToDb(data).catch(console.error);
  }, []);

  const setIncomes = useCallback((data: Income[]) => {
    _setIncomes(data);
    saveIncomesToDb(data).catch(console.error);
  }, []);

  const setExpenses = useCallback((data: Expense[]) => {
    _setExpenses(data);
    saveExpensesToDb(data).catch(console.error);
  }, []);

  const setDebts = useCallback((data: Debt[]) => {
    _setDebts(data);
    saveDebtsToDb(data).catch(console.error);
  }, []);

  const setAskanimIncomes = useCallback((data: AskanimIncome[]) => {
    _setAskanimIncomes(data);
    saveAskanimIncomesToDb(data).catch(console.error);
  }, []);

  const setBasketProducts = useCallback((data: BasketProduct[]) => {
    _setBasketProducts(data);
    saveBasketProductsToDb(data).catch(console.error);
  }, []);

  const setGlobalSettings = useCallback((data: GlobalSettingsData) => {
    _setGlobalSettings(data);
    saveGlobalSettingsToDb(data).catch(console.error);
  }, []);

  const setFundraisers = useCallback((data: string[]) => {
    _setFundraisers(data);
    saveFundraisersToDb(data).catch(console.error);
  }, []);

  const setExpenseCategories = useCallback((salim: string[], amuta: string[]) => {
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
      saveExpenseCategoriesToDb([], []),
    ]);
  }, []);

  return (
    <DataContext.Provider
      value={{
        loading,
        bachurim, incomes, expenses, debts, askanimIncomes,
        basketProducts, globalSettings, fundraisers,
        expenseCategoriesSalim: catsSalim,
        expenseCategoriesAmuta: catsAmuta,
        setBachurim, setIncomes, setExpenses, setDebts,
        setAskanimIncomes, setBasketProducts, setGlobalSettings,
        setFundraisers, setExpenseCategories,
        refresh: loadAll, resetAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
