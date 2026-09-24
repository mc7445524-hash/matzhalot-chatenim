import { useState, useEffect, useCallback } from "react";
import { Plus, Upload, Trash2, UserMinus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useFocusRow } from "@/hooks/useFocusRow";
import { toast } from "sonner";
import type { Bachur } from "@/components/BachurimModule";

// ─── Types ────────────────────────────────────────────────────
interface AskanimIncome {
  id: string;
  bachurId: string;
  bachurName: string;
  date: string;
  amount: number;
  notes: string;
}

// ─── Helpers ──────────────────────────────────────────────────
function loadBachurim(): Bachur[] {
  try {
    return JSON.parse(localStorage.getItem("bachurim") || "[]");
  } catch { return []; }
}

function loadAskanimIncomes(): AskanimIncome[] {
  try {
    return JSON.parse(localStorage.getItem("askanimIncomes") || "[]");
  } catch { return []; }
}

function saveAskanimIncomes(data: AskanimIncome[]) {
  localStorage.setItem("askanimIncomes", JSON.stringify(data));
}

function addToAmutaIncome(description: string, amount: number, date: string) {
  try {
    const incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
    incomes.push({
      id: crypto.randomUUID(),
      description,
      amount,
      date,
      category: "פרויקט עסקנים",
      target: "עמותה",
    });
    localStorage.setItem("incomes", JSON.stringify(incomes));
  } catch { /* ignore */ }
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// ─── Component ────────────────────────────────────────────────
export default function AskanimModule() {
  const [bachurim, setBachurim] = useState<Bachur[]>([]);
  const [incomes, setIncomes] = useState<AskanimIncome[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedBachur, setSelectedBachur] = useState<Bachur | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AskanimIncome | null>(null);
  const [removeFromAskanimTarget, setRemoveFromAskanimTarget] = useState<Bachur | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // form fields
  const [formDate, setFormDate] = useState(today());
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const refresh = useCallback(() => {
    setBachurim(loadBachurim());
    setIncomes(loadAskanimIncomes());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  const { highlightedId, registerRow } = useFocusRow("askanim");

  const askanimBachurim = bachurim.filter((b) => b.inAskanim && !b.married);

  const q = searchQuery.trim().toLowerCase();
  const filteredBachurim = q
    ? askanimBachurim.filter((b) => b.name.toLowerCase().includes(q) || b.sku.toLowerCase().includes(q))
    : askanimBachurim;
  const filteredIncomes = q
    ? incomes.filter((i) => i.bachurName.toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q))
    : incomes;

  const totalRaised = incomes.reduce((s, i) => s + i.amount, 0);

  const totalByBachur = (bachurId: string) =>
    incomes.filter((i) => i.bachurId === bachurId).reduce((s, i) => s + i.amount, 0);

  // ─── Add income ─────────────────────────────────────────────
  function openAddDialog(b: Bachur) {
    setSelectedBachur(b);
    setFormDate(today());
    setFormAmount("");
    setFormNotes("");
    setAddDialogOpen(true);
  }

  function handleSaveIncome() {
    if (!selectedBachur) return;
    const amount = Number(formAmount);
    if (!amount || amount <= 0) {
      toast.error("יש להזין סכום תקין");
      return;
    }

    const newIncome: AskanimIncome = {
      id: crypto.randomUUID(),
      bachurId: selectedBachur.id,
      bachurName: selectedBachur.name,
      date: formDate,
      amount,
      notes: formNotes,
    };

    const updated = [...incomes, newIncome];
    saveAskanimIncomes(updated);
    setIncomes(updated);

    // add to amuta income
    addToAmutaIncome(`פרויקט עסקנים – ${selectedBachur.name}`, amount, formDate);

    toast.success("ההכנסה נשמרה בהצלחה");
    setAddDialogOpen(false);
  }

  // ─── Delete income ──────────────────────────────────────────
  function handleDeleteIncome() {
    if (!deleteTarget) return;
    const updated = incomes.filter((i) => i.id !== deleteTarget.id);
    saveAskanimIncomes(updated);
    setIncomes(updated);
    toast.success("ההכנסה נמחקה");
    setDeleteTarget(null);
  }

  // ─── Remove bachur from askanim project ─────────────────────
  function handleRemoveFromAskanim() {
    if (!removeFromAskanimTarget) return;
    const b = removeFromAskanimTarget;
    const all = loadBachurim();
    const updated = all.map((x) => x.id === b.id ? { ...x, inAskanim: false } : x);
    localStorage.setItem("bachurim", JSON.stringify(updated));
    setBachurim(updated);
    toast.success(`${b.name} הוסר מפרויקט עסקנים`);
    setRemoveFromAskanimTarget(null);
  }

  // ─── Excel import ──────────────────────────────────────────
  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const currentBachurim = loadBachurim();
      const askanimNames = new Set(
        currentBachurim.filter((b) => b.inAskanim).map((b) => b.name)
      );

      let imported = 0;
      let skipped = 0;
      const newIncomes: AskanimIncome[] = [];

      for (const row of rows) {
        const name = String(row["שם בחור"] || row["שם"] || "").trim();
        const amount = Number(row["סכום"] || 0);
        const date = String(row["תאריך"] || today()).trim();
        const notes = String(row["הערות"] || "").trim();

        if (!name || !amount) { skipped++; continue; }

        if (!askanimNames.has(name)) {
          skipped++;
          continue;
        }

        const bachur = currentBachurim.find((b) => b.name === name && b.inAskanim);
        if (!bachur) { skipped++; continue; }

        const income: AskanimIncome = {
          id: crypto.randomUUID(),
          bachurId: bachur.id,
          bachurName: name,
          date,
          amount,
          notes,
        };
        newIncomes.push(income);
        addToAmutaIncome(`פרויקט עסקנים – ${name}`, amount, date);
        imported++;
      }

      if (newIncomes.length > 0) {
        const updated = [...incomes, ...newIncomes];
        saveAskanimIncomes(updated);
        setIncomes(updated);
      }

      toast.success(`יובאו ${imported} רשומות${skipped > 0 ? `, ${skipped} דולגו` : ""}`);
    } catch {
      toast.error("שגיאה בקריאת הקובץ");
    }
    e.target.value = "";
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">פרויקט עסקנים</h1>
        <div>
          <Button variant="outline" size="sm" className="relative" asChild>
            <label className="cursor-pointer">
              <Upload className="ml-2 h-4 w-4" />
              ייבוא Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                className="sr-only"
                onChange={handleImportExcel}
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Summary card */}
      <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
        <CardContent className="py-4 px-6">
          <p className="text-lg font-semibold">
            סה"כ גויס בפרויקט:{" "}
            <span className="text-[hsl(var(--accent-foreground))]">
              {totalRaised.toLocaleString("he-IL")} ₪
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-lg border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="חיפוש לפי שם, מק״ט או הערות..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-8"
          />
        </div>
        {q && (
          <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="gap-1">
            <X className="h-4 w-4" /> נקה
          </Button>
        )}
      </div>

      {/* Area 1 – Participants */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">משתתפים בפרויקט</h2>
        {filteredBachurim.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {q ? "לא נמצאו תוצאות חיפוש." : "אין בחורים משויכים לפרויקט. ניתן לצרף בחור דרך מודול הבחורים."}
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]">
                  <TableHead className="text-primary-foreground text-right">שם</TableHead>
                  <TableHead className="text-primary-foreground text-right">מק"ט</TableHead>
                  <TableHead className="text-primary-foreground text-right">שיעור</TableHead>
                  <TableHead className="text-primary-foreground text-right">סה"כ גייס</TableHead>
                  <TableHead className="text-primary-foreground text-center">פעולות</TableHead>
                  <TableHead className="text-primary-foreground text-center w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBachurim.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.sku}</TableCell>
                    <TableCell>{b.classLevel}</TableCell>
                    <TableCell>{totalByBachur(b.id).toLocaleString("he-IL")} ₪</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" onClick={() => openAddDialog(b)}>
                        <Plus className="ml-1 h-4 w-4" />
                        הוסף הכנסה
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        title="הסר מפרויקט עסקנים"
                        onClick={() => setRemoveFromAskanimTarget(b)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Area 2 – Income table */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">הכנסות פרויקט עסקנים</h2>
        {filteredIncomes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {q ? "לא נמצאו תוצאות חיפוש." : "אין הכנסות עדיין."}
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]">
                  <TableHead className="text-primary-foreground text-right">תאריך</TableHead>
                  <TableHead className="text-primary-foreground text-right">שם הבחור</TableHead>
                  <TableHead className="text-primary-foreground text-right">סכום</TableHead>
                  <TableHead className="text-primary-foreground text-right">הערות</TableHead>
                  <TableHead className="text-primary-foreground text-center">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.map((inc) => (
                  <TableRow
                    key={inc.id}
                    ref={registerRow(inc.id) as any}
                    className={highlightedId === inc.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}
                  >
                    <TableCell>{inc.date}</TableCell>
                    <TableCell>{inc.bachurName}</TableCell>
                    <TableCell>{inc.amount.toLocaleString("he-IL")} ₪</TableCell>
                    <TableCell className="max-w-[200px] truncate">{inc.notes || "—"}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(inc)}
                      >
                        <Trash2 className="ml-1 h-4 w-4" />
                        מחק
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Add income dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת הכנסה לפרויקט עסקנים</DialogTitle>
            <DialogDescription>הוסף הכנסה עבור {selectedBachur?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>שם הבחור</Label>
              <Input value={selectedBachur?.name || ""} disabled />
            </div>
            <div>
              <Label>תאריך</Label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div>
              <Label>סכום (₪)</Label>
              <Input
                type="number"
                min="0"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="הזן סכום"
              />
            </div>
            <div>
              <Label>הערות</Label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="הערות (לא חובה)"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">ביטול</Button>
            </DialogClose>
            <Button onClick={handleSaveIncome}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת הכנסה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק הכנסה של{" "}
              {deleteTarget?.amount.toLocaleString("he-IL")} ₪ עבור {deleteTarget?.bachurName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteIncome}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove from askanim confirmation */}
      <AlertDialog
        open={!!removeFromAskanimTarget}
        onOpenChange={(o) => !o && setRemoveFromAskanimTarget(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>הסרה מפרויקט עסקנים</AlertDialogTitle>
            <AlertDialogDescription>
              האם להסיר את {removeFromAskanimTarget?.name} מרשימת פרויקט עסקנים?
              ההכנסות הקיימות יישמרו, אך הבחור יוסר מטבלת המשתתפים.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFromAskanim}>הסר</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
