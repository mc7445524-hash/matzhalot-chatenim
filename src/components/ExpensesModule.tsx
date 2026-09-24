import { useState, useEffect, useCallback } from "react";
import { Plus, Upload, Trash2, CheckCircle, Circle, Settings, Pencil, Download, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────
interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string;
  subCategory: string;
  notes: string;
  contactPerson: string;
  recognized: boolean;
  recognizedDate?: string;
  auto?: boolean;
  invoiceFileName?: string;
  invoiceFileData?: string;
  invoiceFileType?: string;
}

const DEFAULT_SUB_SALIM = ["גור", "דקל", 'חכ"ם', "אוצרות ההלבשה", "אותיות", "פרוכטר", "גפנרס", "שונות"];
const DEFAULT_SUB_AMUTA = ["משרד", "פרויקט עסקנים", "משכורת", "פעילות", "טלמרקטינג", "שונות"];

// ─── Helpers ──────────────────────────────────────────────────
function loadExpenses(): Expense[] {
  try {
    const raw = JSON.parse(localStorage.getItem("expenses") || "[]") as Expense[];
    return raw.map((e) => ({ ...e, recognized: e.recognized ?? false }));
  } catch { return []; }
}

function saveExpenses(data: Expense[]) {
  localStorage.setItem("expenses", JSON.stringify(data));
}

function loadCategories(key: string, defaults: string[]): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return [...new Set(parsed as string[])];
    }
  } catch {}
  return defaults;
}

