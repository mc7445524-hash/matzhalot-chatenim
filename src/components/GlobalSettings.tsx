import { useState, useEffect, type RefObject } from "react";
import { Settings, Save, ArrowUpCircle, Trash2, RotateCcw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  fetchBachurim, fetchIncomes, fetchExpenses, fetchDebts, fetchAskanimIncomes,
  saveBachurimToDb, saveIncomesToDb, saveExpensesToDb, saveDebtsToDb, saveAskanimIncomesToDb,
  type Bachur, type Income, type Expense, type Debt, type AskanimIncome,
} from "@/lib/db";
import { supabase } from "@/integrations/supabase/client";

// ─── Data backup / restore ───────────────────────────────────
const BACKUP_KEY = "__lastDataBackup__";
interface DataBackup {
  createdAt: string;
  counts: { bachurim: number; incomes: number; expenses: number; debts: number; askanim: number };
  data: {
    bachurim: Bachur[];
    incomes: Income[];
    expenses: Expense[];
    debts: Debt[];
    askanim: AskanimIncome[];
  };
}

function loadBackup(): DataBackup | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DataBackup;
  } catch { return null; }
}

// --- Types ---
interface BasketCostEntry {
  date: string;
  oldCost: number;
  newCost: number;
}

interface ClassUpgradeLog {
  date: string;
  type: "auto" | "manual";
}

interface GlobalSettingsData {
  basketCost: number;
  basketCostHistory: BasketCostEntry[];
  minimumForBasket: number;
  lastClassUpgrade: ClassUpgradeLog | null;
  classUpgradeHistory: ClassUpgradeLog[];
}

const STORAGE_KEY = "globalSettings";
const CLASS_LEVELS = ["א", "ב", "ג", "ד", "ה", "ו"] as const;

function getDefaults(): GlobalSettingsData {
  return {
    basketCost: 6000,
    basketCostHistory: [],
    minimumForBasket: 5000,
    lastClassUpgrade: null,
    classUpgradeHistory: [],
  };
}

function loadSettings(): GlobalSettingsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaults();
    return { ...getDefaults(), ...JSON.parse(raw) };
  } catch {
    return getDefaults();
  }
}

