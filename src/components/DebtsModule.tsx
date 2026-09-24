import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useFocusRow } from "@/hooks/useFocusRow";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import type { Income } from "@/lib/db";

interface Payment {
  id: string;
  date: string;
  amount: number;
  via: string;
  note: string;
}

interface Debt {
  id: string;
  date: string;
  name: string;
  amount: number;
  notes: string;
  returned: boolean;
  returnedAmount?: number;
  returnedVia?: string;
  returnedDate?: string;
}

interface ParsedNotes {
  generalNote: string;
  payments: Payment[];
}

const PAY_MARKER = "\n__PAYMENTS__:";
const STORAGE_KEY = "debts";

function today() {
  return new Date().toISOString().split("T")[0];
}

function parseNotes(d: Debt): ParsedNotes {
  const raw = d.notes || "";
  const idx = raw.indexOf(PAY_MARKER);
  if (idx !== -1) {
    const generalNote = raw.slice(0, idx);
    try {
      const payments = JSON.parse(raw.slice(idx + PAY_MARKER.length)) as Payment[];
      return { generalNote, payments: Array.isArray(payments) ? payments : [] };
    } catch {
      return { generalNote, payments: [] };
    }
  }
  // Legacy: synthesize one payment if returned
  if (d.returned && (d.returnedAmount || 0) > 0) {
    return {
      generalNote: raw,
      payments: [{
        id: crypto.randomUUID(),
        date: d.returnedDate || d.date,
        amount: Number(d.returnedAmount) || 0,
        via: d.returnedVia || "",
        note: "",
      }],
    };
  }
  return { generalNote: raw, payments: [] };
}

function serializeNotes(generalNote: string, payments: Payment[]): string {
  if (payments.length === 0) return generalNote;
  return `${generalNote}${PAY_MARKER}${JSON.stringify(payments)}`;
}

function applyChanges(d: Debt, generalNote: string, payments: Payment[]): Debt {
  const total = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const isReturned = total >= d.amount && payments.length > 0;
  const last = payments[payments.length - 1];
  return {
    ...d,
    notes: serializeNotes(generalNote, payments),
    returned: isReturned,
    returnedAmount: payments.length > 0 ? total : undefined,
    returnedVia: last?.via || undefined,
    returnedDate: last?.date || undefined,
  };
}

