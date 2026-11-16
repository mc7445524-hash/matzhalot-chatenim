import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Store, AlertTriangle, CheckCircle2, Scale } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { computeMoney } from "@/lib/money";
import type { Expense } from "@/lib/db";

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

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function BasketClosureModule() {
  const {
    bachurim, incomes, askanimIncomes, expenses, basketProducts,
    globalSettings, setExpenses,
  } = useData();

  const min = globalSettings.minimumForBasket || 0;

  const money = useMemo(() => computeMoney({
    bachurim, incomes, askanimIncomes, expenses,
    products: basketProducts, minimum: min,
    openingBalance: globalSettings.openingBalance,
  }), [bachurim, incomes, askanimIncomes, expenses, basketProducts, min, globalSettings.openingBalance]);

  const bachurDates = useMemo(
    () => new Map(bachurim.map((b) => [b.id, b.basketDate])),
    [bachurim]
  );
  const nameById = useMemo(
    () => new Map(bachurim.map((b) => [b.id, b.name])),
    [bachurim]
  );
  const shopNameById = useMemo(
    () => new Map(basketProducts.map((p) => [p.id, p.name])),
    [basketProducts]
  );

  /** Writes go to both stores on purpose: the context so this screen and the
   *  dashboard react at once, localStorage because the older modules read
   *  from there and the sync layer carries it to the cloud. */
  function commit(list: Expense[]) {
    setExpenses(list);
    try { localStorage.setItem("expenses", JSON.stringify(list)); } catch { /* noop */ }
  }

  // ── shops with baskets still to settle ────────────────────────
  const openShops = money.shops
    .filter((s) => s.openBachurim.length > 0)
    .sort((a, b) => b.expected - a.expected);

  // ── debts agreed with a shop and not yet handed over ──────────
  const debts = useMemo(
    () => expenses
      .filter((e) => e.basketGapKind === "debt" && (e.basketGapAmount || 0) > 0)
      .sort((a, b) => (a.date || "").localeCompare(b.date || "")),
    [expenses]
  );

  // ── every payment where the invoice and the baskets disagreed ─
  const diffs = useMemo(() => {
    const lockedShare = (bachurId: string, productId: string) => {
      const m = money.byId.get(bachurId);
      return m?.shares.find((s) => s.productId === productId)?.cost || 0;
    };
    return expenses
      .filter((e) => e.basketProductId && (e.basketBachurIds || []).length > 0)
      .map((e) => {
        const ids = e.basketBachurIds || [];
        const expected = ids.reduce((s, id) => s + lockedShare(id, e.basketProductId!), 0);
        return {
          expense: e,
          shop: shopNameById.get(e.basketProductId!) || e.subCategory || "חנות",
          names: ids.map((id) => nameById.get(id) || "—"),
          expected,
          paid: Number(e.amount) || 0,
          gap: (Number(e.amount) || 0) - expected,
        };
      })
      .filter((r) => Math.round(r.gap) !== 0)
      .sort((a, b) => (a.expense.date || "").localeCompare(b.expense.date || ""));
  }, [expenses, money, shopNameById, nameById]);

  // ── the payment dialog ────────────────────────────────────────
  const [payShopId, setPayShopId] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(today());
  const [payNotes, setPayNotes] = useState("");
  const [gapKind, setGapKind] = useState<"discount" | "debt" | null>(null);
  const [withDebts, setWithDebts] = useState<Set<string>>(new Set());

  const shop = openShops.find((s) => s.productId === payShopId)
    || money.shops.find((s) => s.productId === payShopId);

  const shopDebts = debts.filter((d) => d.basketProductId === payShopId);

  const pickedExpected = shop
    ? shop.openBachurim.filter((b) => picked.has(b.id)).reduce((s, b) => s + b.cost, 0)
    : 0;
  const debtExpected = shopDebts
    .filter((d) => withDebts.has(d.id))
    .reduce((s, d) => s + (d.basketGapAmount || 0), 0);
  const expectedTotal = pickedExpected + debtExpected;
  // Before an amount is typed the invoice is not "0 and short by the whole
  // basket" — it is simply not entered yet, so the question stays hidden.
  const typed = payAmount.trim() !== "";
  const actual = Number(payAmount) || 0;
  const shortfall = Math.max(0, expectedTotal - actual);
  const overpaid = Math.max(0, actual - expectedTotal);

  function openPay(productId: string) {
    const s = money.shops.find((x) => x.productId === productId);
    setPayShopId(productId);
    setPicked(new Set(s ? s.openBachurim.map((b) => b.id) : []));
    setPayAmount("");
    setPayDate(today());
    setPayNotes("");
    setGapKind(null);
    setWithDebts(new Set());
  }

  function closePay() {
    setPayShopId(null);
    setPicked(new Set());
  }

  function toggle(set: Set<string>, id: string, apply: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    apply(next);
  }

  function handlePay() {
    if (!shop) return;
    if (picked.size === 0 && withDebts.size === 0) {
      toast.error("צריך לבחור לפחות בחור אחד או חוב אחד");
      return;
    }
    if (!payAmount.trim() || actual < 0) {
      toast.error("צריך להזין את סכום החשבונית");
      return;
    }
    if (shortfall > 0 && !gapKind) {
      toast.error("צריך לבחור מה קורה עם ההפרש — הנחה או ישולם בהמשך");
      return;
    }

    const names = shop.openBachurim
      .filter((b) => picked.has(b.id))
      .map((b) => b.name);

    const newExp: Expense = {
      id: crypto.randomUUID(),
      amount: actual,
      date: payDate,
      category: "סלים",
      subCategory: shop.name,
      basketProductId: shop.productId,
      basketBachurIds: [...picked],
      notes: [payNotes.trim(), names.length ? `עבור: ${names.join(", ")}` : ""]
        .filter(Boolean).join(" · "),
      contactPerson: "",
      recognized: false,
      ...(shortfall > 0
        ? { basketGapKind: gapKind!, basketGapAmount: shortfall }
        : {}),
    };

    // A debt that this invoice covers is settled; it stops being money the
    // amuta still owes and is simply part of what was just paid.
    const updated = expenses.map((e) =>
      withDebts.has(e.id)
        ? { ...e, basketGapKind: undefined, basketGapAmount: undefined }
        : e
    );
    commit([...updated, newExp]);

    toast.success(
      shortfall > 0
        ? gapKind === "discount"
          ? `נסגר. ${fmt(shortfall)} נשארו בעמותה כרווח`
          : `נסגר. נפתח חוב של ${fmt(shortfall)} ל${shop.name}`
        : overpaid > 0
          ? `נסגר. ${fmt(overpaid)} מעל הצפוי נלקחו מהכסף הפנוי של העמותה`
          : "נסגר בדיוק לפי הצפוי"
    );
    closePay();
  }

  /** Releases shares without paying: the shop was dropped from those baskets,
   *  so the money set aside for it goes back to the amuta. */
  function handleNotRelevant() {
    if (!shop || picked.size === 0) {
      toast.error("צריך לבחור בחורים");
      return;
    }
    const chosen = shop.openBachurim.filter((b) => picked.has(b.id));
    const released = chosen.reduce((s, b) => s + b.cost, 0);
    const newExp: Expense = {
      id: crypto.randomUUID(),
      amount: 0,
      date: payDate,
      category: "סלים",
      subCategory: shop.name,
      basketProductId: shop.productId,
      basketBachurIds: chosen.map((b) => b.id),
      notes: `לא רלוונטי — ${shop.name} לא נכלל בסל של: ${chosen.map((b) => b.name).join(", ")}`,
      contactPerson: "",
      recognized: false,
      basketGapKind: "discount",
      basketGapAmount: released,
    };
    commit([...expenses, newExp]);
    toast.success(`${fmt(released)} שוחררו חזרה לעמותה`);
    closePay();
  }

  function markDebtPaid(id: string) {
    commit(expenses.map((e) =>
      e.id === id ? { ...e, basketGapKind: undefined, basketGapAmount: undefined } : e
    ));
    toast.success("החוב סומן כשולם");
  }

  const totalOpen = openShops.reduce((s, x) => s + x.expected, 0);
  const totalDebt = debts.reduce((s, d) => s + (d.basketGapAmount || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">סגירת סלים</h2>
          <p className="text-sm text-muted-foreground">
            סל מורכב ממוצרים, וכל מוצר הוא חנות. כאן רושמים מה באמת שולם לכל
            חנות ועל אילו בחורים — וההפרש בין הצפוי למה ששולם נכנס לעמותה.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">חנויות שממתינות לסגירה</p>
          <p className="text-2xl font-bold">{openShops.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">צפוי לצאת לחנויות</p>
          <p className="text-2xl font-bold">{fmt(totalOpen)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">חובות פתוחים לחנויות</p>
          <p className={`text-2xl font-bold ${totalDebt > 0 ? "text-amber-600" : ""}`}>
            {fmt(totalDebt)}
          </p>
        </div>
      </div>

      {/* ─── 1. shops waiting to be settled ─────────────────── */}
      <section className="space-y-2">
        <h3 className="font-semibold">ממתינות לסגירה</h3>
        {openShops.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
            אין סל פתוח. כל מה שנמסר — שולם.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {openShops.map((s) => {
              const dates = s.openBachurim
                .map((b) => bachurDates.get(b.id) || "")
                .filter(Boolean)
                .sort();
              return (
                <div key={s.productId} className="rounded-lg border bg-card p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {s.name}
                        {!s.active && (
                          <span className="mr-2 text-xs text-muted-foreground font-normal">
                            (הוצא מהסל)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.openBachurim.length} בחורים ממתינים
                        {dates.length > 0 && ` · הישן ביותר ${fmtDate(dates[0])}`}
                      </p>
                    </div>
                    <p className="text-lg font-bold whitespace-nowrap">{fmt(s.expected)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {s.openBachurim.map((b) => b.name).join(" · ")}
                  </p>
                  <Button size="sm" className="w-full" onClick={() => openPay(s.productId)}>
                    רשום תשלום לחנות
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── 2. open debts ──────────────────────────────────── */}
      <section className="space-y-2">
        <h3 className="font-semibold">חובות פתוחים לחנויות</h3>
        {debts.length === 0 ? (
          <p className="text-sm text-muted-foreground">אין חוב פתוח לאף חנות.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">חנות</TableHead>
                  <TableHead className="text-right">סכום החוב</TableHead>
                  <TableHead className="text-right">הערות</TableHead>
                  <TableHead className="text-right w-28"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="whitespace-nowrap">{fmtDate(d.date)}</TableCell>
                    <TableCell>{shopNameById.get(d.basketProductId!) || d.subCategory}</TableCell>
                    <TableCell className="font-semibold text-amber-600">
                      {fmt(d.basketGapAmount || 0)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.notes}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => markDebtPaid(d.id)}>
                        סומן כשולם
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* ─── 3. the differences report ──────────────────────── */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">דוח הפרשים</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          מספר הסלים חייב להיות זהה — הסכום לא. כל שורה כאן היא חנות שגבתה
          אחרת ממה שהסל נעל, והשורה הראשונה היא התאריך שממנו הספרים הפסיקו
          להסתדר.
        </p>
        {diffs.length === 0 ? (
          <p className="text-sm text-muted-foreground">אין אף הפרש. הכול יצא בדיוק לפי הצפוי.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">חנות</TableHead>
                  <TableHead className="text-right">בחורים</TableHead>
                  <TableHead className="text-right">צפוי</TableHead>
                  <TableHead className="text-right">שולם</TableHead>
                  <TableHead className="text-right">הפרש</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diffs.map((r) => (
                  <TableRow key={r.expense.id}>
                    <TableCell className="whitespace-nowrap">{fmtDate(r.expense.date)}</TableCell>
                    <TableCell>{r.shop}</TableCell>
                    <TableCell className="text-xs">{r.names.join(", ")}</TableCell>
                    <TableCell>{fmt(r.expected)}</TableCell>
                    <TableCell>{fmt(r.paid)}</TableCell>
                    {/* A shop that charged less is only profit once it is a
                        discount. Called a debt, the money is still owed. */}
                    <TableCell
                      className={
                        r.gap > 0
                          ? "text-amber-600 font-semibold"
                          : r.expense.basketGapKind === "debt"
                            ? "text-amber-600 font-semibold"
                            : "text-green-600 font-semibold"
                      }
                    >
                      {r.gap > 0
                        ? `${fmt(r.gap)} יצאו מהעמותה`
                        : r.expense.basketGapKind === "debt"
                          ? `${fmt(-r.gap)} עדיין חייבים לחנות`
                          : `${fmt(-r.gap)} הנחה — נשאר בעמותה`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* ─── payment dialog ─────────────────────────────────── */}
      <Dialog open={!!payShopId} onOpenChange={(o) => !o && closePay()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>תשלום ל{shop?.name}</DialogTitle>
            <DialogDescription>
              בחר על אילו בחורים החשבונית הזאת — כל בחור נסגר פעם אחת לכל חנות.
            </DialogDescription>
          </DialogHeader>

          {shop && (
            <div className="space-y-4">
              <div className="rounded-lg border overflow-hidden max-h-56 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={picked.size === shop.openBachurim.length && picked.size > 0}
                          onCheckedChange={(c) =>
                            setPicked(c ? new Set(shop.openBachurim.map((b) => b.id)) : new Set())
                          }
                        />
                      </TableHead>
                      <TableHead className="text-right">בחור</TableHead>
                      <TableHead className="text-right">תאריך הסל</TableHead>
                      <TableHead className="text-right">נעל בסל</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shop.openBachurim.map((b) => (
                      <TableRow
                        key={b.id}
                        className="cursor-pointer"
                        onClick={() => toggle(picked, b.id, setPicked)}
                      >
                        <TableCell>
                          <Checkbox checked={picked.has(b.id)} />
                        </TableCell>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {fmtDate(bachurDates.get(b.id))}
                        </TableCell>
                        <TableCell>{fmt(b.cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {shopDebts.length > 0 && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 space-y-2">
                  <p className="text-sm font-medium">יש חוב פתוח לחנות הזאת</p>
                  {shopDebts.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={withDebts.has(d.id)}
                        onCheckedChange={() => toggle(withDebts, d.id, setWithDebts)}
                      />
                      <span>
                        {fmt(d.basketGapAmount || 0)} מתאריך {fmtDate(d.date)} —
                        האם החשבונית הזאת כוללת גם אותו?
                      </span>
                    </label>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>סכום החשבונית בפועל</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={payAmount}
                    onChange={(e) => { setPayAmount(e.target.value); setGapKind(null); }}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>תאריך התשלום</Label>
                  <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>הערות</Label>
                <Textarea
                  rows={2}
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="מספר חשבונית, פרטים..."
                />
              </div>

              <div className="rounded-lg bg-muted p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span>צפוי לפי מה שהסלים נעלו</span>
                  <span className="font-semibold">{fmt(expectedTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>החשבונית בפועל</span>
                  <span className="font-semibold">{fmt(actual)}</span>
                </div>
                {typed && shortfall > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>החנות גבתה פחות</span>
                    <span className="font-bold">{fmt(shortfall)}</span>
                  </div>
                )}
                {overpaid > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>החנות גבתה יותר — יֵצא מהכסף הפנוי של העמותה</span>
                    <span className="font-bold">{fmt(overpaid)}</span>
                  </div>
                )}
              </div>

              {typed && shortfall > 0 && (
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    נשארו {fmt(shortfall)} — מה הם?
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      type="button"
                      variant={gapKind === "discount" ? "default" : "outline"}
                      className="h-auto py-2.5 flex-col items-start gap-0.5"
                      onClick={() => setGapKind("discount")}
                    >
                      <span className="font-semibold">הנחה</span>
                      <span className="text-[11px] font-normal opacity-80">
                        נשאר בעמותה כרווח. אין חוב.
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant={gapKind === "debt" ? "default" : "outline"}
                      className="h-auto py-2.5 flex-col items-start gap-0.5"
                      onClick={() => setGapKind("debt")}
                    >
                      <span className="font-semibold">ישולם בהמשך</span>
                      <span className="text-[11px] font-normal opacity-80">
                        נפתח חוב לחנות, יורד מהכסף הפנוי.
                      </span>
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    בשני המקרים הבחורים נסגרים ולא נשארים פתוחים.
                  </p>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="ghost" onClick={handleNotRelevant}>
                  לא רלוונטי לבחורים שנבחרו
                </Button>
                <Button onClick={handlePay}>שמור וסגור</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
