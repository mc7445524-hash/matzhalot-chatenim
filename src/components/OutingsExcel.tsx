import { useRef, useState } from "react";
import { FileDown, FileUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Bachur, Outing } from "@/components/BachurimModule";
import {
  todayIso, toStr, parseAmount, parseDate, normalizeName, normalizeHeader, fmtDateHe,
} from "@/lib/excel";

/** Excel round-trip for a single outing.
 *
 *  Download a form listing every relevant bachur, fill in the amounts in
 *  Excel, upload it back. One file is one outing: its name and date are
 *  written once at the top of the sheet instead of repeated on every row.
 *
 *  In basket mode the form has three amount columns, because an Outing
 *  carries exactly one paymentMethod — so a bachur who paid partly in cash
 *  and partly by card becomes two outings under the same name, which is
 *  what adding them by hand twice would have produced.
 *
 *  Askanim mode has a single amount column: an AskanimIncome has no
 *  paymentMethod field at all, so splitting there would record three
 *  indistinguishable rows.
 */

type Mode = "basket" | "askanim";

const PAYMENT_COLUMNS = ["מזומן", "אשראי", "אחר"] as const;

const HDR_SKU = 'מק"ט';
const HDR_NAME = "שם";
const HDR_CLASS = "שיעור";
const HDR_SOFAR = "הוכנס עד כה";
const HDR_DETAIL = 'פירוט ל"אחר"';
const HDR_NOTES = "הערות";
const HDR_AMOUNT = "סכום";
const LBL_OUTING_NAME = "שם היציאה:";
const LBL_DATE = "תאריך:";

interface AskanimIncomeRow {
  id: string;
  bachurId: string;
  bachurName: string;
  date: string;
  amount: number;
  notes: string;
}

/** One amount cell that will become one saved record. */
interface Part {
  method: string;
  amount: number;
  detail?: string;
}

interface OkRow {
  excelRow: number;
  bachurId: string;
  name: string;
  parts: Part[];
  total: number;
  duplicate: boolean;
  notes: string;
}

interface BadRow {
  excelRow: number;
  name: string;
  reason: string;
}

interface Plan {
  outingName: string;
  date: string;
  ok: OkRow[];
  bad: BadRow[];
  empty: BadRow[];
}

function loadAskanimIncomes(): AskanimIncomeRow[] {
  try {
    return JSON.parse(localStorage.getItem("askanimIncomes") || "[]");
  } catch { return []; }
}

function fmtMoney(n: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", minimumFractionDigits: 0,
  }).format(n);
}

interface Props {
  mode: Mode;
  bachurim: Bachur[];
  /** Called after a successful save so the parent re-reads localStorage. */
  onDone: () => void;
}