function loadDebts(): Debt[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveDebts(data: Debt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function incomeIdForPayment(paymentId: string) {
  return `debt-pay-${paymentId}`;
}

export default function DebtsModule() {
  const { incomes, setIncomes } = useData();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [formDate, setFormDate] = useState(today());
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Add-payment form (inside detail dialog)
  const [payDate, setPayDate] = useState(today());
  const [payAmount, setPayAmount] = useState("");
  const [payVia, setPayVia] = useState("");
  const [payNote, setPayNote] = useState("");
  const [editingGeneral, setEditingGeneral] = useState("");
  const [editingDebt, setEditingDebt] = useState(false);
  const [editDebtAmount, setEditDebtAmount] = useState("");
  const [editDebtDate, setEditDebtDate] = useState("");
  const [editDebtName, setEditDebtName] = useState("");
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null);
  const [editPayId, setEditPayId] = useState<string | null>(null);
  const [editPayDate, setEditPayDate] = useState("");
  const [editPayAmount, setEditPayAmount] = useState("");
  const [editPayVia, setEditPayVia] = useState("");
  const [editPayNote, setEditPayNote] = useState("");

  const refresh = useCallback(() => setDebts(loadDebts()), []);
  useEffect(() => { refresh(); }, [refresh]);

  // Migrate existing debt payments to incomes (runs once when incomes are loaded)
  useEffect(() => {
    if (incomes.length === 0 && debts.length === 0) return;
    const existingIncomeIds = new Set(incomes.map((i) => i.id));
    const toAdd: Income[] = [];
    for (const d of debts) {
      const { payments } = parseNotes(d);
      for (const p of payments) {
        const id = incomeIdForPayment(p.id);
        if (!existingIncomeIds.has(id)) {
          toAdd.push({
            id,
            description: `החזר הלוואה – ${d.name}`,
            amount: p.amount,
            date: p.date,
            recognized: true,
            auto: true,
            fundraiser: "החזרי הלוואות",
          });
        }
      }
    }
    if (toAdd.length > 0) {
      setIncomes([...incomes, ...toAdd]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debts]);
  const { highlightedId, registerRow } = useFocusRow("debts");

  const enriched = useMemo(() => debts.map((d) => {
    const p = parseNotes(d);
    const paid = p.payments.reduce((s, x) => s + (Number(x.amount) || 0), 0);
    return { debt: d, parsed: p, paid, remaining: Math.max(0, d.amount - paid) };
  }), [debts]);

  const totalDebt = enriched.reduce((s, e) => s + e.debt.amount, 0);
  const totalReturned = enriched.reduce((s, e) => s + e.paid, 0);
  const remaining = totalDebt - totalReturned;

  const detail = detailId ? enriched.find((e) => e.debt.id === detailId) : null;

  useEffect(() => {
    if (detail) setEditingGeneral(detail.parsed.generalNote);
    setPayDate(today()); setPayAmount(""); setPayVia(""); setPayNote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailId]);

  const canSave = formName.trim().length > 0 && Number(formAmount) > 0 && formNotes.trim().length > 0;
  const canAddPayment = Number(payAmount) > 0 && payVia.trim().length > 0;

  function openAdd() {
    setFormDate(today()); setFormName(""); setFormAmount(""); setFormNotes("");
    setAddOpen(true);
  }

  function handleSave() {
    if (!canSave) return;
    const newDebt: Debt = {
      id: crypto.randomUUID(),
      date: formDate,
      name: formName.trim(),
      amount: Number(formAmount),
      notes: formNotes.trim(),
      returned: false,
    };
    const updated = [...debts, newDebt];
    saveDebts(updated); setDebts(updated);
    toast.success("החוב נוסף בהצלחה");
    setAddOpen(false);
  }

  function persistDebt(updated: Debt) {
    const next = debts.map((d) => d.id === updated.id ? updated : d);
    saveDebts(next); setDebts(next);
  }

  function handleAddPayment() {
    if (!detail || !canAddPayment) return;
    const p: Payment = {
      id: crypto.randomUUID(),
      date: payDate,
      amount: Number(payAmount),
      via: payVia.trim(),
      note: payNote.trim(),
    };
    const newPayments = [...detail.parsed.payments, p];
    persistDebt(applyChanges(detail.debt, editingGeneral, newPayments));
    // Auto-create income entry
    const newIncome: Income = {
      id: incomeIdForPayment(p.id),
      description: `החזר הלוואה – ${detail.debt.name}`,
      amount: p.amount,
      date: p.date,
      recognized: true,
      auto: true,
      fundraiser: "החזרי הלוואות",
    };
    setIncomes([...incomes, newIncome]);
    setPayDate(today()); setPayAmount(""); setPayVia(""); setPayNote("");
    toast.success("ההחזר נוסף");
  }

  function handleDeletePayment() {
    if (!detail || !deletePaymentId) return;
    const newPayments = detail.parsed.payments.filter((p) => p.id !== deletePaymentId);
    persistDebt(applyChanges(detail.debt, editingGeneral, newPayments));
    // Remove corresponding income
    setIncomes(incomes.filter((i) => i.id !== incomeIdForPayment(deletePaymentId)));
    setDeletePaymentId(null);
    toast.success("ההחזר נמחק");
  }

  function startEditPayment(p: Payment) {
    setEditPayId(p.id);
    setEditPayDate(p.date);
    setEditPayAmount(String(p.amount));
    setEditPayVia(p.via);
    setEditPayNote(p.note);
  }

  function cancelEditPayment() {
    setEditPayId(null);
  }

  function saveEditPayment() {
    if (!detail || !editPayId) return;
    if (Number(editPayAmount) <= 0 || editPayVia.trim().length === 0) return;
    const newPayments = detail.parsed.payments.map((p) =>
      p.id === editPayId
        ? { ...p, date: editPayDate, amount: Number(editPayAmount), via: editPayVia.trim(), note: editPayNote.trim() }
        : p
    );
    persistDebt(applyChanges(detail.debt, editingGeneral, newPayments));
    // Update corresponding income
    const incId = incomeIdForPayment(editPayId);
    setIncomes(incomes.map((i) =>
      i.id === incId
        ? { ...i, amount: Number(editPayAmount), date: editPayDate }
        : i
    ));
    setEditPayId(null);
    toast.success("ההחזר עודכן");
  }

  function handleSaveGeneralNote() {
    if (!detail) return;
    persistDebt(applyChanges(detail.debt, editingGeneral, detail.parsed.payments));
    toast.success("ההערה נשמרה");
  }

  function openEditDebt() {
    if (!detail) return;
    setEditDebtAmount(String(detail.debt.amount));
    setEditDebtDate(detail.debt.date);
    setEditDebtName(detail.debt.name);
    setEditingDebt(true);
  }

  function saveEditDebt() {
    if (!detail) return;
    const amount = Number(editDebtAmount);
    if (!amount || amount <= 0 || !editDebtName.trim()) return;
    const updated = { ...detail.debt, amount, date: editDebtDate, name: editDebtName.trim() };
    const next = debts.map((d) => d.id === updated.id ? updated : d);
    saveDebts(next); setDebts(next);
    setEditingDebt(false);
    toast.success("פרטי ההלוואה עודכנו");
  }

  function handleDeleteDebt() {
    if (!deleteTarget) return;
    const updated = debts.filter((d) => d.id !== deleteTarget.id);
    saveDebts(updated); setDebts(updated);
    toast.success("החוב נמחק");
    setDeleteTarget(null);
    if (detailId === deleteTarget.id) setDetailId(null);
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">חובות</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
          <CardContent className="py-4 px-6">
            <p className="text-sm text-muted-foreground">סה"כ חובות</p>
            <p className="text-xl font-bold">{totalDebt.toLocaleString("he-IL")} ₪</p>
          </CardContent>
        </Card>
        <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
          <CardContent className="py-4 px-6">
            <p className="text-sm text-muted-foreground">סה"כ שולם</p>
            <p className="text-xl font-bold text-green-600">{totalReturned.toLocaleString("he-IL")} ₪</p>
          </CardContent>
        </Card>
        <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
          <CardContent className="py-4 px-6">
            <p className="text-sm text-muted-foreground">נשאר לגבות</p>
            <p className="text-xl font-bold text-red-600">{remaining.toLocaleString("he-IL")} ₪</p>
          </CardContent>
        </Card>
      </div>

      <Button onClick={openAdd}>
        <Plus className="ml-1 h-4 w-4" />
        הוסף חוב
      </Button>

      {enriched.length === 0 ? (
        <p className="text-muted-foreground text-sm">אין חובות עדיין.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]">
                <TableHead className="text-primary-foreground text-right">תאריך</TableHead>
                <TableHead className="text-primary-foreground text-right">שם</TableHead>
                <TableHead className="text-primary-foreground text-right">נשאר לגבות</TableHead>
                <TableHead className="text-primary-foreground text-right">הערה</TableHead>
                <TableHead className="text-primary-foreground text-center">סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enriched.map(({ debt: d, parsed, remaining: rem, paid }) => (
                <TableRow
                  key={d.id}
                  ref={registerRow(d.id) as any}
                  onClick={() => setDetailId(d.id)}
                  className={`cursor-pointer hover:bg-primary/5 ${rem === 0 ? "bg-green-50 dark:bg-green-950/20" : ""} ${highlightedId === d.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`}
                >
                  <TableCell>{d.date}</TableCell>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{rem.toLocaleString("he-IL")} ₪</div>
                    {paid > 0 && rem > 0 && (
                      <div className="text-xs text-muted-foreground">
                        מתוך {d.amount.toLocaleString("he-IL")} ₪
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate">{parsed.generalNote || "—"}</TableCell>
                  <TableCell className="text-center">
                    {rem === 0 ? (
                      <Badge className="bg-green-600 text-white">שולם</Badge>
                    ) : paid > 0 ? (
                      <Badge className="bg-amber-500 text-white">חלקי</Badge>
                    ) : (
                      <Badge variant="destructive">לא שולם</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add debt dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>הוספת חוב</DialogTitle>
            <DialogDescription>הזן פרטי חוב חדש</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>תאריך</Label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>
            <div>
              <Label>שם (חובה)</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="שם החייב" />
            </div>
            <div>
              <Label>סכום חוב (₪)</Label>
              <Input type="number" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
            </div>
            <div>
              <Label>הערה כללית (חובה)</Label>
              <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="הערה שתופיע בעמוד הראשי" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button onClick={handleSave} disabled={!canSave}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.debt.name}</DialogTitle>
                <DialogDescription>
                  הלוואה מ-{detail.debt.date}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3">
                <Card><CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">סכום ההלוואה</p>
                  <p className="font-bold">{detail.debt.amount.toLocaleString("he-IL")} ₪</p>
                </CardContent></Card>
                <Card><CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">הוחזר</p>
                  <p className="font-bold text-green-600">{detail.paid.toLocaleString("he-IL")} ₪</p>
                </CardContent></Card>
                <Card><CardContent className="py-3 px-4">
                  <p className="text-xs text-muted-foreground">נשאר</p>
                  <p className="font-bold text-red-600">{detail.remaining.toLocaleString("he-IL")} ₪</p>
                </CardContent></Card>
              </div>

              {editingDebt ? (
                <div className="border rounded p-3 space-y-3 bg-muted/30">
                  <h3 className="font-semibold">עריכת פרטי הלוואה</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">שם</Label>
                      <Input value={editDebtName} onChange={(e) => setEditDebtName(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">תאריך</Label>
                      <Input type="date" value={editDebtDate} onChange={(e) => setEditDebtDate(e.target.value)} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">סכום הלוואה (₪)</Label>
                      <Input type="number" min="0" value={editDebtAmount} onChange={(e) => setEditDebtAmount(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEditDebt} disabled={Number(editDebtAmount) <= 0 || !editDebtName.trim()}>שמור</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingDebt(false)}>ביטול</Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={openEditDebt}>
                  <Pencil className="ml-1 h-3 w-3" /> ערוך פרטי הלוואה
                </Button>
              )}

              <div>
                <Label>הערה כללית (מוצגת בעמוד הראשי)</Label>
                <Textarea value={editingGeneral} onChange={(e) => setEditingGeneral(e.target.value)} />
                <Button size="sm" className="mt-2" onClick={handleSaveGeneralNote}>שמור הערה</Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">החזרים ({detail.parsed.payments.length})</h3>
                {detail.parsed.payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">לא בוצעו החזרים עדיין.</p>
                ) : (
                  <div className="rounded border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">תאריך</TableHead>
                          <TableHead className="text-right">סכום</TableHead>
                          <TableHead className="text-right">באמצעות</TableHead>
                          <TableHead className="text-right">הערה</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detail.parsed.payments.map((p) => (
                          editPayId === p.id ? (
                            <TableRow key={p.id} className="bg-muted/30">
                              <TableCell><Input type="date" value={editPayDate} onChange={(e) => setEditPayDate(e.target.value)} className="h-8" /></TableCell>
                              <TableCell><Input type="number" min="0" value={editPayAmount} onChange={(e) => setEditPayAmount(e.target.value)} className="h-8 w-24" /></TableCell>
                              <TableCell><Input value={editPayVia} onChange={(e) => setEditPayVia(e.target.value)} className="h-8" /></TableCell>
                              <TableCell><Input value={editPayNote} onChange={(e) => setEditPayNote(e.target.value)} className="h-8" /></TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={saveEditPayment} title="שמור"><Check className="h-3 w-3" /></Button>
                                  <Button size="sm" variant="ghost" onClick={cancelEditPayment} title="ביטול"><X className="h-3 w-3" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <TableRow key={p.id}>
                              <TableCell>{p.date}</TableCell>
                              <TableCell>{p.amount.toLocaleString("he-IL")} ₪</TableCell>
                              <TableCell>{p.via}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{p.note || "—"}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="ghost" onClick={() => startEditPayment(p)} title="ערוך">
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setDeletePaymentId(p.id)} title="מחק">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              <div className="border rounded p-3 space-y-3 bg-muted/30">
                <h3 className="font-semibold">הוסף החזר חדש</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">תאריך</Label>
                    <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">סכום (₪)</Label>
                    <Input type="number" min="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">באמצעות</Label>
                    <Input value={payVia} onChange={(e) => setPayVia(e.target.value)} placeholder="מזומן, העברה..." />
                  </div>
                  <div>
                    <Label className="text-xs">הערה לפעולה זו</Label>
                    <Input value={payNote} onChange={(e) => setPayNote(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleAddPayment} disabled={!canAddPayment} size="sm">
                  <Plus className="ml-1 h-3 w-3" /> הוסף החזר
                </Button>
              </div>

              <DialogFooter className="flex flex-row-reverse justify-between gap-2 sm:gap-0">
                <Button variant="destructive" onClick={() => setDeleteTarget(detail.debt)}>
                  <Trash2 className="ml-1 h-4 w-4" /> מחק חוב
                </Button>
                <DialogClose asChild><Button variant="outline">סגור</Button></DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete debt confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת חוב</AlertDialogTitle>
            <AlertDialogDescription>
              למחוק את החוב של {deleteTarget?.name} ({deleteTarget?.amount.toLocaleString("he-IL")} ₪)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDebt}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete payment confirmation */}
      <AlertDialog open={!!deletePaymentId} onOpenChange={(o) => !o && setDeletePaymentId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת החזר</AlertDialogTitle>
            <AlertDialogDescription>למחוק את ההחזר הזה?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePayment}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}