import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronDown, ChevronUp, Download, FileText, Calendar,
  Users, Wallet, Building2, Landmark, ShieldCheck, AlertTriangle,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import * as XLSX from "xlsx";
import { fetchActivityLog, type ActivityLogEntry } from "@/lib/db";

// ─── Data types ───────────────────────────────────────────────
interface Bachur {
  id: string; sku: string; name: string; classLevel: string; joinDate: string;
  outings: { id: string; name: string; date: string; amount: number }[];
  married: boolean; marriedDate?: string;
  receivedBasket: boolean; basketDate?: string; basketCostAtTime?: number;
  inAskanim: boolean; closed: boolean;
}
interface Income {
  id: string; description: string; amount: number; date: string;
  recognized: boolean; auto?: boolean;
}
interface Expense {
  id: string; amount: number; date: string; category: string;
  subCategory: string; notes: string; recognized: boolean; auto?: boolean;
}
// ─── Helpers ──────────────────────────────────────────────────
function fmt(n: number) { return n.toLocaleString("he-IL"); }
function today() { return new Date().toISOString().split("T")[0]; }

function monthRange(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const y = d.getFullYear(), m = d.getMonth();
  return {
    from: new Date(y, m, 1).toISOString().split("T")[0],
    to: new Date(y, m + 1, 0).toISOString().split("T")[0],
  };
}
function yearRange() {
  const y = new Date().getFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

function inRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

// ─── Export helpers ───────────────────────────────────────────
function exportExcel(data: Record<string, unknown>[], fileName: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, fileName);
}

function exportPdfHtml(title: string, html: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;direction:rtl}
table{width:100%;border-collapse:collapse;margin:16px 0}
th,td{border:1px solid #ccc;padding:8px;text-align:right}
th{background:#f0f0f0}h1{font-size:22px}h2{font-size:18px;margin-top:24px}
.green{color:green}.red{color:red}.summary{background:#f8f8f8;padding:16px;border-radius:8px;margin:12px 0}
@media print{body{padding:20px}}</style></head><body>${html}
<script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
}

// ─── Component ────────────────────────────────────────────────
export default function ReportsModule() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const iv = setInterval(refresh, 3000);
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => { clearInterval(iv); window.removeEventListener("storage", onStorage); };
  }, [refresh]);

  const bachurim = loadLocal<Bachur>("bachurim");
  const incomes = loadLocal<Income>("incomes");
  const expenses = loadLocal<Expense>("expenses");
  const settings = loadSettingsLocal();
  const minimum = settings.minimumForBasket || 5000;

  return (
    <div className="p-4 md:p-6 space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold">דוחות</h1>

      <Report1Period incomes={incomes} expenses={expenses} bachurim={bachurim} />
      <Report2Bachurim bachurim={bachurim} minimum={minimum} />
      <Report3Funds incomes={incomes} expenses={expenses} bachurim={bachurim} />
      <Report4History />
    </div>
  );
}

function loadLocal<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function loadSettingsLocal() {
  try { return JSON.parse(localStorage.getItem("globalSettings") || "{}"); } catch { return {}; }
}

