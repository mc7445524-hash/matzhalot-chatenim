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
  /** Every price change, newest first, so a basket handed over before a rise
   *  can still be checked against the price that applied on the day. */
  costHistory: { date: string; oldCost: number; newCost: number }[];
  /** False once the product is taken out of the basket. New baskets stop
   *  carrying it, but it stays visible while bachurim who locked it still
   *  owe that shop. */
  active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────
const PRODUCTS_KEY = "basketProducts";

function loadProducts(): BasketProduct[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    // Products saved before these fields existed are all still in the basket.
    return raw.map((p: any) => ({
      ...p,
      costHistory: Array.isArray(p?.costHistory) ? p.costHistory : [],
      active: p?.active !== false,
    }));
  } catch { return []; }
}

/** Bachurim who locked this product into their basket and have not yet been
 *  settled with that shop. While any remain, the product cannot be removed
 *  for good — the money they owe it would have nowhere to go. */
function openBachurimFor(productId: string): string[] {
  try {
    const bachurim = JSON.parse(localStorage.getItem("bachurim") || "[]");
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    const settled = new Set<string>();
    for (const e of expenses) {
      if (e?.basketProductId !== productId) continue;
      for (const id of e?.basketBachurIds || []) settled.add(id);
    }
    return bachurim
      .filter((b: any) =>
        (b?.basketBreakdownAtTime || []).some((x: any) => x?.productId === productId) &&
        !settled.has(b.id))
      .map((b: any) => b.name);
  } catch { return []; }
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

  const activeProducts = products.filter((p) => p.active);
  const totalCost = activeProducts.reduce((s, p) => s + p.cost, 0);
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
      updated = products.map((p) => {
        if (p.id !== editTarget.id) return p;
        // A price change is logged, so baskets handed over earlier keep being
        // measured against the price that was in force when they went out.
        const history = cost !== p.cost
          ? [{ date: new Date().toISOString(), oldCost: p.cost, newCost: cost }, ...(p.costHistory || [])]
          : p.costHistory || [];
        return { ...p, name: formName.trim(), cost, costHistory: history };
      });
      toast.success(
        cost !== editTarget.cost
          ? `המחיר עודכן — השינוי נשמר בהיסטוריה`
          : "המוצר עודכן"
      );
    } else {
      updated = [...products, {
        id: crypto.randomUUID(), name: formName.trim(), cost,
        costHistory: [], active: true,
      }];
      toast.success("המוצר נוסף");
    }
    saveProducts(updated);
    setProducts(updated);
    setDialogOpen(false);
  }

  // ─── Delete ─────────────────────────────────────────────────
  function handleDelete() {
    if (!deleteTarget) return;
    const owed = openBachurimFor(deleteTarget.id);
    let updated: BasketProduct[];
    if (owed.length > 0) {
      // Deleting outright would strand the money those bachurim still owe
      // this shop, so the product leaves the basket but stays on the books.
      updated = products.map((p) =>
        p.id === deleteTarget.id ? { ...p, active: false } : p
      );
      toast.success(
        `"${deleteTarget.name}" הוצא מהסל. ${owed.length} בחורים עדיין לא נסגרו מולו ` +
        `והוא יישאר ברשימה עד שייסגרו.`,
        { duration: 8000 }
      );
    } else {
      updated = products.filter((p) => p.id !== deleteTarget.id);
      toast.success("המוצר נמחק");
    }
    saveProducts(updated);
    setProducts(updated);
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
                  <TableRow key={p.id} className={p.active ? undefined : "opacity-60"}>
                    <TableCell className="font-medium">
                      {p.name}
                      {!p.active && (
                        <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                          הוצא מהסל — ממתין לסגירה
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.cost.toLocaleString("he-IL")} ₪
                      {(p.costHistory || []).length > 0 && (
                        <span className="mr-2 text-xs text-muted-foreground">
                          (לפני כן {p.costHistory[0].oldCost.toLocaleString("he-IL")} ₪)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                          <Pencil className="ml-1 h-3 w-3" />
                          ערוך
                        </Button>
                        {p.active && (
                          <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(p)}>
                            <Trash2 className="ml-1 h-3 w-3" />
                            מחק
                          </Button>
                        )}
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