function saveCategories(key: string, data: string[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

function today() {
  return new Date().toISOString().split("T")[0];
}

// ─── Component ────────────────────────────────────────────────
export default function ExpensesModule() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [catOpen, setCatOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Expense | null>(null);

  // categories
  const [catsSalim, setCatsSalim] = useState<string[]>(() => loadCategories("expense_cats_salim", DEFAULT_SUB_SALIM));
  const [catsAmuta, setCatsAmuta] = useState<string[]>(() => loadCategories("expense_cats_amuta", DEFAULT_SUB_AMUTA));
  const [newCatSalim, setNewCatSalim] = useState("");
  const [newCatAmuta, setNewCatAmuta] = useState("");
  const [editingCat, setEditingCat] = useState<{ type: "salim" | "amuta"; index: number; value: string } | null>(null);

  // form
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(today());
  const [formCategory, setFormCategory] = useState<string>("");
  const [formSub, setFormSub] = useState<string>("");
  const [formNotes, setFormNotes] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formRecognized, setFormRecognized] = useState(false);
  const [formInvoiceName, setFormInvoiceName] = useState<string | undefined>();
  const [formInvoiceData, setFormInvoiceData] = useState<string | undefined>();
  const [formInvoiceType, setFormInvoiceType] = useState<string | undefined>();

  // download dialog
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadFrom, setDownloadFrom] = useState("");
  const [downloadTo, setDownloadTo] = useState("");

  const refresh = useCallback(() => setExpenses(loadExpenses()), []);
  useEffect(() => { refresh(); }, [refresh]);
  const openEditById = useCallback((id: string) => {
    const exp = loadExpenses().find((e) => e.id === id);
    if (exp) openEdit(exp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { highlightedId, registerRow } = useFocusRow("expenses", openEditById);

  // persist categories
  useEffect(() => { saveCategories("expense_cats_salim", catsSalim); }, [catsSalim]);
  useEffect(() => { saveCategories("expense_cats_amuta", catsAmuta); }, [catsAmuta]);

  const totalSalim = expenses.filter((e) => e.category === "סלים").reduce((s, e) => s + e.amount, 0);
  const totalAmuta = expenses.filter((e) => e.category === "עמותה").reduce((s, e) => s + e.amount, 0);

  const subOptions = formCategory === "סלים" ? catsSalim : formCategory === "עמותה" ? catsAmuta : [];
  const needsInvoice = formCategory === "עמותה" && formRecognized;
  const canSave =
    Number(formAmount) > 0 &&
    formCategory &&
    formSub &&
    (!needsInvoice || !!formInvoiceData);

  // ─── Category management helpers ───────────────────────────
  function addCategory(type: "salim" | "amuta") {
    const name = type === "salim" ? newCatSalim.trim() : newCatAmuta.trim();
    if (!name) return;
    const list = type === "salim" ? catsSalim : catsAmuta;
    if (list.includes(name)) { toast.error("קטגוריה כבר קיימת"); return; }
    if (type === "salim") { setCatsSalim([...catsSalim, name]); setNewCatSalim(""); }
    else { setCatsAmuta([...catsAmuta, name]); setNewCatAmuta(""); }
    toast.success("קטגוריה נוספה");
  }

  function deleteCategory(type: "salim" | "amuta", name: string) {
    const catKey = type === "salim" ? "סלים" : "עמותה";
    const hasExpenses = expenses.some((e) => e.category === catKey && e.subCategory === name);
    if (hasExpenses) { toast.error("לא ניתן למחוק קטגוריה שיש לה הוצאות רשומות"); return; }
    if (type === "salim") setCatsSalim(catsSalim.filter((c) => c !== name));
    else setCatsAmuta(catsAmuta.filter((c) => c !== name));
    toast.success("קטגוריה נמחקה");
  }

  function saveEditCategory() {
    if (!editingCat) return;
    const newName = editingCat.value.trim();
    if (!newName) return;
    const list = editingCat.type === "salim" ? catsSalim : catsAmuta;
    const oldName = list[editingCat.index];
    if (newName !== oldName && list.includes(newName)) { toast.error("קטגוריה כבר קיימת"); return; }
    // update category name
    const updated = [...list];
    updated[editingCat.index] = newName;
    if (editingCat.type === "salim") setCatsSalim(updated);
    else setCatsAmuta(updated);
    // update existing expenses
    if (newName !== oldName) {
      const catKey = editingCat.type === "salim" ? "סלים" : "עמותה";
      const updatedExp = expenses.map((e) =>
        e.category === catKey && e.subCategory === oldName ? { ...e, subCategory: newName } : e
      );
      saveExpenses(updatedExp);
      setExpenses(updatedExp);
    }
    setEditingCat(null);
    toast.success("קטגוריה עודכנה");
  }

  // ─── Add ────────────────────────────────────────────────────
  function openAdd() {
    setFormAmount("");
    setFormDate(today());
    setFormCategory("");
    setFormSub("");
    setFormNotes("");
    setFormContact("");
    setFormRecognized(false);
    setFormInvoiceName(undefined);
    setFormInvoiceData(undefined);
    setFormInvoiceType(undefined);
    setEditTarget(null);
    setAddOpen(true);
  }

  function openEdit(exp: Expense) {
    setFormAmount(String(exp.amount));
    setFormDate(exp.date);
    setFormCategory(exp.category);
    setFormSub(exp.subCategory);
    setFormNotes(exp.notes);
    setFormContact(exp.contactPerson);
    setFormRecognized(exp.recognized);
    setFormInvoiceName(exp.invoiceFileName);
    setFormInvoiceData(exp.invoiceFileData);
    setFormInvoiceType(exp.invoiceFileType);
    setEditTarget(exp);
    setAddOpen(true);
  }

  function handleSave() {
    const amount = Number(formAmount);
    if (!amount || !formCategory || !formSub) return;
    if (formCategory === "עמותה" && formRecognized && !formInvoiceData) {
      toast.error("יש להעלות חשבונית כדי לשמור הוצאה מוכרת");
      return;
    }

    const recognized = formCategory === "עמותה" ? formRecognized : false;
    const invoiceFields = recognized
      ? { invoiceFileName: formInvoiceName, invoiceFileData: formInvoiceData, invoiceFileType: formInvoiceType }
      : { invoiceFileName: undefined, invoiceFileData: undefined, invoiceFileType: undefined };

    if (editTarget) {
      const updated = expenses.map((e) =>
        e.id === editTarget.id
          ? {
              ...e,
              amount,
              date: formDate,
              category: formCategory,
              subCategory: formSub,
              notes: formNotes.trim(),
              contactPerson: formContact.trim(),
              recognized,
              recognizedDate: recognized ? (e.recognizedDate || today()) : undefined,
              ...invoiceFields,
            }
          : e
      );
      saveExpenses(updated);
      setExpenses(updated);
      toast.success("ההוצאה עודכנה בהצלחה");
    } else {
      const newExp: Expense = {
        id: crypto.randomUUID(),
        amount,
        date: formDate,
        category: formCategory,
        subCategory: formSub,
        notes: formNotes.trim(),
        contactPerson: formContact.trim(),
        recognized,
        recognizedDate: recognized ? today() : undefined,
        ...invoiceFields,
      };
      const updated = [...expenses, newExp];
      saveExpenses(updated);
      setExpenses(updated);
      toast.success("ההוצאה נוספה בהצלחה");
    }
    setEditTarget(null);
    setAddOpen(false);
  }

  // ─── Invoice file handling ─────────────────────────────────
  async function handleInvoiceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("הקובץ גדול מ-5MB. אנא בחר קובץ קטן יותר.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormInvoiceData(reader.result as string);
      setFormInvoiceName(file.name);
      setFormInvoiceType(file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function downloadInvoice(exp: Expense) {
    if (!exp.invoiceFileData) return;
    const a = document.createElement("a");
    a.href = exp.invoiceFileData;
    a.download = exp.invoiceFileName || `invoice-${exp.id}`;
    a.click();
  }

  // ─── Bulk download invoices by period ──────────────────────
  function openDownload() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDownloadFrom(first.toISOString().split("T")[0]);
    setDownloadTo(last.toISOString().split("T")[0]);
    setDownloadOpen(true);
  }

  async function handleDownloadInvoices() {
    if (!downloadFrom || !downloadTo) {
      toast.error("יש לבחור טווח תאריכים");
      return;
    }
    const matches = expenses.filter(
      (e) =>
        e.category === "עמותה" &&
        e.recognized &&
        e.invoiceFileData &&
        e.date >= downloadFrom &&
        e.date <= downloadTo
    );
    if (matches.length === 0) {
      toast.error("לא נמצאו חשבוניות בטווח שנבחר");
      return;
    }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const e of matches) {
        const dataUrl = e.invoiceFileData!;
        const base64 = dataUrl.split(",")[1] || "";
        const ext = (e.invoiceFileName?.split(".").pop() || "bin").toLowerCase();
        const safeContact = (e.contactPerson || "ללא").replace(/[\\/:*?"<>|]/g, "_");
        const fname = `${e.date}_${safeContact}_${e.amount}.${ext}`;
        zip.file(fname, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });

      // Build folder name
      const HEB_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
      const f = new Date(downloadFrom);
      const t = new Date(downloadTo);
      const isFullMonth =
        f.getFullYear() === t.getFullYear() &&
        f.getMonth() === t.getMonth() &&
        f.getDate() === 1 &&
        t.getDate() === new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
      const zipName = isFullMonth
        ? `חשבוניות חודש ${HEB_MONTHS[f.getMonth()]} ${f.getFullYear()}.zip`
        : `חשבוניות ${downloadFrom} - ${downloadTo}.zip`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`הורדו ${matches.length} חשבוניות`);
      setDownloadOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה ביצירת הקובץ");
    }
  }

  // ─── Delete ─────────────────────────────────────────────────
  function handleDelete() {
    if (!deleteTarget) return;
    const updated = expenses.filter((e) => e.id !== deleteTarget.id);
    saveExpenses(updated);
    setExpenses(updated);
    toast.success("ההוצאה נמחקה");
    setDeleteTarget(null);
  }

  // ─── Excel import ──────────────────────────────────────────
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
      const newExps: Expense[] = [];

      for (const row of rows) {
        const notes = String(row["הערות"] || "").trim();
        const amount = Number(row["סכום"] || 0);
        const date = String(row["תאריך"] || today()).trim();
        const cat = String(row["עבור"] || "").trim();
        const sub = String(row["פרטים"] || "").trim();
        const contact = String(row["איש קשר"] || "").trim();

        if (!notes || !amount || amount <= 0 || !contact) { skipped++; continue; }

        const category = cat === "סלים" || cat === "עבור הסלים" ? "סלים" : cat === "עמותה" || cat === "עבור העמותה" ? "עמותה" : "";
        if (!category) { skipped++; continue; }

        newExps.push({
          id: crypto.randomUUID(),
          amount,
          date,
          category,
          subCategory: sub || "שונות",
          notes,
          contactPerson: contact,
          recognized: false,
        });
        imported++;
      }

      if (newExps.length > 0) {
        const updated = [...expenses, ...newExps];
        saveExpenses(updated);
        setExpenses(updated);
      }
      toast.success(`יובאו ${imported} הוצאות${skipped > 0 ? `, ${skipped} דולגו` : ""}`);
    } catch {
      toast.error("שגיאה בקריאת הקובץ");
    }
    e.target.value = "";
  }

  // ─── Category list renderer ────────────────────────────────
  function renderCategoryList(type: "salim" | "amuta", list: string[], newVal: string, setNewVal: (v: string) => void) {
    return (
      <div className="space-y-3">
        <ScrollArea className="max-h-[55vh] pr-2">
          <div className="space-y-2">
            {list.map((cat, idx) => (
            <div key={cat} className="flex items-center gap-2 p-2 rounded-md border bg-muted/30">
              {editingCat?.type === type && editingCat.index === idx ? (
                <>
                  <Input
                    value={editingCat.value}
                    onChange={(e) => setEditingCat({ ...editingCat, value: e.target.value })}
                    className="flex-1 h-8"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && saveEditCategory()}
                  />
                  <Button size="sm" variant="default" onClick={saveEditCategory} className="h-8">שמור</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingCat(null)} className="h-8">ביטול</Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{cat}</span>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingCat({ type, index: idx, value: cat })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => deleteCategory(type, cat)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            placeholder="שם קטגוריה חדשה"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && addCategory(type)}
          />
          <Button onClick={() => addCategory(type)} disabled={!newVal.trim()}>
            <Plus className="ml-1 h-4 w-4" />
            הוסף קטגוריה
          </Button>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">הוצאות</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
          <CardContent className="py-4 px-6">
            <p className="text-sm text-muted-foreground">סה"כ הוצאות סלים</p>
            <p className="text-xl font-bold">{totalSalim.toLocaleString("he-IL")} ₪</p>
          </CardContent>
        </Card>
        <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
          <CardContent className="py-4 px-6">
            <p className="text-sm text-muted-foreground">סה"כ הוצאות עמותה</p>
            <p className="text-xl font-bold">{totalAmuta.toLocaleString("he-IL")} ₪</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={openAdd}>
          <Plus className="ml-1 h-4 w-4" />
          הוסף הוצאה
        </Button>
        <Button variant="outline" asChild>
          <label className="cursor-pointer">
            <Upload className="ml-1 h-4 w-4" />
            ייבוא Excel
            <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={handleImport} />
          </label>
        </Button>
        <Button variant="outline" onClick={() => { setEditingCat(null); setCatOpen(true); }}>
          <Settings className="ml-1 h-4 w-4" />
          ניהול קטגוריות ⚙️
        </Button>
        <Button variant="outline" onClick={openDownload}>
          <Download className="ml-1 h-4 w-4" />
          הורד חשבוניות
        </Button>
      </div>

      {/* Table */}
      {expenses.length === 0 ? (
        <p className="text-muted-foreground text-sm">אין הוצאות עדיין.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]">
                <TableHead className="text-primary-foreground text-right">תאריך</TableHead>
                <TableHead className="text-primary-foreground text-right">קטגוריה</TableHead>
                <TableHead className="text-primary-foreground text-right">תת-קטגוריה</TableHead>
                <TableHead className="text-primary-foreground text-right">פירוט</TableHead>
                <TableHead className="text-primary-foreground text-right">סכום</TableHead>
                <TableHead className="text-primary-foreground text-right">איש קשר</TableHead>
                <TableHead className="text-primary-foreground text-right">הערות</TableHead>
                <TableHead className="text-primary-foreground text-center">מוכר בעמותה</TableHead>
                <TableHead className="text-primary-foreground text-center">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow
                  key={exp.id}
                  ref={registerRow(exp.id) as any}
                  className={`${exp.auto ? "bg-sky-50 dark:bg-sky-950/20" : ""} ${highlightedId === exp.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`}
                >
                  <TableCell>{exp.date}</TableCell>
                  <TableCell>
                    <Badge variant={exp.category === "סלים" ? "default" : "secondary"}>
                      {exp.category === "סלים" ? "עבור הסלים" : "עבור העמותה"}
                    </Badge>
                  </TableCell>
                  <TableCell>{exp.subCategory}</TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {exp.subCategory}
                    {exp.auto && (
                      <Badge variant="secondary" className="mr-2 text-xs bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                        אוטומטי
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{exp.amount.toLocaleString("he-IL")} ₪</TableCell>
                  <TableCell>{exp.contactPerson || "—"}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{exp.notes}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant={exp.recognized ? "default" : "secondary"}
                        className={exp.recognized ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {exp.recognized ? (
                          <><CheckCircle className="ml-1 h-3 w-3" />מוכר</>
                        ) : (
                          <><Circle className="ml-1 h-3 w-3" />לא מוכר</>
                        )}
                      </Badge>
                      {exp.invoiceFileData && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => downloadInvoice(exp)}
                          title={`הורד: ${exp.invoiceFileName}`}
                        >
                          <Paperclip className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {exp.auto ? (
                      <span className="text-xs text-muted-foreground">לא ניתן למחיקה</span>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => openEdit(exp)}>
                          <Pencil className="ml-1 h-4 w-4" />
                          ערוך
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(exp)}>
                          <Trash2 className="ml-1 h-4 w-4" />
                          מחק
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "עריכת הוצאה" : "הוספת הוצאה"}</DialogTitle>
            <DialogDescription>{editTarget ? "עדכן את פרטי ההוצאה" : "הזן פרטי הוצאה חדשה"}</DialogDescription>
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
              <Label>עבור</Label>
              <Select value={formCategory} onValueChange={(v) => { setFormCategory(v); setFormSub(""); }}>
                <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="סלים">עבור הסלים</SelectItem>
                  <SelectItem value="עמותה">עבור העמותה</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formCategory && (
              <div>
                <Label>פרטים</Label>
                <Select value={formSub} onValueChange={setFormSub}>
                  <SelectTrigger><SelectValue placeholder="בחר תת-קטגוריה" /></SelectTrigger>
                  <SelectContent>
                    {subOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {formCategory === "עמותה" && (
              <div className="space-y-3 p-3 rounded-md border bg-muted/30">
                <Label>סטטוס הכרה בעמותה</Label>
                <RadioGroup
                  value={formRecognized ? "yes" : "no"}
                  onValueChange={(v) => setFormRecognized(v === "yes")}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="rec-no" />
                    <Label htmlFor="rec-no" className="font-normal cursor-pointer">לא מוכר בעמותה</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="rec-yes" />
                    <Label htmlFor="rec-yes" className="font-normal cursor-pointer">מוכר בעמותה</Label>
                  </div>
                </RadioGroup>
                {formRecognized && (
                  <div className="space-y-2">
                    <Label>חשבונית (חובה)</Label>
                    {formInvoiceName ? (
                      <div className="flex items-center gap-2 p-2 rounded-md border bg-background">
                        <Paperclip className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm flex-1 truncate">{formInvoiceName}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setFormInvoiceData(undefined);
                            setFormInvoiceName(undefined);
                            setFormInvoiceType(undefined);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" asChild className="w-full">
                        <label className="cursor-pointer">
                          <Upload className="ml-1 h-4 w-4" />
                          העלה חשבונית
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="sr-only"
                            onChange={handleInvoiceUpload}
                          />
                        </label>
                      </Button>
                    )}
                    {!formInvoiceData && (
                      <p className="text-xs text-destructive">יש להעלות חשבונית כדי לשמור הוצאה מוכרת</p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div>
              <Label>איש קשר</Label>
              <Input value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="שם איש הקשר" />
            </div>
            <div>
              <Label>הערות</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="תיאור ההוצאה" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button onClick={handleSave} disabled={!canSave}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Download invoices dialog */}
      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הורדת חשבוניות לפי תקופה</DialogTitle>
            <DialogDescription>בחר טווח תאריכים. הקובץ יישמר כ-ZIP.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>מתאריך</Label>
              <Input type="date" value={downloadFrom} onChange={(e) => setDownloadFrom(e.target.value)} />
            </div>
            <div>
              <Label>עד תאריך</Label>
              <Input type="date" value={downloadTo} onChange={(e) => setDownloadTo(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button onClick={handleDownloadInvoices}>
              <Download className="ml-1 h-4 w-4" />
              הורד ZIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories management dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col" dir="rtl">
          <DialogHeader>
            <DialogTitle>ניהול קטגוריות הוצאות</DialogTitle>
            <DialogDescription>הוסף, ערוך או מחק קטגוריות הוצאות</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="salim" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="salim" className="flex-1">קטגוריות סלים</TabsTrigger>
              <TabsTrigger value="amuta" className="flex-1">קטגוריות עמותה</TabsTrigger>
            </TabsList>
            <TabsContent value="salim" className="mt-4">
              {renderCategoryList("salim", catsSalim, newCatSalim, setNewCatSalim)}
            </TabsContent>
            <TabsContent value="amuta" className="mt-4">
              {renderCategoryList("amuta", catsAmuta, newCatAmuta, setNewCatAmuta)}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת הוצאה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שרוצה למחוק הוצאה זו? ({deleteTarget?.amount.toLocaleString("he-IL")} ₪ – {deleteTarget?.notes})
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