// ─── Collapsible wrapper ──────────────────────────────────────
function ReportCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">{icon}{title}</CardTitle>
              {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ═══════════════════════════════════════════════════════════════
// REPORT 1: סיכום תקופתי
// ═══════════════════════════════════════════════════════════════
function Report1Period({ incomes, expenses, bachurim }: { incomes: Income[]; expenses: Expense[]; bachurim: Bachur[] }) {
  const cur = monthRange(0);
  const [from, setFrom] = useState(cur.from);
  const [to, setTo] = useState(cur.to);

  const data = useMemo(() => {
    const fi = incomes.filter((i) => inRange(i.date, from, to));
    const fe = expenses.filter((e) => inRange(e.date, from, to));

    const manualInc = fi.filter((i) => !i.auto).reduce((s, i) => s + i.amount, 0);
    const askanimInc = fi.filter((i) => i.auto && i.description?.includes("פרויקט עסקנים")).reduce((s, i) => s + i.amount, 0);
    const donationInc = fi.filter((i) => i.auto && !i.description?.includes("פרויקט עסקנים")).reduce((s, i) => s + i.amount, 0);
    const totalInc = fi.reduce((s, i) => s + i.amount, 0);

    const expSalim = fe.filter((e) => e.category === "סלים").reduce((s, e) => s + e.amount, 0);
    const expAmuta = fe.filter((e) => e.category === "עמותה").reduce((s, e) => s + e.amount, 0);
    const totalExp = fe.reduce((s, e) => s + e.amount, 0);

    const basketCount = bachurim.filter((b) => b.receivedBasket && b.basketDate && inRange(b.basketDate, from, to)).length;
    const marriedCount = bachurim.filter((b) => b.married && b.marriedDate && inRange(b.marriedDate, from, to)).length;

    return { manualInc, askanimInc, donationInc, totalInc, expSalim, expAmuta, totalExp, basketCount, marriedCount };
  }, [incomes, expenses, bachurim, from, to]);

  function handleExportExcel() {
    exportExcel([{
      "סה\"כ הכנסות": data.totalInc, "הכנסות ידניות": data.manualInc,
      "פרויקט עסקנים": data.askanimInc, "תרומות מבחורים": data.donationInc,
      "סה\"כ הוצאות": data.totalExp, "הוצאות סלים": data.expSalim,
      "הוצאות עמותה": data.expAmuta, "מאזן": data.totalInc - data.totalExp,
      "בחורים קיבלו סל": data.basketCount, "בחורים התחתנו": data.marriedCount,
      "מתאריך": from, "עד תאריך": to,
    }], `סיכום_תקופתי_${from}_${to}.xlsx`);
  }

  function handleExportPdf() {
    const balance = data.totalInc - data.totalExp;
    exportPdfHtml("סיכום תקופתי", `
      <h1>סיכום תקופתי</h1>
      <p>מתאריך: ${from} &nbsp; עד: ${to}</p>
      <div class="summary">
        <h2>הכנסות: ${fmt(data.totalInc)} ₪</h2>
        <table><tr><th>ידניות</th><th>פרויקט עסקנים</th><th>תרומות מבחורים</th></tr>
        <tr><td>${fmt(data.manualInc)} ₪</td><td>${fmt(data.askanimInc)} ₪</td><td>${fmt(data.donationInc)} ₪</td></tr></table>
        <h2>הוצאות: ${fmt(data.totalExp)} ₪</h2>
        <table><tr><th>סלים</th><th>עמותה</th></tr>
        <tr><td>${fmt(data.expSalim)} ₪</td><td>${fmt(data.expAmuta)} ₪</td></tr></table>
        <h2 class="${balance >= 0 ? 'green' : 'red'}">מאזן תקופה: ${fmt(balance)} ₪</h2>
        <p>בחורים שקיבלו סל: ${data.basketCount} | בחורים שהתחתנו: ${data.marriedCount}</p>
      </div>
    `);
  }

  return (
    <ReportCard title="סיכום תקופתי" icon={<Calendar className="h-5 w-5" />}>
      {/* Date range */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div><Label>מתאריך</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" /></div>
        <div><Label>עד תאריך</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" /></div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { const r = monthRange(0); setFrom(r.from); setTo(r.to); }}>החודש הנוכחי</Button>
          <Button size="sm" variant="outline" onClick={() => { const r = monthRange(-1); setFrom(r.from); setTo(r.to); }}>החודש הקודם</Button>
          <Button size="sm" variant="outline" onClick={() => { const r = yearRange(); setFrom(r.from); setTo(r.to); }}>השנה הנוכחית</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">סה"כ הכנסות</p>
          <p className="text-xl font-bold text-green-600">{fmt(data.totalInc)} ₪</p>
          <p className="text-xs text-muted-foreground mt-1">ידניות: {fmt(data.manualInc)} | עסקנים: {fmt(data.askanimInc)} | תרומות: {fmt(data.donationInc)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">סה"כ הוצאות</p>
          <p className="text-xl font-bold text-red-600">{fmt(data.totalExp)} ₪</p>
          <p className="text-xs text-muted-foreground mt-1">סלים: {fmt(data.expSalim)} | עמותה: {fmt(data.expAmuta)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground">מאזן תקופה</p>
          <p className={`text-xl font-bold ${data.totalInc - data.totalExp >= 0 ? "text-green-600" : "text-red-600"}`}>
            {fmt(data.totalInc - data.totalExp)} ₪
          </p>
          <p className="text-xs text-muted-foreground mt-1">קיבלו סל: {data.basketCount} | התחתנו: {data.marriedCount}</p>
        </CardContent></Card>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleExportPdf}><FileText className="h-4 w-4 ml-1" />הורד PDF</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><Download className="h-4 w-4 ml-1" />הורד Excel</Button>
      </div>
    </ReportCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// REPORT 2: סטטוס בחורים
// ═══════════════════════════════════════════════════════════════
function Report2Bachurim({ bachurim, minimum }: { bachurim: Bachur[]; minimum: number }) {
  const active = useMemo(() => {
    return bachurim
      .filter((b) => !b.married && !b.receivedBasket)
      .map((b) => {
        const total = (b.outings || []).reduce((s, o) => s + o.amount, 0);
        const pct = minimum > 0 ? (total / minimum) * 100 : 0;
        let status = "עוד רחוק";
        if (total >= minimum) status = "זכאי";
        else if (pct >= 70) status = "קרוב לסל";
        return { ...b, total, pct, status };
      })
      .sort((a, b) => b.total - a.total);
  }, [bachurim, minimum]);

  function handleExport() {
    exportExcel(
      active.map((b) => ({
        "שם": b.name, "מק\"ט": b.sku, "שיעור": b.classLevel,
        "סה\"כ הכניס": b.total, "אחוז מהמינימום": `${b.pct.toFixed(1)}%`, "סטטוס": b.status,
      })),
      "סטטוס_בחורים.xlsx"
    );
  }

  return (
    <ReportCard title="סטטוס בחורים" icon={<Users className="h-5 w-5" />}>
      <div className="mb-3">
        <Badge variant="outline">{active.length} בחורים פעילים</Badge>
      </div>
      <div className="overflow-auto max-h-96">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">מק"ט</TableHead>
              <TableHead className="text-right">שיעור</TableHead>
              <TableHead className="text-right">סה"כ הכניס</TableHead>
              <TableHead className="text-right">% מהמינימום</TableHead>
              <TableHead className="text-right">סטטוס</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {active.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">אין בחורים פעילים</TableCell></TableRow>
            ) : active.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.sku}</TableCell>
                <TableCell>{b.classLevel}</TableCell>
                <TableCell>{fmt(b.total)} ₪</TableCell>
                <TableCell>{b.pct.toFixed(1)}%</TableCell>
                <TableCell>
                  <Badge variant={b.status === "זכאי" ? "default" : b.status === "קרוב לסל" ? "secondary" : "outline"}>
                    {b.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3">
        <Button size="sm" variant="outline" onClick={handleExport}><Download className="h-4 w-4 ml-1" />הורד Excel</Button>
      </div>
    </ReportCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// REPORT 3: דוח קופות
// ═══════════════════════════════════════════════════════════════
function Report3Funds({ incomes, expenses, bachurim }: { incomes: Income[]; expenses: Expense[]; bachurim: Bachur[] }) {
  const data = useMemo(() => {
    const active = bachurim.filter((b) => !b.married);
    const totalActiveBachurimIncome = active.reduce(
      (s, b) => s + (b.outings || []).reduce((os, o) => os + o.amount, 0), 0
    );
    const expSalim = expenses.filter((e) => e.category === "סלים").reduce((s, e) => s + e.amount, 0);
    const basketFund = totalActiveBachurimIncome - expSalim;

    const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);
    const expAmuta = expenses.filter((e) => e.category === "עמותה").reduce((s, e) => s + e.amount, 0);
    const orgFund = totalIncomes - expAmuta;

    const totalBank = basketFund + orgFund;
    const balanced = totalActiveBachurimIncome === basketFund + expSalim;

    return {
      basketInc: totalActiveBachurimIncome, basketExp: expSalim, basketFund,
      orgInc: totalIncomes, orgExp: expAmuta, orgFund,
      totalBank, balanced,
      diff: totalActiveBachurimIncome - basketFund,
    };
  }, [incomes, expenses, bachurim]);

  function handleExportPdf() {
    exportPdfHtml("דוח קופות", `
      <h1>דוח קופות</h1>
      <table>
        <tr><th></th><th>הכנסות</th><th>הוצאות</th><th>יתרה</th></tr>
        <tr><td><strong>קופת סלים</strong></td><td>${fmt(data.basketInc)} ₪</td><td>${fmt(data.basketExp)} ₪</td><td>${fmt(data.basketFund)} ₪</td></tr>
        <tr><td><strong>קופת עמותה</strong></td><td>${fmt(data.orgInc)} ₪</td><td>${fmt(data.orgExp)} ₪</td><td>${fmt(data.orgFund)} ₪</td></tr>
        <tr><td><strong>סה"כ בנק</strong></td><td colspan="2"></td><td><strong>${fmt(data.totalBank)} ₪</strong></td></tr>
      </table>
      <p class="${data.balanced ? 'green' : 'red'}">${data.balanced ? "✅ החשבון מאוזן" : `⚠️ יש הפרש של ${fmt(data.diff)} ₪`}</p>
    `);
  }

  return (
    <ReportCard title="דוח קופות" icon={<Landmark className="h-5 w-5" />}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Wallet className="h-4 w-4" />קופת סלים</p>
          <p className="text-xs mt-1">הכנסות: {fmt(data.basketInc)} ₪</p>
          <p className="text-xs">הוצאות: {fmt(data.basketExp)} ₪</p>
          <p className="text-lg font-bold mt-1">{fmt(data.basketFund)} ₪</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Building2 className="h-4 w-4" />קופת עמותה</p>
          <p className="text-xs mt-1">הכנסות: {fmt(data.orgInc)} ₪</p>
          <p className="text-xs">הוצאות: {fmt(data.orgExp)} ₪</p>
          <p className="text-lg font-bold mt-1">{fmt(data.orgFund)} ₪</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Landmark className="h-4 w-4" />סה"כ בנק</p>
          <p className="text-2xl font-bold mt-2">{fmt(data.totalBank)} ₪</p>
        </CardContent></Card>
      </div>

      <Card className={data.balanced ? "border-green-500" : "border-red-500"}>
        <CardContent className="p-4 flex items-center gap-2">
          {data.balanced ? (
            <><ShieldCheck className="h-5 w-5 text-green-600" /><span className="text-green-600 font-medium">✅ החשבון מאוזן</span></>
          ) : (
            <><AlertTriangle className="h-5 w-5 text-red-600" /><span className="text-red-600 font-medium">⚠️ יש הפרש של {fmt(data.diff)} ₪ – יש לבדוק</span></>
          )}
        </CardContent>
      </Card>

      <div className="mt-3">
        <Button size="sm" variant="outline" onClick={handleExportPdf}><FileText className="h-4 w-4 ml-1" />הורד PDF</Button>
      </div>
    </ReportCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// REPORT 4: היסטוריית פעולות
// ═══════════════════════════════════════════════════════════════
const ACTION_TYPES = [
  { value: "all", label: "הכל" },
  { value: "הוספת בחור", label: "הוספת בחור" },
  { value: "הכנסת כסף", label: "הכנסת כסף לבחור" },
  { value: "קיבל סל", label: "קיבל סל" },
  { value: "התחתן", label: "התחתן" },
  { value: "הכנסה", label: "הכנסה" },
  { value: "הוצאה", label: "הוצאה" },
  { value: "שינוי הגדרות", label: "שינוי הגדרות" },
];

function Report4History() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchActivityLog().then((data) => { setLogs(data); setLoadingLogs(false); });
  }, []);

  const filtered = useMemo(() => {
    let result = [...logs];
    if (typeFilter !== "all") {
      result = result.filter((l) => l.action_type.includes(typeFilter));
    }
    if (dateFrom) result = result.filter((l) => l.created_at >= dateFrom);
    if (dateTo) result = result.filter((l) => l.created_at <= dateTo + "T99");
    return result;
  }, [logs, typeFilter, dateFrom, dateTo]);

  function handleExport() {
    exportExcel(
      filtered.map((l) => ({
        "תאריך ושעה": l.created_at, "סוג פעולה": l.action_type,
        "פרטים": l.details, "סכום": l.amount ?? "",
      })),
      "היסטוריית_פעולות.xlsx"
    );
  }

  return (
    <ReportCard title="היסטוריית פעולות" icon={<FileText className="h-5 w-5" />}>
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <Label>סוג פעולה</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>מתאריך</Label><Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" /></div>
        <div><Label>עד תאריך</Label><Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" /></div>
      </div>

      <div className="overflow-auto max-h-96">
        {loadingLogs ? (
          <div className="text-center py-8 text-muted-foreground">טוען היסטוריית פעולות...</div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">תאריך ושעה</TableHead>
              <TableHead className="text-right">סוג פעולה</TableHead>
              <TableHead className="text-right">פרטים</TableHead>
              <TableHead className="text-right">סכום</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">אין פעולות להצגה</TableCell></TableRow>
            ) : filtered.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="text-xs">{new Date(l.created_at).toLocaleString("he-IL")}</TableCell>
                <TableCell><Badge variant="outline">{l.action_type}</Badge></TableCell>
                <TableCell>{l.details}</TableCell>
                <TableCell>{l.amount != null ? `${fmt(l.amount)} ₪` : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>

      <div className="mt-3">
        <Button size="sm" variant="outline" onClick={handleExport}><Download className="h-4 w-4 ml-1" />הורד Excel</Button>
      </div>
    </ReportCard>
  );
}
