import { useMemo, useState } from "react";
import DashboardTasks from "@/components/DashboardTasks";
import {
  Wallet, Snowflake, Receipt, ClipboardList, Scale, Download, ChevronDown,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CLOSE_TO_BASKET_RATIO } from "@/lib/db";
import { computeMoney } from "@/lib/money";
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

function PocketRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={value < 0 ? "text-red-600" : "text-foreground"}>{fmt(value)}</span>
    </div>
  );
}

function StageCard(
  { title, note, value, tone }:
  { title: string; note: string; value: number; tone: "muted" | "amber" | "red" }
) {
  const ring = tone === "red"
    ? "border-red-200 dark:border-red-900"
    : tone === "amber"
      ? "border-amber-200 dark:border-amber-900"
      : "border-border";
  return (
    <div className={`rounded-xl border bg-card p-5 ${ring}`}>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{fmt(value)}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────
export default function Dashboard() {
  const {
    bachurim, incomes, expenses, askanimIncomes, fundraisers, globalSettings,
    basketProducts,
  } = useData();
  const { navigateTo } = useNavigation();

  const min = globalSettings.minimumForBasket || 0;
  const basketCost = globalSettings.basketCost || 0;
  const amutaSupplement = Math.max(0, basketCost - min);

  /** Every askan income is written twice: once to askanimIncomes and once,
   *  mirrored, to incomes under this category. Counting both would inflate
   *  the income total, so the mirrors are dropped and askanimIncomes is the
   *  single source for that money. */
  const generalIncomes = useMemo(
    () => incomes.filter((i: any) => i.category !== "פרויקט עסקנים"),
    [incomes]
  );

  // Everything about the money comes from one place, so that no screen can
  // disagree with another about whose a shekel is.
  const money = useMemo(() => computeMoney({
    bachurim, incomes, askanimIncomes, expenses,
    products: basketProducts, minimum: min,
    openingBalance: globalSettings.openingBalance,
    bankGap: globalSettings.bankGap,
  }), [bachurim, incomes, askanimIncomes, expenses, basketProducts, min, globalSettings.openingBalance, globalSettings.bankGap]);

  // ── derived per-bachur stats ────────────────────────────────
  const stats = useMemo(() => {
    const active = bachurim.filter((b) => !b.married);
    const married = bachurim.filter((b) => b.married);
    const { pockets, expected } = money;

    const cappedSum = pockets.salimFromBachurim;
    const excessSum = pockets.amutaExcess;
    const incomesSum = pockets.amutaDonations;
    const askanimSum = pockets.amutaAskanim;

    // Money a bachur gave stays in the books after he marries — it is still
    // in the bank, and the basket it paid for is an expense of its own.
    const marriedSum = married.reduce((s, b) => s + bachurTotal(b), 0);
    const otherIncomes = incomesSum + askanimSum + excessSum + marriedSum + pockets.amutaOpening;
    const totalIncome = pockets.totalIncome;

    const eligible = active.filter((b) => bachurTotal(b) >= min && min > 0);
    const frozenFromBachurim = pockets.salimFromBachurim;
    const frozenFromAmuta = pockets.salimAllocations;
    const frozenTotal = pockets.salimTotal;

    const totalExpenses = pockets.totalExpenses;

    const expectedList = eligible.filter((b) => !b.receivedBasket);
    const expectedTotal = expected.allocated;

    return {
      active, married, cappedSum, excessSum, incomesSum, askanimSum,
      marriedSum, otherIncomes, totalIncome,
      eligible, frozenFromBachurim, frozenFromAmuta, frozenTotal,
      totalExpenses, expectedList, expectedTotal,
    };
  }, [bachurim, money, min]);

  const balance = stats.totalIncome - stats.totalExpenses;
  const balanceWithExpected = balance - stats.expectedTotal;

  // ── modals state ────────────────────────────────────────────
  const [openCard, setOpenCard] = useState<null | "A" | "B" | "C" | "D" | "E">(null);

  // Card A inner state
  const [aMode, setAMode] = useState<null | "bachurim" | "other">(null);
  const [aBachurFilter, setABachurFilter] = useState<string[]>(["eligible"]);
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
      <p className="text-muted-foreground mb-6">סקירה כללית של נתוני העמותה</p>

      <DashboardTasks />

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

      {/* ─── The two pockets ─── */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-1">שני הכיסים</h3>
        <p className="text-sm text-muted-foreground mb-4">
          אותו כסף בבנק, מחולק לפי מי שהוא שייך לו. כיס הסלים הוא כסף שכבר
          הובטח; רק "פנוי לעמותה" הוא כסף שאפשר להשתמש בו.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground mb-3">כיס הסלים</p>
            <PocketRow label="כסף הבחורים (עד המינימום)" value={money.pockets.salimFromBachurim} />
            <PocketRow label="הוקצה לזכאים" value={money.pockets.salimAllocations} />
            <PocketRow label="חוב לחנויות על סלים שנמסרו" value={money.pockets.salimOwedToShops} />
            <div className="mt-3 border-t border-border pt-2 flex justify-between">
              <span className="text-sm font-semibold">סה"כ</span>
              <span className="text-lg font-bold">{fmt(money.pockets.salimTotal)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground mb-3">כיס העמותה</p>
            <PocketRow label="פרויקט עסקנים" value={money.pockets.amutaAskanim} />
            <PocketRow label="תרומות והכנסות" value={money.pockets.amutaDonations} />
            <PocketRow label="עודפי בחורים מעל המינימום" value={money.pockets.amutaExcess} />
            {money.pockets.amutaOpening !== 0 && (
              <PocketRow label="יתרת פתיחה" value={money.pockets.amutaOpening} />
            )}
            <PocketRow label="הוקצה לסלים" value={-money.pockets.amutaLentOut} />
            {money.pockets.openShopDebts > 0 && (
              <PocketRow label="חוב פתוח לחנויות" value={-money.pockets.openShopDebts} />
            )}
            {money.pockets.bankDiff !== null && money.pockets.bankDiff !== 0 && (
              <PocketRow label="חסר בבנק מול הספרים" value={money.pockets.bankDiff} />
            )}
          </div>

          <div className={`rounded-xl border p-5 ${
            money.pockets.amutaFree < 0
              ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
              : "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
          }`}>
            <p className="text-sm font-medium text-muted-foreground mb-3">כמה כסף באמת פנוי</p>
            <p className={`text-4xl font-bold ${
              money.pockets.amutaFree < 0 ? "text-red-600" : "text-green-700 dark:text-green-500"
            }`}>
              {fmt(money.pockets.amutaFree)}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              בבנק {fmt(money.pockets.actualBank ?? money.pockets.bank)} · מתוכם{" "}
              {fmt(money.pockets.salimTotal)} מובטחים
            </p>
            {money.pockets.amutaFree < 0 && (
              <p className="mt-3 text-sm font-semibold text-red-600">
                ✗ העמותה התחייבה על יותר סלים ממה שיש לה
              </p>
            )}
          </div>
        </div>

        {/* ─── The hole, and the gap that cannot be quietly closed ─── */}
        {money.pockets.bankDiff === null ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h3 className="text-lg font-bold text-foreground mb-1">בדיקת בנק</h3>
            <p className="text-sm text-muted-foreground">
              כדי לדעת אם הכסף שאמור להיות בחשבון באמת שם — הזינו בהגדרות, תחת
              "בדיקת בנק", כמה באמת יש בבנק היום.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* The question he actually asks: how much must be put back */}
            <div className={`rounded-xl border p-5 ${
              (money.pockets.holeInSalim as number) > 0
                ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                : "border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
            }`}>
              <h3 className="text-lg font-bold text-foreground mb-1">החור שצריך להחזיר</h3>
              <p className="text-sm text-muted-foreground mb-3">
                כסף של בחורים חייב להיות בחשבון. אם הוא חסר — צריך להחזיר אותו.
                יתרת הבנק מתעדכנת לבד מכל הכנסה והוצאה.
              </p>
              <PocketRow label="כסף שמובטח לבחורים" value={money.pockets.salimTotal + money.pockets.openShopDebts} />
              <PocketRow label="יש בבנק" value={money.pockets.actualBank as number} />
              <div className="mt-3 border-t border-border pt-2 flex justify-between items-center">
                <span className="text-sm font-semibold">חסר להחזיר</span>
                <span className={`text-3xl font-bold ${
                  (money.pockets.holeInSalim as number) > 0
                    ? "text-red-600"
                    : "text-green-700 dark:text-green-500"
                }`}>
                  {fmt(money.pockets.holeInSalim as number)}
                </span>
              </div>
              {(money.pockets.holeInSalim as number) === 0 && (
                <p className="mt-3 text-sm font-semibold text-green-700 dark:text-green-500">
                  ✓ כל הכסף של הבחורים נמצא בבנק
                </p>
              )}
            </div>

            {/* The figure a mistake cannot quietly erase */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-lg font-bold text-foreground mb-1">הפער בספרים</h3>
              <p className="text-sm text-muted-foreground mb-3">
                כמה כסף לא מוסבר — בלי קשר לשאלה של מי הוא היה.
                {globalSettings.actualBankDate && (
                  <> נמדד ב-{new Date(globalSettings.actualBankDate).toLocaleDateString("he-IL")}.</>
                )}{" "}
                המספר ננעל ביום המדידה. אם היתרה במערכת כבר לא תואמת לבנק —
                הזינו אותה שוב בהגדרות, וזה מה שיתפוס טעות חדשה.
              </p>
              <PocketRow label="אמור להיות בבנק" value={money.pockets.bank} />
              <PocketRow label="באמת יש בבנק" value={money.pockets.actualBank as number} />
              <div className="mt-3 border-t border-border pt-2 flex justify-between items-center">
                <span className="text-sm font-semibold">
                  {(money.pockets.bankDiff as number) > 0 ? "יש יותר מהרשום" : "לא מוסבר"}
                </span>
                <span className={`text-2xl font-bold ${
                  money.pockets.bankDiff === 0
                    ? "text-green-700 dark:text-green-500"
                    : (money.pockets.bankDiff as number) < 0
                      ? "text-red-600"
                      : "text-amber-600"
                }`}>
                  {fmt(Math.abs(money.pockets.bankDiff as number))}
                </span>
              </div>

              {money.pockets.bankDiff === 0 && (
                <p className="mt-3 text-sm font-semibold text-green-700 dark:text-green-500">
                  ✓ הספרים והבנק תואמים
                </p>
              )}

              {(money.pockets.bankDiff as number) < 0 && (
                <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
                  <p className="text-sm font-semibold text-foreground mb-1">מתוך זה:</p>
                  <PocketRow
                    label="היה כסף פנוי של העמותה — אין מה להחזיר"
                    value={money.pockets.missingFromAmuta as number}
                  />
                  <PocketRow
                    label="היה כסף של הבחורים — זה החור"
                    value={money.pockets.holeInSalim as number}
                  />
                </div>
              )}

              {money.pockets.bankDiff !== 0 && (
                <div className={`mt-4 rounded-lg border p-4 text-sm ${
                  (money.pockets.bankDiff as number) < 0
                    ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                    : "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                }`}>
                  <p className="text-muted-foreground">
                    {(money.pockets.bankDiff as number) < 0
                      ? "ברוב המקרים הסיבה היא הוצאה ששולמה ולא הוזנה כאן. בדקו קודם את זה, ואחר כך יתרת פתיחה שלא הוזנה."
                      : "ברוב המקרים הסיבה היא הכנסה שהתקבלה ולא נרשמה, או יתרת פתיחה שחסרה."}
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    תרומה שתיכנס תקטין את החור — <strong className="text-foreground">ולא תזיז את המספר הזה</strong>,
                    כי הבנק והספרים עולים יחד. הפקדה של בחור לא תקטין אף אחד
                    מהשניים: היא מעלה גם את מה שמובטח לו.
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    אל תסגרו את המספר הזה בהזנת סכום. הוא זוכר כמה כסף נעלם, גם
                    אחרי שהחור יכוסה.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── What is still to come ─── */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-foreground mb-1">מה עוד צפוי לצאת</h3>
        <p className="text-sm text-muted-foreground mb-4">
          שלושה שלבים שונים, ואסור לערבב ביניהם — רק השניים האחרונים הם כסף
          ששמור בפועל.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StageCard
            title="מתקרבים למינימום"
            note={`${money.expected.approachingCount} בחורים · תחזית בלבד, לא הוקצה`}
            value={money.expected.approaching}
            tone="muted"
          />
          <StageCard
            title="הוקצה — זכאים ללא סל"
            note={`${money.expected.allocatedCount} בחורים · הכסף כבר שמור בכיס הסלים`}
            value={money.expected.allocated}
            tone="amber"
          />
          <StageCard
            title="חוב לחנויות"
            note={`${money.expected.shopDebtCount} סלים נמסרו וטרם שולמו`}
            value={money.expected.shopDebt}
            tone="red"
          />
        </div>
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
              incomes={generalIncomes} askanimIncomes={askanimIncomes}
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

const BACHUR_CATEGORIES = [
  { id: "eligible", label: "זכאי (הגיע למינימום)" },
  { id: "close",    label: "קרוב לסל (80%+)" },
  { id: "far",      label: "רחוק מהסל (מתחת ל-80%)" },
  { id: "married",  label: "התחתן" },
] as const;

/** The four categories are mutually exclusive, so OR-ing them cannot
 *  double-count a bachur — the totals below the table rely on that. */
function bachurCategory(b: any, min: number) {
  if (b.married) return "married";
  const t = bachurTotal(b);
  if (t >= min) return "eligible";
  if (t >= CLOSE_TO_BASKET_RATIO * min) return "close";
  return "far";
}

function CardABachurim({ bachurim, min, filter, setFilter, onBack, onRowClick }: {
  bachurim: any[]; min: number;
  filter: string[]; setFilter: (s: string[]) => void; onBack: () => void;
  onRowClick?: (id: string) => void;
}) {
  const filtered = useMemo(() => {
    // No selection means no restriction, matching the old "בחר הכול".
    if (filter.length === 0) return bachurim;
    return bachurim.filter((b) => filter.includes(bachurCategory(b, min)));
  }, [bachurim, filter, min]);

  const toggle = (id: string) =>
    setFilter(filter.includes(id) ? filter.filter((f) => f !== id) : [...filter, id]);

  const filterLabel =
    filter.length === 0 ? "כל הבחורים"
    : filter.length === 1 ? BACHUR_CATEGORIES.find((c) => c.id === filter[0])?.label ?? ""
    : `${filter.length} קטגוריות`;

  const rows = filtered.map((b) => ({
    id: b.id as string,
    name: b.name,
    amount: Math.min(bachurTotal(b), min),
    actual: bachurTotal(b),
  }));
  const sumAmount = rows.reduce((s, r) => s + r.amount, 0);
  const sumActual = rows.reduce((s, r) => s + r.actual, 0);

  // The headline "הכנסות בחורים" counts only the unmarried, so show that
  // subtraction explicitly instead of making the reader infer it.
  const breakdown = useMemo(() => {
    const capped = (b: any) => Math.min(bachurTotal(b), min);
    const marriedList = bachurim.filter((b) => b.married);
    return {
      allCount: bachurim.length,
      allSum: bachurim.reduce((s, b) => s + capped(b), 0),
      marriedCount: marriedList.length,
      marriedSum: marriedList.reduce((s, b) => s + capped(b), 0),
    };
  }, [bachurim, min]);
  const netCount = breakdown.allCount - breakdown.marriedCount;
  const netSum = breakdown.allSum - breakdown.marriedSum;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={onBack}>← חזור</Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="w-[220px] justify-between font-normal">
              <span className="truncate">{filterLabel}</span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-2" align="start" dir="rtl">
            <button
              type="button"
              className="w-full text-right text-sm px-2 py-1.5 rounded hover:bg-accent"
              onClick={() =>
                setFilter(
                  filter.length === BACHUR_CATEGORIES.length
                    ? []
                    : BACHUR_CATEGORIES.map((c) => c.id as string)
                )
              }
            >
              {filter.length === BACHUR_CATEGORIES.length ? "נקה הכול" : "בחר הכול"}
            </button>
            <div className="h-px bg-border my-1" />
            {BACHUR_CATEGORIES.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={filter.includes(c.id)}
                  onCheckedChange={() => toggle(c.id)}
                />
                <span className="text-sm">{c.label}</span>
              </label>
            ))}
          </PopoverContent>
        </Popover>
        <div className="ms-auto">
          <ExportButton
            onClick={() => exportToExcel(`הכנסות-בחורים-${filter.length ? filter.join("-") : "הכל"}`,
              ["שם", "סכום (עד מינימום)", "סכום בפועל"],
              [
                [`סה"כ (${rows.length})`, sumAmount, sumActual],
                ...rows.map((r) => [r.name, r.amount, r.actual]),
              ])}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm">
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground">סה"כ הכול ({breakdown.allCount})</span>
          <span className="font-medium tabular-nums">{fmt(breakdown.allSum)}</span>
        </div>
        <div className="flex items-center justify-between py-1 text-muted-foreground">
          <span>פחות שהתחתנו ({breakdown.marriedCount})</span>
          <span className="tabular-nums">−{fmt(breakdown.marriedSum)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 mt-1 border-t font-semibold">
          <span>סה"כ ({netCount})</span>
          <span className="tabular-nums">{fmt(netSum)}</span>
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
