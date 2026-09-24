import { useState, useCallback } from "react";
import { Plus, Upload, Trash2, CheckCircle, Circle, Settings, Pencil } from "lucide-react";
import { useFocusRow } from "@/hooks/useFocusRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import type { Income } from "@/lib/db";

function today() {
  return new Date().toISOString().split("T")[0];
}

export default function IncomesModule() {
  const { incomes, setIncomes, fundraisers, setFundraisers } = useData();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Income | null>(null);
  const [editTarget, setEditTarget] = useState<Income | null>(null);
  const [manageFundraisersOpen, setManageFundraisersOpen] = useState(false);
  const [newFundraiserName, setNewFundraiserName] = useState("");

  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(today());
  const [formNotes, setFormNotes] = useState("");
  const [formFundraiser, setFormFundraiser] = useState("");

  function openEditById(id: string) {
    const inc = incomes.find((i) => i.id === id);
    if (!inc) return;
    openEdit(inc);
  }
  const { highlightedId, registerRow } = useFocusRow("income", openEditById);

  const total = incomes.reduce((s, i) => s + i.amount, 0);
  const canSave = formNotes.trim().length > 0 && Number(formAmount) > 0 && formFundraiser.length > 0;

  function openAdd() {
    setEditTarget(null);
    setFormAmount("");
    setFormDate(today());
    setFormNotes("");
    setFormFundraiser("");
    setAddDialogOpen(true);
  }

  function openEdit(inc: Income) {
    setEditTarget(inc);
    setFormAmount(String(inc.amount));
    setFormDate(inc.date);
    setFormNotes(inc.description);
    setFormFundraiser(inc.fundraiser || "");
    setAddDialogOpen(true);
  }

  function handleSave() {
    const amount = Number(formAmount);
    if (!amount || amount <= 0 || !formNotes.trim() || !formFundraiser) return;

    if (editTarget) {
      const updated = incomes.map((i) =>
        i.id === editTarget.id
          ? { ...i, description: formNotes.trim(), amount, date: formDate, fundraiser: formFundraiser }
          : i
      );
      setIncomes(updated);
      toast.success("ההכנסה עודכנה");
    } else {
      const newIncome: Income = {
        id: crypto.randomUUID(),
        description: formNotes.trim(),
        amount,
        date: formDate,
        recognized: false,
        fundraiser: formFundraiser,
      };
      setIncomes([...incomes, newIncome]);
      toast.success("ההכנסה נוספה בהצלחה");
    }
    setEditTarget(null);
    setAddDialogOpen(false);
  }

  function toggleRecognized(id: string) {
    const updated = incomes.map((i) =>
      i.id === id
        ? { ...i, recognized: !i.recognized, recognizedDate: !i.recognized ? today() : undefined }
        : i
    );
    setIncomes(updated);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setIncomes(incomes.filter((i) => i.id !== deleteTarget.id));
    toast.success("ההכנסה נמחקה");
    setDeleteTarget(null);
  }

  function addFundraiser() {
    const name = newFundraiserName.trim();
    if (!name) return;
    if (fundraisers.includes(name)) {
      toast.error("מתרים בשם זה כבר קיים");
      return;
    }
    setFundraisers([...fundraisers, name]);
    setNewFundraiserName("");
    toast.success("מתרים נוסף");
  }

  function deleteFundraiser(name: string) {
    const usedBy = incomes.filter((i) => i.fundraiser === name);
    if (usedBy.length > 0) {
      toast.error(`לא ניתן למחוק – למתרים "${name}" יש ${usedBy.length} הכנסות רשומות`);
      return;
    }
    setFundraisers(fundraisers.filter((f) => f !== name));
    toast.success("מתרים נמחק");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      let imported = 0;
      let skipped = 0;
      const newIncomes: Income[] = [];

      for (const row of rows) {
        const notes = String(row["הערות"] || row["תיאור"] || "").trim();
        const amount = Number(row["סכום"] || 0);
        const date = String(row["תאריך"] || today()).trim();
        const fundraiser = String(row["מתרים"] || "שונות").trim();

        if (!notes) { skipped++; continue; }
        if (!amount || amount <= 0) { skipped++; continue; }

        newIncomes.push({
          id: crypto.randomUUID(),
          description: notes,
          amount,
          date,
          recognized: false,
          fundraiser,
        });
        imported++;
      }

      if (newIncomes.length > 0) {
        setIncomes([...incomes, ...newIncomes]);
      }

      toast.success(`יובאו ${imported} הכנסות${skipped > 0 ? `, ${skipped} דולגו (חסרות הערות/סכום)` : ""}`);
    } catch {
      toast.error("שגיאה בקריאת הקובץ");
    }
    e.target.value = "";
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">הכנסות</h1>
      </div>

      <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
        <CardContent className="py-4 px-6">
          <p className="text-lg font-semibold">
            סה"כ הכנסות עמותה:{" "}
            <span className="text-[hsl(var(--accent-foreground))]">
              {total.toLocaleString("he-IL")} ₪
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Button onClick={openAdd}>
          <Plus className="ml-1 h-4 w-4" />
          הוסף הכנסה
        </Button>
        <Button variant="outline" asChild>
          <label className="cursor-pointer">
            <Upload className="ml-1 h-4 w-4" />
            ייבוא Excel
            <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={handleImport} />
          </label>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setManageFundraisersOpen(true)}>
          <Settings className="ml-1 h-4 w-4" />
          ניהול מתרימים
        </Button>
      </div>

      {incomes.length === 0 ? (
        <p className="text-muted-foreground text-sm">אין הכנסות עדיין.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]">
                <TableHead className="text-primary-foreground text-right">תאריך</TableHead>
                <TableHead className="text-primary-foreground text-right">תיאור / הערות</TableHead>
                <TableHead className="text-primary-foreground text-right">סכום</TableHead>
                <TableHead className="text-primary-foreground text-right">מתרים</TableHead>
                <TableHead className="text-primary-foreground text-center">מוכר בעמותה</TableHead>
                <TableHead className="text-primary-foreground text-center">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((inc) => (
                <TableRow
                  key={inc.id}
                  ref={registerRow(inc.id) as any}
                  className={`${inc.auto ? "bg-sky-50 dark:bg-sky-950/20" : ""} ${highlightedId === inc.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`}
                >
                  <TableCell>{inc.date}</TableCell>
                  <TableCell>
                    <span>{inc.description}</span>
                    {inc.auto && (
                      <Badge variant="secondary" className="mr-2 text-xs bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                        אוטומטי
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{inc.amount.toLocaleString("he-IL")} ₪</TableCell>
                  <TableCell>{inc.fundraiser || "—"}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRecognized(inc.id)}
                      className={inc.recognized ? "text-green-600" : "text-muted-foreground"}
                    >
                      {inc.recognized ? (
                        <><CheckCircle className="ml-1 h-4 w-4" />מוכר</>
                      ) : (
                        <><Circle className="ml-1 h-4 w-4" />לא מוכר</>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" className="ml-2" onClick={() => openEdit(inc)}>
                      <Pencil className="ml-1 h-4 w-4" />
                      ערוך
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(inc)}>
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

      <Dialog open={addDialogOpen} onOpenChange={(o) => { setAddDialogOpen(o); if (!o) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "עריכת הכנסה" : "הוספת הכנסה"}</DialogTitle>
            <DialogDescription>{editTarget ? "עדכן את פרטי ההכנסה" : "הזן פרטי הכנסה חדשה לעמותה"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>סכום (₪)</Label>
              <Input type="number" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="הזן סכום" />
            </div>
            <div>
              <Label>תאריך</Label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div>
              <Label>מתרים (חובה)</Label>
              <Select value={formFundraiser} onValueChange={setFormFundraiser}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר מתרים..." />
                </SelectTrigger>
                <SelectContent>
                  {fundraisers.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formFundraiser && (
                <p className="text-xs text-destructive mt-1">יש לבחור מתרים כדי לשמור</p>
              )}
            </div>
            <div>
              <Label>הערות (חובה)</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="תיאור ההכנסה" />
              {formNotes.trim().length === 0 && (
                <p className="text-xs text-destructive mt-1">יש למלא הערות כדי לשמור</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">ביטול</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!canSave}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={manageFundraisersOpen} onOpenChange={setManageFundraisersOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>ניהול מתרימים</DialogTitle>
            <DialogDescription>הוסף או הסר מתרימים מהרשימה</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newFundraiserName}
                onChange={(e) => setNewFundraiserName(e.target.value)}
                placeholder="שם מתרים חדש"
                onKeyDown={(e) => e.key === "Enter" && addFundraiser()}
              />
              <Button onClick={addFundraiser} disabled={!newFundraiserName.trim()}>
                <Plus className="ml-1 h-4 w-4" />
                הוסף
              </Button>
            </div>
            <div className="border rounded-lg divide-y max-h-60 overflow-auto">
              {fundraisers.map((f) => (
                <div key={f} className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm">{f}</span>
                  <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => deleteFundraiser(f)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">סגור</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת הכנסה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שרוצה למחוק הכנסה זו? ({deleteTarget?.amount.toLocaleString("he-IL")} ₪ – {deleteTarget?.description})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
