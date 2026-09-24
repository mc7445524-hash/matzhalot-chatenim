import { useState, useEffect, useRef, useCallback } from "react";
import {
  UserPlus, Upload, Download, Eye, EyeOff, ShoppingBasket,
  Heart, Users, X, AlertTriangle, Plus, ChevronLeft, Pencil, Trash2, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useFocusRow } from "@/hooks/useFocusRow";
import MasterExcelImport from "@/components/MasterExcelImport";

// ─── Types ────────────────────────────────────────────────────
export interface Outing {
  id: string;
  name: string;
  date: string;
  amount: number;
  paymentMethod: string; // "מזומן" | "אשראי" | "אחר"
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

const CLASS_LEVELS = ["א", "ב", "ג", "ד", "ה", "ו"];
const STORAGE_KEY = "bachurim";

// ─── Helpers ──────────────────────────────────────────────────
function loadBachurim(): Bachur[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveBachurim(list: Bachur[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem("globalSettings") || "{}");
  } catch {
    return {};
  }
}

function getMinimum(): number {
  return loadSettings().minimumForBasket || 5000;
}

function getBasketCost(): number {
  return loadSettings().basketCost || 6000;
}

function generateSku(existing: Bachur[]): string {
  const usedSkus = new Set(existing.map((b) => b.sku));
  let sku: string;
  do {
    sku = String(Math.floor(Math.random() * 50000) + 1).padStart(5, "0");
  } while (usedSkus.has(sku));
  return sku;
}

function totalIncome(b: Bachur): number {
  return b.outings.reduce((sum, o) => sum + o.amount, 0);
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 0 }).format(n);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL");
}

function addExpense(description: string, amount: number) {
  try {
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    expenses.push({ id: crypto.randomUUID(), description, amount, date: new Date().toISOString(), category: "סלים" });
    localStorage.setItem("expenses", JSON.stringify(expenses));
  } catch { /* silent */ }
}

function addIncome(description: string, amount: number) {
  try {
    const incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
    incomes.push({ id: crypto.randomUUID(), description, amount, date: new Date().toISOString(), category: "תרומות", target: "amuta" });
    localStorage.setItem("incomes", JSON.stringify(incomes));
  } catch { /* silent */ }
}

function addToAskanim(name: string, sku: string) {
  try {
    const list = JSON.parse(localStorage.getItem("askanim") || "[]");
    list.push({ id: crypto.randomUUID(), name, sku, date: new Date().toISOString() });
    localStorage.setItem("askanim", JSON.stringify(list));
  } catch { /* silent */ }
}