function saveSettings(data: GlobalSettingsData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Get next Elul 1 date (approximate — Hebrew calendar)
function getNextElulApprox(): string {
  // This is a rough estimate. For production, use a Hebrew calendar library.
  const now = new Date();
  const year = now.getFullYear();
  // Elul 1 typically falls in August-September
  // Very rough approximation
  const estimates: Record<number, string> = {
    2024: "2024-09-04",
    2025: "2025-08-23",
    2026: "2026-09-12",
    2027: "2027-09-02",
    2028: "2028-08-22",
  };
  const nextElul = estimates[year] || estimates[2026];
  const elulDate = new Date(nextElul);
  if (elulDate < now && estimates[year + 1]) {
    return estimates[year + 1];
  }
  return nextElul;
}

export default function GlobalSettings({ triggerRef, onNavigateToTab }: { triggerRef?: RefObject<HTMLButtonElement | null>; onNavigateToTab?: (tab: string) => void }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<GlobalSettingsData>(getDefaults());
  const [newMinimum, setNewMinimum] = useState("");
  const [resetMode, setResetMode] = useState<null | "full" | "amounts">(null);
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0);
  const [backup, setBackup] = useState<DataBackup | null>(null);
  const [busy, setBusy] = useState<null | "reset" | "restore">(null);
  const [confirmRestore, setConfirmRestore] = useState(false);

  useEffect(() => {
    if (open) {
      const loaded = loadSettings();
      setSettings(loaded);
      setNewMinimum(String(loaded.minimumForBasket));
      setBackup(loadBackup());
    }
  }, [open]);

  const handleSaveMinimum = () => {
    const amount = Number(newMinimum);
    if (!amount || amount <= 0) {
      toast.error("יש להזין סכום חיובי");
      return;
    }
    if (amount === settings.minimumForBasket) {
      toast.info("הסכום לא השתנה");
      return;
    }
    const updated: GlobalSettingsData = {
      ...settings,
      minimumForBasket: amount,
    };
    saveSettings(updated);
    setSettings(updated);
    toast.success(`סכום מינימום לזכאות עודכן ל-${formatCurrency(amount)}`);
  };

  const handleUpgradeClasses = () => {
    try {
      const bachurim = JSON.parse(localStorage.getItem("bachurim") || "[]");
      let upgraded = 0;

      const updatedBachurim = bachurim.map((b: any) => {
        // Skip married bachurim
        if (b.married) return b;
        const currentIdx = CLASS_LEVELS.indexOf(b.classLevel);
        if (currentIdx === -1 || currentIdx >= CLASS_LEVELS.length - 1) return b;
        upgraded++;
        return { ...b, classLevel: CLASS_LEVELS[currentIdx + 1] };
      });

      localStorage.setItem("bachurim", JSON.stringify(updatedBachurim));

      const logEntry: ClassUpgradeLog = {
        date: new Date().toISOString(),
        type: "manual",
      };

      const updated: GlobalSettingsData = {
        ...settings,
        lastClassUpgrade: logEntry,
        classUpgradeHistory: [logEntry, ...settings.classUpgradeHistory],
      };
      saveSettings(updated);
      setSettings(updated);

      toast.success(`השיעורים עודכנו! ${upgraded} בחורים הועלו שיעור`);
    } catch {
      toast.error("שגיאה בעדכון השיעורים");
    }
  };

  const nextElul = getNextElulApprox();

  // ─── Data reset (with backup) ──────────────────────────────
  async function handleDataReset(mode: "full" | "amounts") {
    setBusy("reset");
    try {
      const [bachurim, incomes, expenses, debts, askanim] = await Promise.all([
        fetchBachurim(), fetchIncomes(), fetchExpenses(), fetchDebts(), fetchAskanimIncomes(),
      ]);
      const snapshot: DataBackup = {
        createdAt: new Date().toISOString(),
        counts: {
          bachurim: bachurim.length, incomes: incomes.length,
          expenses: expenses.length, debts: debts.length, askanim: askanim.length,
        },
        data: { bachurim, incomes, expenses, debts, askanim },
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(snapshot));
      setBackup(snapshot);

      if (mode === "full") {
        await Promise.all([
          saveBachurimToDb([]),
          saveIncomesToDb([]),
          saveExpensesToDb([]),
          saveDebtsToDb([]),
          saveAskanimIncomesToDb([]),
        ]);
        // Also clear local caches so modules that still read localStorage
        // (BachurimModule etc.) don't restore stale data after reload.
        ["bachurim", "incomes", "expenses", "debts", "askanimIncomes", "askanim"]
          .forEach((k) => localStorage.removeItem(k));
        toast.success("כל הנתונים נמחקו. גיבוי נשמר ויש אפשרות לשחזור.");
      } else {
        // Amounts-only: clear financial tables + per-bachur outings,
        // and reset basket-received flags on bachurim (keep names/class/married).
        await Promise.all([
          saveIncomesToDb([]),
          saveExpensesToDb([]),
          saveDebtsToDb([]),
          saveAskanimIncomesToDb([]),
          supabase.from("outings").delete().neq("id", "___never___"),
          supabase.from("bachurim").update({
            received_basket: false,
            basket_date: null,
            basket_cost_at_time: null,
          }).neq("id", "___never___"),
        ]);
        ["incomes", "expenses", "debts", "askanimIncomes", "askanim"]
          .forEach((k) => localStorage.removeItem(k));
        toast.success("הסכומים אופסו. רשימת הבחורים נשמרה. גיבוי נוצר לשחזור.");
      }
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה באיפוס הנתונים");
    } finally {
      setBusy(null);
      setResetMode(null);
      setConfirmStep(0);
    }
  }

  async function handleRestoreBackup() {
    if (!backup) return;
    setBusy("restore");
    try {
      await Promise.all([
        saveBachurimToDb(backup.data.bachurim),
        saveIncomesToDb(backup.data.incomes),
        saveExpensesToDb(backup.data.expenses),
        saveDebtsToDb(backup.data.debts),
        saveAskanimIncomesToDb(backup.data.askanim),
      ]);
      toast.success("הנתונים שוחזרו בהצלחה");
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בשחזור הנתונים");
    } finally {
      setBusy(null);
      setConfirmRestore(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          ref={triggerRef}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
          aria-label="הגדרות"
        >
          <Settings className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">הגדרות גלובליות</SheetTitle>
          <SheetDescription>ניהול הגדרות המערכת</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* ===== Section 1: Basket Cost (read-only) ===== */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">עלות הסל הנוכחית</h3>
            <div className="rounded-lg bg-secondary/50 border border-border p-4">
              <p className="text-lg font-bold text-foreground">
                עלות סל נוכחית: {formatCurrency(settings.basketCost)}
              </p>
              <button
                type="button"
                className="text-xs text-primary underline hover:text-primary/80 mt-2 cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  onNavigateToTab?.("basket-cost");
                }}
              >
                לשינוי עלות הסל – עבור לדף "עלות הסל" ועדכן את רשימת המוצרים
              </button>
            </div>
          </section>

          <Separator />

          {/* ===== Section 2: Minimum for Basket ===== */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">סכום מינימום לזכאות לסל</h3>
            <p className="text-sm text-muted-foreground mb-3">
              שינוי משפיע מיידית על חישוב הזכאות בכל המערכת
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="minBasket">סכום מינימום (₪)</Label>
                <Input
                  id="minBasket"
                  type="number"
                  value={newMinimum}
                  onChange={(e) => setNewMinimum(e.target.value)}
                  min={0}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSaveMinimum} className="gap-1.5">
                <Save className="h-4 w-4" />
                שמור שינוי
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              ערך נוכחי: <span className="font-semibold text-foreground">{formatCurrency(settings.minimumForBasket)}</span>
            </p>
          </section>

          <Separator />

          {/* ===== Section 3: Class Management ===== */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-3">ניהול שיעורים</h3>
            <p className="text-sm text-muted-foreground mb-3">
              השיעורים: א׳, ב׳, ג׳, ד׳, ה׳, ו׳ — בחורים בשיעור ו׳ נשארים בו.
              <br />
              העדכון חל רק על בחורים פעילים (לא נשואים).
            </p>

            <div className="rounded-lg bg-secondary/50 border border-border p-4 mb-4">
              <p className="text-sm text-foreground">
                📅 א׳ אלול הבא (משוער):{" "}
                <span className="font-semibold">{new Date(nextElul).toLocaleDateString("he-IL")}</span>
              </p>
              {settings.lastClassUpgrade && (
                <p className="text-sm text-muted-foreground mt-1">
                  עדכון אחרון: {formatDate(settings.lastClassUpgrade.date)} ({settings.lastClassUpgrade.type === "manual" ? "ידני" : "אוטומטי"})
                </p>
              )}
            </div>

            <Button onClick={handleUpgradeClasses} variant="outline" className="gap-1.5 w-full">
              <ArrowUpCircle className="h-4 w-4" />
              העלה שיעור לכולם
            </Button>

            {settings.classUpgradeHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">היסטוריית עדכוני שיעורים</h4>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>תאריך</TableHead>
                        <TableHead>סוג</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.classUpgradeHistory.map((log, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{formatDate(log.date)}</TableCell>
                          <TableCell className="text-sm">{log.type === "manual" ? "ידני" : "אוטומטי"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </section>

          <Separator />

          {/* ===== Section 4: System Reset ===== */}
          <section>
            <h3 className="text-lg font-semibold text-destructive mb-3">איפוס נתונים</h3>
            <p className="text-sm text-muted-foreground mb-3">
              מחיקת כל נתוני התפעול (בחורים, הכנסות, הוצאות, חובות, פרויקט עסקנים).
              ההגדרות, הקטגוריות, המגייסים ומוצרי הסל נשמרים.
              לפני המחיקה נשמר אוטומטית גיבוי שאפשר לשחזר ממנו.
            </p>
            {resetMode === null ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="destructive"
                  className="gap-1.5 w-full"
                  onClick={() => { setResetMode("full"); setConfirmStep(1); }}
                  disabled={busy !== null}
                >
                  <Trash2 className="h-4 w-4" />
                  מחיקת כל הנתונים
                </Button>
                <Button
                  variant="outline"
                  className="gap-1.5 w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => { setResetMode("amounts"); setConfirmStep(1); }}
                  disabled={busy !== null}
                >
                  <RotateCcw className="h-4 w-4" />
                  איפוס סכומים בלבד
                </Button>
              </div>
            ) : confirmStep === 1 ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3">
                <p className="text-sm font-medium text-destructive">
                  {resetMode === "full"
                    ? "האם אתה בטוח שברצונך למחוק את כל הנתונים (בחורים, הכנסות, הוצאות, חובות, עסקנים)? לפני המחיקה יישמר גיבוי."
                    : "האם אתה בטוח שברצונך לאפס את כל הסכומים? רשימת הבחורים תישאר כפי שהיא. ההכנסות, ההוצאות, החובות והעסקנים יתאפסו. גיבוי יישמר."}
                </p>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={() => setConfirmStep(2)}>
                    כן, המשך
                  </Button>
                  <Button variant="outline" onClick={() => { setResetMode(null); setConfirmStep(0); }}>
                    ביטול
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-destructive bg-destructive/20 p-4 space-y-3">
                <p className="text-sm font-bold text-destructive">
                  {resetMode === "full"
                    ? "אישור אחרון – לאחר לחיצה כל הנתונים יימחקו. ניתן לשחזר מהגיבוי שיישמר."
                    : "אישור אחרון – לאחר לחיצה כל הסכומים יתאפסו (הבחורים יישמרו). ניתן לשחזר מהגיבוי שיישמר."}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleDataReset(resetMode)}
                    disabled={busy === "reset"}
                  >
                    {busy === "reset"
                      ? "מאפס..."
                      : resetMode === "full" ? "מחק הכל ושמור גיבוי" : "אפס סכומים ושמור גיבוי"}
                  </Button>
                  <Button variant="outline" onClick={() => { setResetMode(null); setConfirmStep(0); }}>
                    ביטול
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Restore last backup ─── */}
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold">שחזור גיבוי אחרון</h4>
              </div>
              {!backup ? (
                <p className="text-sm text-muted-foreground">
                  אין גיבוי זמין. גיבוי נוצר אוטומטית בכל פעם שמבצעים איפוס נתונים.
                </p>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>
                      נוצר ב-{" "}
                      <span className="font-medium text-foreground">
                        {new Date(backup.createdAt).toLocaleString("he-IL")}
                      </span>
                    </div>
                    <div className="text-xs">
                      {backup.counts.bachurim} בחורים · {backup.counts.incomes} הכנסות ·{" "}
                      {backup.counts.expenses} הוצאות · {backup.counts.debts} חובות ·{" "}
                      {backup.counts.askanim} פרויקט עסקנים
                    </div>
                  </div>
                  {!confirmRestore ? (
                    <Button
                      variant="outline"
                      className="gap-1.5 w-full"
                      onClick={() => setConfirmRestore(true)}
                      disabled={busy !== null}
                    >
                      <RotateCcw className="h-4 w-4" />
                      שחזר נתונים מהגיבוי
                    </Button>
                  ) : (
                    <div className="rounded border border-orange-500/50 bg-orange-500/10 p-3 space-y-2">
                      <p className="text-sm font-medium">
                        השחזור יחליף את כל הנתונים הקיימים בנתוני הגיבוי. להמשיך?
                      </p>
                      <div className="flex gap-2">
                        <Button onClick={handleRestoreBackup} disabled={busy === "restore"}>
                          {busy === "restore" ? "משחזר..." : "כן, שחזר"}
                        </Button>
                        <Button variant="outline" onClick={() => setConfirmRestore(false)}>
                          ביטול
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
