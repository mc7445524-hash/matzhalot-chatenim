import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import type { Bachur, Outing, Income, Expense, Debt } from "@/lib/db";

// ───────── Types ─────────
type ImportKind =
  | "skip"
  | "bachurim_list"
  | "bachurim_update"
  | "bachur_income"
  | "donations"
  | "expenses"
  | "debts"
  | "mark_basket";

type ColRole =
  | "ignore"
  | "first_name"
  | "last_name"
  | "full_name"
  | "sku"
  | "class_level"
  | "date"
  | "amount"
  | "payment_method"
  | "notes"
  | "money_outing";

interface ColMap {
  role: ColRole;
  outingName?: string; // for money_outing
}

interface SheetInfo {
  name: string;
  rows: any[][];
  headerRowIndex: number;
  headers: string[];
  kind: ImportKind;
  cols: ColMap[];
  updateFields: { sku: boolean; classLevel: boolean; joinDate: boolean };
  incomeName?: string; // for bachur_income: default outing name for all amount cols
}

interface UnmatchedEntry {
  rawName: string;
  records: PendingOuting[]; // for bachur_income / mark_basket
  updates?: BachurUpdatePayload; // for bachurim_update
  resolution: { type: "ignore" } | { type: "existing"; id: string } | { type: "new" };
  newClassLevel?: string; // chosen class when resolution is "new"
}

interface PendingOuting {
  outingName: string;
  date: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  // for mark_basket only
  isBasketMark?: boolean;
}

interface BachurUpdatePayload {
  sku?: string;
  classLevel?: string;
  joinDate?: string;
}

interface DuplicateEntry {
  bachurId: string;
  bachurName: string;
  outingName: string;
  existingOutingId: string;
  existingAmount: number;
  existingDate: string;
  newOutings: Outing[];
  resolution: "update" | "add" | "skip";
}

interface ApplyPlan {
  newBachurim: Bachur[];
  outingsByExistingId: Map<string, Outing[]>;
  basketMarkByExistingId: Map<string, string>;
  updateByExistingId: Map<string, BachurUpdatePayload>;
  newIncomes: Income[];
  newExpenses: Expense[];
  newDebts: Debt[];
  summary: { sheet: string; rows: number; kind: ImportKind }[];
}

// ───────── Helpers ─────────
const KIND_LABELS: Record<ImportKind, string> = {
  skip: "אל תייבא",
  bachurim_list: "רשימת בחורים חדשים",
  bachurim_update: "עדכון בחורים קיימים",
  bachur_income: "הכנסות לבחורים (כסף לפי שם)",
  donations: "תרומות / הכנסות כלליות",
  expenses: "הוצאות",
  debts: "חובות",
  mark_basket: 'סימון "קיבל סל"',
};

const ROLE_LABELS: Record<ColRole, string> = {
  ignore: "התעלם",
  first_name: "שם פרטי",
  last_name: "שם משפחה",
  full_name: "שם מלא",
  sku: "מק״ט",
  class_level: "שיעור",
  date: "תאריך",
  amount: "סכום",
  payment_method: "אמצעי תשלום",
  notes: "הערות",
  money_outing: "סכום כסף (יציאה חדשה)",
};

function today() {
  return new Date().toISOString().split("T")[0];
}

function generateSku(used: Set<string>): string {
  let sku: string;
  do {
    sku = String(Math.floor(Math.random() * 50000) + 1).padStart(5, "0");
  } while (used.has(sku));
  used.add(sku);
  return sku;
}

function toStr(v: any): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function toNum(v: any): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(String(v).replace(/[^\d.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}

// Parse Excel serial date or various string formats → ISO YYYY-MM-DD
function parseDate(v: any): string {
  if (v === null || v === undefined || v === "") return today();
  // Excel serial number
  if (typeof v === "number" && v > 1000 && v < 100000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + v * 86400000);
    return d.toISOString().split("T")[0];
  }
  const s = String(v).trim().split(" ")[0];
  // DD/MM/YYYY or DD-MM-YYYY
  const m1 = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m1) {
    let [_, d, m, y] = m1;
    if (y.length === 2) y = "20" + y;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return today();
}

function detectHeaderRow(rows: any[][]): number {
  // First row with ≥2 non-empty string cells
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const r = rows[i] || [];
    const filled = r.filter((c) => toStr(c) !== "").length;
    if (filled >= 2) return i;
  }
  return 0;
}

