import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter,
} from "@/components/ui/table";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────
interface BasketProduct {
  id: string;
  name: string;
  cost: number;
}

// ─── Helpers ──────────────────────────────────────────────────
const PRODUCTS_KEY = "basketProducts";

function loadProducts(): BasketProduct[] {
  try { return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]"); }
  catch { return []; }
}

function saveProducts(data: BasketProduct[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
}

function loadGlobalSettings() {
  try {
    const raw = localStorage.getItem("globalSettings");
    if (!raw) return { basketCost: 6000, minimumForBasket: 5000 };
    const parsed = JSON.parse(raw);
    return {
      basketCost: parsed.basketCost ?? 6000,
      minimumForBasket: parsed.minimumForBasket ?? 5000,
    };
  } catch {
    return { basketCost: 6000, minimumForBasket: 5000 };
  }
}

interface BasketCostModuleProps {
  onOpenSettings?: () => void;
}

// ─── Component ────────────────────────────────────────────────
export default function BasketCostModule({ onOpenSettings }: BasketCostModuleProps) {
  const [products, setProducts] = useState<BasketProduct[]>([]);
  const [settings, setSettings] = useState(loadGlobalSettings());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BasketProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BasketProduct | null>(null);

  const [formName, setFormName] = useState("");
  const [formCost, setFormCost] = useState("");

  const refresh = useCallback(() => {
    setProducts(loadProducts());
    setSettings(loadGlobalSettings());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const totalCost = products.reduce((s, p) => s + p.cost, 0);
  const diff = totalCost - settings.minimumForBasket;

  // Sync basket cost to global settings automatically
  useEffect(() => {
    const currentSettings = loadGlobalSettings();
    if (currentSettings.basketCost !== totalCost) {
      try {
        const raw = localStorage.getItem("globalSettings");
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.basketCost = totalCost;
        localStorage.setItem("globalSettings", JSON.stringify(parsed));
      } catch {}
    }
  }, [totalCost]);

  // ─── Add / Edit ─────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null);
    setFormName("");
    setFormCost("");
    setDialogOpen(true);
  }

  function openEdit(p: BasketProduct) {
    setEditTarget(p);
    setFormName(p.name);
    setFormCost(String(p.cost));
    setDialogOpen(true);
  }

  function handleSave() {
    const cost = Number(formCost);
    if (!formName.trim() || !cost || cost <= 0) {
      toast.error("יש למלא שם מוצר וסכום תקין");
      return;
    }

    let updated: BasketProduct[];
    if (editTarget) {
      updated = products.map((p) =>
        p.id === editTarget.id ? { ...p, name: formName.trim(), cost } : p
      );
      toast.success("המוצר עודכן");
    } else {
      updated = [...products, { id: crypto.randomUUID(), name: formName.trim(), cost }];
      toast.success("המוצר נוסף");
    }
    saveProducts(updated);
    setProducts(updated);
    setDialogOpen(false);
  }

  // ─── Delete ─────────────────────────────────────────────────
  function handleDelete() {
    if (!deleteTarget) return;
    const updated = products.filter((p) => p.id !== deleteTarget.id);
    saveProducts(updated);
    setProducts(updated);
    toast.success("המוצר נמחק");
    setDeleteTarget(null);
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold text-[hsl(var(--primary))]">עלות הסל</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
          <CardContent className="py-4 px-6">
            <p className="text-sm text-muted-foreground">עלות סל נוכחית</p>
            <p className="text-xl font-bold">{totalCost.toLocaleString("he-IL")} ₪</p>
          </CardContent>
        </Card>
        <Card className="border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10">
          <CardContent className="py-4 px-6">
            <p className="text-sm text-muted-foreground">סכום מינימום לזכאות</p>
            <p className="text-xl font-bold">{settings.minimumForBasket.toLocaleString("he-IL")} ₪</p>
          </CardContent>
        </Card>
      </div>

      {/* Explanation */}
      <Card className="bg-muted/50">
        <CardContent className="py-4 px-6 space-y-2">
          <p className="text-sm">
            כשבחור מגיע ל-<strong>{settings.minimumForBasket.toLocaleString("he-IL")} ₪</strong> (המינימום),
            העמותה מוסיפה לו <strong>{diff > 0 ? diff.toLocaleString("he-IL") : 0} ₪</strong> (ההפרש) להשלמת הסל.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <p className="text-xs text-muted-foreground">
              עלות הסל ועדכון המינימום מנוהלים בהגדרות הגלובליות ⚙️
            </p>
            {onOpenSettings && (
              <Button variant="outline" size="sm" onClick={onOpenSettings}>
                <Settings className="ml-1 h-4 w-4" />
                עבור להגדרות
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            שינוי בעלות המוצרים משפיע רק על בחורים שעוד לא קיבלו סל.
          </p>
        </CardContent>
      </Card>

      {/* Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">מוצרים בסל</h2>
          <Button size="sm" onClick={openAdd}>
            <Plus className="ml-1 h-4 w-4" />
            הוסף מוצר
          </Button>
        </div>

        {products.length === 0 ? (
          <p className="text-muted-foreground text-sm">לא הוגדרו מוצרים עדיין.</p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]">
                  <TableHead className="text-primary-foreground text-right">שם מוצר</TableHead>
                  <TableHead className="text-primary-foreground text-right">עלות</TableHead>
                  <TableHead className="text-primary-foreground text-center">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.cost.toLocaleString("he-IL")} ₪</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                          <Pencil className="ml-1 h-3 w-3" />
                          ערוך
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(p)}>
                          <Trash2 className="ml-1 h-3 w-3" />
                          מחק
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-bold">סה"כ</TableCell>
                  <TableCell className="font-bold">{totalCost.toLocaleString("he-IL")} ₪</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editTarget ? "עריכת מוצר" : "הוספת מוצר"}</DialogTitle>
            <DialogDescription>{editTarget ? "עדכן את פרטי המוצר" : "הזן שם מוצר ועלות"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>שם מוצר</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="שם המוצר" />
            </div>
            <div>
              <Label>עלות (₪)</Label>
              <Input type="number" min="0" value={formCost} onChange={(e) => setFormCost(e.target.value)} placeholder="עלות" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="outline">ביטול</Button></DialogClose>
            <Button onClick={handleSave} disabled={!formName.trim() || Number(formCost) <= 0}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת מוצר</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שרוצה למחוק את "{deleteTarget?.name}"?
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
