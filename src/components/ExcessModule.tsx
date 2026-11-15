import { useMemo, useState } from "react";
import { TrendingUp, Pencil, ArrowLeft } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { computeMoney, type BachurMoney } from "@/lib/money";
import type { Outing } from "@/lib/db";

function fmt(n: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency", currency: "ILS", minimumFractionDigits: 0,
  }).format(Math.round(n));
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("he-IL");
}

/** Walks a bachur's deposits oldest-first and says, for each one, how much of
 *  it still went towards the minimum and how much landed in the amuta's
 *  pocket. The split is per-deposit, not one subtraction at the end, because
 *  the single deposit that crosses the line is usually split in two. */
function splitOutings(outings: Outing[], minimum: number) {
  const sorted = [...(outings || [])].sort(
    (a, b) => (a.date || "").localeCompare(b.date || "")
  );
  let running = 0;
  return sorted.map((o) => {
    const amount = o.amount || 0;
    const roomLeft = Math.max(0, minimum - running);
    const toMinimum = Math.min(amount, roomLeft);
    running += amount;
    return { outing: o, amount, toMinimum, toAmuta: amount - toMinimum };
  });
}

export default function ExcessModule() {
  const {
    bachurim, incomes, askanimIncomes, expenses, basketProducts, globalSettings,
  } = useData();
  const { navigateTo } = useNavigation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<BachurMoney | null>(null);

  const min = globalSettings.minimumForBasket || 0;

  const money = useMemo(() => computeMoney({
    bachurim, incomes, askanimIncomes, expenses,
    products: basketProducts, minimum: min,
    openingBalance: globalSettings.openingBalance,
  }), [bachurim, incomes, askanimIncomes, expenses, basketProducts, min, globalSettings.openingBalance]);

  const rows = useMemo(() => {
    const q = query.trim();
    return money.perBachur
      .filter((b) => b.excess > 0)
      .filter((b) => !q || b.name.includes(q))
      .sort((a, b) => b.excess - a.excess);
  }, [money, query]);

  const totalExcess = rows.reduce((s, b) => s + b.excess, 0);
  const allExcess = money.pockets.amutaExcess;

  const detail = useMemo(() => {
    if (!selected) return [];
    const b = bachurim.find((x) => x.id === selected.id);
    return b ? splitOutings(b.outings, min) : [];
  }, [selected, bachurim, min]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">עברו את המינימום</h2>
          <p className="text-sm text-muted-foreground">
            כל שקל שבחור הכניס מעל המינימום ({fmt(min)}) שייך לעמותה ולא לסלים.
            המסך הזה מחושב לבד — אין בו מה להוסיף או למחוק, הכול מתעדכן
            מכרטיס הבחור.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">בחורים שעברו את המינימום</p>
          <p className="text-2xl font-bold">{rows.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">סך העודף שלהם</p>
          <p className="text-2xl font-bold text-primary">{fmt(totalExcess)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">בכיס העמותה מעודפים</p>
          <p className="text-2xl font-bold">{fmt(allExcess)}</p>
          {Math.round(allExcess) !== Math.round(totalExcess) && (
            <p className="text-[11px] text-muted-foreground mt-1">
              ההפרש הוא עודפים של בחורים שסוננו בחיפוש
            </p>
          )}
        </div>
      </div>

      <Input
        placeholder="חיפוש לפי שם..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-xs"
      />

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">סך הכול הכניס</TableHead>
              <TableHead className="text-right">נספר לסלים</TableHead>
              <TableHead className="text-right">עודף לעמותה</TableHead>
              <TableHead className="text-right">מצב</TableHead>
              <TableHead className="text-right w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  {query
                    ? "אין בחור בשם הזה שעבר את המינימום"
                    : "אף בחור עדיין לא עבר את המינימום"}
                </TableCell>
              </TableRow>
            ) : rows.map((b) => (
              <TableRow
                key={b.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelected(b)}
              >
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{fmt(b.given)}</TableCell>
                <TableCell>{fmt(b.inSalim)}</TableCell>
                <TableCell className="font-semibold text-primary">{fmt(b.excess)}</TableCell>
                <TableCell className="text-sm">
                  {b.closed
                    ? <span className="text-muted-foreground">סגור</span>
                    : b.eligible
                      ? <span className="text-green-600">זכאי לסל</span>
                      : <span>עבר את המינימום</span>}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    title="פתח את כרטיס הבחור"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo("bachurim", b.id, { edit: true });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              כל הכנסה לפי תאריך, ואיך היא התחלקה בין הסלים לעמותה.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-muted p-2">
                  <p className="text-[11px] text-muted-foreground">הכניס</p>
                  <p className="font-bold">{fmt(selected.given)}</p>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <p className="text-[11px] text-muted-foreground">לסלים</p>
                  <p className="font-bold">{fmt(selected.inSalim)}</p>
                </div>
                <div className="rounded-md bg-primary/10 p-2">
                  <p className="text-[11px] text-muted-foreground">עודף לעמותה</p>
                  <p className="font-bold text-primary">{fmt(selected.excess)}</p>
                </div>
              </div>

              <div className="rounded-lg border overflow-hidden max-h-[45vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">תאריך</TableHead>
                      <TableHead className="text-right">יציאה</TableHead>
                      <TableHead className="text-right">סכום</TableHead>
                      <TableHead className="text-right">לסלים</TableHead>
                      <TableHead className="text-right">לעמותה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.map((d) => (
                      <TableRow key={d.outing.id}>
                        <TableCell className="whitespace-nowrap">{fmtDate(d.outing.date)}</TableCell>
                        <TableCell>{d.outing.name || "—"}</TableCell>
                        <TableCell>{fmt(d.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {d.toMinimum > 0 ? fmt(d.toMinimum) : "—"}
                        </TableCell>
                        <TableCell className={d.toAmuta > 0 ? "font-semibold text-primary" : "text-muted-foreground"}>
                          {d.toAmuta > 0 ? fmt(d.toAmuta) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  const id = selected.id;
                  setSelected(null);
                  navigateTo("bachurim", id, { edit: true });
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                לעריכה בכרטיס הבחור
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