function guessRole(header: string): ColRole {
  const h = header.replace(/["׳״'`]/g, "").toLowerCase();
  if (/שם.*פרטי/.test(h)) return "first_name";
  if (/שם.*משפחה|משפחה/.test(h)) return "last_name";
  if (/^שם$|שם.*מלא|שם.*בחור/.test(h)) return "full_name";
  if (/מקט|מק.*ט|sku/.test(h)) return "sku";
  if (/שיעור|כיתה|class/.test(h)) return "class_level";
  if (/תאריך|date/.test(h)) return "date";
  if (/סכום|amount|סהכ|סה.*כ/.test(h)) return "amount";
  if (/אמצעי|תשלום|מזומן|אשראי|method/.test(h)) return "payment_method";
  if (/הער|notes?/.test(h)) return "notes";
  return "ignore";
}

function buildFullName(row: any[], cols: ColMap[]): string {
  const fullIdx = cols.findIndex((c) => c.role === "full_name");
  const fnIdx = cols.findIndex((c) => c.role === "first_name");
  const lnIdx = cols.findIndex((c) => c.role === "last_name");
  const fullVal = fullIdx >= 0 ? toStr(row[fullIdx]) : "";
  const fnVal = fnIdx >= 0 ? toStr(row[fnIdx]) : "";
  const lnVal = lnIdx >= 0 ? toStr(row[lnIdx]) : "";
  // Prefer concatenating first+last when both are mapped
  if (fnVal && lnVal) return `${fnVal} ${lnVal}`.trim();
  // If only full_name is mapped, use it (optionally append last_name if it adds info)
  if (fullVal) {
    if (lnVal && !fullVal.includes(lnVal)) return `${fullVal} ${lnVal}`.trim();
    return fullVal;
  }
  // Fallback: whatever name parts exist
  return `${fnVal} ${lnVal}`.trim();
}

function normalizeName(n: string): string {
  return n.replace(/\s+/g, " ").trim();
}

// ───────── Component ─────────
export default function MasterExcelImport() {
  const {
    bachurim, incomes, expenses, debts,
    setBachurim, setIncomes, setExpenses, setDebts,
  } = useData();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [importing, setImporting] = useState(false);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedEntry[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateEntry[]>([]);
  const [savedPlan, setSavedPlan] = useState<ApplyPlan | null>(null);
  const [savedCounts, setSavedCounts] = useState<{
    createdCount: number;
    mappedCount: number;
    ignoredCount: number;
  }>({ createdCount: 0, mappedCount: 0, ignoredCount: 0 });
  const [pendingResults, setPendingResults] = useState<{
    newBachurim: Bachur[];
    addOutingsByBachurId: Map<string, Outing[]>;
    markBasketByBachurId: Map<string, string>;
    updateBachurById: Map<string, BachurUpdatePayload>;
    newIncomes: Income[];
    newExpenses: Expense[];
    newDebts: Debt[];
    summary: { sheet: string; rows: number; kind: ImportKind }[];
  } | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep(1);
    setSheets([]);
    setUnmatched([]);
    setDuplicates([]);
    setSavedPlan(null);
    setPendingResults(null);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) reset();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const infos: SheetInfo[] = wb.SheetNames.map((name) => {
        const ws = wb.Sheets[name];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: true });
        const headerRowIndex = detectHeaderRow(rows);
        const headers = (rows[headerRowIndex] || []).map((c, i) =>
          toStr(c) || `עמודה ${i + 1}`
        );
        const cols: ColMap[] = headers.map((h) => ({ role: guessRole(h) }));
        return {
          name,
          rows,
          headerRowIndex,
          headers,
          kind: "skip" as ImportKind,
          cols,
          updateFields: { sku: true, classLevel: true, joinDate: true },
        };
      });
      setSheets(infos);
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בקריאת הקובץ");
    } finally {
      setImporting(false);
    }
  }

  function updateSheet(idx: number, patch: Partial<SheetInfo>) {
    setSheets((s) =>
      s.map((sh, i) => {
        if (i !== idx) return sh;
        const merged = { ...sh, ...patch };
        return merged;
      }),
    );
  }

  function updateCol(sheetIdx: number, colIdx: number, patch: Partial<ColMap>) {
    setSheets((s) =>
      s.map((sh, i) =>
        i !== sheetIdx
          ? sh
          : { ...sh, cols: sh.cols.map((c, j) => (j === colIdx ? { ...c, ...patch } : c)) }
      )
    );
  }

  const activeSheets = sheets.filter((s) => s.kind !== "skip");

  function goToMapping() {
    if (activeSheets.length === 0) {
      toast.error("יש לבחור לפחות לשונית אחת לייבוא");
      return;
    }
    setStep(3);
  }

  // ───────── Build pending records ─────────
  function processSheets() {
    // Validate bachur_income sheets: must have an income name (sheet-level or per-column)
    for (const sh of activeSheets) {
      if (sh.kind !== "bachur_income") continue;
      const hasAmountCol = sh.cols.some(
        (c) => c.role === "amount" || c.role === "money_outing",
      );
      if (!hasAmountCol) continue;
      const sheetName = sh.incomeName?.trim();
      const allColsHaveName = sh.cols
        .filter((c) => c.role === "money_outing" || c.role === "amount")
        .every((c) => c.outingName?.trim() || sheetName);
      if (!sheetName && !allColsHaveName) {
        toast.error(`בלשונית "${sh.name}" יש להזין שם להכנסה (למשל: "מצהלות פסח")`);
        return;
      }
    }

    const usedSkus = new Set(bachurim.map((b) => b.sku));
    const nameToBachur = new Map<string, Bachur>();
    for (const b of bachurim) nameToBachur.set(normalizeName(b.name), b);

    const newBachurim: Bachur[] = [];
    const addOutingsByBachurId = new Map<string, Outing[]>();
    const markBasketByBachurId = new Map<string, string>();
  const updateBachurById = new Map<string, BachurUpdatePayload>();
    const newIncomes: Income[] = [];
    const newExpenses: Expense[] = [];
    const newDebts: Debt[] = [];
    const summary: { sheet: string; rows: number; kind: ImportKind }[] = [];
    const unmatchedMap = new Map<string, UnmatchedEntry>();

    function addUnmatched(name: string, rec: PendingOuting) {
      const key = normalizeName(name);
      if (!unmatchedMap.has(key)) {
        unmatchedMap.set(key, { rawName: name, records: [], resolution: { type: "new" } });
      }
      unmatchedMap.get(key)!.records.push(rec);
    }

    function addUnmatchedUpdate(name: string, upd: BachurUpdatePayload) {
      const key = normalizeName(name);
      if (!unmatchedMap.has(key)) {
        unmatchedMap.set(key, { rawName: name, records: [], resolution: { type: "new" } });
      }
      const e = unmatchedMap.get(key)!;
      e.updates = { ...(e.updates || {}), ...upd };
    }

    function addOutingToBachur(bachurId: string, o: Outing) {
      const list = addOutingsByBachurId.get(bachurId) || [];
      list.push(o);
      addOutingsByBachurId.set(bachurId, list);
    }

    for (const sh of activeSheets) {
      let count = 0;
      const dataStart = sh.headerRowIndex + 1;

      for (let r = dataStart; r < sh.rows.length; r++) {
        const row = sh.rows[r];
        if (!row || row.every((c) => toStr(c) === "")) continue;

        if (sh.kind === "bachurim_list") {
          const name = buildFullName(row, sh.cols);
          if (!name) continue;
          if (nameToBachur.has(normalizeName(name))) continue;
          const skuCol = sh.cols.findIndex((c) => c.role === "sku");
          const classCol = sh.cols.findIndex((c) => c.role === "class_level");
          const useSku = sh.updateFields.sku && skuCol >= 0 && toStr(row[skuCol]);
          const useClass = sh.updateFields.classLevel && classCol >= 0 && toStr(row[classCol]);
          const b: Bachur = {
            id: crypto.randomUUID(),
            sku: useSku ? toStr(row[skuCol]) : generateSku(usedSkus),
            name,
            classLevel: useClass ? toStr(row[classCol]) : "א",
            joinDate: new Date().toISOString(),
            outings: [],
            married: false,
            receivedBasket: false,
            inAskanim: false,
            closed: false,
          };
          usedSkus.add(b.sku);
          newBachurim.push(b);
          nameToBachur.set(normalizeName(name), b);
          count++;
        } else if (sh.kind === "bachurim_update") {
          const name = buildFullName(row, sh.cols);
          if (!name) continue;
          const skuCol = sh.cols.findIndex((c) => c.role === "sku");
          const classCol = sh.cols.findIndex((c) => c.role === "class_level");
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const upd: BachurUpdatePayload = {};
          if (sh.updateFields.sku && skuCol >= 0) {
            const v = toStr(row[skuCol]);
            if (v) upd.sku = v;
          }
          if (sh.updateFields.classLevel && classCol >= 0) {
            const v = toStr(row[classCol]);
            if (v) upd.classLevel = v;
          }
          if (sh.updateFields.joinDate && dateCol >= 0) {
            const v = toStr(row[dateCol]);
            if (v) upd.joinDate = parseDate(row[dateCol]);
          }
          if (Object.keys(upd).length === 0) continue;
          const existing = nameToBachur.get(normalizeName(name));
          if (existing) {
            const prev = updateBachurById.get(existing.id) || {};
            updateBachurById.set(existing.id, { ...prev, ...upd });
          } else {
            addUnmatchedUpdate(name, upd);
          }
          count++;
        } else if (sh.kind === "bachur_income") {
          const name = buildFullName(row, sh.cols);
          if (!name) continue;
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const payCol = sh.cols.findIndex((c) => c.role === "payment_method");
          const noteCol = sh.cols.findIndex((c) => c.role === "notes");
          const date = dateCol >= 0 ? parseDate(row[dateCol]) : today();
          const payment = payCol >= 0 ? toStr(row[payCol]) || "אחר" : "אחר";
          const notes = noteCol >= 0 ? toStr(row[noteCol]) : undefined;
          const sheetIncomeName = sh.incomeName?.trim() || "";

          const recs: PendingOuting[] = [];
          // money_outing + amount columns — both treated as income amounts
          sh.cols.forEach((c, i) => {
            if (c.role !== "money_outing" && c.role !== "amount") return;
            const amt = toNum(row[i]);
            if (amt <= 0) return;
            const outingName =
              c.outingName?.trim() || sheetIncomeName || "הכנסה";
            recs.push({
              outingName,
              date,
              amount: amt,
              paymentMethod: payment,
              notes,
            });
          });
          if (recs.length === 0) continue;

          const existing = nameToBachur.get(normalizeName(name));
          if (existing) {
            for (const rec of recs) {
              addOutingToBachur(existing.id, {
                id: crypto.randomUUID(),
                name: rec.outingName,
                date: rec.date,
                amount: rec.amount,
                paymentMethod: rec.paymentMethod,
                paymentMethodDetail: rec.notes,
              });
            }
          } else {
            for (const rec of recs) addUnmatched(name, rec);
          }
          count += recs.length;
        } else if (sh.kind === "donations") {
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const amountCol = sh.cols.findIndex((c) => c.role === "amount");
          const noteCol = sh.cols.findIndex((c) => c.role === "notes");
          const payCol = sh.cols.findIndex((c) => c.role === "payment_method");
          if (amountCol < 0) continue;
          const amt = toNum(row[amountCol]);
          if (amt <= 0) continue;
          const desc = noteCol >= 0 ? toStr(row[noteCol]) : "";
          const pay = payCol >= 0 ? toStr(row[payCol]) : "";
          newIncomes.push({
            id: crypto.randomUUID(),
            description: desc || "תרומה",
            amount: amt,
            date: dateCol >= 0 ? parseDate(row[dateCol]) : today(),
            category: pay || "תרומות",
            target: "amuta",
            recognized: false,
            auto: false,
          });
          count++;
        } else if (sh.kind === "expenses") {
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const amountCol = sh.cols.findIndex((c) => c.role === "amount");
          const noteCol = sh.cols.findIndex((c) => c.role === "notes");
          if (amountCol < 0) continue;
          const amt = toNum(row[amountCol]);
          if (amt <= 0) continue;
          newExpenses.push({
            id: crypto.randomUUID(),
            amount: amt,
            date: dateCol >= 0 ? parseDate(row[dateCol]) : today(),
            category: "עמותה",
            subCategory: "שונות",
            notes: noteCol >= 0 ? toStr(row[noteCol]) : "ייבוא מאקסל",
            contactPerson: "",
            recognized: false,
          });
          count++;
        } else if (sh.kind === "debts") {
          const name = buildFullName(row, sh.cols);
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const amountCol = sh.cols.findIndex((c) => c.role === "amount");
          const noteCol = sh.cols.findIndex((c) => c.role === "notes");
          if (amountCol < 0) continue;
          const amt = toNum(row[amountCol]);
          if (amt <= 0) continue;
          newDebts.push({
            id: crypto.randomUUID(),
            date: dateCol >= 0 ? parseDate(row[dateCol]) : today(),
            name: name || "ללא שם",
            amount: amt,
            notes: noteCol >= 0 ? toStr(row[noteCol]) : "",
            returned: false,
          });
          count++;
        } else if (sh.kind === "mark_basket") {
          const name = buildFullName(row, sh.cols);
          if (!name) continue;
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const date = dateCol >= 0 ? parseDate(row[dateCol]) : today();
          const existing = nameToBachur.get(normalizeName(name));
          if (existing) {
            markBasketByBachurId.set(existing.id, date);
          } else {
            addUnmatched(name, {
              outingName: "סל",
              date,
              amount: 0,
              paymentMethod: "",
              isBasketMark: true,
            });
          }
          count++;
        }
      }
      summary.push({ sheet: sh.name, rows: count, kind: sh.kind });
    }

    setPendingResults({
      newBachurim,
      addOutingsByBachurId,
      markBasketByBachurId,
      updateBachurById,
      newIncomes,
      newExpenses,
      newDebts,
      summary,
    });

    const unmatchedList = Array.from(unmatchedMap.values());
    if (unmatchedList.length > 0) {
      setUnmatched(unmatchedList);
      setStep(4);
    } else {
      finalize(null, {
        newBachurim, addOutingsByBachurId, markBasketByBachurId, updateBachurById,
        newIncomes, newExpenses, newDebts, summary,
      });
    }
  }

  // ───────── Build plan + detect duplicates ─────────
  function buildPlanAndDuplicates(
    unmatchedRes: UnmatchedEntry[] | null,
    res: NonNullable<typeof pendingResults>,
  ): { plan: ApplyPlan; duplicates: DuplicateEntry[]; createdCount: number; mappedCount: number; ignoredCount: number } {
    const newBachurim: Bachur[] = [...res.newBachurim];
    const outingsByExistingId = new Map<string, Outing[]>();
    res.addOutingsByBachurId.forEach((o, k) => outingsByExistingId.set(k, [...o]));
    const basketMarkByExistingId = new Map<string, string>(res.markBasketByBachurId);
    const updateByExistingId = new Map<string, BachurUpdatePayload>(res.updateBachurById);

    const usedSkus = new Set(bachurim.map((b) => b.sku));
    newBachurim.forEach((b) => usedSkus.add(b.sku));

    let createdCount = 0, mappedCount = 0, ignoredCount = 0;

    if (unmatchedRes) {
      const byNameNew = new Map<string, Bachur>();
      for (const u of unmatchedRes) {
        if (u.resolution.type === "ignore") { ignoredCount++; continue; }
        let targetId: string | null = null;
        let targetNewBachur: Bachur | null = null;
        if (u.resolution.type === "existing") {
          targetId = u.resolution.id;
          mappedCount++;
          if (u.updates) {
            const prev = updateByExistingId.get(targetId) || {};
            updateByExistingId.set(targetId, { ...prev, ...u.updates });
          }
        } else {
          const key = normalizeName(u.rawName);
          const existingNew = byNameNew.get(key);
          if (existingNew) {
            targetNewBachur = existingNew;
          } else {
            const nb: Bachur = {
              id: crypto.randomUUID(),
              sku: u.updates?.sku || generateSku(usedSkus),
              name: u.rawName,
              classLevel: u.updates?.classLevel || u.newClassLevel || "א",
              joinDate: u.updates?.joinDate || new Date().toISOString(),
              outings: [],
              married: false,
              receivedBasket: false,
              inAskanim: false,
              closed: false,
            };
            newBachurim.push(nb);
            byNameNew.set(key, nb);
            targetNewBachur = nb;
            createdCount++;
          }
        }
        for (const rec of u.records) {
          if (rec.isBasketMark) {
            if (targetId) basketMarkByExistingId.set(targetId, rec.date);
            else if (targetNewBachur) {
              targetNewBachur.receivedBasket = true;
              targetNewBachur.basketDate = rec.date;
            }
          } else {
            const o: Outing = {
              id: crypto.randomUUID(),
              name: rec.outingName,
              date: rec.date,
              amount: rec.amount,
              paymentMethod: rec.paymentMethod || "אחר",
              paymentMethodDetail: rec.notes,
            };
            if (targetId) {
              const cur = outingsByExistingId.get(targetId) || [];
              cur.push(o);
              outingsByExistingId.set(targetId, cur);
            } else if (targetNewBachur) {
              targetNewBachur.outings.push(o);
            }
          }
        }
      }
    }

    // Detect duplicates against original existing bachurim outings
    const duplicates: DuplicateEntry[] = [];
    outingsByExistingId.forEach((outings, bId) => {
      const b = bachurim.find((x) => x.id === bId);
      if (!b) return;
      const byName = new Map<string, Outing[]>();
      for (const o of outings) {
        const key = normalizeName(o.name);
        const arr = byName.get(key) || [];
        arr.push(o);
        byName.set(key, arr);
      }
      const remaining: Outing[] = [];
      byName.forEach((newOuts, key) => {
        const existing = b.outings.find((o) => normalizeName(o.name) === key);
        if (existing) {
          duplicates.push({
            bachurId: bId,
            bachurName: b.name,
            outingName: newOuts[0].name,
            existingOutingId: existing.id,
            existingAmount: existing.amount,
            existingDate: existing.date,
            newOutings: newOuts,
            resolution: "add",
          });
        } else {
          remaining.push(...newOuts);
        }
      });
      if (remaining.length > 0) outingsByExistingId.set(bId, remaining);
      else outingsByExistingId.delete(bId);
    });

    const plan: ApplyPlan = {
      newBachurim,
      outingsByExistingId,
      basketMarkByExistingId,
      updateByExistingId,
      newIncomes: res.newIncomes,
      newExpenses: res.newExpenses,
      newDebts: res.newDebts,
      summary: res.summary,
    };
    return { plan, duplicates, createdCount, mappedCount, ignoredCount };
  }

  function finalize(
    unmatchedRes: UnmatchedEntry[] | null,
    res: NonNullable<typeof pendingResults>,
  ) {
    const built = buildPlanAndDuplicates(unmatchedRes, res);
    if (built.duplicates.length === 0) {
      commit(built.plan, [], built.createdCount, built.mappedCount, built.ignoredCount);
    } else {
      setSavedPlan(built.plan);
      setDuplicates(built.duplicates);
      // Store counts on the plan summary tail via a closure — keep on state for commit later
      setSavedCounts({
        createdCount: built.createdCount,
        mappedCount: built.mappedCount,
        ignoredCount: built.ignoredCount,
      });
      setStep(5);
    }
  }

  function commit(
    plan: ApplyPlan,
    dupRes: DuplicateEntry[],
    createdCount: number,
    mappedCount: number,
    ignoredCount: number,
  ) {
    const updated: Bachur[] = bachurim.map((b) => ({ ...b, outings: [...b.outings] }));
    const byId = new Map(updated.map((b) => [b.id, b]));
    for (const nb of plan.newBachurim) { updated.push(nb); byId.set(nb.id, nb); }

    plan.outingsByExistingId.forEach((outings, bId) => {
      const b = byId.get(bId);
      if (b) b.outings.push(...outings);
    });

    plan.basketMarkByExistingId.forEach((date, bId) => {
      const b = byId.get(bId);
      if (b) { b.receivedBasket = true; b.basketDate = date; }
    });

    let updatedCount = 0;
    plan.updateByExistingId.forEach((upd, bId) => {
      const b = byId.get(bId);
      if (!b) return;
      if (upd.sku !== undefined) b.sku = upd.sku;
      if (upd.classLevel !== undefined) b.classLevel = upd.classLevel;
      if (upd.joinDate !== undefined) b.joinDate = upd.joinDate;
      updatedCount++;
    });

    let dupUpdated = 0, dupAdded = 0, dupSkipped = 0;
    for (const d of dupRes) {
      const b = byId.get(d.bachurId);
      if (!b) continue;
      if (d.resolution === "skip") { dupSkipped++; continue; }
      if (d.resolution === "update") {
        const o = b.outings.find((x) => x.id === d.existingOutingId);
        if (o) {
          o.amount = d.newOutings.reduce((s, n) => s + n.amount, 0);
          o.date = d.newOutings.reduce((m, n) => (n.date > m ? n.date : m), d.newOutings[0].date);
          const last = d.newOutings[d.newOutings.length - 1];
          if (last.paymentMethod) o.paymentMethod = last.paymentMethod;
          if (last.paymentMethodDetail !== undefined) o.paymentMethodDetail = last.paymentMethodDetail;
          dupUpdated++;
        }
      } else {
        b.outings.push(...d.newOutings);
        dupAdded++;
      }
    }

    setBachurim(updated);
    if (plan.newIncomes.length > 0) setIncomes([...incomes, ...plan.newIncomes]);
    if (plan.newExpenses.length > 0) setExpenses([...expenses, ...plan.newExpenses]);
    if (plan.newDebts.length > 0) setDebts([...debts, ...plan.newDebts]);

    const summaryMsg = plan.summary.map((s) => `${s.sheet}: ${s.rows}`).join(" | ");
    const extras: string[] = [];
    if (updatedCount) extras.push(`${updatedCount} בחורים עודכנו`);
    if (createdCount) extras.push(`${createdCount} בחורים חדשים`);
    if (mappedCount) extras.push(`${mappedCount} מופו`);
    if (ignoredCount) extras.push(`${ignoredCount} נמחקו`);
    if (dupUpdated) extras.push(`${dupUpdated} כפולים עודכנו`);
    if (dupAdded) extras.push(`${dupAdded} כפולים נוספו`);
    if (dupSkipped) extras.push(`${dupSkipped} כפולים דולגו`);
    toast.success(`ייבוא הושלם — ${summaryMsg}${extras.length ? " | " + extras.join(", ") : ""}`);
    handleOpenChange(false);
  }

  // ───────── UI ─────────
  const hasUnmatched = unmatched.length > 0;
  const hasDuplicates = duplicates.length > 0;
  const totalSteps = 3 + (hasUnmatched ? 1 : 0) + (hasDuplicates ? 1 : 0);

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFile}
        className="hidden"
      />
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 ml-2" />
        ייבוא Excel
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              ייבוא חכם מאקסל — שלב {step} מתוך {totalSteps}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && "בחר קובץ Excel לסריקה"}
              {step === 2 && "בחר אילו לשוניות לייבא ומה הסוג שלהן"}
              {step === 3 && "מפה את העמודות בכל לשונית"}
              {step === 4 && "טיפול בשמות בחורים שלא זוהו במערכת"}
              {step === 5 && "נמצאו כפילויות — בחר לעדכן או להוסיף"}
            </DialogDescription>
          </DialogHeader>

          {/* ───── Step 1 ───── */}
          {step === 1 && (
            <div className="py-8 text-center">
              <Button
                size="lg"
                onClick={() => fileRef.current?.click()}
                disabled={importing}
              >
                <Upload className="h-4 w-4 ml-2" />
                {importing ? "טוען..." : "בחר קובץ Excel"}
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                המערכת תסרוק את כל הלשוניות והעמודות ותשאל אותך מה לייבא
              </p>
            </div>
          )}

          {/* ───── Step 2: Sheet selection ───── */}
          {step === 2 && (
            <div className="space-y-3">
              {sheets.map((sh, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={sh.kind !== "skip"}
                        onCheckedChange={(v) =>
                          updateSheet(i, { kind: v ? "bachur_income" : "skip" })
                        }
                      />
                      <span className="font-semibold">{sh.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({sh.rows.length - sh.headerRowIndex - 1} שורות, {sh.headers.length} עמודות)
                      </span>
                    </div>
                    {sh.kind !== "skip" && (
                      <Select
                        value={sh.kind}
                        onValueChange={(v) => updateSheet(i, { kind: v as ImportKind })}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(KIND_LABELS) as ImportKind[])
                            .filter((k) => k !== "skip")
                            .map((k) => (
                              <SelectItem key={k} value={k}>
                                {KIND_LABELS[k]}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    כותרות: {sh.headers.slice(0, 8).join(" | ")}
                    {sh.headers.length > 8 && " ..."}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ───── Step 3: Column mapping ───── */}
          {step === 3 && (
            <div className="space-y-6">
              {activeSheets.map((sh) => {
                const sheetIdx = sheets.indexOf(sh);
                const sampleRow = sh.rows[sh.headerRowIndex + 1] || [];
                return (
                  <div key={sheetIdx} className="border rounded-lg p-3">
                    <div className="font-semibold mb-2">
                      {sh.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        ({KIND_LABELS[sh.kind]})
                      </span>
                    </div>
                    {(sh.kind === "bachurim_list" || sh.kind === "bachurim_update") && (
                      <div className="flex items-center gap-4 mb-3 p-2 bg-muted/40 rounded">
                        <span className="text-sm font-medium">שדות לעדכון:</span>
                        {([
                          ["sku", "מק״ט"],
                          ["classLevel", "שיעור"],
                          ["joinDate", "תאריך הצטרפות"],
                        ] as const).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={sh.updateFields[key]}
                              onCheckedChange={(v) =>
                                updateSheet(sheetIdx, {
                                  updateFields: { ...sh.updateFields, [key]: !!v },
                                })
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    )}
                    {sh.kind === "bachur_income" && (
                      <div className="flex items-center gap-3 mb-3 p-3 bg-primary/5 border border-primary/20 rounded">
                        <span className="text-sm font-medium whitespace-nowrap">
                          איך לקרוא להכנסה הזאת?
                        </span>
                        <Input
                          value={sh.incomeName || ""}
                          onChange={(e) =>
                            updateSheet(sheetIdx, { incomeName: e.target.value })
                          }
                          placeholder='למשל: מצהלות פסח, בין הזמנים תשפ״ו, הכנסת עסקנים'
                          className="flex-1"
                        />
                      </div>
                    )}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">כותרת בקובץ</TableHead>
                          <TableHead className="text-right">דוגמה</TableHead>
                          <TableHead className="text-right">סוג</TableHead>
                          <TableHead className="text-right">שם יציאה</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sh.headers.map((h, j) => {
                          const col = sh.cols[j];
                          return (
                            <TableRow key={j}>
                              <TableCell className="font-medium">{h}</TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                                {toStr(sampleRow[j])}
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={col.role}
                                  onValueChange={(v) =>
                                    updateCol(sheetIdx, j, { role: v as ColRole })
                                  }
                                >
                                  <SelectTrigger className="w-44">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(Object.keys(ROLE_LABELS) as ColRole[]).map((r) => (
                                      <SelectItem key={r} value={r}>
                                        {ROLE_LABELS[r]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                {col.role === "money_outing" ? (
                                  <Input
                                    value={col.outingName || ""}
                                    onChange={(e) =>
                                      updateCol(sheetIdx, j, { outingName: e.target.value })
                                    }
                                    placeholder='לדוגמה: "בין הזמנים תשפ״ו"'
                                    className="w-56"
                                  />
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          )}

          {/* ───── Step 4: Unmatched bachurim ───── */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  נמצאו {unmatched.length} שמות שלא מזוהים. בחר מה לעשות עם כל אחד:
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setUnmatched((u) => u.map((e) => ({ ...e, resolution: { type: "new" } })))
                    }
                  >
                    הכל: הוסף כחדש
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setUnmatched((u) => u.map((e) => ({ ...e, resolution: { type: "ignore" } })))
                    }
                  >
                    הכל: מחק
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-muted/40 rounded text-sm">
                <span>שייך את כל הבחורים החדשים לשיעור:</span>
                <Select
                  onValueChange={(v) =>
                    setUnmatched((arr) =>
                      arr.map((e) => (e.resolution.type === "new" ? { ...e, newClassLevel: v } : e))
                    )
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="בחר שיעור" />
                  </SelectTrigger>
                  <SelectContent>
                    {["א", "ב", "ג", "ד", "ה", "ו"].map((c) => (
                      <SelectItem key={c} value={c}>
                        שיעור {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">שם מהאקסל</TableHead>
                    <TableHead className="text-right">סה״כ סכום</TableHead>
                    <TableHead className="text-right">רשומות</TableHead>
                    <TableHead className="text-right">פעולה</TableHead>
                    <TableHead className="text-right">בחור קיים</TableHead>
                    <TableHead className="text-right">שיעור (לחדש)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unmatched.map((u, i) => {
                    const total = u.records.reduce((s, r) => s + r.amount, 0);
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{u.rawName}</TableCell>
                        <TableCell>{total.toLocaleString()} ₪</TableCell>
                        <TableCell>{u.records.length}</TableCell>
                        <TableCell>
                          <Select
                            value={u.resolution.type}
                            onValueChange={(v) =>
                              setUnmatched((arr) =>
                                arr.map((e, idx) =>
                                  idx !== i
                                    ? e
                                    : {
                                        ...e,
                                        resolution:
                                          v === "existing"
                                            ? { type: "existing", id: bachurim[0]?.id || "" }
                                            : v === "new"
                                            ? { type: "new" }
                                            : { type: "ignore" },
                                      }
                                )
                              )
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">הוסף כבחור חדש</SelectItem>
                              <SelectItem value="existing">שייך לבחור קיים</SelectItem>
                              <SelectItem value="ignore">מחק / התעלם</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {u.resolution.type === "existing" && (
                            <Select
                              value={u.resolution.id}
                              onValueChange={(v) =>
                                setUnmatched((arr) =>
                                  arr.map((e, idx) =>
                                    idx !== i
                                      ? e
                                      : { ...e, resolution: { type: "existing", id: v } }
                                  )
                                )
                              }
                            >
                              <SelectTrigger className="w-56">
                                <SelectValue placeholder="בחר בחור..." />
                              </SelectTrigger>
                              <SelectContent>
                                {bachurim.map((b) => (
                                  <SelectItem key={b.id} value={b.id}>
                                    {b.name} ({b.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          {u.resolution.type === "new" && (
                            <Select
                              value={u.newClassLevel || "א"}
                              onValueChange={(v) =>
                                setUnmatched((arr) =>
                                  arr.map((e, idx) =>
                                    idx !== i ? e : { ...e, newClassLevel: v }
                                  )
                                )
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {["א", "ב", "ג", "ד", "ה", "ו"].map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {c}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* ───── Step 5: Duplicates ───── */}
          {step === 5 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  נמצאו {duplicates.length} כפילויות (אותו בחור + שם הכנסה שכבר קיים). בחר מה לעשות עם כל אחד:
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDuplicates((d) => d.map((e) => ({ ...e, resolution: "update" })))}
                  >
                    הכל: עדכן
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDuplicates((d) => d.map((e) => ({ ...e, resolution: "add" })))}
                  >
                    הכל: הוסף שורה חדשה
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDuplicates((d) => d.map((e) => ({ ...e, resolution: "skip" })))}
                  >
                    הכל: דלג
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">בחור</TableHead>
                    <TableHead className="text-right">שם הכנסה</TableHead>
                    <TableHead className="text-right">קיים</TableHead>
                    <TableHead className="text-right">חדש</TableHead>
                    <TableHead className="text-right">פעולה</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duplicates.map((d, i) => {
                    const newSum = d.newOutings.reduce((s, n) => s + n.amount, 0);
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{d.bachurName}</TableCell>
                        <TableCell>{d.outingName}</TableCell>
                        <TableCell className="text-xs">
                          {d.existingAmount.toLocaleString()} ₪
                          <span className="text-muted-foreground"> ({d.existingDate})</span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {newSum.toLocaleString()} ₪
                          {d.newOutings.length > 1 && (
                            <span className="text-muted-foreground"> ({d.newOutings.length} שורות)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={d.resolution}
                            onValueChange={(v) =>
                              setDuplicates((arr) =>
                                arr.map((e, idx) => (idx !== i ? e : { ...e, resolution: v as DuplicateEntry["resolution"] }))
                              )
                            }
                          >
                            <SelectTrigger className="w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="update">עדכן את הקיים</SelectItem>
                              <SelectItem value="add">הוסף כשורה חדשה</SelectItem>
                              <SelectItem value="skip">דלג / התעלם</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="flex gap-2 justify-between sm:justify-between">
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>
              <X className="h-4 w-4 ml-2" />
              ביטול
            </Button>
            <div className="flex gap-2">
              {step > 1 && step < 4 && (
                <Button
                  variant="outline"
                  onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                >
                  <ArrowRight className="h-4 w-4 ml-2" />
                  חזור
                </Button>
              )}
              {step === 2 && (
                <Button onClick={goToMapping}>
                  המשך לבחירת עמודות
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              )}
              {step === 3 && (
                <Button onClick={processSheets}>
                  בדוק נתונים
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              )}
              {step === 4 && (
                <Button
                  onClick={() => {
                    if (pendingResults) finalize(unmatched, pendingResults);
                  }}
                >
                  המשך
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              )}
              {step === 5 && (
                <Button
                  onClick={() => {
                    if (savedPlan) {
                      commit(savedPlan, duplicates, savedCounts.createdCount, savedCounts.mappedCount, savedCounts.ignoredCount);
                    }
                  }}
                >
                  שמור ייבוא
                  <ArrowLeft className="h-4 w-4 mr-2" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}