export default function OutingsExcel({ mode, bachurim, onDone }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(false);
  const [openSection, setOpenSection] = useState<"ok" | "bad" | "empty" | null>("ok");

  const isAskanim = mode === "askanim";
  const label = isAskanim ? "עסקנים" : "בחורים";

  /** Who appears in the downloaded form. Matching on upload still runs
   *  against the whole list, so a bachur whose status changed meanwhile
   *  is not rejected. */
  const formRows = isAskanim
    ? bachurim.filter((b) => b.inAskanim && !b.married)
    : bachurim.filter((b) => !b.closed && !b.married);

  // ─── Download the form ──────────────────────────────────────
  const handleDownload = async () => {
    if (formRows.length === 0) {
      toast.error(`אין ${label} להוריד`);
      return;
    }
    const XLSX = await import("xlsx");

    const askanimByBachur = new Map<string, number>();
    if (isAskanim) {
      for (const inc of loadAskanimIncomes()) {
        askanimByBachur.set(inc.bachurId, (askanimByBachur.get(inc.bachurId) || 0) + (inc.amount || 0));
      }
    }
    const soFar = (b: Bachur) =>
      isAskanim
        ? askanimByBachur.get(b.id) || 0
        : (b.outings || []).reduce((s, o) => s + (o.amount || 0), 0);

    const headers = isAskanim
      ? [HDR_SKU, HDR_NAME, HDR_CLASS, HDR_SOFAR, HDR_AMOUNT, HDR_NOTES]
      : [HDR_SKU, HDR_NAME, HDR_CLASS, HDR_SOFAR, ...PAYMENT_COLUMNS, HDR_DETAIL, HDR_NOTES];

    const aoa: unknown[][] = [
      [LBL_OUTING_NAME, ""],
      [LBL_DATE, fmtDateHe(todayIso())],
      [],
      headers,
      ...formRows.map((b) => {
        const head = [b.sku, b.name, b.classLevel, soFar(b)];
        return isAskanim
          ? [...head, "", ""]
          : [...head, "", "", "", "", ""];
      }),
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!views"] = [{ RTL: true }];
    ws["!cols"] = headers.map((h) =>
      ({ wch: h === HDR_NAME ? 22 : h === HDR_DETAIL || h === HDR_NOTES ? 20 : h === HDR_SOFAR ? 14 : 11 })
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "יציאה");
    XLSX.writeFile(wb, `יציאה-${label}-${todayIso()}.xlsx`);
    toast.success("הטופס הורד. מלא את הסכומים והעלה בחזרה");
  };

  // ─── Read an uploaded form ──────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer());
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: true });

      // The two labels in the top block, wherever they ended up.
      let outingName = "";
      let date = todayIso();
      for (const r of rows.slice(0, 8)) {
        const a = normalizeHeader(r?.[0]);
        if (a === normalizeHeader(LBL_OUTING_NAME)) outingName = toStr(r?.[1]);
        if (a === normalizeHeader(LBL_DATE)) date = parseDate(r?.[1]);
      }
      if (!outingName) {
        toast.error('שם היציאה לא מולא. מלא אותו בתא שליד "שם היציאה:" בראש הקובץ ונסה שוב');
        return;
      }

      const headerIdx = rows.findIndex((r) =>
        (r || []).some((c) => normalizeHeader(c) === HDR_NAME)
      );
      if (headerIdx < 0) {
        toast.error("לא נמצאה שורת הכותרות בקובץ. הורד טופס חדש והעלה אותו");
        return;
      }

      const col: Record<string, number> = {};
      (rows[headerIdx] || []).forEach((c, i) => {
        const h = normalizeHeader(c);
        if (h) col[h] = i;
      });
      const at = (r: unknown[], header: string) => {
        const i = col[normalizeHeader(header)];
        return i === undefined ? "" : r[i];
      };

      const amountCols = isAskanim ? [HDR_AMOUNT] : [...PAYMENT_COLUMNS];
      if (!amountCols.some((h) => col[normalizeHeader(h)] !== undefined)) {
        toast.error("לא נמצאה עמודת סכום בקובץ. הורד טופס חדש והעלה אותו");
        return;
      }

      const bySku = new Map(bachurim.map((b) => [toStr(b.sku), b]));
      const byName = new Map<string, Bachur>();
      for (const b of bachurim) {
        const key = normalizeName(b.name);
        if (key && !byName.has(key)) byName.set(key, b);
      }

      const existingNames = new Map<string, Set<string>>();
      if (isAskanim) {
        for (const inc of loadAskanimIncomes()) {
          const set = existingNames.get(inc.bachurId) || new Set<string>();
          set.add(normalizeName(inc.notes || ""));
          existingNames.set(inc.bachurId, set);
        }
      } else {
        for (const b of bachurim) {
          existingNames.set(b.id, new Set((b.outings || []).map((o) => normalizeName(o.name))));
        }
      }

      const ok: OkRow[] = [];
      const bad: BadRow[] = [];
      const empty: BadRow[] = [];

      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i] || [];
        const excelRow = i + 1; // 1-based, as Excel shows it
        const sku = toStr(at(r, HDR_SKU));
        const name = toStr(at(r, HDR_NAME));
        if (!sku && !name) continue; // blank spacer row

        const parts: Part[] = [];
        let failure = "";
        for (const h of amountCols) {
          if (col[normalizeHeader(h)] === undefined) continue;
          const raw = at(r, h);
          if (toStr(raw) === "") continue;
          const { ok: numOk, value } = parseAmount(raw);
          if (!numOk) {
            failure = isAskanim
              ? `הסכום "${toStr(raw)}" אינו מספר`
              : `הסכום בעמודת "${h}" אינו מספר ("${toStr(raw)}")`;
            break;
          }
          if (value < 0) {
            failure = isAskanim ? "סכום שלילי" : `סכום שלילי בעמודת "${h}"`;
            break;
          }
          if (value === 0) continue;
          const detail = h === "אחר" ? toStr(at(r, HDR_DETAIL)) : "";
          parts.push({ method: isAskanim ? "" : h, amount: value, detail: detail || undefined });
        }

        if (failure) {
          bad.push({ excelRow, name: name || sku, reason: failure });
          continue;
        }
        if (parts.length === 0) {
          empty.push({ excelRow, name: name || sku, reason: "" });
          continue;
        }

        const bachur = (sku && bySku.get(sku)) || byName.get(normalizeName(name));
        if (!bachur) {
          bad.push({
            excelRow,
            name: name || sku,
            reason: sku ? `לא נמצא בחור עם מק"ט ${sku} או בשם הזה` : "השם לא קיים בתוכנה",
          });
          continue;
        }

        ok.push({
          excelRow,
          bachurId: bachur.id,
          name: bachur.name,
          parts,
          total: parts.reduce((s, p) => s + p.amount, 0),
          duplicate: existingNames.get(bachur.id)?.has(normalizeName(outingName)) ?? false,
          notes: toStr(at(r, HDR_NOTES)),
        });
      }

      if (ok.length === 0 && bad.length === 0) {
        toast.error("לא נמצא אף סכום בקובץ. מלא סכומים ונסה שוב");
        return;
      }

      setSkipDuplicates(false);
      setOpenSection("ok");
      setPlan({ outingName, date, ok, bad, empty });
    } catch {
      toast.error("שגיאה בקריאת הקובץ. ודא שזה קובץ אקסל תקין");
    }
  };

  // ─── Save ───────────────────────────────────────────────────
  const rowsToSave = plan ? plan.ok.filter((r) => !(skipDuplicates && r.duplicate)) : [];
  const totalToSave = rowsToSave.reduce((s, r) => s + r.total, 0);
  const recordCount = rowsToSave.reduce((s, r) => s + r.parts.length, 0);

  const byMethod = PAYMENT_COLUMNS.map((m) => ({
    method: m,
    sum: rowsToSave.reduce(
      (s, r) => s + r.parts.filter((p) => p.method === m).reduce((x, p) => x + p.amount, 0), 0
    ),
  })).filter((x) => x.sum > 0);

  const handleSave = () => {
    if (!plan || rowsToSave.length === 0) return;
    const iso = new Date(`${plan.date}T12:00:00`).toISOString();

    if (isAskanim) {
      const incomes = loadAskanimIncomes();
      const allIncomes: unknown[] = (() => {
        try { return JSON.parse(localStorage.getItem("incomes") || "[]"); } catch { return []; }
      })();
      for (const r of rowsToSave) {
        for (const p of r.parts) {
          incomes.push({
            id: crypto.randomUUID(),
            bachurId: r.bachurId,
            bachurName: r.name,
            date: plan.date,
            amount: p.amount,
            notes: plan.outingName,
          });
          // Mirrored into the amuta incomes exactly as the manual dialog
          // does; without it the money is missing from the other reports.
          allIncomes.push({
            id: crypto.randomUUID(),
            description: `פרויקט עסקנים – ${r.name}`,
            amount: p.amount,
            date: plan.date,
            category: "פרויקט עסקנים",
            target: "עמותה",
          });
        }
      }
      localStorage.setItem("askanimIncomes", JSON.stringify(incomes));
      localStorage.setItem("incomes", JSON.stringify(allIncomes));
    } else {
      const additions = new Map<string, Outing[]>();
      for (const r of rowsToSave) {
        const list = additions.get(r.bachurId) || [];
        for (const p of r.parts) {
          list.push({
            id: crypto.randomUUID(),
            name: plan.outingName,
            date: iso,
            amount: p.amount,
            paymentMethod: p.method,
            paymentMethodDetail: p.method === "אחר" ? p.detail : undefined,
          });
        }
        additions.set(r.bachurId, list);
      }
      const updated = bachurim.map((b) => {
        const add = additions.get(b.id);
        return add ? { ...b, outings: [...(b.outings || []), ...add] } : b;
      });
      localStorage.setItem("bachurim", JSON.stringify(updated));
    }

    setPlan(null);
    onDone();
    toast.success(`נוספו ${recordCount} הכנסות ל-${rowsToSave.length} ${label} · ${fmtMoney(totalToSave)}`);
  };

  // ─── UI ─────────────────────────────────────────────────────
  const Section = ({
    id, title, count, tone, children,
  }: {
    id: "ok" | "bad" | "empty"; title: string; count: number; tone: string; children: React.ReactNode;
  }) => (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium ${tone}`}
        onClick={() => setOpenSection(openSection === id ? null : id)}
      >
        <span>{title} ({count})</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${openSection === id ? "rotate-180" : ""}`} />
      </button>
      {openSection === id && count > 0 && (
        <div className="max-h-52 overflow-y-auto divide-y divide-border text-sm">{children}</div>
      )}
    </div>
  );

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
        <FileDown className="h-4 w-4" /> הורדת טופס יציאה
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}>
        <FileUp className="h-4 w-4" /> העלאת טופס יציאה
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls"
        className="sr-only"
        onChange={handleUpload}
      />

      <Dialog open={!!plan} onOpenChange={(o) => { if (!o) setPlan(null); }}>
        <DialogContent className="sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>אישור לפני שמירה</DialogTitle>
            <DialogDescription>
              {plan && <>יציאה <strong>{plan.outingName}</strong> · {fmtDateHe(plan.date)} · {label}</>}
              <br />
              שום דבר לא נשמר עד שתלחץ "אישור ושמירה".
            </DialogDescription>
          </DialogHeader>

          {plan && (
            <div className="space-y-2">
              <Section id="ok" title="✅ ייכנסו" count={rowsToSave.length} tone="bg-emerald-50 text-emerald-900">
                {plan.ok.map((r) => {
                  const skipped = skipDuplicates && r.duplicate;
                  return (
                    <div
                      key={r.excelRow}
                      className={`flex items-start justify-between gap-3 px-3 py-1.5 ${skipped ? "opacity-40 line-through" : ""}`}
                    >
                      <span className="shrink-0 text-muted-foreground">שורה {r.excelRow}</span>
                      <span className="flex-1 font-medium">
                        {r.name}
                        {r.duplicate && <span className="mr-1 text-amber-700">🔁 ייתכן כפול</span>}
                      </span>
                      <span className="text-left shrink-0">
                        {isAskanim
                          ? fmtMoney(r.total)
                          : r.parts.map((p) =>
                              `${fmtMoney(p.amount)} ${p.method}${p.detail ? ` (${p.detail})` : ""}`
                            ).join(" + ")}
                        {!isAskanim && r.parts.length > 1 && (
                          <strong className="block">סה"כ {fmtMoney(r.total)}</strong>
                        )}
                      </span>
                    </div>
                  );
                })}
              </Section>

              <Section id="bad" title="⚠️ לא ייכנסו" count={plan.bad.length} tone="bg-red-50 text-red-900">
                {plan.bad.map((r) => (
                  <div key={r.excelRow} className="flex items-start justify-between gap-3 px-3 py-1.5">
                    <span className="shrink-0 text-muted-foreground">שורה {r.excelRow}</span>
                    <span className="flex-1 font-medium">{r.name || "—"}</span>
                    <span className="text-left shrink-0 text-red-700">{r.reason}</span>
                  </div>
                ))}
              </Section>

              <Section id="empty" title="⬜ דולגו — ריקים" count={plan.empty.length} tone="bg-muted text-muted-foreground">
                {plan.empty.map((r) => (
                  <div key={r.excelRow} className="flex gap-3 px-3 py-1.5">
                    <span className="shrink-0 text-muted-foreground">שורה {r.excelRow}</span>
                    <span>{r.name}</span>
                  </div>
                ))}
              </Section>

              {plan.ok.some((r) => r.duplicate) && (
                <label className="flex items-center gap-2 text-sm pt-1 cursor-pointer">
                  <Checkbox
                    checked={skipDuplicates}
                    onCheckedChange={(v) => setSkipDuplicates(v === true)}
                  />
                  דלג על החשודים ככפולים (למי שכבר יש יציאה בשם הזה)
                </label>
              )}

              <div className="rounded-lg bg-muted/50 border border-border px-3 py-2 text-sm">
                <div className="font-semibold">
                  סה"כ שייכנס: {fmtMoney(totalToSave)} ({recordCount} הכנסות)
                </div>
                {!isAskanim && byMethod.length > 0 && (
                  <div className="text-muted-foreground mt-0.5">
                    {byMethod.map((x) => `${x.method}: ${fmtMoney(x.sum)}`).join(" · ")}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPlan(null)}>ביטול</Button>
            <Button onClick={handleSave} disabled={rowsToSave.length === 0}>
              אישור ושמירה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
