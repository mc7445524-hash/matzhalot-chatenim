import { useState, useMemo } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────
type SearchType = "bachur" | "income" | "expense";

interface Outing { id: string; name: string; date: string; amount: number; paymentMethod?: string; paymentMethodOther?: string; }
interface Bachur {
  id: string; sku: string; name: string; classLevel: string; joinDate: string;
  outings: Outing[]; married: boolean; marriedDate?: string;
  receivedBasket: boolean; basketDate?: string; basketCostAtTime?: number;
  inAskanim: boolean;
}
interface AskanimIncome {
  id: string; bachurId: string; bachurName: string; date: string; amount: number; notes: string;
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
function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}

function fmt(n: number) { return n.toLocaleString("he-IL") + " ₪"; }

function match(query: string, ...fields: (string | number | undefined)[]) {
  const q = query.toLowerCase();
  return fields.some((f) => f != null && String(f).toLowerCase().includes(q));
}

// ─── Component ────────────────────────────────────────────────
export default function SearchModule() {
  const [type, setType] = useState<SearchType | "">("");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const bachurim = useMemo(() => load<Bachur>("bachurim"), [type, query]);
  const askanimIncomes = useMemo(() => load<AskanimIncome>("askanim"), [type, query]);
  const incomes = useMemo(() => load<Income>("incomes"), [type, query]);
  const expenses = useMemo(() => load<Expense>("expenses"), [type, query]);

  const q = query.trim();

  const filteredBachurim = useMemo(() => {
    if (type !== "bachur" || !q) return [];
    return bachurim.filter((b) => match(q, b.name, b.sku));
  }, [bachurim, q, type]);

  const filteredIncomes = useMemo(() => {
    if (type !== "income" || !q) return [];
    return incomes.filter((i) => match(q, i.description, String(i.amount), i.date));
  }, [incomes, q, type]);

  const filteredExpenses = useMemo(() => {
    if (type !== "expense" || !q) return [];
    return expenses.filter((e) => match(q, e.notes, e.category, e.subCategory, String(e.amount), e.date));
  }, [expenses, q, type]);

  const hasResults =
    (type === "bachur" && filteredBachurim.length > 0) ||
    (type === "income" && filteredIncomes.length > 0) ||
    (type === "expense" && filteredExpenses.length > 0);

  function clear() { setQuery(""); setExpandedId(null); }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">חיפוש</h1>

      {/* Type selector */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-56">
          <Select value={type} onValueChange={(v) => { setType(v as SearchType); setQuery(""); setExpandedId(null); }}>
            <SelectTrigger><SelectValue placeholder="בחר סוג חיפוש..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bachur">שם בחור</SelectItem>
              <SelectItem value="income">הכנסה</SelectItem>
              <SelectItem value="expense">הוצאה</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type && (
          <div className="flex-1 min-w-[200px] flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pr-9"
                placeholder={
                  type === "bachur" ? "הקלד שם בחור או מק\"ט..."
                    : type === "income" ? "חפש לפי תיאור, סכום או תאריך..."
                    : "חפש לפי הערות, קטגוריה, סכום או תאריך..."
                }
                value={query}
                onChange={(e) => { setQuery(e.target.value); setExpandedId(null); }}
                autoFocus
              />
            </div>
            {q && (
              <Button variant="outline" size="icon" onClick={clear}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* No results */}
      {type && q && !hasResults && (
        <p className="text-muted-foreground text-sm">לא נמצאו תוצאות</p>
      )}

      {/* Bachur results */}
      {type === "bachur" && filteredBachurim.map((b) => {
        const basketTotal = (b.outings || []).reduce((s, o) => s + o.amount, 0);
        const bachurAskanim = askanimIncomes.filter((a) => a.bachurId === b.id);
        const askanimTotal = bachurAskanim.reduce((s, a) => s + a.amount, 0);
        const grandTotal = basketTotal + askanimTotal;
        const status = b.married
          ? b.receivedBasket ? "קיבל סל + התחתן" : "התחתן"
          : "פעיל";

        // Combine outings for table display
        const allRows: { id: string; name: string; date: string; amount: number; type: "סל" | "עסקנים" }[] = [
          ...(b.outings || []).map((o) => ({ id: o.id, name: o.name, date: o.date, amount: o.amount, type: "סל" as const })),
          ...bachurAskanim.map((a) => ({ id: a.id, name: a.notes || "הכנסת עסקנים", date: a.date, amount: a.amount, type: "עסקנים" as const })),
        ];

        return (
          <Card key={b.id} className="overflow-hidden">
            <CardContent className="py-4 px-6 space-y-3">
              <div className="flex flex-wrap gap-x-6 gap-y-1 items-center">
                <span className="font-bold text-lg">{b.name}</span>
                <Badge variant="outline">מק"ט: {b.sku}</Badge>
                <Badge variant="secondary">שיעור {b.classLevel}</Badge>
                <Badge variant={b.married ? "destructive" : "default"}>{status}</Badge>
                {b.inAskanim && <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">פרויקט עסקנים</Badge>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div><span className="text-muted-foreground">תאריך הצטרפות:</span> {b.joinDate}</div>
                <div><span className="text-muted-foreground">סה"כ לסלים:</span> {fmt(basketTotal)}</div>
                {b.inAskanim && (
                  <div><span className="text-muted-foreground">סה"כ לפרויקט עסקנים:</span> {fmt(askanimTotal)}</div>
                )}
                <div><span className="font-semibold">סה"כ כללי:</span> {fmt(grandTotal)}</div>
                {b.married && b.marriedDate && (
                  <div><span className="text-muted-foreground">תאריך חתונה:</span> {b.marriedDate}</div>
                )}
                {b.receivedBasket && (
                  <>
                    <div><span className="text-muted-foreground">תאריך קבלת סל:</span> {b.basketDate}</div>
                    {b.basketCostAtTime != null && (
                      <div><span className="text-muted-foreground">עלות סל:</span> {fmt(b.basketCostAtTime)}</div>
                    )}
                  </>
                )}
              </div>
              {allRows.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-1">יציאות:</p>
                  <div className="rounded border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">שם יציאה</TableHead>
                          <TableHead className="text-right">תאריך</TableHead>
                          <TableHead className="text-right">סכום</TableHead>
                          <TableHead className="text-right">סוג</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allRows.map((o) => (
                          <TableRow key={o.id}>
                            <TableCell>{o.name}</TableCell>
                            <TableCell>{o.date}</TableCell>
                            <TableCell>{fmt(o.amount)}</TableCell>
                            <TableCell>
                              <Badge variant={o.type === "סל" ? "default" : "secondary"}>{o.type}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Summary row */}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={2} className="text-left">סיכום</TableCell>
                          <TableCell colSpan={2}>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                              <span>סה"כ סלים: {fmt(basketTotal)}</span>
                              {askanimTotal > 0 && <span>סה"כ עסקנים: {fmt(askanimTotal)}</span>}
                              <span className="font-extrabold">סה"כ כללי: {fmt(grandTotal)}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Income results */}
      {type === "income" && filteredIncomes.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]">
                <TableHead className="text-primary-foreground text-right">תאריך</TableHead>
                <TableHead className="text-primary-foreground text-right">תיאור</TableHead>
                <TableHead className="text-primary-foreground text-right">סכום</TableHead>
                <TableHead className="text-primary-foreground text-center">מוכר</TableHead>
                <TableHead className="text-primary-foreground w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncomes.map((inc) => {
                const expanded = expandedId === inc.id;
                return (
                  <>
                    <TableRow
                      key={inc.id}
                      className={`cursor-pointer ${inc.auto ? "bg-sky-50 dark:bg-sky-950/20" : ""}`}
                      onClick={() => setExpandedId(expanded ? null : inc.id)}
                    >
                      <TableCell>{inc.date}</TableCell>
                      <TableCell>
                        {inc.description}
                        {inc.auto && <Badge variant="secondary" className="mr-2 text-xs bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">אוטומטי</Badge>}
                      </TableCell>
                      <TableCell>{fmt(inc.amount)}</TableCell>
                      <TableCell className="text-center">{inc.recognized ? "✅" : "—"}</TableCell>
                      <TableCell>{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</TableCell>
                    </TableRow>
                    {expanded && (
                      <TableRow key={`${inc.id}-detail`}>
                        <TableCell colSpan={5} className="bg-muted/30 text-sm">
                          <div className="p-2 space-y-1">
                            <p><strong>תיאור:</strong> {inc.description}</p>
                            <p><strong>סכום:</strong> {fmt(inc.amount)}</p>
                            <p><strong>תאריך:</strong> {inc.date}</p>
                            <p><strong>מוכר בעמותה:</strong> {inc.recognized ? "כן" : "לא"}</p>
                            <p><strong>סוג:</strong> {inc.auto ? "אוטומטי" : "ידני"}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Expense results */}
      {type === "expense" && filteredExpenses.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]">
                <TableHead className="text-primary-foreground text-right">תאריך</TableHead>
                <TableHead className="text-primary-foreground text-right">קטגוריה</TableHead>
                <TableHead className="text-primary-foreground text-right">תת-קטגוריה</TableHead>
                <TableHead className="text-primary-foreground text-right">הערות</TableHead>
                <TableHead className="text-primary-foreground text-right">סכום</TableHead>
                <TableHead className="text-primary-foreground text-center">מוכר</TableHead>
                <TableHead className="text-primary-foreground w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => {
                const expanded = expandedId === exp.id;
                return (
                  <>
                    <TableRow
                      key={exp.id}
                      className={`cursor-pointer ${exp.auto ? "bg-sky-50 dark:bg-sky-950/20" : ""}`}
                      onClick={() => setExpandedId(expanded ? null : exp.id)}
                    >
                      <TableCell>{exp.date}</TableCell>
                      <TableCell><Badge variant={exp.category === "סלים" ? "default" : "secondary"}>{exp.category === "סלים" ? "עבור הסלים" : "עבור העמותה"}</Badge></TableCell>
                      <TableCell>{exp.subCategory}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{exp.notes}</TableCell>
                      <TableCell>{fmt(exp.amount)}</TableCell>
                      <TableCell className="text-center">{exp.recognized ? "✅" : "—"}</TableCell>
                      <TableCell>{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</TableCell>
                    </TableRow>
                    {expanded && (
                      <TableRow key={`${exp.id}-detail`}>
                        <TableCell colSpan={7} className="bg-muted/30 text-sm">
                          <div className="p-2 space-y-1">
                            <p><strong>הערות:</strong> {exp.notes}</p>
                            <p><strong>קטגוריה:</strong> {exp.category === "סלים" ? "עבור הסלים" : "עבור העמותה"}</p>
                            <p><strong>תת-קטגוריה:</strong> {exp.subCategory}</p>
                            <p><strong>סכום:</strong> {fmt(exp.amount)}</p>
                            <p><strong>תאריך:</strong> {exp.date}</p>
                            <p><strong>מוכר בעמותה:</strong> {exp.recognized ? "כן" : "לא"}</p>
                            <p><strong>סוג:</strong> {exp.auto ? "אוטומטי" : "ידני"}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
