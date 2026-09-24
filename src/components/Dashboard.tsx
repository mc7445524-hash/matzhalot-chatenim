import { useMemo, useState } from "react";
import {
  Wallet, Snowflake, Receipt, ClipboardList, Scale, Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useData } from "@/contexts/DataContext";
import { useNavigation } from "@/contexts/NavigationContext";
import MasterExcelImport from "@/components/MasterExcelImport";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ─── helpers ───────────────────────────────────────────────────
function fmt(n: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", minimumFractionDigits: 0,
  }).format(Math.round(n));
}
function bachurTotal(b: any): number {
  return (b.outings || []).reduce((s: number, o: any) => s + (o.amount || 0), 0);
}

function exportToExcel(filename: string, headers: string[], rows: (string | number)[][]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!views"] = [{ RTL: true }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "נתונים");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} className="gap-2">
      <Download className="h-4 w-4" />
      ייצוא Excel
    </Button>
  );
}

// ─── Component ─────────────────────────────────────────────────
export default function Dashboard() {
  const {
    bachurim, incomes, expenses, askanimIncomes, fundraisers, globalSettings,
  } = useData();
  const { navigateTo } = useNavigation();

  const min = globalSettings.minimumForBasket || 0;
  const basketCost = globalSettings.basketCost || 0;
  const amutaSupplement = Math.max(0, basketCost - min);

  // ── derived per-bachur stats ────────────────────────────────
  const stats = useMemo(() => {
    const active = bachurim.filter((b) => !b.married);
    const married = bachurim.filter((b) => b.married);

    const cappedSum = active.reduce(
      (s, b) => s + Math.min(bachurTotal(b), min), 0
    );
    const excessSum = active.reduce(
      (s, b) => s + Math.max(0, bachurTotal(b) - min), 0
    );

    const incomesSum = incomes.reduce((s, i) => s + (i.amount || 0), 0);
    const askanimSum = askanimIncomes.reduce((s, i) => s + (i.amount || 0), 0);

    const otherIncomes = incomesSum + askanimSum + excessSum;
    const totalIncome = cappedSum + otherIncomes;

    // Card B – frozen baskets (eligible & not married)
    const eligible = active.filter((b) => bachurTotal(b) >= min && min > 0);
    const frozenFromBachurim = eligible.length * min;
    const frozenFromAmuta = eligible.length * amutaSupplement;
    const frozenTotal = frozenFromBachurim + frozenFromAmuta;

    // Card C – expenses
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    // Card D – expected expenses (eligible & not yet received basket)
    const expectedList = eligible.filter((b) => !b.receivedBasket);
    const expectedTotal = expectedList.length * basketCost;

    return {
      active, married, cappedSum, excessSum, incomesSum, askanimSum,
      otherIncomes, totalIncome,
      eligible, frozenFromBachurim, frozenFromAmuta, frozenTotal,
      totalExpenses, expectedList, expectedTotal,
    };
  }, [bachurim, incomes, askanimIncomes, expenses, min, basketCost, amutaSupplement]);

  const balance = stats.totalIncome - stats.totalExpenses;
  const balanceWithExpected = balance - stats.expectedTotal;

  // ── modals state ────────────────────────────────────────────
  const [openCard, setOpenCard] = useState<null | "A" | "B" | "C" | "D" | "E">(null);

  // Card A inner state
  const [aMode, setAMode] = useState<null | "bachurim" | "other">(null);
  const [aBachurFilter, setABachurFilter] = useState<string>("eligible");
  const [aOtherFilter, setAOtherFilter] = useState<string>("");

  const closeAll = () => { setOpenCard(null); setAMode(null); setABachurFilter("eligible"); setAOtherFilter(""); };

  // ── Card definitions ────────────────────────────────────────
  const cards = [
    { id: "A" as const, title: 'סה"כ הכנסות',
      desc: "סכומי בחורים עד המינימום + שאר ההכנסות",
      icon: Wallet, value: stats.totalIncome },
    { id: "B" as const, title: "סלים בהקפאה",
      desc: "כסף בחורים זכאים + תוספת העמותה",
      icon: Snowflake, value: stats.frozenTotal },
    { id: "C" as const, title: "הוצאות",
      desc: "סך כל ההוצאות במערכת",
      icon: Receipt, value: stats.totalExpenses },
    { id: "D" as const, title: "הוצאות צפויות",
      desc: "בחורים זכאים שטרם קיבלו סל",
      icon: ClipboardList, value: stats.expectedTotal },
    { id: "E" as const, title: 'סה"כ הוצאות מול הכנסות',
      desc: "מאזן כולל",
      icon: Scale, value: balance },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <h2 className="text-2xl font-bold text-foreground">לוח בקרה</h2>
        <MasterExcelImport />
      </div>
      <p className="text-muted-foreground mb-8">סקירה כללית של נתוני העמותה</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          const isB = c.id === "B";
          const amutaDiff = stats.otherIncomes - stats.frozenFromAmuta;
          const surplus = amutaDiff >= 0;
          const cardBg = isB
            ? surplus
              ? "bg-green-50 border-green-400 dark:bg-green-950/30 dark:border-green-600"
              : "bg-red-50 border-red-400 dark:bg-red-950/30 dark:border-red-600"
            : "bg-card border-border";
          return (
            <button
              key={c.id}
              onClick={() => setOpenCard(c.id)}
              className={`text-right rounded-xl border p-6 shadow-sm hover:shadow-md transition-all ${cardBg}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{c.title}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isB ? (surplus ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40") : "bg-primary/10"}`}>
                  <Icon className={`h-5 w-5 ${isB ? (surplus ? "text-green-600" : "text-red-600") : "text-primary"}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{fmt(c.value)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
              {isB && (
                <p className={`mt-2 text-sm font-semibold ${surplus ? "text-green-600" : "text-red-600"}`}>
                  {surplus
                    ? amutaDiff === 0 ? "✓ מאוזן" : `✓ עודף ${fmt(amutaDiff)}`
                    : `✗ חסר ${fmt(Math.abs(amutaDiff))}`}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Card A modal ─── */}
      <Dialog open={openCard === "A"} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>סה"כ הכנסות — {fmt(stats.totalIncome)}</DialogTitle>
            <DialogDescription>בחר באיזה רכיב להציג פירוט</DialogDescription>
          </DialogHeader>

          {!aMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <button
                onClick={() => setAMode("bachurim")}
                className="rounded-lg border p-5 text-right hover:border-primary"
              >
                <p className="text-sm text-muted-foreground">הכנסות בחורים (עד מינימום)</p>
                <p className="text-2xl font-bold mt-1">{fmt(stats.cappedSum)}</p>
              </button>
              <button
                onClick={() => setAMode("other")}
                className="rounded-lg border p-5 text-right hover:border-primary"
              >
                <p className="text-sm text-muted-foreground">שאר ההכנסות</p>
                <p className="text-2xl font-bold mt-1">{fmt(stats.otherIncomes)}</p>
              </button>
            </div>
          )}

          {aMode === "bachurim" && (
            <CardABachurim
              bachurim={bachurim} min={min}
              filter={aBachurFilter} setFilter={setABachurFilter}
              onBack={() => setAMode(null)}
              onRowClick={(id) => { closeAll(); navigateTo("bachurim", id); }}
            />
          )}

          {aMode === "other" && (
            <CardAOther
              incomes={incomes} askanimIncomes={askanimIncomes}
              bachurim={bachurim} fundraisers={fundraisers} min={min}
              filter={aOtherFilter} setFilter={setAOtherFilter}
              onBack={() => setAMode(null)}
              onRowClick={(target) => {
                closeAll();
                navigateTo(target.module, target.id, target.module === "income" ? { edit: true } : undefined);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Card B modal ─── */}
      <Dialog open={openCard === "B"} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>סלים בהקפאה — {fmt(stats.frozenTotal)}</DialogTitle>
            <DialogDescription>
              {stats.eligible.length} בחורים זכאים שטרם התחתנו
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">סה"כ מהבחורים</p>
              <p className="text-xl font-bold">{fmt(stats.frozenFromBachurim)}</p>
            </div>
            <div className={`rounded-lg border p-4 ${stats.otherIncomes - stats.frozenFromAmuta < 0 ? "border-red-400 bg-red-50 dark:bg-red-950/30" : "border-green-400 bg-green-50 dark:bg-green-950/30"}`}>
              <p className="text-xs text-muted-foreground">נדרש מהעמותה</p>
              <p className="text-xl font-bold">{fmt(stats.frozenFromAmuta)}</p>
              {stats.otherIncomes - stats.frozenFromAmuta < 0 ? (
                <p className="text-sm font-semibold text-red-600 mt-1">✗ חסר {fmt(Math.abs(stats.otherIncomes - stats.frozenFromAmuta))}</p>
              ) : (
                <p className="text-sm font-semibold text-green-600 mt-1">✓ עודף {fmt(stats.otherIncomes - stats.frozenFromAmuta)}</p>
              )}
            </div>
          </div>
          <BachurimTable
            rows={stats.eligible.map((b) => ({
              id: b.id,
              name: b.name,
              fromBachur: min,
              fromAmuta: amutaSupplement,
              total: basketCost,
            }))}
            columns={["שם", "מהבחור", "תוספת עמותה", 'סה"כ']}
            exportName="סלים-בהקפאה"
            onRowClick={(id) => { closeAll(); navigateTo("bachurim", id); }}
          />
        </DialogContent>
      </Dialog>

      {/* ─── Card C modal ─── */}
      <Dialog open={openCard === "C"} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוצאות — {fmt(stats.totalExpenses)}</DialogTitle>
            <DialogDescription>פירוט לפי קטגוריה</DialogDescription>
          </DialogHeader>
          <ExpensesByCategory
            expenses={expenses}
            onRowClick={(id) => { closeAll(); navigateTo("expenses", id, { edit: true }); }}
          />
        </DialogContent>
      </Dialog>

      {/* ─── Card D modal ─── */}
      <Dialog open={openCard === "D"} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוצאות צפויות — {fmt(stats.expectedTotal)}</DialogTitle>
            <DialogDescription>
              {stats.expectedList.length} בחורים זכאים שטרם קיבלו סל
            </DialogDescription>
          </DialogHeader>
          <BachurimTable
            rows={stats.expectedList.map((b) => ({
              id: b.id,
              name: b.name,
              fromBachur: min,
              fromAmuta: amutaSupplement,
              total: basketCost,
            }))}
            columns={["שם", "כסף הבחור", "תוספת עמותה", "צפוי לסל"]}
            exportName="הוצאות-צפויות"
            onRowClick={(id) => { closeAll(); navigateTo("bachurim", id); }}
          />
        </DialogContent>
      </Dialog>

      {/* ─── Card E modal ─── */}
      <Dialog open={openCard === "E"} onOpenChange={(o) => !o && closeAll()}>
        <DialogContent className="max-w-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>סה"כ הוצאות מול הכנסות</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end">
            <ExportButton
              onClick={() => exportToExcel("מאזן", ["סעיף", "סכום"], [
                ['סה"כ הכנסות', stats.totalIncome],
                ['סה"כ הוצאות בפועל', stats.totalExpenses],
                ['סה"כ הוצאות צפויות', stats.expectedTotal],
                ["מאזן (הכנסות - הוצאות)", balance],
                ["מאזן כולל הוצאות צפויות", balanceWithExpected],
              ])}
            />
          </div>
          <div className="space-y-3">
            <Row label='סה"כ הכנסות' value={stats.totalIncome} />
            <Row label='סה"כ הוצאות בפועל' value={stats.totalExpenses} />
            <Row label='סה"כ הוצאות צפויות' value={stats.expectedTotal} />
            <hr className="border-border" />
            <Row label="מאזן (הכנסות - הוצאות)" value={balance}
                 highlight={balance >= 0 ? "positive" : "negative"} />
            <Row label="מאזן כולל הוצאות צפויות" value={balanceWithExpected}
                 highlight={balanceWithExpected >= 0 ? "positive" : "negative"} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── sub-components ───────────────────────────────────────────
function Row({ label, value, highlight }: {
  label: string; value: number; highlight?: "positive" | "negative";
}) {
  const cls = highlight === "positive"
    ? "text-green-600 dark:text-green-400"
    : highlight === "negative"
    ? "text-red-600 dark:text-red-400"
    : "text-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold ${cls}`}>{fmt(value)}</span>
    </div>
  );
}

function BachurimTable({ rows, columns, exportName, onRowClick }: {
  rows: { id?: string; name: string; fromBachur: number; fromAmuta: number; total: number }[];
  columns: string[];
  exportName: string;
  onRowClick?: (id: string) => void;
}) {
  const sumBachur = rows.reduce((s, r) => s + r.fromBachur, 0);
  const sumAmuta = rows.reduce((s, r) => s + r.fromAmuta, 0);
  const sumTotal = rows.reduce((s, r) => s + r.total, 0);
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ExportButton
          onClick={() => exportToExcel(exportName, columns, [
            [`סה"כ (${rows.length})`, sumBachur, sumAmuta, sumTotal],
            ...rows.map((r) => [r.name, r.fromBachur, r.fromAmuta, r.total]),
          ])}
        />
      </div>
      <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => <TableHead key={c} className="text-right">{c}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="bg-muted/50 font-bold">
            <TableCell>סה"כ ({rows.length})</TableCell>
            <TableCell>{fmt(sumBachur)}</TableCell>
            <TableCell>{fmt(sumAmuta)}</TableCell>
            <TableCell>{fmt(sumTotal)}</TableCell>
          </TableRow>
          {rows.map((r, i) => (
            <TableRow
              key={i}
              className={onRowClick && r.id ? "cursor-pointer hover:bg-primary/5" : ""}
              onClick={() => { if (onRowClick && r.id) onRowClick(r.id); }}
            >
              <TableCell>{r.name}</TableCell>
              <TableCell>{fmt(r.fromBachur)}</TableCell>
              <TableCell>{fmt(r.fromAmuta)}</TableCell>
              <TableCell className="font-medium">{fmt(r.total)}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={columns.length} className="text-center text-muted-foreground py-6">אין נתונים</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}

function CardABachurim({ bachurim, min, filter, setFilter, onBack, onRowClick }: {
  bachurim: any[]; min: number;
  filter: string; setFilter: (s: string) => void; onBack: () => void;
  onRowClick?: (id: string) => void;
}) {
  const filtered = useMemo(() => {
    return bachurim.filter((b) => {
      const t = bachurTotal(b);
      switch (filter) {
        case "all": return true;
        case "eligible": return !b.married && t >= min;
        case "close": return !b.married && t >= 0.8 * min && t < min;
        case "far": return !b.married && t < 0.8 * min;
        case "married": return b.married;
        default: return false;
      }
    });
  }, [bachurim, filter, min]);

  const rows = filtered.map((b) => ({
    id: b.id as string,
    name: b.name,
    amount: Math.min(bachurTotal(b), min),
    actual: bachurTotal(b),
  }));
  const sumAmount = rows.reduce((s, r) => s + r.amount, 0);
  const sumActual = rows.reduce((s, r) => s + r.actual, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onBack}>← חזור</Button>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">בחר הכול</SelectItem>
            <SelectItem value="eligible">זכאי (הגיע למינימום)</SelectItem>
            <SelectItem value="close">קרוב לסל (80%+)</SelectItem>
            <SelectItem value="far">רחוק מהסל (מתחת ל-80%)</SelectItem>
            <SelectItem value="married">התחתן</SelectItem>
          </SelectContent>
        </Select>
        <div className="ms-auto">
          <ExportButton
            onClick={() => exportToExcel(`הכנסות-בחורים-${filter}`,
              ["שם", "סכום (עד מינימום)", "סכום בפועל"],
              [
                [`סה"כ (${rows.length})`, sumAmount, sumActual],
                ...rows.map((r) => [r.name, r.amount, r.actual]),
              ])}
          />
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">סכום (עד מינימום)</TableHead>
              <TableHead className="text-right">סכום בפועל</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>סה"כ ({rows.length})</TableCell>
              <TableCell>{fmt(sumAmount)}</TableCell>
              <TableCell>{fmt(sumActual)}</TableCell>
            </TableRow>
            {rows.map((r, i) => (
              <TableRow
                key={i}
                className={onRowClick ? "cursor-pointer hover:bg-primary/5" : ""}
                onClick={() => onRowClick?.(r.id)}
              >
                <TableCell>{r.name}</TableCell>
                <TableCell>{fmt(r.amount)}</TableCell>
                <TableCell>{fmt(r.actual)}</TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">אין בחורים בקטגוריה זו</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CardAOther({
  incomes, askanimIncomes, bachurim, fundraisers, min,
  filter, setFilter, onBack, onRowClick,
}: {
  incomes: any[]; askanimIncomes: any[]; bachurim: any[]; fundraisers: string[];
  min: number; filter: string; setFilter: (s: string) => void; onBack: () => void;
  onRowClick?: (target: { module: "income" | "askanim" | "bachurim"; id: string }) => void;
}) {
  type Row = { name: string; date: string; amount: number; notes?: string; target?: { module: "income" | "askanim" | "bachurim"; id: string } };
  let rows: Row[] = [];

  if (filter === "__askanim__") {
    rows = askanimIncomes.map((a) => ({
      name: a.bachurName, date: a.date, amount: a.amount, notes: a.notes,
      target: { module: "askanim", id: a.id },
    }));
  } else if (filter === "__excess__") {
    rows = bachurim
      .filter((b) => !b.married)
      .map((b) => ({ name: b.name, date: "—", amount: Math.max(0, bachurTotal(b) - min), target: { module: "bachurim" as const, id: b.id } }))
      .filter((r) => r.amount > 0);
  } else if (filter === "__all__") {
    rows = [
      ...incomes.map((i) => ({
        name: `${i.description || "—"}${i.fundraiser ? ` (${i.fundraiser})` : ""}`,
        date: i.date, amount: i.amount,
        target: { module: "income" as const, id: i.id },
      })),
      ...askanimIncomes.map((a) => ({
        name: `${a.bachurName} (פרויקט עסקנים)`, date: a.date, amount: a.amount,
        target: { module: "askanim" as const, id: a.id },
      })),
      ...bachurim
        .filter((b) => !b.married)
        .map((b) => ({ name: `${b.name} (עודף מעל מינימום)`, date: "—", amount: Math.max(0, bachurTotal(b) - min), target: { module: "bachurim" as const, id: b.id } }))
        .filter((r) => r.amount > 0),
    ];
  } else if (filter) {
    rows = incomes
      .filter((i) => (i.fundraiser || "") === filter)
      .map((i) => ({ name: i.description || filter, date: i.date, amount: i.amount, target: { module: "income" as const, id: i.id } }));
  }

  const sum = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onBack}>← חזור</Button>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[260px]"><SelectValue placeholder="בחר מקור" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">בחר הכול</SelectItem>
            {fundraisers.map((f) => (
              <SelectItem key={f} value={f}>{f}</SelectItem>
            ))}
            <SelectItem value="__askanim__">פרויקט עסקנים</SelectItem>
            <SelectItem value="__excess__">עודף בחורים מעל המינימום</SelectItem>
          </SelectContent>
        </Select>
        {filter && (
          <div className="ms-auto">
            <ExportButton
              onClick={() => exportToExcel(`שאר-הכנסות-${filter}`,
                ["שם / תיאור", "תאריך", "סכום"],
                [
                  [`סה"כ (${rows.length})`, "—", sum],
                  ...rows.map((r) => [r.name, r.date, r.amount]),
                ])}
            />
          </div>
        )}
      </div>

      {filter && (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">שם / תיאור</TableHead>
                <TableHead className="text-right">תאריך</TableHead>
                <TableHead className="text-right">סכום</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>סה"כ ({rows.length})</TableCell>
                <TableCell>—</TableCell>
                <TableCell>{fmt(sum)}</TableCell>
              </TableRow>
              {rows.map((r, i) => (
                <TableRow
                  key={i}
                  className={onRowClick && r.target ? "cursor-pointer hover:bg-primary/5" : ""}
                  onClick={() => { if (onRowClick && r.target) onRowClick(r.target); }}
                >
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{fmt(r.amount)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-6">אין נתונים</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ExpensesByCategory({ expenses, onRowClick }: { expenses: any[]; onRowClick?: (id: string) => void }) {
  const rows = useMemo(() => {
    return [...expenses].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [expenses]);
  const total = rows.reduce((s, e) => s + (e.amount || 0), 0);
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ExportButton
          onClick={() => exportToExcel("הוצאות-לפי-קטגוריה",
            ["תאריך", "קטגוריה", "פירוט", "סכום"],
            [["", "סה\"כ", "", total], ...rows.map((e) => [e.date, `${e.category || "ללא"} / ${e.subCategory || "ללא"}`, e.notes || "", e.amount || 0])])}
        />
      </div>
      <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">תאריך</TableHead>
            <TableHead className="text-right">קטגוריה</TableHead>
            <TableHead className="text-right">פירוט</TableHead>
            <TableHead className="text-right">סכום</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="bg-muted/50 font-bold">
            <TableCell colSpan={3}>סה"כ</TableCell>
            <TableCell>{fmt(total)}</TableCell>
          </TableRow>
          {rows.map((e) => (
            <TableRow
              key={e.id}
              className={onRowClick ? "cursor-pointer hover:bg-primary/5" : ""}
              onClick={() => onRowClick?.(e.id)}
            >
              <TableCell>{e.date}</TableCell>
              <TableCell>{`${e.category || "ללא"} / ${e.subCategory || "ללא"}`}</TableCell>
              <TableCell className="max-w-[200px] truncate">{e.notes || "—"}</TableCell>
              <TableCell>{fmt(e.amount || 0)}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">אין הוצאות</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