// ─── Main Component ───────────────────────────────────────────
export default function BachurimModule() {
  const [bachurim, setBachurim] = useState<Bachur[]>([]);
  const [showClosed, setShowClosed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedBachur, setSelectedBachur] = useState<Bachur | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; bachur: Bachur; date?: string } | null>(null);
  const [deleteBachurId, setDeleteBachurId] = useState<string | null>(null);

  const handleDeleteBachur = () => {
    if (!deleteBachurId) return;
    const b = bachurim.find((x) => x.id === deleteBachurId);
    if (b && !b.receivedBasket) {
      const income = totalIncome(b);
      if (income > 0) {
        addIncome(`תרומה – ${b.name}`, income);
      }
    }
    persist(bachurim.filter((x) => x.id !== deleteBachurId));
    setDeleteBachurId(null);
    setSelectedBachur(null);
    toast.success(b ? `${b.name} נמחק` : "הבחור נמחק");
  };

  const reload = useCallback(() => setBachurim(loadBachurim()), []);
  useEffect(reload, [reload]);
  const { highlightedId, registerRow } = useFocusRow("bachurim", (id) => {
    const b = loadBachurim().find((x) => x.id === id);
    if (b) setSelectedBachur(b);
  });

  const persist = (list: Bachur[]) => { saveBachurim(list); setBachurim(list); };

  const minimum = getMinimum();

  // ─── Search + Filter ─────────────────────────────
  const q = searchQuery.trim().toLowerCase();
  const matchesSearch = (b: Bachur) =>
    !q || b.name.toLowerCase().includes(q) || b.sku.toLowerCase().includes(q);
  const matchesClass = (b: Bachur) => filterClass.length === 0 || filterClass.includes(b.classLevel);
  const statusMatches = (b: Bachur, status: string) => {
    const income = totalIncome(b);
    switch (status) {
      case "eligible": return income >= minimum && !b.married;
      case "not_eligible": return income < minimum && !b.married && !b.receivedBasket;
      case "received_basket": return b.receivedBasket;
      case "married": return b.married;
      case "closed": return b.closed;
      case "askanim": return b.inAskanim;
      default: return false;
    }
  };
  const matchesStatus = (b: Bachur) =>
    filterStatus.length === 0 || filterStatus.some((s) => statusMatches(b, s));
  const filtered = bachurim.filter((b) => matchesSearch(b) && matchesClass(b) && matchesStatus(b));
  const active = filtered.filter((b) => !b.closed);
  const closed = filtered.filter((b) => b.closed);
  const hasActiveFilter = q !== "" || filterClass.length > 0 || filterStatus.length > 0;
  const clearFilters = () => { setSearchQuery(""); setFilterClass([]); setFilterStatus([]); };

  const toggleInArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: "eligible", label: "זכאי" },
    { value: "not_eligible", label: "לא זכאי" },
    { value: "received_basket", label: "קיבל סל" },
    { value: "married", label: "התחתן" },
    { value: "closed", label: "סגור" },
    { value: "askanim", label: "פרויקט עסקנים" },
  ];

  // ─── Add Bachur ─────────────────────────────────
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("א");

  const handleAdd = () => {
    if (!newName.trim()) { toast.error("יש להזין שם"); return; }
    const b: Bachur = {
      id: crypto.randomUUID(),
      sku: generateSku(bachurim),
      name: newName.trim(),
      classLevel: newClass,
      joinDate: new Date().toISOString(),
      outings: [],
      married: false,
      receivedBasket: false,
      inAskanim: false,
      closed: false,
    };
    persist([...bachurim, b]);
    setNewName("");
    setNewClass("א");
    setAddDialogOpen(false);
    toast.success(`${b.name} נוסף בהצלחה (מק"ט: ${b.sku})`);
  };

  // ─── Basket Action ──────────────────────────────
  const handleBasket = (b: Bachur) => {
    const cost = getBasketCost();
    const income = totalIncome(b);
    const subsidy = cost - minimum;
    const updated = bachurim.map((x) =>
      x.id === b.id
        ? { ...x, receivedBasket: true, basketDate: new Date().toISOString(), basketCostAtTime: cost, married: true, marriedDate: new Date().toISOString(), closed: true }
        : x
    );
    persist(updated);
    if (subsidy > 0) {
      addExpense(`סבסוד סל – ${b.name}`, subsidy);
    }
    setConfirmAction(null);
    setSelectedBachur(null);
    toast.success(`${b.name} קיבל סל ונרשם כנשוי`);
  };

  // ─── Married Action ─────────────────────────────
  const [marriedDate, setMarriedDate] = useState(new Date().toISOString().slice(0, 10));

  const handleMarried = (b: Bachur) => {
    const income = totalIncome(b);
    const updated = bachurim.map((x) =>
      x.id === b.id
        ? { ...x, married: true, marriedDate: confirmAction?.date || new Date().toISOString(), closed: true }
        : x
    );
    persist(updated);
    if (!b.receivedBasket && income > 0) {
      addIncome(`תרומה – ${b.name}`, income);
    }
    setConfirmAction(null);
    setSelectedBachur(null);
    toast.success(`${b.name} נרשם כנשוי`);
  };

  // ─── Askanim Action ─────────────────────────────
  const handleAskanim = (b: Bachur) => {
    const updated = bachurim.map((x) => x.id === b.id ? { ...x, inAskanim: true } : x);
    persist(updated);
    addToAskanim(b.name, b.sku);
    toast.success(`${b.name} צורף לפרויקט עסקנים`);
  };

  // ─── Cancel Closed ──────────────────────────────
  const handleCancelClosed = (b: Bachur) => {
    // Remove auto-generated income "תרומה – name"
    if (b.married && !b.receivedBasket && totalIncome(b) > 0) {
      try {
        const incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
        const filtered = incomes.filter((inc: any) => inc.description !== `תרומה – ${b.name}`);
        localStorage.setItem("incomes", JSON.stringify(filtered));
      } catch { /* silent */ }
    }
    // Remove auto-generated expense "סבסוד סל – name"
    if (b.receivedBasket) {
      try {
        const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
        const filtered = expenses.filter((exp: any) => exp.description !== `סבסוד סל – ${b.name}`);
        localStorage.setItem("expenses", JSON.stringify(filtered));
      } catch { /* silent */ }
    }

    const updated = bachurim.map((x) =>
      x.id === b.id
        ? { ...x, married: false, marriedDate: undefined, receivedBasket: false, basketDate: undefined, basketCostAtTime: undefined, closed: false }
        : x
    );
    persist(updated);
    setConfirmAction(null);
    toast.success(`${b.name} הוחזר לרשימת הפעילים`);
  };

  // ─── Add Outing ─────────────────────────────────
  const [outingName, setOutingName] = useState("");
  const [outingDate, setOutingDate] = useState(new Date().toISOString().slice(0, 10));
  const [outingAmount, setOutingAmount] = useState("");
  const [outingPayment, setOutingPayment] = useState("");
  const [outingPaymentDetail, setOutingPaymentDetail] = useState("");
  const [addOutingOpen, setAddOutingOpen] = useState(false);
  const [editingOuting, setEditingOuting] = useState<Outing | null>(null);
  const [editOutingName, setEditOutingName] = useState("");
  const [editOutingDate, setEditOutingDate] = useState("");
  const [editOutingAmount, setEditOutingAmount] = useState("");
  const [editOutingPayment, setEditOutingPayment] = useState("");
  const [editOutingPaymentDetail, setEditOutingPaymentDetail] = useState("");
  const [deleteOutingId, setDeleteOutingId] = useState<string | null>(null);

  const canSaveOuting = outingName.trim() && Number(outingAmount) > 0 && outingPayment && (outingPayment !== "אחר" || outingPaymentDetail.trim());

  const handleAddOuting = () => {
    if (!selectedBachur || !canSaveOuting) { toast.error("יש למלא את כל השדות"); return; }
    const outing: Outing = {
      id: crypto.randomUUID(),
      name: outingName.trim(),
      date: new Date(outingDate).toISOString(),
      amount: Number(outingAmount),
      paymentMethod: outingPayment,
      paymentMethodDetail: outingPayment === "אחר" ? outingPaymentDetail.trim() : undefined,
    };
    const updated = bachurim.map((x) =>
      x.id === selectedBachur.id ? { ...x, outings: [...x.outings, outing] } : x
    );
    persist(updated);
    setSelectedBachur(updated.find((x) => x.id === selectedBachur.id) || null);
    setOutingName("");
    setOutingAmount("");
    setOutingDate(new Date().toISOString().slice(0, 10));
    setOutingPayment("");
    setOutingPaymentDetail("");
    setAddOutingOpen(false);
    toast.success("ההכנסה נוספה בהצלחה");
  };

  const openEditOuting = (o: Outing) => {
    setEditingOuting(o);
    setEditOutingName(o.name);
    setEditOutingDate(new Date(o.date).toISOString().slice(0, 10));
    setEditOutingAmount(String(o.amount));
    setEditOutingPayment(o.paymentMethod);
    setEditOutingPaymentDetail(o.paymentMethodDetail || "");
  };

  const handleEditOuting = () => {
    if (!selectedBachur || !editingOuting) return;
    const canSave = editOutingName.trim() && Number(editOutingAmount) > 0 && editOutingPayment && (editOutingPayment !== "אחר" || editOutingPaymentDetail.trim());
    if (!canSave) { toast.error("יש למלא את כל השדות"); return; }
    const updatedOuting: Outing = {
      ...editingOuting,
      name: editOutingName.trim(),
      date: new Date(editOutingDate).toISOString(),
      amount: Number(editOutingAmount),
      paymentMethod: editOutingPayment,
      paymentMethodDetail: editOutingPayment === "אחר" ? editOutingPaymentDetail.trim() : undefined,
    };
    const updated = bachurim.map((x) =>
      x.id === selectedBachur.id
        ? { ...x, outings: x.outings.map((o) => o.id === editingOuting.id ? updatedOuting : o) }
        : x
    );
    persist(updated);
    setSelectedBachur(updated.find((x) => x.id === selectedBachur.id) || null);
    setEditingOuting(null);
    toast.success("הפעולה עודכנה בהצלחה");
  };

  const handleDeleteOuting = () => {
    if (!selectedBachur || !deleteOutingId) return;
    const updated = bachurim.map((x) =>
      x.id === selectedBachur.id
        ? { ...x, outings: x.outings.filter((o) => o.id !== deleteOutingId) }
        : x
    );
    persist(updated);
    setSelectedBachur(updated.find((x) => x.id === selectedBachur.id) || null);
    setDeleteOutingId(null);
    toast.success("הפעולה נמחקה בהצלחה");
  };

  // ─── Import Excel ───────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<{ name: string; classLevel: string; exists: boolean }[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      const names = new Set(bachurim.map((b) => b.name));
      const parsed = rows.map((r) => ({
        name: String(r["שם"] || r.name || "").trim(),
        classLevel: String(r["שיעור"] || r.class || "א").trim(),
        exists: names.has(String(r["שם"] || r.name || "").trim()),
      })).filter((r) => r.name);
      setImportData(parsed);
      setImportDialogOpen(true);
    } catch {
      toast.error("שגיאה בקריאת הקובץ");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = (skipExisting: boolean) => {
    const toImport = skipExisting ? importData.filter((r) => !r.exists) : importData;
    let current = [...bachurim];
    for (const row of toImport) {
      if (row.exists && !skipExisting) {
        current = current.map((b) => b.name === row.name ? { ...b, classLevel: row.classLevel } : b);
      } else if (!row.exists) {
        current.push({
          id: crypto.randomUUID(),
          sku: generateSku(current),
          name: row.name,
          classLevel: CLASS_LEVELS.includes(row.classLevel) ? row.classLevel : "א",
          joinDate: new Date().toISOString(),
          outings: [],
          married: false,
          receivedBasket: false,
          inAskanim: false,
          closed: false,
        });
      }
    }
    persist(current);
    setImportDialogOpen(false);
    setImportData([]);
    toast.success(`${toImport.length} בחורים יובאו בהצלחה`);
  };

  // ─── Export Excel ───────────────────────────────
  const [exportCols, setExportCols] = useState({
    sku: true, classLevel: true, joinDate: false,
    eligibility: false, askanim: false,
  });
  const [exportBasketOutings, setExportBasketOutings] = useState(false);
  const [exportAskanimOutings, setExportAskanimOutings] = useState(false);
  const [selectedBasketOutings, setSelectedBasketOutings] = useState<Set<string>>(new Set());
  const [selectedAskanimOutings, setSelectedAskanimOutings] = useState<Set<string>>(new Set());
  const [expandedBasketYears, setExpandedBasketYears] = useState<Set<string>>(new Set());
  const [expandedAskanimYears, setExpandedAskanimYears] = useState<Set<string>>(new Set());

  // Build hierarchical tree: year -> outing names
  const allBasketOutings = active.flatMap((b) => b.outings || []);
  const basketTree: Record<string, string[]> = {};
  for (const o of allBasketOutings) {
    const year = new Date(o.date).getFullYear().toString();
    if (!basketTree[year]) basketTree[year] = [];
    if (!basketTree[year].includes(o.name)) basketTree[year].push(o.name);
  }
  const basketYearsSorted = Object.keys(basketTree).sort();

  const allAskanimIncomes: { id: string; bachurId: string; bachurName: string; date: string; amount: number; notes: string }[] = (() => {
    try { return JSON.parse(localStorage.getItem("askanimIncomes") || "[]"); } catch { return []; }
  })();
  const askanimTree: Record<string, string[]> = {};
  for (const a of allAskanimIncomes) {
    const year = new Date(a.date).getFullYear().toString();
    const name = a.notes || "הכנסת עסקנים";
    if (!askanimTree[year]) askanimTree[year] = [];
    if (!askanimTree[year].includes(name)) askanimTree[year].push(name);
  }
  const askanimYearsSorted = Object.keys(askanimTree).sort();

  const toggleBasketYear = (year: string) => {
    const names = basketTree[year] || [];
    const allSelected = names.every((n) => selectedBasketOutings.has(`${year}::${n}`));
    const next = new Set(selectedBasketOutings);
    names.forEach((n) => allSelected ? next.delete(`${year}::${n}`) : next.add(`${year}::${n}`));
    setSelectedBasketOutings(next);
  };
  const toggleBasketOuting = (year: string, name: string) => {
    const key = `${year}::${name}`;
    const next = new Set(selectedBasketOutings);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedBasketOutings(next);
  };
  const toggleAskanimYear = (year: string) => {
    const names = askanimTree[year] || [];
    const allSelected = names.every((n) => selectedAskanimOutings.has(`${year}::${n}`));
    const next = new Set(selectedAskanimOutings);
    names.forEach((n) => allSelected ? next.delete(`${year}::${n}`) : next.add(`${year}::${n}`));
    setSelectedAskanimOutings(next);
  };
  const toggleAskanimOuting = (year: string, name: string) => {
    const key = `${year}::${name}`;
    const next = new Set(selectedAskanimOutings);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedAskanimOutings(next);
  };
  const toggleExpandBasket = (year: string) => {
    const next = new Set(expandedBasketYears);
    next.has(year) ? next.delete(year) : next.add(year);
    setExpandedBasketYears(next);
  };
  const toggleExpandAskanim = (year: string) => {
    const next = new Set(expandedAskanimYears);
    next.has(year) ? next.delete(year) : next.add(year);
    setExpandedAskanimYears(next);
  };

  const handleExport = async () => {
    const XLSX = await import("xlsx");

    // Collect selected outing names (unique, ordered)
    const basketOutingNames = exportBasketOutings
      ? [...selectedBasketOutings].map((k) => { const [, ...rest] = k.split("::"); return rest.join("::"); }).filter((v, i, a) => a.indexOf(v) === i)
      : [];
    const askanimOutingNames = exportAskanimOutings
      ? [...selectedAskanimOutings].map((k) => { const [, ...rest] = k.split("::"); return rest.join("::"); }).filter((v, i, a) => a.indexOf(v) === i)
      : [];

    // Helper: check if an outing matches any selected key
    const isBasketSelected = (o: Outing) => {
      const year = new Date(o.date).getFullYear().toString();
      return selectedBasketOutings.has(`${year}::${o.name}`);
    };
    const isAskanimSelected = (a: { date: string; notes: string }) => {
      const year = new Date(a.date).getFullYear().toString();
      return selectedAskanimOutings.has(`${year}::${a.notes || "הכנסת עסקנים"}`);
    };

    const rows = active.map((b) => {
      const row: Record<string, any> = { שם: b.name };
      if (exportCols.sku) row["מק\"ט"] = b.sku;
      if (exportCols.classLevel) row["שיעור"] = b.classLevel;
      if (exportCols.joinDate) row["תאריך הצטרפות"] = fmtDate(b.joinDate);
      if (exportCols.eligibility) row["סטטוס זכאות"] = totalIncome(b) >= minimum ? "זכאי" : "לא זכאי";
      if (exportCols.askanim) row["פרויקט עסקנים"] = b.inAskanim ? "כן" : "לא";

      if (exportBasketOutings) {
        const filtered = (b.outings || []).filter(isBasketSelected);
        for (const name of basketOutingNames) {
          row[name] = filtered.filter((o) => o.name === name).reduce((s, o) => s + o.amount, 0) || "";
        }
        row["סה\"כ סלים"] = filtered.reduce((s, o) => s + o.amount, 0);
      }

      if (exportAskanimOutings) {
        const bAsk = allAskanimIncomes.filter((a) => a.bachurId === b.id).filter(isAskanimSelected);
        for (const name of askanimOutingNames) {
          row[`${name} (עסקנים)`] = b.inAskanim ? (bAsk.filter((a) => (a.notes || "הכנסת עסקנים") === name).reduce((s, a) => s + a.amount, 0) || "") : "";
        }
        row["סה\"כ עסקנים"] = b.inAskanim ? bAsk.reduce((s, a) => s + a.amount, 0) : "";
      }

      if (exportBasketOutings || exportAskanimOutings) {
        const basketSum = exportBasketOutings ? (b.outings || []).filter(isBasketSelected).reduce((s, o) => s + o.amount, 0) : 0;
        const askanimSum = exportAskanimOutings && b.inAskanim ? allAskanimIncomes.filter((a) => a.bachurId === b.id).filter(isAskanimSelected).reduce((s, a) => s + a.amount, 0) : 0;
        row["סה\"כ כללי"] = basketSum + askanimSum;
      }

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Bold headers for sections
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      if (ws[cellRef]) {
        ws[cellRef].s = { font: { bold: true } };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "בחורים");
    XLSX.writeFile(wb, "bachurim_export.xlsx");
    setExportDialogOpen(false);
    toast.success("הקובץ הורד בהצלחה");
  };

  const getEligibilityBadge = (b: Bachur) => {
    const income = totalIncome(b);
    const pct = minimum > 0 ? income / minimum : 0;
    if (income >= minimum) return <Badge className="bg-green-600 text-white">זכאי</Badge>;
    if (pct >= 0.8) return <Badge className="bg-orange-500 text-white">קרוב לסל!</Badge>;
    return <Badge variant="destructive">לא זכאי</Badge>;
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* ─── Toolbar ─────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button onClick={() => setAddDialogOpen(true)} className="gap-1.5">
          <UserPlus className="h-4 w-4" /> הוסף בחור ידנית
        </Button>
        <MasterExcelImport />
        <Button variant="outline" className="gap-1.5" onClick={() => setExportDialogOpen(true)}>
          <Download className="h-4 w-4" /> ייצוא Excel
        </Button>
        <div className="flex-1" />
        <Button variant={showClosed ? "secondary" : "outline"} className="gap-1.5" onClick={() => setShowClosed(!showClosed)}>
          {showClosed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showClosed ? "הסתר סגורים" : `הצג סגורים (${closed.length})`}
        </Button>
      </div>

      {/* ─── Search + Filters ─────────────────── */}
      <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-lg border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="חיפוש לפי שם או מק״ט..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[160px] justify-between gap-1">
              <span className="truncate">
                {filterClass.length === 0
                  ? "כל השיעורים"
                  : `שיעור: ${filterClass.join(", ")}`}
              </span>
              {filterClass.length > 0 && (
                <Badge variant="secondary" className="ms-1">{filterClass.length}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-2" align="start">
            <div className="space-y-1">
              {CLASS_LEVELS.map((c) => (
                <label key={c} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer">
                  <Checkbox
                    checked={filterClass.includes(c)}
                    onCheckedChange={() => setFilterClass((prev) => toggleInArray(prev, c))}
                  />
                  <span className="text-sm">שיעור {c}</span>
                </label>
              ))}
              {filterClass.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => setFilterClass([])}>
                  נקה בחירה
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between gap-1">
              <span className="truncate">
                {filterStatus.length === 0
                  ? "כל הסטטוסים"
                  : filterStatus.length === 1
                    ? STATUS_OPTIONS.find((o) => o.value === filterStatus[0])?.label
                    : `${filterStatus.length} סטטוסים`}
              </span>
              {filterStatus.length > 0 && (
                <Badge variant="secondary" className="ms-1">{filterStatus.length}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-2" align="start">
            <div className="space-y-1">
              {STATUS_OPTIONS.map((o) => (
                <label key={o.value} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer">
                  <Checkbox
                    checked={filterStatus.includes(o.value)}
                    onCheckedChange={() => setFilterStatus((prev) => toggleInArray(prev, o.value))}
                  />
                  <span className="text-sm">{o.label}</span>
                </label>
              ))}
              {filterStatus.length > 0 && (
                <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => setFilterStatus([])}>
                  נקה בחירה
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
        {hasActiveFilter && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
            <X className="h-4 w-4" /> נקה
          </Button>
        )}
        <div className="text-xs text-muted-foreground ms-auto">
          {filtered.length} מתוך {bachurim.length}
        </div>
      </div>

      {/* ─── Active Table ────────────────────── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>מק"ט</TableHead>
              <TableHead>שם</TableHead>
              <TableHead>שיעור</TableHead>
              <TableHead>סה"כ הכניס</TableHead>
              <TableHead>סטטוס זכאות</TableHead>
              <TableHead>פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {active.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  אין בחורים פעילים. לחץ "הוסף בחור ידנית" להתחלה.
                </TableCell>
              </TableRow>
            ) : (
              active.map((b) => (
                <TableRow
                  key={b.id}
                  ref={registerRow(b.id) as any}
                  className={`hover:bg-muted/30 ${highlightedId === b.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`}
                >
                  <TableCell className="font-mono text-sm">{b.sku}</TableCell>
                  <TableCell>
                    <button onClick={() => setSelectedBachur(b)} className="text-primary hover:underline font-medium">
                      {b.name}
                    </button>
                  </TableCell>
                  <TableCell>{b.classLevel}</TableCell>
                  <TableCell className="font-medium">{fmtCurrency(totalIncome(b))}</TableCell>
                  <TableCell>{getEligibilityBadge(b)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        disabled={totalIncome(b) < minimum}
                        onClick={() => setConfirmAction({ type: "basket", bachur: b })}
                      >
                        <ShoppingBasket className="h-3 w-3" /> קיבל סל
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => { setMarriedDate(new Date().toISOString().slice(0, 10)); setConfirmAction({ type: "married", bachur: b }); }}
                      >
                        <Heart className="h-3 w-3" /> התחתן
                      </Button>
                      <Button
                        size="sm"
                        variant={b.inAskanim ? "ghost" : "outline"}
                        className="gap-1 text-xs"
                        disabled={b.inAskanim}
                        onClick={() => handleAskanim(b)}
                      >
                        <Users className="h-3 w-3" /> {b.inAskanim ? "מצורף" : "עסקנים"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Closed Table ────────────────────── */}
      {showClosed && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-muted/50 border-b border-border">
            <h3 className="font-semibold text-foreground">בחורים סגורים ({closed.length})</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>מק"ט</TableHead>
                <TableHead>שיעור</TableHead>
                <TableHead>תאריך חתונה</TableHead>
                <TableHead>קיבל סל</TableHead>
                <TableHead>סה"כ הכניס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closed.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">אין בחורים סגורים</TableCell></TableRow>
              ) : (
                closed.map((b) => (
                  <TableRow
                    key={b.id}
                    ref={registerRow(b.id) as any}
                    className={`bg-muted/20 ${highlightedId === b.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`}
                  >
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="font-mono text-sm">{b.sku}</TableCell>
                    <TableCell>{b.classLevel}</TableCell>
                    <TableCell>{b.marriedDate ? fmtDate(b.marriedDate) : "—"}</TableCell>
                    <TableCell>{b.receivedBasket ? <Badge className="bg-green-600 text-white">כן</Badge> : <Badge variant="secondary">לא</Badge>}</TableCell>
                    <TableCell>{fmtCurrency(totalIncome(b))}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => setConfirmAction({ type: "cancel", bachur: b })}>
                        <X className="h-3 w-3" /> בטל
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ─── Add Dialog ──────────────────────── */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף בחור חדש</DialogTitle>
            <DialogDescription>הזן שם מלא ובחר שיעור</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bachurName">שם מלא</Label>
              <Input id="bachurName" value={newName} onChange={(e) => setNewName(e.target.value)} className="mt-1" placeholder="הזן שם מלא" />
            </div>
            <div>
              <Label>שיעור</Label>
              <Select value={newClass} onValueChange={setNewClass}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLASS_LEVELS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button onClick={handleAdd}>הוסף</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Import Dialog ───────────────────── */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>ייבוא מ-Excel</DialogTitle>
            <DialogDescription>נמצאו {importData.length} שורות</DialogDescription>
          </DialogHeader>
          {importData.some((r) => r.exists) && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{importData.filter((r) => r.exists).length} בחורים כבר קיימים במערכת</span>
            </div>
          )}
          <div className="max-h-60 overflow-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow><TableHead>שם</TableHead><TableHead>שיעור</TableHead><TableHead>סטטוס</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-muted/60 font-semibold hover:bg-muted/60">
                  <TableCell>סה"כ {importData.length}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>{importData.filter((r) => r.exists).length} קיימים / {importData.filter((r) => !r.exists).length} חדשים</TableCell>
                </TableRow>
                {importData.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.classLevel}</TableCell>
                    <TableCell>{r.exists ? <Badge variant="destructive">קיים</Badge> : <Badge className="bg-green-600 text-white">חדש</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handleImport(true)}>דלג על קיימים</Button>
            <Button onClick={() => handleImport(false)}>עדכן קיימים</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Export Dialog ────────────────────── */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ייצוא Excel</DialogTitle>
            <DialogDescription>בחר עמודות לייצוא (בחורים פעילים בלבד)</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2"><Checkbox checked disabled /><Label className="text-muted-foreground">שם (חובה)</Label></div>
            {([
              ["sku", "מק\"ט"],
              ["classLevel", "שיעור"],
              ["joinDate", "תאריך הצטרפות"],
              ["eligibility", "סטטוס זכאות לסל"],
              ["askanim", "פרויקט עסקנים"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Checkbox
                  checked={exportCols[key]}
                  onCheckedChange={(v) => setExportCols({ ...exportCols, [key]: !!v })}
                  id={`exp-${key}`}
                />
                <Label htmlFor={`exp-${key}`}>{label}</Label>
              </div>
            ))}

            <Separator />

            {/* Basket outings tree */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={exportBasketOutings}
                  onCheckedChange={(v) => { setExportBasketOutings(!!v); if (!v) setSelectedBasketOutings(new Set()); }}
                  id="exp-basket-outings"
                />
                <Label htmlFor="exp-basket-outings" className="font-semibold">יציאות סלים</Label>
              </div>
              {exportBasketOutings && basketYearsSorted.length > 0 && (
                <div className="mr-6 space-y-1 max-h-40 overflow-y-auto border border-border rounded-md p-2">
                  {basketYearsSorted.map((year) => {
                    const names = basketTree[year];
                    const allSel = names.every((n) => selectedBasketOutings.has(`${year}::${n}`));
                    const someSel = names.some((n) => selectedBasketOutings.has(`${year}::${n}`));
                    return (
                      <div key={year}>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={allSel} data-indeterminate={someSel && !allSel} onCheckedChange={() => toggleBasketYear(year)} />
                          <button type="button" className="text-sm font-medium hover:underline" onClick={() => toggleExpandBasket(year)}>
                            {expandedBasketYears.has(year) ? "▾" : "▸"} {year}
                          </button>
                        </div>
                        {expandedBasketYears.has(year) && (
                          <div className="mr-6 space-y-0.5 mt-1">
                            {names.map((name) => (
                              <div key={name} className="flex items-center gap-2">
                                <Checkbox checked={selectedBasketOutings.has(`${year}::${name}`)} onCheckedChange={() => toggleBasketOuting(year, name)} />
                                <span className="text-sm">{name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Askanim outings tree */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={exportAskanimOutings}
                  onCheckedChange={(v) => { setExportAskanimOutings(!!v); if (!v) setSelectedAskanimOutings(new Set()); }}
                  id="exp-askanim-outings"
                />
                <Label htmlFor="exp-askanim-outings" className="font-semibold">יציאות פרויקט עסקנים</Label>
              </div>
              {exportAskanimOutings && askanimYearsSorted.length > 0 && (
                <div className="mr-6 space-y-1 max-h-40 overflow-y-auto border border-border rounded-md p-2">
                  {askanimYearsSorted.map((year) => {
                    const names = askanimTree[year];
                    const allSel = names.every((n) => selectedAskanimOutings.has(`${year}::${n}`));
                    const someSel = names.some((n) => selectedAskanimOutings.has(`${year}::${n}`));
                    return (
                      <div key={year}>
                        <div className="flex items-center gap-2">
                          <Checkbox checked={allSel} data-indeterminate={someSel && !allSel} onCheckedChange={() => toggleAskanimYear(year)} />
                          <button type="button" className="text-sm font-medium hover:underline" onClick={() => toggleExpandAskanim(year)}>
                            {expandedAskanimYears.has(year) ? "▾" : "▸"} {year}
                          </button>
                        </div>
                        {expandedAskanimYears.has(year) && (
                          <div className="mr-6 space-y-0.5 mt-1">
                            {names.map((name) => (
                              <div key={name} className="flex items-center gap-2">
                                <Checkbox checked={selectedAskanimOutings.has(`${year}::${name}`)} onCheckedChange={() => toggleAskanimOuting(year, name)} />
                                <span className="text-sm">{name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button onClick={handleExport} className="gap-1.5"><Download className="h-4 w-4" /> הורד Excel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Bachur Side Panel ───────────────── */}
      <Sheet open={!!selectedBachur} onOpenChange={(o) => { if (!o) setSelectedBachur(null); }}>
        <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
          {selectedBachur && (() => {
            const b = bachurim.find((x) => x.id === selectedBachur.id) || selectedBachur;
            const income = totalIncome(b);
            const pct = minimum > 0 ? income / minimum : 0;
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="text-xl">{b.name}</SheetTitle>
                  <SheetDescription>מק"ט: {b.sku}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground block">שיעור</span><span className="font-semibold text-lg">{b.classLevel}</span></div>
                    <div className="bg-muted/50 rounded-lg p-3"><span className="text-muted-foreground block">תאריך הצטרפות</span><span className="font-semibold">{fmtDate(b.joinDate)}</span></div>
                    <div className="bg-muted/50 rounded-lg p-3 col-span-2"><span className="text-muted-foreground block">סה"כ הכניס</span><span className="font-semibold text-lg">{fmtCurrency(income)}</span></div>
                  </div>

                  {/* Eligibility */}
                  <div>
                    {income >= minimum ? (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">✅ זכאי לסל!</div>
                    ) : pct >= 0.8 ? (
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm font-medium">⚠️ קרוב לסל! ({Math.round(pct * 100)}%)</div>
                    ) : (
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium">❌ לא זכאי ({fmtCurrency(minimum - income)} חסרים)</div>
                    )}
                  </div>

                  <Separator />

                  {/* Outings */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">פירוט יציאות ({b.outings.length})</h4>
                      {!b.closed && (
                        <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setAddOutingOpen(true)}>
                          <Plus className="h-3 w-3" /> הוסף הכנסה
                        </Button>
                      )}
                    </div>
                    {b.outings.length === 0 ? (
                      <p className="text-sm text-muted-foreground">אין יציאות</p>
                    ) : (
                      <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow><TableHead>שם יציאה</TableHead><TableHead>תאריך</TableHead><TableHead>סכום</TableHead><TableHead>אופן תשלום</TableHead><TableHead className="w-20">פעולות</TableHead></TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-muted/60 font-semibold hover:bg-muted/60">
                              <TableCell className="text-sm">סה"כ</TableCell>
                              <TableCell className="text-sm">{b.outings.length} יציאות</TableCell>
                              <TableCell className="text-sm">{fmtCurrency(income)}</TableCell>
                              <TableCell className="text-sm">—</TableCell>
                              <TableCell className="text-sm">—</TableCell>
                            </TableRow>
                            {b.outings.map((o) => (
                              <TableRow key={o.id}>
                                <TableCell className="text-sm">{o.name}</TableCell>
                                <TableCell className="text-sm">{fmtDate(o.date)}</TableCell>
                                <TableCell className="text-sm font-medium">{fmtCurrency(o.amount)}</TableCell>
                                <TableCell className="text-sm">{o.paymentMethod === "אחר" ? `אחר: ${o.paymentMethodDetail || ""}` : (o.paymentMethod || "—")}</TableCell>
                                <TableCell className="text-sm">
                                  <div className="flex gap-1">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEditOuting(o)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteOutingId(o.id)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="pt-2">
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => setDeleteBachurId(b.id)}
                    >
                      <Trash2 className="h-4 w-4" /> מחק בחור
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteBachurId} onOpenChange={(o) => { if (!o) setDeleteBachurId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>למחוק את הבחור?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק לצמיתות את הבחור ואת כל היציאות שלו. לא ניתן לבטל פעולה זו.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBachur} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* ─── Add Outing Dialog ───────────────── */}
      <Dialog open={addOutingOpen} onOpenChange={setAddOutingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף הכנסה ליציאה</DialogTitle>
            <DialogDescription>{selectedBachur?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>שם היציאה</Label><Input value={outingName} onChange={(e) => setOutingName(e.target.value)} className="mt-1" placeholder="למשל: מגבית חנוכה" /></div>
            <div><Label>תאריך</Label><Input type="date" value={outingDate} onChange={(e) => setOutingDate(e.target.value)} className="mt-1" /></div>
            <div><Label>סכום (₪)</Label><Input type="number" value={outingAmount} onChange={(e) => setOutingAmount(e.target.value)} className="mt-1" min={0} /></div>
            <div>
              <Label>אופן תשלום</Label>
              <Select value={outingPayment} onValueChange={(v) => { setOutingPayment(v); if (v !== "אחר") setOutingPaymentDetail(""); }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="בחר אופן תשלום" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="מזומן">מזומן</SelectItem>
                  <SelectItem value="אשראי">אשראי</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {outingPayment === "אחר" && (
              <div>
                <Label>פירוט אופן תשלום (חובה)</Label>
                <Input value={outingPaymentDetail} onChange={(e) => setOutingPaymentDetail(e.target.value)} className="mt-1" placeholder="פרט את אופן התשלום" />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button onClick={handleAddOuting} disabled={!canSaveOuting}>הוסף</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Confirm Dialogs ─────────────────── */}
      <AlertDialog open={confirmAction?.type === "basket"} onOpenChange={(o) => { if (!o) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>קיבל סל – {confirmAction?.bachur.name}</AlertDialogTitle>
            <AlertDialogDescription>
              הבחור יסומן כמקבל סל ויועבר לרשימת הסגורים. פעולה זו תרשום גם הוצאת סבסוד.
              <br />האם אתה בטוח?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmAction && handleBasket(confirmAction.bachur)}>אישור</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction?.type === "married"} onOpenChange={(o) => { if (!o) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>התחתן – {confirmAction?.bachur.name}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.bachur && !confirmAction.bachur.receivedBasket && totalIncome(confirmAction.bachur) > 0
                ? `כל הכסף שהכניס (${fmtCurrency(totalIncome(confirmAction.bachur))}) יועבר כתרומה לקופת העמותה.`
                : "הבחור יועבר לרשימת הסגורים."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 pb-2">
            <Label>תאריך חתונה</Label>
            <Input type="date" value={marriedDate} onChange={(e) => { setMarriedDate(e.target.value); setConfirmAction(confirmAction ? { ...confirmAction, date: new Date(e.target.value).toISOString() } : null); }} className="mt-1" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmAction && handleMarried(confirmAction.bachur)}>אישור</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction?.type === "cancel"} onOpenChange={(o) => { if (!o) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ביטול סטטוס – {confirmAction?.bachur.name}</AlertDialogTitle>
            <AlertDialogDescription>הבחור יוחזר לרשימת הפעילים. האם אתה בטוח?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmAction && handleCancelClosed(confirmAction.bachur)}>אישור</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Edit Outing Dialog ───────────────── */}
      <Dialog open={!!editingOuting} onOpenChange={(o) => { if (!o) setEditingOuting(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת פעולה</DialogTitle>
            <DialogDescription>{selectedBachur?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>שם היציאה</Label><Input value={editOutingName} onChange={(e) => setEditOutingName(e.target.value)} className="mt-1" /></div>
            <div><Label>תאריך</Label><Input type="date" value={editOutingDate} onChange={(e) => setEditOutingDate(e.target.value)} className="mt-1" /></div>
            <div><Label>סכום (₪)</Label><Input type="number" value={editOutingAmount} onChange={(e) => setEditOutingAmount(e.target.value)} className="mt-1" min={0} /></div>
            <div>
              <Label>אופן תשלום</Label>
              <Select value={editOutingPayment} onValueChange={(v) => { setEditOutingPayment(v); if (v !== "אחר") setEditOutingPaymentDetail(""); }}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="מזומן">מזומן</SelectItem>
                  <SelectItem value="אשראי">אשראי</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editOutingPayment === "אחר" && (
              <div>
                <Label>פירוט אופן תשלום</Label>
                <Input value={editOutingPaymentDetail} onChange={(e) => setEditOutingPaymentDetail(e.target.value)} className="mt-1" />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button onClick={handleEditOuting}>שמור שינויים</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Outing Confirm ───────────────── */}
      <AlertDialog open={!!deleteOutingId} onOpenChange={(o) => { if (!o) setDeleteOutingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת פעולה</AlertDialogTitle>
            <AlertDialogDescription>האם אתה בטוח שברצונך למחוק את הפעולה הזו? הפעולה לא ניתנת לשחזור.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOuting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
