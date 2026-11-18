import { useRef, useState } from "react";
import { Download, Upload, GraduationCap, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const CLASS_LEVELS = ["א", "ב", "ג", "ד", "ה", "ו"] as const;

/** A move the intake is about to make, worked out before anything is
 *  written. Nothing happens until the whole picture has been shown and
 *  approved — a year's shiurim are not something to undo by hand. */
interface Plan {
  newNames: string[];
  skipped: { name: string; reason: string }[];
  promoted: { from: string; to: string; count: number }[];
  stayCount: number;
}

function loadBachurim(): any[] {
  try {
    const raw = localStorage.getItem("bachurim");
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function generateSku(existing: any[]): string {
  const used = new Set(existing.map((b) => b.sku));
  let sku: string;
  do {
    sku = String(Math.floor(Math.random() * 50000) + 1).padStart(5, "0");
  } while (used.has(sku));
  return sku;
}

/** Names are compared without quotes or spacing, because the same boy is
 *  written ‎בר"ב‎ in one list and ‎בר ב‎ in the next. */
function loose(s: string): string {
  return s.replace(/["'׳״`‘’“”]/g, "").replace(/\s+/g, "");
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL");
}

export default function NewYearIntake({
  lastUpgrade,
  onApplied,
}: {
  lastUpgrade: { date: string; type: string } | null;
  onApplied: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [override, setOverride] = useState(false);
  const [busy, setBusy] = useState(false);

  // An upgrade that already happened this year is the one mistake that
  // cannot be undone from the screen, so it is blocked unless deliberately
  // waived.
  const monthsSince = lastUpgrade
    ? (Date.now() - new Date(lastUpgrade.date).getTime()) / (1000 * 60 * 60 * 24 * 30.4)
    : null;
  const alreadyThisYear = monthsSince !== null && monthsSince < 6;

  const downloadTemplate = async () => {
    const XLSX = await import("xlsx");
    const rows = [
      ["שם פרטי", "שם משפחה"],
      ["אלטר ישעיה", "בעק"],
      ["אלימלך", "בעק"],
      ["שמעון", "ברגר"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 22 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "בחורים חדשים");
    XLSX.writeFile(wb, "בחורים-חדשים-שיעור-א.xlsx");
    toast.success("הקובץ ירד. מחקו את שלוש שורות הדוגמה ומלאו את השמות");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(await file.arrayBuffer());
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });

      const existing = loadBachurim();
      const existingLoose = new Set(existing.map((b: any) => loose(String(b.name || ""))));
      const newNames: string[] = [];
      const seen = new Set<string>();
      const skipped: { name: string; reason: string }[] = [];

      for (const row of rows) {
        const cells = (row || []).map((c) => String(c ?? "").trim()).filter(Boolean);
        if (cells.length === 0) continue;
        const name = cells.join(" ").trim();
        // The header line, whatever order its two columns are written in.
        if (/שם\s*פרטי/.test(name) || /שם\s*משפחה/.test(name)) continue;
        const key = loose(name);
        if (existingLoose.has(key)) {
          skipped.push({ name, reason: "כבר קיים במערכת" });
          continue;
        }
        if (seen.has(key)) {
          skipped.push({ name, reason: "מופיע פעמיים בקובץ" });
          continue;
        }
        seen.add(key);
        newNames.push(name);
      }

      // Who moves up, counted per shiur so the whole year is visible at once.
      const counts = new Map<string, number>();
      let stayCount = 0;
      for (const b of existing) {
        if (b.married || b.closed) { stayCount++; continue; }
        const idx = CLASS_LEVELS.indexOf(b.classLevel);
        if (idx === -1 || idx >= CLASS_LEVELS.length - 1) { stayCount++; continue; }
        counts.set(b.classLevel, (counts.get(b.classLevel) || 0) + 1);
      }
      const promoted = CLASS_LEVELS
        .filter((c) => counts.has(c))
        .map((c) => ({
          from: c,
          to: CLASS_LEVELS[CLASS_LEVELS.indexOf(c) + 1],
          count: counts.get(c) as number,
        }));

      if (newNames.length === 0 && promoted.length === 0) {
        toast.error("לא נמצא מה לעשות בקובץ הזה");
        setBusy(false);
        return;
      }
      setOverride(false);
      setPlan({ newNames, skipped, promoted, stayCount });
    } catch (err) {
      console.error(err);
      toast.error("לא הצלחתי לקרוא את הקובץ");
    } finally {
      setBusy(false);
    }
  };

  const apply = () => {
    if (!plan) return;
    if (alreadyThisYear && !override) return;
    try {
      const existing = loadBachurim();
      // Everyone already here moves up one shiur; the file's names come in
      // underneath them, at shiur א.
      const promotedList = existing.map((b: any) => {
        if (b.married || b.closed) return b;
        const idx = CLASS_LEVELS.indexOf(b.classLevel);
        if (idx === -1 || idx >= CLASS_LEVELS.length - 1) return b;
        return { ...b, classLevel: CLASS_LEVELS[idx + 1] };
      });

      const added: any[] = [];
      for (const name of plan.newNames) {
        added.push({
          id: crypto.randomUUID(),
          sku: generateSku([...promotedList, ...added]),
          name,
          classLevel: "א",
          joinDate: new Date().toISOString(),
          outings: [],
          married: false,
          receivedBasket: false,
          inAskanim: false,
          closed: false,
        });
      }

      localStorage.setItem("bachurim", JSON.stringify([...promotedList, ...added]));
      onApplied();
      setPlan(null);
      toast.success(
        `${added.length} בחורים חדשים נוספו לשיעור א׳, ו-${plan.promoted.reduce((s, p) => s + p.count, 0)} עלו שיעור`
      );
    } catch {
      toast.error("שגיאה בעדכון. שום דבר לא שונה");
    }
  };

  const promotedTotal = plan ? plan.promoted.reduce((s, p) => s + p.count, 0) : 0;

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={downloadTemplate} variant="outline" className="gap-1.5">
          <Download className="h-4 w-4" />
          הורדת קובץ לדוגמה
        </Button>
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="gap-1.5"
        >
          <Upload className="h-4 w-4" />
          {busy ? "קורא..." : "העלאת בחורים חדשים"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {lastUpgrade && (
        <p className="mt-2 text-xs text-muted-foreground">
          העלאת שיעור אחרונה: {fmtDate(lastUpgrade.date)}
        </p>
      )}

      <Dialog open={plan !== null} onOpenChange={(o) => !o && setPlan(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              מעבר לשנה חדשה
            </DialogTitle>
            <DialogDescription>
              שום דבר לא ישתנה עד שתאשרו. כדאי לקרוא את הכול.
            </DialogDescription>
          </DialogHeader>

          {plan && (
            <div className="space-y-4">
              {alreadyThisYear && (
                <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-4">
                  <p className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    כבר העליתם שיעור השנה — ב-{fmtDate(lastUpgrade!.date)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    אם תעשו את זה שוב, כל הבחורים יקפצו שיעור נוסף, ואין דרך
                    קלה לחזור אחורה. אם אתם בטוחים — סמנו למטה.
                  </p>
                  <label className="mt-3 flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      checked={override}
                      onCheckedChange={(v) => setOverride(v === true)}
                    />
                    אני יודע, ורוצה להעלות שיעור בכל זאת
                  </label>
                </div>
              )}

              <div className="rounded-lg border border-border p-4">
                <p className="font-semibold text-foreground mb-2">
                  {promotedTotal} בחורים יעלו שיעור
                </p>
                {plan.promoted.map((p) => (
                  <div key={p.from} className="flex justify-between py-1 text-sm">
                    <span className="text-muted-foreground">
                      שיעור {p.from} ← שיעור {p.to}
                    </span>
                    <span className="font-medium">{p.count}</span>
                  </div>
                ))}
                {plan.stayCount > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {plan.stayCount} לא יזוזו — נשואים, סגורים, או כבר בשיעור ו׳.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="font-semibold text-foreground mb-2">
                  {plan.newNames.length} בחורים חדשים ייכנסו לשיעור א׳
                </p>
                <div className="max-h-40 overflow-y-auto text-sm text-muted-foreground">
                  {plan.newNames.map((n, i) => (
                    <div key={i} className="py-0.5">{n}</div>
                  ))}
                </div>
              </div>

              {plan.skipped.length > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-4">
                  <p className="font-semibold text-foreground mb-2">
                    {plan.skipped.length} שורות לא ייכנסו
                  </p>
                  <div className="max-h-40 overflow-y-auto text-sm">
                    {plan.skipped.map((s, i) => (
                      <div key={i} className="flex justify-between py-0.5 gap-3">
                        <span className="text-muted-foreground">{s.reason}</span>
                        <span>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPlan(null)}>ביטול</Button>
            <Button onClick={apply} disabled={alreadyThisYear && !override}>
              אישור — בצע
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
