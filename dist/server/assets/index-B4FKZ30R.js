import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useCallback, useMemo, useContext, createContext, useRef } from "react";
import { X, Settings, Save, ArrowUpCircle, Trash2, RotateCcw, Database, ChevronRight, Check, Circle, MessageCircle, User, KeyRound, LogOut, ChevronDown, ChevronUp, Upload, FileSpreadsheet, ArrowRight, ArrowLeft, Wallet, Snowflake, Receipt, ClipboardList, Scale, Download, UserPlus, EyeOff, Eye, Search, ShoppingBasket, Heart, Users, AlertTriangle, Plus, Pencil, UserMinus, CheckCircle, Paperclip, FileText, Calendar, Building2, Landmark, ShieldCheck, Construction, Clock, CheckCheck, Send, ArrowDown, Smile, Image, Mic, Square } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as LabelPrimitive from "@radix-ui/react-label";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { toast } from "sonner";
import { f as fetchBachurim, a as fetchIncomes, b as fetchExpenses, c as fetchDebts, d as fetchAskanimIncomes, s as saveBachurimToDb, e as saveIncomesToDb, g as saveExpensesToDb, h as saveDebtsToDb, i as saveAskanimIncomesToDb, j as supabase, u as useAuth, k as useData, l as fetchActivityLog, m as fetchBasketProducts, n as fetchGlobalSettings, o as fetchFundraisers, p as fetchExpenseCategories, q as saveGlobalSettingsToDb, r as saveExpenseCategoriesToDb, t as addActivityLog, v as saveFundraisersToDb, w as saveBasketProductsToDb } from "./router-BQtaaTJ3.js";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as XLSX from "xlsx";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import EmojiPicker, { Theme } from "emoji-picker-react";
import "@tanstack/react-router";
import "@supabase/supabase-js";
import "@lovable.dev/webhooks-js";
import "@react-email/components";
import "@lovable.dev/email-js";
const ringsIcon = "/assets/rings-icon-DJN8cjWt.png";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
  /* @__PURE__ */ jsx(SheetOverlay, {}),
  /* @__PURE__ */ jsxs(
    SheetPrimitive.Content,
    {
      ref,
      className: cn(sheetVariants({ side }), className),
      ...props,
      children: [
        /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] }),
        children
      ]
    }
  )
] }));
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold text-foreground", className),
    ...props
  }
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
const Table = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx(
  "table",
  {
    ref,
    className: cn("w-full caption-bottom text-sm", className),
    ...props
  }
) }));
Table.displayName = "Table";
const TableHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "tbody",
  {
    ref,
    className: cn("[&_tr:last-child]:border-0", className),
    ...props
  }
));
TableBody.displayName = "TableBody";
const TableFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "tfoot",
  {
    ref,
    className: cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    ),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "tr",
  {
    ref,
    className: cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    ),
    ...props
  }
));
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "th",
  {
    ref,
    className: cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "td",
  {
    ref,
    className: cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "caption",
  {
    ref,
    className: cn("mt-4 text-sm text-muted-foreground", className),
    ...props
  }
));
TableCaption.displayName = "TableCaption";
const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
    SeparatorPrimitive.Root,
    {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props
    }
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;
const BACKUP_KEY = "__lastDataBackup__";
function loadBackup() {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
const STORAGE_KEY$2 = "globalSettings";
const CLASS_LEVELS$1 = ["א", "ב", "ג", "ד", "ה", "ו"];
function getDefaults() {
  return {
    basketCost: 6e3,
    basketCostHistory: [],
    minimumForBasket: 5e3,
    lastClassUpgrade: null,
    classUpgradeHistory: []
  };
}
function loadSettings$1() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY$2);
    if (!raw) return getDefaults();
    return { ...getDefaults(), ...JSON.parse(raw) };
  } catch {
    return getDefaults();
  }
}
function saveSettings(data) {
  localStorage.setItem(STORAGE_KEY$2, JSON.stringify(data));
}
function formatDate$1(iso) {
  return new Date(iso).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}
function formatCurrency(amount) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0
  }).format(amount);
}
function getNextElulApprox() {
  const now = /* @__PURE__ */ new Date();
  const year = now.getFullYear();
  const estimates = {
    2024: "2024-09-04",
    2025: "2025-08-23",
    2026: "2026-09-12",
    2027: "2027-09-02",
    2028: "2028-08-22"
  };
  const nextElul = estimates[year] || estimates[2026];
  const elulDate = new Date(nextElul);
  if (elulDate < now && estimates[year + 1]) {
    return estimates[year + 1];
  }
  return nextElul;
}
function GlobalSettings({ triggerRef, onNavigateToTab }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(getDefaults());
  const [newMinimum, setNewMinimum] = useState("");
  const [resetMode, setResetMode] = useState(null);
  const [confirmStep, setConfirmStep] = useState(0);
  const [backup, setBackup] = useState(null);
  const [busy, setBusy] = useState(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  useEffect(() => {
    if (open) {
      const loaded = loadSettings$1();
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
    const updated = {
      ...settings,
      minimumForBasket: amount
    };
    saveSettings(updated);
    setSettings(updated);
    toast.success(`סכום מינימום לזכאות עודכן ל-${formatCurrency(amount)}`);
  };
  const handleUpgradeClasses = () => {
    try {
      const bachurim = JSON.parse(localStorage.getItem("bachurim") || "[]");
      let upgraded = 0;
      const updatedBachurim = bachurim.map((b) => {
        if (b.married) return b;
        const currentIdx = CLASS_LEVELS$1.indexOf(b.classLevel);
        if (currentIdx === -1 || currentIdx >= CLASS_LEVELS$1.length - 1) return b;
        upgraded++;
        return { ...b, classLevel: CLASS_LEVELS$1[currentIdx + 1] };
      });
      localStorage.setItem("bachurim", JSON.stringify(updatedBachurim));
      const logEntry = {
        date: (/* @__PURE__ */ new Date()).toISOString(),
        type: "manual"
      };
      const updated = {
        ...settings,
        lastClassUpgrade: logEntry,
        classUpgradeHistory: [logEntry, ...settings.classUpgradeHistory]
      };
      saveSettings(updated);
      setSettings(updated);
      toast.success(`השיעורים עודכנו! ${upgraded} בחורים הועלו שיעור`);
    } catch {
      toast.error("שגיאה בעדכון השיעורים");
    }
  };
  const nextElul = getNextElulApprox();
  async function handleDataReset(mode) {
    setBusy("reset");
    try {
      const [bachurim, incomes, expenses, debts, askanim] = await Promise.all([
        fetchBachurim(),
        fetchIncomes(),
        fetchExpenses(),
        fetchDebts(),
        fetchAskanimIncomes()
      ]);
      const snapshot = {
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        counts: {
          bachurim: bachurim.length,
          incomes: incomes.length,
          expenses: expenses.length,
          debts: debts.length,
          askanim: askanim.length
        },
        data: { bachurim, incomes, expenses, debts, askanim }
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(snapshot));
      setBackup(snapshot);
      if (mode === "full") {
        await Promise.all([
          saveBachurimToDb([]),
          saveIncomesToDb([]),
          saveExpensesToDb([]),
          saveDebtsToDb([]),
          saveAskanimIncomesToDb([])
        ]);
        ["bachurim", "incomes", "expenses", "debts", "askanimIncomes", "askanim"].forEach((k) => localStorage.removeItem(k));
        toast.success("כל הנתונים נמחקו. גיבוי נשמר ויש אפשרות לשחזור.");
      } else {
        await Promise.all([
          saveIncomesToDb([]),
          saveExpensesToDb([]),
          saveDebtsToDb([]),
          saveAskanimIncomesToDb([]),
          supabase.from("outings").delete().neq("id", "___never___"),
          supabase.from("bachurim").update({
            received_basket: false,
            basket_date: null,
            basket_cost_at_time: null
          }).neq("id", "___never___")
        ]);
        ["incomes", "expenses", "debts", "askanimIncomes", "askanim"].forEach((k) => localStorage.removeItem(k));
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
        saveAskanimIncomesToDb(backup.data.askanim)
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
  return /* @__PURE__ */ jsxs(Sheet, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      "button",
      {
        ref: triggerRef,
        className: "flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors",
        "aria-label": "הגדרות",
        children: /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" })
      }
    ) }),
    /* @__PURE__ */ jsxs(SheetContent, { side: "left", className: "w-full sm:max-w-lg overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { children: [
        /* @__PURE__ */ jsx(SheetTitle, { className: "text-xl", children: "הגדרות גלובליות" }),
        /* @__PURE__ */ jsx(SheetDescription, { children: "ניהול הגדרות המערכת" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-8", children: [
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-3", children: "עלות הסל הנוכחית" }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-secondary/50 border border-border p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold text-foreground", children: [
              "עלות סל נוכחית: ",
              formatCurrency(settings.basketCost)
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "text-xs text-primary underline hover:text-primary/80 mt-2 cursor-pointer",
                onClick: () => {
                  setOpen(false);
                  onNavigateToTab?.("basket-cost");
                },
                children: 'לשינוי עלות הסל – עבור לדף "עלות הסל" ועדכן את רשימת המוצרים'
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-3", children: "סכום מינימום לזכאות לסל" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "שינוי משפיע מיידית על חישוב הזכאות בכל המערכת" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-end", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "minBasket", children: "סכום מינימום (₪)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "minBasket",
                  type: "number",
                  value: newMinimum,
                  onChange: (e) => setNewMinimum(e.target.value),
                  min: 0,
                  className: "mt-1"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(Button, { onClick: handleSaveMinimum, className: "gap-1.5", children: [
              /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
              "שמור שינוי"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
            "ערך נוכחי: ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: formatCurrency(settings.minimumForBasket) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-3", children: "ניהול שיעורים" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-3", children: [
            "השיעורים: א׳, ב׳, ג׳, ד׳, ה׳, ו׳ — בחורים בשיעור ו׳ נשארים בו.",
            /* @__PURE__ */ jsx("br", {}),
            "העדכון חל רק על בחורים פעילים (לא נשואים)."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-secondary/50 border border-border p-4 mb-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-foreground", children: [
              "📅 א׳ אלול הבא (משוער):",
              " ",
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: new Date(nextElul).toLocaleDateString("he-IL") })
            ] }),
            settings.lastClassUpgrade && /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
              "עדכון אחרון: ",
              formatDate$1(settings.lastClassUpgrade.date),
              " (",
              settings.lastClassUpgrade.type === "manual" ? "ידני" : "אוטומטי",
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Button, { onClick: handleUpgradeClasses, variant: "outline", className: "gap-1.5 w-full", children: [
            /* @__PURE__ */ jsx(ArrowUpCircle, { className: "h-4 w-4" }),
            "העלה שיעור לכולם"
          ] }),
          settings.classUpgradeHistory.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: "היסטוריית עדכוני שיעורים" }),
            /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
              /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableHead, { children: "תאריך" }),
                /* @__PURE__ */ jsx(TableHead, { children: "סוג" })
              ] }) }),
              /* @__PURE__ */ jsx(TableBody, { children: settings.classUpgradeHistory.map((log, i) => /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: formatDate$1(log.date) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: log.type === "manual" ? "ידני" : "אוטומטי" })
              ] }, i)) })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsxs("section", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-destructive mb-3", children: "איפוס נתונים" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "מחיקת כל נתוני התפעול (בחורים, הכנסות, הוצאות, חובות, פרויקט עסקנים). ההגדרות, הקטגוריות, המגייסים ומוצרי הסל נשמרים. לפני המחיקה נשמר אוטומטית גיבוי שאפשר לשחזר ממנו." }),
          resetMode === null ? /* @__PURE__ */ jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "destructive",
                className: "gap-1.5 w-full",
                onClick: () => {
                  setResetMode("full");
                  setConfirmStep(1);
                },
                disabled: busy !== null,
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                  "מחיקת כל הנתונים"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                className: "gap-1.5 w-full border-destructive/50 text-destructive hover:bg-destructive/10",
                onClick: () => {
                  setResetMode("amounts");
                  setConfirmStep(1);
                },
                disabled: busy !== null,
                children: [
                  /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
                  "איפוס סכומים בלבד"
                ]
              }
            )
          ] }) : confirmStep === 1 ? /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-destructive", children: resetMode === "full" ? "האם אתה בטוח שברצונך למחוק את כל הנתונים (בחורים, הכנסות, הוצאות, חובות, עסקנים)? לפני המחיקה יישמר גיבוי." : "האם אתה בטוח שברצונך לאפס את כל הסכומים? רשימת הבחורים תישאר כפי שהיא. ההכנסות, ההוצאות, החובות והעסקנים יתאפסו. גיבוי יישמר." }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(Button, { variant: "destructive", onClick: () => setConfirmStep(2), children: "כן, המשך" }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
                setResetMode(null);
                setConfirmStep(0);
              }, children: "ביטול" })
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-destructive bg-destructive/20 p-4 space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-destructive", children: resetMode === "full" ? "אישור אחרון – לאחר לחיצה כל הנתונים יימחקו. ניתן לשחזר מהגיבוי שיישמר." : "אישור אחרון – לאחר לחיצה כל הסכומים יתאפסו (הבחורים יישמרו). ניתן לשחזר מהגיבוי שיישמר." }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "destructive",
                  onClick: () => handleDataReset(resetMode),
                  disabled: busy === "reset",
                  children: busy === "reset" ? "מאפס..." : resetMode === "full" ? "מחק הכל ושמור גיבוי" : "אפס סכומים ושמור גיבוי"
                }
              ),
              /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
                setResetMode(null);
                setConfirmStep(0);
              }, children: "ביטול" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg border border-border bg-muted/30 p-4 space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Database, { className: "h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: "שחזור גיבוי אחרון" })
            ] }),
            !backup ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "אין גיבוי זמין. גיבוי נוצר אוטומטית בכל פעם שמבצעים איפוס נתונים." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  "נוצר ב-",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: new Date(backup.createdAt).toLocaleString("he-IL") })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
                  backup.counts.bachurim,
                  " בחורים · ",
                  backup.counts.incomes,
                  " הכנסות ·",
                  " ",
                  backup.counts.expenses,
                  " הוצאות · ",
                  backup.counts.debts,
                  " חובות ·",
                  " ",
                  backup.counts.askanim,
                  " פרויקט עסקנים"
                ] })
              ] }),
              !confirmRestore ? /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "outline",
                  className: "gap-1.5 w-full",
                  onClick: () => setConfirmRestore(true),
                  disabled: busy !== null,
                  children: [
                    /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
                    "שחזר נתונים מהגיבוי"
                  ]
                }
              ) : /* @__PURE__ */ jsxs("div", { className: "rounded border border-orange-500/50 bg-orange-500/10 p-3 space-y-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "השחזור יחליף את כל הנתונים הקיימים בנתוני הגיבוי. להמשיך?" }),
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsx(Button, { onClick: handleRestoreBackup, disabled: busy === "restore", children: busy === "restore" ? "משחזר..." : "כן, שחזר" }),
                  /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setConfirmRestore(false), children: "ביטול" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function useOnlineUsers(currentEmail, currentUserId) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (!currentEmail || !currentUserId) return;
    const channel = supabase.channel(`online-users-${currentUserId}-${Math.random().toString(36).slice(2)}`, {
      config: { presence: { key: currentUserId } }
    });
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const all = [];
      const seen = /* @__PURE__ */ new Set();
      for (const key of Object.keys(state)) {
        for (const meta of state[key]) {
          if (!seen.has(meta.userId)) {
            seen.add(meta.userId);
            all.push(meta);
          }
        }
      }
      setUsers(all);
    }).subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          email: currentEmail,
          userId: currentUserId,
          joinedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentEmail, currentUserId]);
  return users;
}
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-tooltip-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
function initialsFromEmail(email) {
  const name = email.split("@")[0];
  return name.slice(0, 2).toUpperCase();
}
function colorFromEmail(email) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}
function OnlineUsers() {
  const { user } = useAuth();
  const onlineUsers = useOnlineUsers(user?.email ?? null, user?.id ?? null);
  if (!user) return null;
  const visible = onlineUsers.slice(0, 3);
  const extra = Math.max(0, onlineUsers.length - visible.length);
  return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsxs(Popover, { children: [
    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "flex items-center gap-1 hover:opacity-80 transition",
        "aria-label": `${onlineUsers.length} משתמשים מחוברים`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex -space-x-2 rtl:space-x-reverse", children: [
            visible.map((u) => /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white border-2 border-primary ring-1 ring-white",
                  style: { backgroundColor: colorFromEmail(u.email) },
                  children: initialsFromEmail(u.email)
                }
              ) }),
              /* @__PURE__ */ jsx(TooltipContent, { children: u.email })
            ] }, u.userId)),
            extra > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-foreground/20 text-xs font-bold border-2 border-primary", children: [
              "+",
              extra
            ] })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "ms-1 hidden sm:inline-flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-green-400 animate-pulse" }),
            onlineUsers.length
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx(PopoverContent, { align: "start", className: "w-64", dir: "rtl", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold border-b pb-2", children: [
        "מחוברים כעת (",
        onlineUsers.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "space-y-1.5 max-h-64 overflow-y-auto", children: onlineUsers.map((u) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: "inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white shrink-0",
            style: { backgroundColor: colorFromEmail(u.email) },
            children: initialsFromEmail(u.email)
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "truncate", dir: "ltr", children: u.email }),
        u.userId === user.id && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: "(אתה)" })
      ] }, u.userId)) })
    ] }) })
  ] }) });
}
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const Dialog = SheetPrimitive.Root;
const DialogTrigger = SheetPrimitive.Trigger;
const DialogPortal = SheetPrimitive.Portal;
const DialogClose = SheetPrimitive.Close;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = SheetPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    SheetPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = SheetPrimitive.Content.displayName;
const DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Title,
  {
    ref,
    className: cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    ),
    ...props
  }
));
DialogTitle.displayName = SheetPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = SheetPrimitive.Description.displayName;
function UserProfileDialog({ open, onOpenChange }) {
  const { user, displayName, refreshProfile } = useAuth();
  const [name, setName] = useState(displayName ?? "");
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [currentPwd, setCurrentPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);
  useEffect(() => {
    if (open) {
      setName(displayName ?? "");
      setNameMsg(null);
      setPwdMsg(null);
      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
    }
  }, [open, displayName]);
  const saveName = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSavingName(true);
    setNameMsg(null);
    const { error } = await supabase.from("profiles").update({ display_name: name.trim() || null }).eq("id", user.id);
    setSavingName(false);
    if (error) {
      setNameMsg({ type: "err", text: "שגיאה בשמירה: " + error.message });
    } else {
      setNameMsg({ type: "ok", text: "השם נשמר בהצלחה" });
      await refreshProfile();
    }
  };
  const savePwd = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      setPwdMsg({ type: "err", text: "לא ניתן לזהות את המשתמש" });
      return;
    }
    if (!currentPwd) {
      setPwdMsg({ type: "err", text: "יש להזין את הסיסמה הנוכחית" });
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg({ type: "err", text: "הסיסמה חייבת להכיל לפחות 6 תווים" });
      return;
    }
    if (newPwd !== newPwd2) {
      setPwdMsg({ type: "err", text: "הסיסמאות לא תואמות" });
      return;
    }
    setSavingPwd(true);
    setPwdMsg(null);
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPwd
    });
    if (signInErr) {
      setSavingPwd(false);
      setPwdMsg({ type: "err", text: "הסיסמה הנוכחית שגויה" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) {
      setPwdMsg({ type: "err", text: "שגיאה: " + error.message });
    } else {
      setPwdMsg({ type: "ok", text: "הסיסמה שונתה בהצלחה" });
      setCurrentPwd("");
      setNewPwd("");
      setNewPwd2("");
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { dir: "rtl", className: "max-w-md", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: "פרופיל המשתמש" }),
      /* @__PURE__ */ jsx(DialogDescription, { children: user?.email })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: saveName, className: "space-y-3 border-b pb-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm", children: "שם להצגה" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "profile-name", children: "שם" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "profile-name",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "הכנס שם להצגה"
          }
        )
      ] }),
      nameMsg && /* @__PURE__ */ jsx("div", { className: `text-sm px-3 py-2 rounded ${nameMsg.type === "ok" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-destructive bg-destructive/10"}`, children: nameMsg.text }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: savingName, size: "sm", children: savingName ? "שומר..." : "שמור שם" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: savePwd, className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm", children: "שינוי סיסמה" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "cur-pwd", children: "סיסמה נוכחית" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "cur-pwd",
            type: "password",
            value: currentPwd,
            onChange: (e) => setCurrentPwd(e.target.value),
            dir: "ltr",
            className: "text-left",
            autoComplete: "current-password"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "new-pwd", children: "סיסמה חדשה" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "new-pwd",
            type: "password",
            value: newPwd,
            onChange: (e) => setNewPwd(e.target.value),
            minLength: 6,
            dir: "ltr",
            className: "text-left",
            autoComplete: "new-password"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "new-pwd2", children: "אישור סיסמה חדשה" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "new-pwd2",
            type: "password",
            value: newPwd2,
            onChange: (e) => setNewPwd2(e.target.value),
            minLength: 6,
            dir: "ltr",
            className: "text-left",
            autoComplete: "new-password"
          }
        )
      ] }),
      pwdMsg && /* @__PURE__ */ jsx("div", { className: `text-sm px-3 py-2 rounded ${pwdMsg.type === "ok" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-destructive bg-destructive/10"}`, children: pwdMsg.text }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: savingPwd, size: "sm", children: savingPwd ? "מעדכן..." : "שנה סיסמה" })
    ] })
  ] }) });
}
const ChatPanelContext = createContext(null);
function useChatPanel() {
  const ctx = useContext(ChatPanelContext);
  if (!ctx) throw new Error("useChatPanel must be used within ChatPanelProvider");
  return ctx;
}
function ChatPanelProvider({ children }) {
  const { user } = useAuth();
  const myId = user?.id || "";
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);
  useEffect(() => {
    if (!myId) return;
    const ch = supabase.channel(`chat-panel-unread-${myId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      const msg = payload.new;
      if (msg.sender_id === myId) return;
      setUnread((n) => n + 1);
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [myId]);
  const value = useMemo(() => ({ open, setOpen, toggle, unread }), [open, toggle, unread]);
  return /* @__PURE__ */ jsx(ChatPanelContext.Provider, { value, children });
}
const tabs = [
  { id: "dashboard", label: "ראשי" },
  { id: "bachurim", label: "בחורים" },
  { id: "askanim", label: "פרויקט עסקנים" },
  { id: "income", label: "הכנסות" },
  { id: "expenses", label: "הוצאות" },
  { id: "debts", label: "חובות" },
  { id: "basket-cost", label: "עלות הסל" },
  { id: "search", label: "חיפוש" },
  { id: "reports", label: "דוחות" },
  { id: "users", label: "משתמשים" }
];
function AppHeader({ activeTab, onTabChange, settingsBtnRef }) {
  const { signOut, user, isAdmin, displayName } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const { toggle: toggleChat, unread } = useChatPanel();
  const visibleTabs = tabs.filter((t) => t.id !== "users" || isAdmin);
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(GlobalSettings, { triggerRef: settingsBtnRef, onNavigateToTab: (tab) => onTabChange(tab) }),
        /* @__PURE__ */ jsx(OnlineUsers, {}),
        user && /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: toggleChat,
            className: "relative text-primary-foreground hover:bg-primary-foreground/10 gap-1",
            title: "צ'אט",
            children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "hidden md:inline text-xs", children: "צ'אט" }),
              unread > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] leading-none min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold", children: unread > 99 ? "99+" : unread })
            ]
          }
        ),
        user && /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "text-primary-foreground hover:bg-primary-foreground/10 gap-1",
              title: `מחובר: ${user.email}`,
              children: [
                /* @__PURE__ */ jsx(User, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsx("span", { className: "hidden md:inline text-xs max-w-[140px] truncate", children: displayName || user.email })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "start", className: "min-w-[220px]", children: [
            /* @__PURE__ */ jsxs(DropdownMenuLabel, { className: "font-normal", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: displayName || "משתמש" }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground truncate", dir: "ltr", children: user.email })
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setProfileOpen(true), children: [
              /* @__PURE__ */ jsx(User, { className: "w-4 h-4 ms-2" }),
              "עריכת שם"
            ] }),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setProfileOpen(true), children: [
              /* @__PURE__ */ jsx(KeyRound, { className: "w-4 h-4 ms-2" }),
              "שינוי סיסמה"
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: signOut, className: "text-destructive focus:text-destructive", children: [
              /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4 ms-2" }),
              "יציאה"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(UserProfileDialog, { open: profileOpen, onOpenChange: setProfileOpen })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("img", { src: ringsIcon, alt: "טבעות נישואין", width: 36, height: 36, className: "drop-shadow" }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-wide", children: "קול מצהלות חתנים" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("nav", { className: "flex gap-1 overflow-x-auto pb-1 -mb-px scrollbar-hide", children: visibleTabs.map((tab) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => onTabChange(tab.id),
        className: `whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors
                ${activeTab === tab.id ? "bg-background text-foreground" : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"}`,
        children: tab.label
      },
      tab.id
    )) })
  ] }) });
}
const NavigationContext = createContext(null);
function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
function NavigationProvider({ children }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [focus, setFocus] = useState(null);
  const navigateTo = useCallback((module, id, opts) => {
    setActiveTab(module);
    if (id) setFocus({ module, id, edit: opts?.edit });
    else setFocus(null);
  }, []);
  const consumeFocus = useCallback((module) => {
    if (focus && focus.module === module) {
      const f = focus;
      setTimeout(() => setFocus((cur) => cur === f ? null : cur), 0);
      return f;
    }
    return null;
  }, [focus]);
  return /* @__PURE__ */ jsx(NavigationContext.Provider, { value: { activeTab, setActiveTab, focus, navigateTo, consumeFocus }, children });
}
const Checkbox = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  CheckboxPrimitive.Root,
  {
    ref,
    className: cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(
      CheckboxPrimitive.Indicator,
      {
        className: cn("grid place-content-center text-current"),
        children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
      }
    )
  }
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const KIND_LABELS = {
  skip: "אל תייבא",
  bachurim_list: "רשימת בחורים חדשים",
  bachurim_update: "עדכון בחורים קיימים",
  bachur_income: "הכנסות לבחורים (כסף לפי שם)",
  donations: "תרומות / הכנסות כלליות",
  expenses: "הוצאות",
  debts: "חובות",
  mark_basket: 'סימון "קיבל סל"'
};
const ROLE_LABELS = {
  ignore: "התעלם",
  first_name: "שם פרטי",
  last_name: "שם משפחה",
  full_name: "שם מלא",
  sku: "מק״ט",
  class_level: "שיעור",
  date: "תאריך",
  amount: "סכום",
  payment_method: "אמצעי תשלום",
  notes: "הערות",
  money_outing: "סכום כסף (יציאה חדשה)"
};
function today$4() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function generateSku$1(used) {
  let sku;
  do {
    sku = String(Math.floor(Math.random() * 5e4) + 1).padStart(5, "0");
  } while (used.has(sku));
  used.add(sku);
  return sku;
}
function toStr(v) {
  if (v === null || v === void 0) return "";
  return String(v).trim();
}
function toNum(v) {
  if (v === null || v === void 0 || v === "") return 0;
  const n = Number(String(v).replace(/[^\d.\-]/g, ""));
  return isNaN(n) ? 0 : n;
}
function parseDate(v) {
  if (v === null || v === void 0 || v === "") return today$4();
  if (typeof v === "number" && v > 1e3 && v < 1e5) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + v * 864e5);
    return d.toISOString().split("T")[0];
  }
  const s = String(v).trim().split(" ")[0];
  const m1 = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m1) {
    let [_, d, m, y] = m1;
    if (y.length === 2) y = "20" + y;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return today$4();
}
function detectHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const r = rows[i] || [];
    const filled = r.filter((c) => toStr(c) !== "").length;
    if (filled >= 2) return i;
  }
  return 0;
}
function guessRole(header) {
  const h = header.replace(/["׳״'`]/g, "").toLowerCase();
  if (/שם.*פרטי/.test(h)) return "first_name";
  if (/שם.*משפחה|משפחה/.test(h)) return "last_name";
  if (/^שם$|שם.*מלא|שם.*בחור/.test(h)) return "full_name";
  if (/מקט|מק.*ט|sku/.test(h)) return "sku";
  if (/שיעור|כיתה|class/.test(h)) return "class_level";
  if (/תאריך|date/.test(h)) return "date";
  if (/סכום|amount|סהכ|סה.*כ/.test(h)) return "amount";
  if (/אמצעי|תשלום|מזומן|אשראי|method/.test(h)) return "payment_method";
  if (/הער|notes?/.test(h)) return "notes";
  return "ignore";
}
function buildFullName(row, cols) {
  const fullIdx = cols.findIndex((c) => c.role === "full_name");
  const fnIdx = cols.findIndex((c) => c.role === "first_name");
  const lnIdx = cols.findIndex((c) => c.role === "last_name");
  const fullVal = fullIdx >= 0 ? toStr(row[fullIdx]) : "";
  const fnVal = fnIdx >= 0 ? toStr(row[fnIdx]) : "";
  const lnVal = lnIdx >= 0 ? toStr(row[lnIdx]) : "";
  if (fnVal && lnVal) return `${fnVal} ${lnVal}`.trim();
  if (fullVal) {
    if (lnVal && !fullVal.includes(lnVal)) return `${fullVal} ${lnVal}`.trim();
    return fullVal;
  }
  return `${fnVal} ${lnVal}`.trim();
}
function normalizeName(n) {
  return n.replace(/\s+/g, " ").trim();
}
function MasterExcelImport() {
  const {
    bachurim,
    incomes,
    expenses,
    debts,
    setBachurim,
    setIncomes,
    setExpenses,
    setDebts
  } = useData();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [importing, setImporting] = useState(false);
  const [sheets, setSheets] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [savedPlan, setSavedPlan] = useState(null);
  const [savedCounts, setSavedCounts] = useState({ createdCount: 0, mappedCount: 0, ignoredCount: 0 });
  const [pendingResults, setPendingResults] = useState(null);
  const fileRef = useRef(null);
  function reset() {
    setStep(1);
    setSheets([]);
    setUnmatched([]);
    setDuplicates([]);
    setSavedPlan(null);
    setPendingResults(null);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  }
  function handleOpenChange(v) {
    setOpen(v);
    if (!v) reset();
  }
  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const XLSX2 = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX2.read(buf);
      const infos = wb.SheetNames.map((name) => {
        const ws = wb.Sheets[name];
        const rows = XLSX2.utils.sheet_to_json(ws, { header: 1, defval: "", raw: true });
        const headerRowIndex = detectHeaderRow(rows);
        const headers = (rows[headerRowIndex] || []).map(
          (c, i) => toStr(c) || `עמודה ${i + 1}`
        );
        const cols = headers.map((h) => ({ role: guessRole(h) }));
        return {
          name,
          rows,
          headerRowIndex,
          headers,
          kind: "skip",
          cols,
          updateFields: { sku: true, classLevel: true, joinDate: true }
        };
      });
      setSheets(infos);
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בקריאת הקובץ");
    } finally {
      setImporting(false);
    }
  }
  function updateSheet(idx, patch) {
    setSheets(
      (s) => s.map((sh, i) => {
        if (i !== idx) return sh;
        const merged = { ...sh, ...patch };
        return merged;
      })
    );
  }
  function updateCol(sheetIdx, colIdx, patch) {
    setSheets(
      (s) => s.map(
        (sh, i) => i !== sheetIdx ? sh : { ...sh, cols: sh.cols.map((c, j) => j === colIdx ? { ...c, ...patch } : c) }
      )
    );
  }
  const activeSheets = sheets.filter((s) => s.kind !== "skip");
  function goToMapping() {
    if (activeSheets.length === 0) {
      toast.error("יש לבחור לפחות לשונית אחת לייבוא");
      return;
    }
    setStep(3);
  }
  function processSheets() {
    for (const sh of activeSheets) {
      if (sh.kind !== "bachur_income") continue;
      const hasAmountCol = sh.cols.some(
        (c) => c.role === "amount" || c.role === "money_outing"
      );
      if (!hasAmountCol) continue;
      const sheetName = sh.incomeName?.trim();
      const allColsHaveName = sh.cols.filter((c) => c.role === "money_outing" || c.role === "amount").every((c) => c.outingName?.trim() || sheetName);
      if (!sheetName && !allColsHaveName) {
        toast.error(`בלשונית "${sh.name}" יש להזין שם להכנסה (למשל: "מצהלות פסח")`);
        return;
      }
    }
    const usedSkus = new Set(bachurim.map((b) => b.sku));
    const nameToBachur = /* @__PURE__ */ new Map();
    for (const b of bachurim) nameToBachur.set(normalizeName(b.name), b);
    const newBachurim = [];
    const addOutingsByBachurId = /* @__PURE__ */ new Map();
    const markBasketByBachurId = /* @__PURE__ */ new Map();
    const updateBachurById = /* @__PURE__ */ new Map();
    const newIncomes = [];
    const newExpenses = [];
    const newDebts = [];
    const summary = [];
    const unmatchedMap = /* @__PURE__ */ new Map();
    function addUnmatched(name, rec) {
      const key = normalizeName(name);
      if (!unmatchedMap.has(key)) {
        unmatchedMap.set(key, { rawName: name, records: [], resolution: { type: "new" } });
      }
      unmatchedMap.get(key).records.push(rec);
    }
    function addUnmatchedUpdate(name, upd) {
      const key = normalizeName(name);
      if (!unmatchedMap.has(key)) {
        unmatchedMap.set(key, { rawName: name, records: [], resolution: { type: "new" } });
      }
      const e = unmatchedMap.get(key);
      e.updates = { ...e.updates || {}, ...upd };
    }
    function addOutingToBachur(bachurId, o) {
      const list = addOutingsByBachurId.get(bachurId) || [];
      list.push(o);
      addOutingsByBachurId.set(bachurId, list);
    }
    for (const sh of activeSheets) {
      let count = 0;
      const dataStart = sh.headerRowIndex + 1;
      for (let r = dataStart; r < sh.rows.length; r++) {
        const row = sh.rows[r];
        if (!row || row.every((c) => toStr(c) === "")) continue;
        if (sh.kind === "bachurim_list") {
          const name = buildFullName(row, sh.cols);
          if (!name) continue;
          if (nameToBachur.has(normalizeName(name))) continue;
          const skuCol = sh.cols.findIndex((c) => c.role === "sku");
          const classCol = sh.cols.findIndex((c) => c.role === "class_level");
          const useSku = sh.updateFields.sku && skuCol >= 0 && toStr(row[skuCol]);
          const useClass = sh.updateFields.classLevel && classCol >= 0 && toStr(row[classCol]);
          const b = {
            id: crypto.randomUUID(),
            sku: useSku ? toStr(row[skuCol]) : generateSku$1(usedSkus),
            name,
            classLevel: useClass ? toStr(row[classCol]) : "א",
            joinDate: (/* @__PURE__ */ new Date()).toISOString(),
            outings: [],
            married: false,
            receivedBasket: false,
            inAskanim: false,
            closed: false
          };
          usedSkus.add(b.sku);
          newBachurim.push(b);
          nameToBachur.set(normalizeName(name), b);
          count++;
        } else if (sh.kind === "bachurim_update") {
          const name = buildFullName(row, sh.cols);
          if (!name) continue;
          const skuCol = sh.cols.findIndex((c) => c.role === "sku");
          const classCol = sh.cols.findIndex((c) => c.role === "class_level");
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const upd = {};
          if (sh.updateFields.sku && skuCol >= 0) {
            const v = toStr(row[skuCol]);
            if (v) upd.sku = v;
          }
          if (sh.updateFields.classLevel && classCol >= 0) {
            const v = toStr(row[classCol]);
            if (v) upd.classLevel = v;
          }
          if (sh.updateFields.joinDate && dateCol >= 0) {
            const v = toStr(row[dateCol]);
            if (v) upd.joinDate = parseDate(row[dateCol]);
          }
          if (Object.keys(upd).length === 0) continue;
          const existing = nameToBachur.get(normalizeName(name));
          if (existing) {
            const prev = updateBachurById.get(existing.id) || {};
            updateBachurById.set(existing.id, { ...prev, ...upd });
          } else {
            addUnmatchedUpdate(name, upd);
          }
          count++;
        } else if (sh.kind === "bachur_income") {
          const name = buildFullName(row, sh.cols);
          if (!name) continue;
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const payCol = sh.cols.findIndex((c) => c.role === "payment_method");
          const noteCol = sh.cols.findIndex((c) => c.role === "notes");
          const date = dateCol >= 0 ? parseDate(row[dateCol]) : today$4();
          const payment = payCol >= 0 ? toStr(row[payCol]) || "אחר" : "אחר";
          const notes = noteCol >= 0 ? toStr(row[noteCol]) : void 0;
          const sheetIncomeName = sh.incomeName?.trim() || "";
          const recs = [];
          sh.cols.forEach((c, i) => {
            if (c.role !== "money_outing" && c.role !== "amount") return;
            const amt = toNum(row[i]);
            if (amt <= 0) return;
            const outingName = c.outingName?.trim() || sheetIncomeName || "הכנסה";
            recs.push({
              outingName,
              date,
              amount: amt,
              paymentMethod: payment,
              notes
            });
          });
          if (recs.length === 0) continue;
          const existing = nameToBachur.get(normalizeName(name));
          if (existing) {
            for (const rec of recs) {
              addOutingToBachur(existing.id, {
                id: crypto.randomUUID(),
                name: rec.outingName,
                date: rec.date,
                amount: rec.amount,
                paymentMethod: rec.paymentMethod,
                paymentMethodDetail: rec.notes
              });
            }
          } else {
            for (const rec of recs) addUnmatched(name, rec);
          }
          count += recs.length;
        } else if (sh.kind === "donations") {
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const amountCol = sh.cols.findIndex((c) => c.role === "amount");
          const noteCol = sh.cols.findIndex((c) => c.role === "notes");
          const payCol = sh.cols.findIndex((c) => c.role === "payment_method");
          if (amountCol < 0) continue;
          const amt = toNum(row[amountCol]);
          if (amt <= 0) continue;
          const desc = noteCol >= 0 ? toStr(row[noteCol]) : "";
          const pay = payCol >= 0 ? toStr(row[payCol]) : "";
          newIncomes.push({
            id: crypto.randomUUID(),
            description: desc || "תרומה",
            amount: amt,
            date: dateCol >= 0 ? parseDate(row[dateCol]) : today$4(),
            category: pay || "תרומות",
            target: "amuta",
            recognized: false,
            auto: false
          });
          count++;
        } else if (sh.kind === "expenses") {
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const amountCol = sh.cols.findIndex((c) => c.role === "amount");
          const noteCol = sh.cols.findIndex((c) => c.role === "notes");
          if (amountCol < 0) continue;
          const amt = toNum(row[amountCol]);
          if (amt <= 0) continue;
          newExpenses.push({
            id: crypto.randomUUID(),
            amount: amt,
            date: dateCol >= 0 ? parseDate(row[dateCol]) : today$4(),
            category: "עמותה",
            subCategory: "שונות",
            notes: noteCol >= 0 ? toStr(row[noteCol]) : "ייבוא מאקסל",
            contactPerson: "",
            recognized: false
          });
          count++;
        } else if (sh.kind === "debts") {
          const name = buildFullName(row, sh.cols);
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const amountCol = sh.cols.findIndex((c) => c.role === "amount");
          const noteCol = sh.cols.findIndex((c) => c.role === "notes");
          if (amountCol < 0) continue;
          const amt = toNum(row[amountCol]);
          if (amt <= 0) continue;
          newDebts.push({
            id: crypto.randomUUID(),
            date: dateCol >= 0 ? parseDate(row[dateCol]) : today$4(),
            name: name || "ללא שם",
            amount: amt,
            notes: noteCol >= 0 ? toStr(row[noteCol]) : "",
            returned: false
          });
          count++;
        } else if (sh.kind === "mark_basket") {
          const name = buildFullName(row, sh.cols);
          if (!name) continue;
          const dateCol = sh.cols.findIndex((c) => c.role === "date");
          const date = dateCol >= 0 ? parseDate(row[dateCol]) : today$4();
          const existing = nameToBachur.get(normalizeName(name));
          if (existing) {
            markBasketByBachurId.set(existing.id, date);
          } else {
            addUnmatched(name, {
              outingName: "סל",
              date,
              amount: 0,
              paymentMethod: "",
              isBasketMark: true
            });
          }
          count++;
        }
      }
      summary.push({ sheet: sh.name, rows: count, kind: sh.kind });
    }
    setPendingResults({
      newBachurim,
      addOutingsByBachurId,
      markBasketByBachurId,
      updateBachurById,
      newIncomes,
      newExpenses,
      newDebts,
      summary
    });
    const unmatchedList = Array.from(unmatchedMap.values());
    if (unmatchedList.length > 0) {
      setUnmatched(unmatchedList);
      setStep(4);
    } else {
      finalize(null, {
        newBachurim,
        addOutingsByBachurId,
        markBasketByBachurId,
        updateBachurById,
        newIncomes,
        newExpenses,
        newDebts,
        summary
      });
    }
  }
  function buildPlanAndDuplicates(unmatchedRes, res) {
    const newBachurim = [...res.newBachurim];
    const outingsByExistingId = /* @__PURE__ */ new Map();
    res.addOutingsByBachurId.forEach((o, k) => outingsByExistingId.set(k, [...o]));
    const basketMarkByExistingId = new Map(res.markBasketByBachurId);
    const updateByExistingId = new Map(res.updateBachurById);
    const usedSkus = new Set(bachurim.map((b) => b.sku));
    newBachurim.forEach((b) => usedSkus.add(b.sku));
    let createdCount = 0, mappedCount = 0, ignoredCount = 0;
    if (unmatchedRes) {
      const byNameNew = /* @__PURE__ */ new Map();
      for (const u of unmatchedRes) {
        if (u.resolution.type === "ignore") {
          ignoredCount++;
          continue;
        }
        let targetId = null;
        let targetNewBachur = null;
        if (u.resolution.type === "existing") {
          targetId = u.resolution.id;
          mappedCount++;
          if (u.updates) {
            const prev = updateByExistingId.get(targetId) || {};
            updateByExistingId.set(targetId, { ...prev, ...u.updates });
          }
        } else {
          const key = normalizeName(u.rawName);
          const existingNew = byNameNew.get(key);
          if (existingNew) {
            targetNewBachur = existingNew;
          } else {
            const nb = {
              id: crypto.randomUUID(),
              sku: u.updates?.sku || generateSku$1(usedSkus),
              name: u.rawName,
              classLevel: u.updates?.classLevel || u.newClassLevel || "א",
              joinDate: u.updates?.joinDate || (/* @__PURE__ */ new Date()).toISOString(),
              outings: [],
              married: false,
              receivedBasket: false,
              inAskanim: false,
              closed: false
            };
            newBachurim.push(nb);
            byNameNew.set(key, nb);
            targetNewBachur = nb;
            createdCount++;
          }
        }
        for (const rec of u.records) {
          if (rec.isBasketMark) {
            if (targetId) basketMarkByExistingId.set(targetId, rec.date);
            else if (targetNewBachur) {
              targetNewBachur.receivedBasket = true;
              targetNewBachur.basketDate = rec.date;
            }
          } else {
            const o = {
              id: crypto.randomUUID(),
              name: rec.outingName,
              date: rec.date,
              amount: rec.amount,
              paymentMethod: rec.paymentMethod || "אחר",
              paymentMethodDetail: rec.notes
            };
            if (targetId) {
              const cur = outingsByExistingId.get(targetId) || [];
              cur.push(o);
              outingsByExistingId.set(targetId, cur);
            } else if (targetNewBachur) {
              targetNewBachur.outings.push(o);
            }
          }
        }
      }
    }
    const duplicates2 = [];
    outingsByExistingId.forEach((outings, bId) => {
      const b = bachurim.find((x) => x.id === bId);
      if (!b) return;
      const byName = /* @__PURE__ */ new Map();
      for (const o of outings) {
        const key = normalizeName(o.name);
        const arr = byName.get(key) || [];
        arr.push(o);
        byName.set(key, arr);
      }
      const remaining = [];
      byName.forEach((newOuts, key) => {
        const existing = b.outings.find((o) => normalizeName(o.name) === key);
        if (existing) {
          duplicates2.push({
            bachurId: bId,
            bachurName: b.name,
            outingName: newOuts[0].name,
            existingOutingId: existing.id,
            existingAmount: existing.amount,
            existingDate: existing.date,
            newOutings: newOuts,
            resolution: "add"
          });
        } else {
          remaining.push(...newOuts);
        }
      });
      if (remaining.length > 0) outingsByExistingId.set(bId, remaining);
      else outingsByExistingId.delete(bId);
    });
    const plan = {
      newBachurim,
      outingsByExistingId,
      basketMarkByExistingId,
      updateByExistingId,
      newIncomes: res.newIncomes,
      newExpenses: res.newExpenses,
      newDebts: res.newDebts,
      summary: res.summary
    };
    return { plan, duplicates: duplicates2, createdCount, mappedCount, ignoredCount };
  }
  function finalize(unmatchedRes, res) {
    const built = buildPlanAndDuplicates(unmatchedRes, res);
    if (built.duplicates.length === 0) {
      commit(built.plan, [], built.createdCount, built.mappedCount, built.ignoredCount);
    } else {
      setSavedPlan(built.plan);
      setDuplicates(built.duplicates);
      setSavedCounts({
        createdCount: built.createdCount,
        mappedCount: built.mappedCount,
        ignoredCount: built.ignoredCount
      });
      setStep(5);
    }
  }
  function commit(plan, dupRes, createdCount, mappedCount, ignoredCount) {
    const updated = bachurim.map((b) => ({ ...b, outings: [...b.outings] }));
    const byId = new Map(updated.map((b) => [b.id, b]));
    for (const nb of plan.newBachurim) {
      updated.push(nb);
      byId.set(nb.id, nb);
    }
    plan.outingsByExistingId.forEach((outings, bId) => {
      const b = byId.get(bId);
      if (b) b.outings.push(...outings);
    });
    plan.basketMarkByExistingId.forEach((date, bId) => {
      const b = byId.get(bId);
      if (b) {
        b.receivedBasket = true;
        b.basketDate = date;
      }
    });
    let updatedCount = 0;
    plan.updateByExistingId.forEach((upd, bId) => {
      const b = byId.get(bId);
      if (!b) return;
      if (upd.sku !== void 0) b.sku = upd.sku;
      if (upd.classLevel !== void 0) b.classLevel = upd.classLevel;
      if (upd.joinDate !== void 0) b.joinDate = upd.joinDate;
      updatedCount++;
    });
    let dupUpdated = 0, dupAdded = 0, dupSkipped = 0;
    for (const d of dupRes) {
      const b = byId.get(d.bachurId);
      if (!b) continue;
      if (d.resolution === "skip") {
        dupSkipped++;
        continue;
      }
      if (d.resolution === "update") {
        const o = b.outings.find((x) => x.id === d.existingOutingId);
        if (o) {
          o.amount = d.newOutings.reduce((s, n) => s + n.amount, 0);
          o.date = d.newOutings.reduce((m, n) => n.date > m ? n.date : m, d.newOutings[0].date);
          const last = d.newOutings[d.newOutings.length - 1];
          if (last.paymentMethod) o.paymentMethod = last.paymentMethod;
          if (last.paymentMethodDetail !== void 0) o.paymentMethodDetail = last.paymentMethodDetail;
          dupUpdated++;
        }
      } else {
        b.outings.push(...d.newOutings);
        dupAdded++;
      }
    }
    setBachurim(updated);
    if (plan.newIncomes.length > 0) setIncomes([...incomes, ...plan.newIncomes]);
    if (plan.newExpenses.length > 0) setExpenses([...expenses, ...plan.newExpenses]);
    if (plan.newDebts.length > 0) setDebts([...debts, ...plan.newDebts]);
    const summaryMsg = plan.summary.map((s) => `${s.sheet}: ${s.rows}`).join(" | ");
    const extras = [];
    if (updatedCount) extras.push(`${updatedCount} בחורים עודכנו`);
    if (createdCount) extras.push(`${createdCount} בחורים חדשים`);
    if (mappedCount) extras.push(`${mappedCount} מופו`);
    if (ignoredCount) extras.push(`${ignoredCount} נמחקו`);
    if (dupUpdated) extras.push(`${dupUpdated} כפולים עודכנו`);
    if (dupAdded) extras.push(`${dupAdded} כפולים נוספו`);
    if (dupSkipped) extras.push(`${dupSkipped} כפולים דולגו`);
    toast.success(`ייבוא הושלם — ${summaryMsg}${extras.length ? " | " + extras.join(", ") : ""}`);
    handleOpenChange(false);
  }
  const hasUnmatched = unmatched.length > 0;
  const hasDuplicates = duplicates.length > 0;
  const totalSteps = 3 + (hasUnmatched ? 1 : 0) + (hasDuplicates ? 1 : 0);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        ref: fileRef,
        type: "file",
        accept: ".xlsx,.xls",
        onChange: handleFile,
        className: "hidden"
      }
    ),
    /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => setOpen(true), children: [
      /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 ml-2" }),
      "ייבוא Excel"
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-5xl max-h-[90vh] overflow-y-auto", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FileSpreadsheet, { className: "h-5 w-5" }),
          "ייבוא חכם מאקסל — שלב ",
          step,
          " מתוך ",
          totalSteps
        ] }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          step === 1 && "בחר קובץ Excel לסריקה",
          step === 2 && "בחר אילו לשוניות לייבא ומה הסוג שלהן",
          step === 3 && "מפה את העמודות בכל לשונית",
          step === 4 && "טיפול בשמות בחורים שלא זוהו במערכת",
          step === 5 && "נמצאו כפילויות — בחר לעדכן או להוסיף"
        ] })
      ] }),
      step === 1 && /* @__PURE__ */ jsxs("div", { className: "py-8 text-center", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "lg",
            onClick: () => fileRef.current?.click(),
            disabled: importing,
            children: [
              /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 ml-2" }),
              importing ? "טוען..." : "בחר קובץ Excel"
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-4", children: "המערכת תסרוק את כל הלשוניות והעמודות ותשאל אותך מה לייבא" })
      ] }),
      step === 2 && /* @__PURE__ */ jsx("div", { className: "space-y-3", children: sheets.map((sh, i) => /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-3 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: sh.kind !== "skip",
                onCheckedChange: (v) => updateSheet(i, { kind: v ? "bachur_income" : "skip" })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: sh.name }),
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "(",
              sh.rows.length - sh.headerRowIndex - 1,
              " שורות, ",
              sh.headers.length,
              " עמודות)"
            ] })
          ] }),
          sh.kind !== "skip" && /* @__PURE__ */ jsxs(
            Select,
            {
              value: sh.kind,
              onValueChange: (v) => updateSheet(i, { kind: v }),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-64", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsx(SelectContent, { children: Object.keys(KIND_LABELS).filter((k) => k !== "skip").map((k) => /* @__PURE__ */ jsx(SelectItem, { value: k, children: KIND_LABELS[k] }, k)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
          "כותרות: ",
          sh.headers.slice(0, 8).join(" | "),
          sh.headers.length > 8 && " ..."
        ] })
      ] }, i)) }),
      step === 3 && /* @__PURE__ */ jsx("div", { className: "space-y-6", children: activeSheets.map((sh) => {
        const sheetIdx = sheets.indexOf(sh);
        const sampleRow = sh.rows[sh.headerRowIndex + 1] || [];
        return /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "font-semibold mb-2", children: [
            sh.name,
            " ",
            /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "(",
              KIND_LABELS[sh.kind],
              ")"
            ] })
          ] }),
          (sh.kind === "bachurim_list" || sh.kind === "bachurim_update") && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-3 p-2 bg-muted/40 rounded", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "שדות לעדכון:" }),
            [
              ["sku", "מק״ט"],
              ["classLevel", "שיעור"],
              ["joinDate", "תאריך הצטרפות"]
            ].map(([key, label]) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  checked: sh.updateFields[key],
                  onCheckedChange: (v) => updateSheet(sheetIdx, {
                    updateFields: { ...sh.updateFields, [key]: !!v }
                  })
                }
              ),
              label
            ] }, key))
          ] }),
          sh.kind === "bachur_income" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3 p-3 bg-primary/5 border border-primary/20 rounded", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium whitespace-nowrap", children: "איך לקרוא להכנסה הזאת?" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                value: sh.incomeName || "",
                onChange: (e) => updateSheet(sheetIdx, { incomeName: e.target.value }),
                placeholder: "למשל: מצהלות פסח, בין הזמנים תשפ״ו, הכנסת עסקנים",
                className: "flex-1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "כותרת בקובץ" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "דוגמה" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סוג" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שם יציאה" })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: sh.headers.map((h, j) => {
              const col = sh.cols[j];
              return /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: h }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-muted-foreground max-w-[150px] truncate", children: toStr(sampleRow[j]) }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: col.role,
                    onValueChange: (v) => updateCol(sheetIdx, j, { role: v }),
                    children: [
                      /* @__PURE__ */ jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                      /* @__PURE__ */ jsx(SelectContent, { children: Object.keys(ROLE_LABELS).map((r) => /* @__PURE__ */ jsx(SelectItem, { value: r, children: ROLE_LABELS[r] }, r)) })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx(TableCell, { children: col.role === "money_outing" ? /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: col.outingName || "",
                    onChange: (e) => updateCol(sheetIdx, j, { outingName: e.target.value }),
                    placeholder: 'לדוגמה: "בין הזמנים תשפ״ו"',
                    className: "w-56"
                  }
                ) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) })
              ] }, j);
            }) })
          ] })
        ] }, sheetIdx);
      }) }),
      step === 4 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
            "נמצאו ",
            unmatched.length,
            " שמות שלא מזוהים. בחר מה לעשות עם כל אחד:"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setUnmatched((u) => u.map((e) => ({ ...e, resolution: { type: "new" } }))),
                children: "הכל: הוסף כחדש"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setUnmatched((u) => u.map((e) => ({ ...e, resolution: { type: "ignore" } }))),
                children: "הכל: מחק"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 bg-muted/40 rounded text-sm", children: [
          /* @__PURE__ */ jsx("span", { children: "שייך את כל הבחורים החדשים לשיעור:" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              onValueChange: (v) => setUnmatched(
                (arr) => arr.map((e) => e.resolution.type === "new" ? { ...e, newClassLevel: v } : e)
              ),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-32", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "בחר שיעור" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: ["א", "ב", "ג", "ד", "ה", "ו"].map((c) => /* @__PURE__ */ jsxs(SelectItem, { value: c, children: [
                  "שיעור ",
                  c
                ] }, c)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שם מהאקסל" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סה״כ סכום" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "רשומות" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "פעולה" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "בחור קיים" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שיעור (לחדש)" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: unmatched.map((u, i) => {
            const total = u.records.reduce((s, r) => s + r.amount, 0);
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: u.rawName }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                total.toLocaleString(),
                " ₪"
              ] }),
              /* @__PURE__ */ jsx(TableCell, { children: u.records.length }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
                Select,
                {
                  value: u.resolution.type,
                  onValueChange: (v) => setUnmatched(
                    (arr) => arr.map(
                      (e, idx) => idx !== i ? e : {
                        ...e,
                        resolution: v === "existing" ? { type: "existing", id: bachurim[0]?.id || "" } : v === "new" ? { type: "new" } : { type: "ignore" }
                      }
                    )
                  ),
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { className: "w-36", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "new", children: "הוסף כבחור חדש" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "existing", children: "שייך לבחור קיים" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "ignore", children: "מחק / התעלם" })
                    ] })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(TableCell, { children: u.resolution.type === "existing" && /* @__PURE__ */ jsxs(
                Select,
                {
                  value: u.resolution.id,
                  onValueChange: (v) => setUnmatched(
                    (arr) => arr.map(
                      (e, idx) => idx !== i ? e : { ...e, resolution: { type: "existing", id: v } }
                    )
                  ),
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { className: "w-56", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "בחר בחור..." }) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: bachurim.map((b) => /* @__PURE__ */ jsxs(SelectItem, { value: b.id, children: [
                      b.name,
                      " (",
                      b.sku,
                      ")"
                    ] }, b.id)) })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(TableCell, { children: u.resolution.type === "new" && /* @__PURE__ */ jsxs(
                Select,
                {
                  value: u.newClassLevel || "א",
                  onValueChange: (v) => setUnmatched(
                    (arr) => arr.map(
                      (e, idx) => idx !== i ? e : { ...e, newClassLevel: v }
                    )
                  ),
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { className: "w-24", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsx(SelectContent, { children: ["א", "ב", "ג", "ד", "ה", "ו"].map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c)) })
                  ]
                }
              ) })
            ] }, i);
          }) })
        ] })
      ] }),
      step === 5 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
            "נמצאו ",
            duplicates.length,
            " כפילויות (אותו בחור + שם הכנסה שכבר קיים). בחר מה לעשות עם כל אחד:"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setDuplicates((d) => d.map((e) => ({ ...e, resolution: "update" }))),
                children: "הכל: עדכן"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setDuplicates((d) => d.map((e) => ({ ...e, resolution: "add" }))),
                children: "הכל: הוסף שורה חדשה"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setDuplicates((d) => d.map((e) => ({ ...e, resolution: "skip" }))),
                children: "הכל: דלג"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "בחור" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שם הכנסה" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "קיים" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "חדש" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "פעולה" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: duplicates.map((d, i) => {
            const newSum = d.newOutings.reduce((s, n) => s + n.amount, 0);
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: d.bachurName }),
              /* @__PURE__ */ jsx(TableCell, { children: d.outingName }),
              /* @__PURE__ */ jsxs(TableCell, { className: "text-xs", children: [
                d.existingAmount.toLocaleString(),
                " ₪",
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  " (",
                  d.existingDate,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ jsxs(TableCell, { className: "text-xs", children: [
                newSum.toLocaleString(),
                " ₪",
                d.newOutings.length > 1 && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  " (",
                  d.newOutings.length,
                  " שורות)"
                ] })
              ] }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
                Select,
                {
                  value: d.resolution,
                  onValueChange: (v) => setDuplicates(
                    (arr) => arr.map((e, idx) => idx !== i ? e : { ...e, resolution: v })
                  ),
                  children: [
                    /* @__PURE__ */ jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                    /* @__PURE__ */ jsxs(SelectContent, { children: [
                      /* @__PURE__ */ jsx(SelectItem, { value: "update", children: "עדכן את הקיים" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "add", children: "הוסף כשורה חדשה" }),
                      /* @__PURE__ */ jsx(SelectItem, { value: "skip", children: "דלג / התעלם" })
                    ] })
                  ]
                }
              ) })
            ] }, i);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "flex gap-2 justify-between sm:justify-between", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "ghost", onClick: () => handleOpenChange(false), children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4 ml-2" }),
          "ביטול"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          step > 1 && step < 4 && /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => setStep(step - 1),
              children: [
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" }),
                "חזור"
              ]
            }
          ),
          step === 2 && /* @__PURE__ */ jsxs(Button, { onClick: goToMapping, children: [
            "המשך לבחירת עמודות",
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" })
          ] }),
          step === 3 && /* @__PURE__ */ jsxs(Button, { onClick: processSheets, children: [
            "בדוק נתונים",
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" })
          ] }),
          step === 4 && /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: () => {
                if (pendingResults) finalize(unmatched, pendingResults);
              },
              children: [
                "המשך",
                /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" })
              ]
            }
          ),
          step === 5 && /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: () => {
                if (savedPlan) {
                  commit(savedPlan, duplicates, savedCounts.createdCount, savedCounts.mappedCount, savedCounts.ignoredCount);
                }
              },
              children: [
                "שמור ייבוא",
                /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" })
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
function fmt$2(n) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 0
  }).format(Math.round(n));
}
function bachurTotal(b) {
  return (b.outings || []).reduce((s, o) => s + (o.amount || 0), 0);
}
function exportToExcel(filename, headers, rows) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!views"] = [{ RTL: true }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "נתונים");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
function ExportButton({ onClick }) {
  return /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick, className: "gap-2", children: [
    /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
    "ייצוא Excel"
  ] });
}
function Dashboard() {
  const {
    bachurim,
    incomes,
    expenses,
    askanimIncomes,
    fundraisers,
    globalSettings
  } = useData();
  const { navigateTo } = useNavigation();
  const min = globalSettings.minimumForBasket || 0;
  const basketCost = globalSettings.basketCost || 0;
  const amutaSupplement = Math.max(0, basketCost - min);
  const stats = useMemo(() => {
    const active = bachurim.filter((b) => !b.married);
    const married = bachurim.filter((b) => b.married);
    const cappedSum = active.reduce(
      (s, b) => s + Math.min(bachurTotal(b), min),
      0
    );
    const excessSum = active.reduce(
      (s, b) => s + Math.max(0, bachurTotal(b) - min),
      0
    );
    const incomesSum = incomes.reduce((s, i) => s + (i.amount || 0), 0);
    const askanimSum = askanimIncomes.reduce((s, i) => s + (i.amount || 0), 0);
    const otherIncomes = incomesSum + askanimSum + excessSum;
    const totalIncome2 = cappedSum + otherIncomes;
    const eligible = active.filter((b) => bachurTotal(b) >= min && min > 0);
    const frozenFromBachurim = eligible.length * min;
    const frozenFromAmuta = eligible.length * amutaSupplement;
    const frozenTotal = frozenFromBachurim + frozenFromAmuta;
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const expectedList = eligible.filter((b) => !b.receivedBasket);
    const expectedTotal = expectedList.length * basketCost;
    return {
      active,
      married,
      cappedSum,
      excessSum,
      incomesSum,
      askanimSum,
      otherIncomes,
      totalIncome: totalIncome2,
      eligible,
      frozenFromBachurim,
      frozenFromAmuta,
      frozenTotal,
      totalExpenses,
      expectedList,
      expectedTotal
    };
  }, [bachurim, incomes, askanimIncomes, expenses, min, basketCost, amutaSupplement]);
  const balance = stats.totalIncome - stats.totalExpenses;
  const balanceWithExpected = balance - stats.expectedTotal;
  const [openCard, setOpenCard] = useState(null);
  const [aMode, setAMode] = useState(null);
  const [aBachurFilter, setABachurFilter] = useState("eligible");
  const [aOtherFilter, setAOtherFilter] = useState("");
  const closeAll = () => {
    setOpenCard(null);
    setAMode(null);
    setABachurFilter("eligible");
    setAOtherFilter("");
  };
  const cards = [
    {
      id: "A",
      title: 'סה"כ הכנסות',
      desc: "סכומי בחורים עד המינימום + שאר ההכנסות",
      icon: Wallet,
      value: stats.totalIncome
    },
    {
      id: "B",
      title: "סלים בהקפאה",
      desc: "כסף בחורים זכאים + תוספת העמותה",
      icon: Snowflake,
      value: stats.frozenTotal
    },
    {
      id: "C",
      title: "הוצאות",
      desc: "סך כל ההוצאות במערכת",
      icon: Receipt,
      value: stats.totalExpenses
    },
    {
      id: "D",
      title: "הוצאות צפויות",
      desc: "בחורים זכאים שטרם קיבלו סל",
      icon: ClipboardList,
      value: stats.expectedTotal
    },
    {
      id: "E",
      title: 'סה"כ הוצאות מול הכנסות',
      desc: "מאזן כולל",
      icon: Scale,
      value: balance
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-10", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4 mb-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "לוח בקרה" }),
      /* @__PURE__ */ jsx(MasterExcelImport, {})
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8", children: "סקירה כללית של נתוני העמותה" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5", children: cards.map((c) => {
      const Icon = c.icon;
      const isB = c.id === "B";
      const amutaDiff = stats.otherIncomes - stats.frozenFromAmuta;
      const surplus = amutaDiff >= 0;
      const cardBg = isB ? surplus ? "bg-green-50 border-green-400 dark:bg-green-950/30 dark:border-green-600" : "bg-red-50 border-red-400 dark:bg-red-950/30 dark:border-red-600" : "bg-card border-border";
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setOpenCard(c.id),
          className: `text-right rounded-xl border p-6 shadow-sm hover:shadow-md transition-all ${cardBg}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: c.title }),
              /* @__PURE__ */ jsx("div", { className: `flex h-10 w-10 items-center justify-center rounded-lg ${isB ? surplus ? "bg-green-100 dark:bg-green-900/40" : "bg-red-100 dark:bg-red-900/40" : "bg-primary/10"}`, children: /* @__PURE__ */ jsx(Icon, { className: `h-5 w-5 ${isB ? surplus ? "text-green-600" : "text-red-600" : "text-primary"}` }) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold text-foreground", children: fmt$2(c.value) }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: c.desc }),
            isB && /* @__PURE__ */ jsx("p", { className: `mt-2 text-sm font-semibold ${surplus ? "text-green-600" : "text-red-600"}`, children: surplus ? amutaDiff === 0 ? "✓ מאוזן" : `✓ עודף ${fmt$2(amutaDiff)}` : `✗ חסר ${fmt$2(Math.abs(amutaDiff))}` })
          ]
        },
        c.id
      );
    }) }),
    /* @__PURE__ */ jsx(Dialog, { open: openCard === "A", onOpenChange: (o) => !o && closeAll(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { children: [
          'סה"כ הכנסות — ',
          fmt$2(stats.totalIncome)
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "בחר באיזה רכיב להציג פירוט" })
      ] }),
      !aMode && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAMode("bachurim"),
            className: "rounded-lg border p-5 text-right hover:border-primary",
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "הכנסות בחורים (עד מינימום)" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: fmt$2(stats.cappedSum) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setAMode("other"),
            className: "rounded-lg border p-5 text-right hover:border-primary",
            children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "שאר ההכנסות" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: fmt$2(stats.otherIncomes) })
            ]
          }
        )
      ] }),
      aMode === "bachurim" && /* @__PURE__ */ jsx(
        CardABachurim,
        {
          bachurim,
          min,
          filter: aBachurFilter,
          setFilter: setABachurFilter,
          onBack: () => setAMode(null),
          onRowClick: (id) => {
            closeAll();
            navigateTo("bachurim", id);
          }
        }
      ),
      aMode === "other" && /* @__PURE__ */ jsx(
        CardAOther,
        {
          incomes,
          askanimIncomes,
          bachurim,
          fundraisers,
          min,
          filter: aOtherFilter,
          setFilter: setAOtherFilter,
          onBack: () => setAMode(null),
          onRowClick: (target) => {
            closeAll();
            navigateTo(target.module, target.id, target.module === "income" ? { edit: true } : void 0);
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: openCard === "B", onOpenChange: (o) => !o && closeAll(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { children: [
          "סלים בהקפאה — ",
          fmt$2(stats.frozenTotal)
        ] }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          stats.eligible.length,
          " בחורים זכאים שטרם התחתנו"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border p-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: 'סה"כ מהבחורים' }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-bold", children: fmt$2(stats.frozenFromBachurim) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `rounded-lg border p-4 ${stats.otherIncomes - stats.frozenFromAmuta < 0 ? "border-red-400 bg-red-50 dark:bg-red-950/30" : "border-green-400 bg-green-50 dark:bg-green-950/30"}`, children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "נדרש מהעמותה" }),
          /* @__PURE__ */ jsx("p", { className: "text-xl font-bold", children: fmt$2(stats.frozenFromAmuta) }),
          stats.otherIncomes - stats.frozenFromAmuta < 0 ? /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-red-600 mt-1", children: [
            "✗ חסר ",
            fmt$2(Math.abs(stats.otherIncomes - stats.frozenFromAmuta))
          ] }) : /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-green-600 mt-1", children: [
            "✓ עודף ",
            fmt$2(stats.otherIncomes - stats.frozenFromAmuta)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        BachurimTable,
        {
          rows: stats.eligible.map((b) => ({
            id: b.id,
            name: b.name,
            fromBachur: min,
            fromAmuta: amutaSupplement,
            total: basketCost
          })),
          columns: ["שם", "מהבחור", "תוספת עמותה", 'סה"כ'],
          exportName: "סלים-בהקפאה",
          onRowClick: (id) => {
            closeAll();
            navigateTo("bachurim", id);
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: openCard === "C", onOpenChange: (o) => !o && closeAll(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { children: [
          "הוצאות — ",
          fmt$2(stats.totalExpenses)
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "פירוט לפי קטגוריה" })
      ] }),
      /* @__PURE__ */ jsx(
        ExpensesByCategory,
        {
          expenses,
          onRowClick: (id) => {
            closeAll();
            navigateTo("expenses", id, { edit: true });
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: openCard === "D", onOpenChange: (o) => !o && closeAll(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] overflow-y-auto", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { children: [
          "הוצאות צפויות — ",
          fmt$2(stats.expectedTotal)
        ] }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          stats.expectedList.length,
          " בחורים זכאים שטרם קיבלו סל"
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        BachurimTable,
        {
          rows: stats.expectedList.map((b) => ({
            id: b.id,
            name: b.name,
            fromBachur: min,
            fromAmuta: amutaSupplement,
            total: basketCost
          })),
          columns: ["שם", "כסף הבחור", "תוספת עמותה", "צפוי לסל"],
          exportName: "הוצאות-צפויות",
          onRowClick: (id) => {
            closeAll();
            navigateTo("bachurim", id);
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: openCard === "E", onOpenChange: (o) => !o && closeAll(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-xl", dir: "rtl", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: 'סה"כ הוצאות מול הכנסות' }) }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
        ExportButton,
        {
          onClick: () => exportToExcel("מאזן", ["סעיף", "סכום"], [
            ['סה"כ הכנסות', stats.totalIncome],
            ['סה"כ הוצאות בפועל', stats.totalExpenses],
            ['סה"כ הוצאות צפויות', stats.expectedTotal],
            ["מאזן (הכנסות - הוצאות)", balance],
            ["מאזן כולל הוצאות צפויות", balanceWithExpected]
          ])
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Row, { label: 'סה"כ הכנסות', value: stats.totalIncome }),
        /* @__PURE__ */ jsx(Row, { label: 'סה"כ הוצאות בפועל', value: stats.totalExpenses }),
        /* @__PURE__ */ jsx(Row, { label: 'סה"כ הוצאות צפויות', value: stats.expectedTotal }),
        /* @__PURE__ */ jsx("hr", { className: "border-border" }),
        /* @__PURE__ */ jsx(
          Row,
          {
            label: "מאזן (הכנסות - הוצאות)",
            value: balance,
            highlight: balance >= 0 ? "positive" : "negative"
          }
        ),
        /* @__PURE__ */ jsx(
          Row,
          {
            label: "מאזן כולל הוצאות צפויות",
            value: balanceWithExpected,
            highlight: balanceWithExpected >= 0 ? "positive" : "negative"
          }
        )
      ] })
    ] }) })
  ] });
}
function Row({ label, value, highlight }) {
  const cls = highlight === "positive" ? "text-green-600 dark:text-green-400" : highlight === "negative" ? "text-red-600 dark:text-red-400" : "text-foreground";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("span", { className: `text-lg font-bold ${cls}`, children: fmt$2(value) })
  ] });
}
function BachurimTable({ rows, columns, exportName, onRowClick }) {
  const sumBachur = rows.reduce((s, r) => s + r.fromBachur, 0);
  const sumAmuta = rows.reduce((s, r) => s + r.fromAmuta, 0);
  const sumTotal = rows.reduce((s, r) => s + r.total, 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
      ExportButton,
      {
        onClick: () => exportToExcel(exportName, columns, [
          [`סה"כ (${rows.length})`, sumBachur, sumAmuta, sumTotal],
          ...rows.map((r) => [r.name, r.fromBachur, r.fromAmuta, r.total])
        ])
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsx(TableRow, { children: columns.map((c) => /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: c }, c)) }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/50 font-bold", children: [
          /* @__PURE__ */ jsxs(TableCell, { children: [
            'סה"כ (',
            rows.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx(TableCell, { children: fmt$2(sumBachur) }),
          /* @__PURE__ */ jsx(TableCell, { children: fmt$2(sumAmuta) }),
          /* @__PURE__ */ jsx(TableCell, { children: fmt$2(sumTotal) })
        ] }),
        rows.map((r, i) => /* @__PURE__ */ jsxs(
          TableRow,
          {
            className: onRowClick && r.id ? "cursor-pointer hover:bg-primary/5" : "",
            onClick: () => {
              if (onRowClick && r.id) onRowClick(r.id);
            },
            children: [
              /* @__PURE__ */ jsx(TableCell, { children: r.name }),
              /* @__PURE__ */ jsx(TableCell, { children: fmt$2(r.fromBachur) }),
              /* @__PURE__ */ jsx(TableCell, { children: fmt$2(r.fromAmuta) }),
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: fmt$2(r.total) })
            ]
          },
          i
        )),
        rows.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: columns.length, className: "text-center text-muted-foreground py-6", children: "אין נתונים" }) })
      ] })
    ] }) })
  ] });
}
function CardABachurim({ bachurim, min, filter, setFilter, onBack, onRowClick }) {
  const filtered = useMemo(() => {
    return bachurim.filter((b) => {
      const t = bachurTotal(b);
      switch (filter) {
        case "all":
          return true;
        case "eligible":
          return !b.married && t >= min;
        case "close":
          return !b.married && t >= 0.8 * min && t < min;
        case "far":
          return !b.married && t < 0.8 * min;
        case "married":
          return b.married;
        default:
          return false;
      }
    });
  }, [bachurim, filter, min]);
  const rows = filtered.map((b) => ({
    id: b.id,
    name: b.name,
    amount: Math.min(bachurTotal(b), min),
    actual: bachurTotal(b)
  }));
  const sumAmount = rows.reduce((s, r) => s + r.amount, 0);
  const sumActual = rows.reduce((s, r) => s + r.actual, 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: onBack, children: "← חזור" }),
      /* @__PURE__ */ jsxs(Select, { value: filter, onValueChange: setFilter, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[200px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "בחר הכול" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "eligible", children: "זכאי (הגיע למינימום)" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "close", children: "קרוב לסל (80%+)" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "far", children: "רחוק מהסל (מתחת ל-80%)" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "married", children: "התחתן" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "ms-auto", children: /* @__PURE__ */ jsx(
        ExportButton,
        {
          onClick: () => exportToExcel(
            `הכנסות-בחורים-${filter}`,
            ["שם", "סכום (עד מינימום)", "סכום בפועל"],
            [
              [`סה"כ (${rows.length})`, sumAmount, sumActual],
              ...rows.map((r) => [r.name, r.amount, r.actual])
            ]
          )
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שם" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סכום (עד מינימום)" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סכום בפועל" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/50 font-bold", children: [
          /* @__PURE__ */ jsxs(TableCell, { children: [
            'סה"כ (',
            rows.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx(TableCell, { children: fmt$2(sumAmount) }),
          /* @__PURE__ */ jsx(TableCell, { children: fmt$2(sumActual) })
        ] }),
        rows.map((r, i) => /* @__PURE__ */ jsxs(
          TableRow,
          {
            className: onRowClick ? "cursor-pointer hover:bg-primary/5" : "",
            onClick: () => onRowClick?.(r.id),
            children: [
              /* @__PURE__ */ jsx(TableCell, { children: r.name }),
              /* @__PURE__ */ jsx(TableCell, { children: fmt$2(r.amount) }),
              /* @__PURE__ */ jsx(TableCell, { children: fmt$2(r.actual) })
            ]
          },
          i
        )),
        rows.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 3, className: "text-center text-muted-foreground py-6", children: "אין בחורים בקטגוריה זו" }) })
      ] })
    ] }) })
  ] });
}
function CardAOther({
  incomes,
  askanimIncomes,
  bachurim,
  fundraisers,
  min,
  filter,
  setFilter,
  onBack,
  onRowClick
}) {
  let rows = [];
  if (filter === "__askanim__") {
    rows = askanimIncomes.map((a) => ({
      name: a.bachurName,
      date: a.date,
      amount: a.amount,
      notes: a.notes,
      target: { module: "askanim", id: a.id }
    }));
  } else if (filter === "__excess__") {
    rows = bachurim.filter((b) => !b.married).map((b) => ({ name: b.name, date: "—", amount: Math.max(0, bachurTotal(b) - min), target: { module: "bachurim", id: b.id } })).filter((r) => r.amount > 0);
  } else if (filter === "__all__") {
    rows = [
      ...incomes.map((i) => ({
        name: `${i.description || "—"}${i.fundraiser ? ` (${i.fundraiser})` : ""}`,
        date: i.date,
        amount: i.amount,
        target: { module: "income", id: i.id }
      })),
      ...askanimIncomes.map((a) => ({
        name: `${a.bachurName} (פרויקט עסקנים)`,
        date: a.date,
        amount: a.amount,
        target: { module: "askanim", id: a.id }
      })),
      ...bachurim.filter((b) => !b.married).map((b) => ({ name: `${b.name} (עודף מעל מינימום)`, date: "—", amount: Math.max(0, bachurTotal(b) - min), target: { module: "bachurim", id: b.id } })).filter((r) => r.amount > 0)
    ];
  } else if (filter) {
    rows = incomes.filter((i) => (i.fundraiser || "") === filter).map((i) => ({ name: i.description || filter, date: i.date, amount: i.amount, target: { module: "income", id: i.id } }));
  }
  const sum = rows.reduce((s, r) => s + r.amount, 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: onBack, children: "← חזור" }),
      /* @__PURE__ */ jsxs(Select, { value: filter, onValueChange: setFilter, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[260px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "בחר מקור" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "__all__", children: "בחר הכול" }),
          fundraisers.map((f) => /* @__PURE__ */ jsx(SelectItem, { value: f, children: f }, f)),
          /* @__PURE__ */ jsx(SelectItem, { value: "__askanim__", children: "פרויקט עסקנים" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "__excess__", children: "עודף בחורים מעל המינימום" })
        ] })
      ] }),
      filter && /* @__PURE__ */ jsx("div", { className: "ms-auto", children: /* @__PURE__ */ jsx(
        ExportButton,
        {
          onClick: () => exportToExcel(
            `שאר-הכנסות-${filter}`,
            ["שם / תיאור", "תאריך", "סכום"],
            [
              [`סה"כ (${rows.length})`, "—", sum],
              ...rows.map((r) => [r.name, r.date, r.amount])
            ]
          )
        }
      ) })
    ] }),
    filter && /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שם / תיאור" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "תאריך" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סכום" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/50 font-bold", children: [
          /* @__PURE__ */ jsxs(TableCell, { children: [
            'סה"כ (',
            rows.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx(TableCell, { children: "—" }),
          /* @__PURE__ */ jsx(TableCell, { children: fmt$2(sum) })
        ] }),
        rows.map((r, i) => /* @__PURE__ */ jsxs(
          TableRow,
          {
            className: onRowClick && r.target ? "cursor-pointer hover:bg-primary/5" : "",
            onClick: () => {
              if (onRowClick && r.target) onRowClick(r.target);
            },
            children: [
              /* @__PURE__ */ jsx(TableCell, { children: r.name }),
              /* @__PURE__ */ jsx(TableCell, { children: r.date }),
              /* @__PURE__ */ jsx(TableCell, { children: fmt$2(r.amount) })
            ]
          },
          i
        )),
        rows.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 3, className: "text-center text-muted-foreground py-6", children: "אין נתונים" }) })
      ] })
    ] }) })
  ] });
}
function ExpensesByCategory({ expenses, onRowClick }) {
  const rows = useMemo(() => {
    return [...expenses].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [expenses]);
  const total = rows.reduce((s, e) => s + (e.amount || 0), 0);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
      ExportButton,
      {
        onClick: () => exportToExcel(
          "הוצאות-לפי-קטגוריה",
          ["תאריך", "קטגוריה", "פירוט", "סכום"],
          [["", 'סה"כ', "", total], ...rows.map((e) => [e.date, `${e.category || "ללא"} / ${e.subCategory || "ללא"}`, e.notes || "", e.amount || 0])]
        )
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "תאריך" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "קטגוריה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "פירוט" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סכום" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/50 font-bold", children: [
          /* @__PURE__ */ jsx(TableCell, { colSpan: 3, children: 'סה"כ' }),
          /* @__PURE__ */ jsx(TableCell, { children: fmt$2(total) })
        ] }),
        rows.map((e) => /* @__PURE__ */ jsxs(
          TableRow,
          {
            className: onRowClick ? "cursor-pointer hover:bg-primary/5" : "",
            onClick: () => onRowClick?.(e.id),
            children: [
              /* @__PURE__ */ jsx(TableCell, { children: e.date }),
              /* @__PURE__ */ jsx(TableCell, { children: `${e.category || "ללא"} / ${e.subCategory || "ללא"}` }),
              /* @__PURE__ */ jsx(TableCell, { className: "max-w-[200px] truncate", children: e.notes || "—" }),
              /* @__PURE__ */ jsx(TableCell, { children: fmt$2(e.amount || 0) })
            ]
          },
          e.id
        )),
        rows.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-6", children: "אין הוצאות" }) })
      ] })
    ] }) })
  ] });
}
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    ),
    ...props
  }
);
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    ),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Action,
  {
    ref,
    className: cn(buttonVariants(), className),
    ...props
  }
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
function useFocusRow(module, onEdit) {
  const { consumeFocus } = useNavigation();
  const [highlightedId, setHighlightedId] = useState(null);
  const rowRefs = useRef(/* @__PURE__ */ new Map());
  useEffect(() => {
    const f = consumeFocus(module);
    if (!f) return;
    const tryFocus = (attempt = 0) => {
      const el = rowRefs.current.get(f.id);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        setHighlightedId(f.id);
        setTimeout(() => setHighlightedId((cur) => cur === f.id ? null : cur), 2500);
        if (f.edit && onEdit) onEdit(f.id);
      } else if (attempt < 10) {
        setTimeout(() => tryFocus(attempt + 1), 80);
      }
    };
    tryFocus();
  }, [consumeFocus, module]);
  const registerRow = (id) => (el) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  };
  return { highlightedId, registerRow };
}
const CLASS_LEVELS = ["א", "ב", "ג", "ד", "ה", "ו"];
const STORAGE_KEY$1 = "bachurim";
function loadBachurim$1() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY$1) || "[]");
  } catch {
    return [];
  }
}
function saveBachurim(list) {
  localStorage.setItem(STORAGE_KEY$1, JSON.stringify(list));
}
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem("globalSettings") || "{}");
  } catch {
    return {};
  }
}
function getMinimum() {
  return loadSettings().minimumForBasket || 5e3;
}
function getBasketCost() {
  return loadSettings().basketCost || 6e3;
}
function generateSku(existing) {
  const usedSkus = new Set(existing.map((b) => b.sku));
  let sku;
  do {
    sku = String(Math.floor(Math.random() * 5e4) + 1).padStart(5, "0");
  } while (usedSkus.has(sku));
  return sku;
}
function totalIncome(b) {
  return b.outings.reduce((sum, o) => sum + o.amount, 0);
}
function fmtCurrency(n) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 0 }).format(n);
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("he-IL");
}
function addExpense(description, amount) {
  try {
    const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    expenses.push({ id: crypto.randomUUID(), description, amount, date: (/* @__PURE__ */ new Date()).toISOString(), category: "סלים" });
    localStorage.setItem("expenses", JSON.stringify(expenses));
  } catch {
  }
}
function addIncome(description, amount) {
  try {
    const incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
    incomes.push({ id: crypto.randomUUID(), description, amount, date: (/* @__PURE__ */ new Date()).toISOString(), category: "תרומות", target: "amuta" });
    localStorage.setItem("incomes", JSON.stringify(incomes));
  } catch {
  }
}
function addToAskanim(name, sku) {
  try {
    const list = JSON.parse(localStorage.getItem("askanim") || "[]");
    list.push({ id: crypto.randomUUID(), name, sku, date: (/* @__PURE__ */ new Date()).toISOString() });
    localStorage.setItem("askanim", JSON.stringify(list));
  } catch {
  }
}
function BachurimModule() {
  const [bachurim, setBachurim] = useState([]);
  const [showClosed, setShowClosed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedBachur, setSelectedBachur] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [deleteBachurId, setDeleteBachurId] = useState(null);
  const handleDeleteBachur = () => {
    if (!deleteBachurId) return;
    const b = bachurim.find((x) => x.id === deleteBachurId);
    if (b && !b.receivedBasket) {
      const income = totalIncome(b);
      if (income > 0) {
        addIncome(`תרומה – ${b.name}`, income);
      }
    }
    persist(bachurim.filter((x) => x.id !== deleteBachurId));
    setDeleteBachurId(null);
    setSelectedBachur(null);
    toast.success(b ? `${b.name} נמחק` : "הבחור נמחק");
  };
  const reload = useCallback(() => setBachurim(loadBachurim$1()), []);
  useEffect(reload, [reload]);
  const { highlightedId, registerRow } = useFocusRow("bachurim", (id) => {
    const b = loadBachurim$1().find((x) => x.id === id);
    if (b) setSelectedBachur(b);
  });
  const persist = (list) => {
    saveBachurim(list);
    setBachurim(list);
  };
  const minimum = getMinimum();
  const q = searchQuery.trim().toLowerCase();
  const matchesSearch = (b) => !q || b.name.toLowerCase().includes(q) || b.sku.toLowerCase().includes(q);
  const matchesClass = (b) => filterClass.length === 0 || filterClass.includes(b.classLevel);
  const statusMatches = (b, status) => {
    const income = totalIncome(b);
    switch (status) {
      case "eligible":
        return income >= minimum && !b.married;
      case "not_eligible":
        return income < minimum && !b.married && !b.receivedBasket;
      case "received_basket":
        return b.receivedBasket;
      case "married":
        return b.married;
      case "closed":
        return b.closed;
      case "askanim":
        return b.inAskanim;
      default:
        return false;
    }
  };
  const matchesStatus = (b) => filterStatus.length === 0 || filterStatus.some((s) => statusMatches(b, s));
  const filtered = bachurim.filter((b) => matchesSearch(b) && matchesClass(b) && matchesStatus(b));
  const active = filtered.filter((b) => !b.closed);
  const closed = filtered.filter((b) => b.closed);
  const hasActiveFilter = q !== "" || filterClass.length > 0 || filterStatus.length > 0;
  const clearFilters = () => {
    setSearchQuery("");
    setFilterClass([]);
    setFilterStatus([]);
  };
  const toggleInArray = (arr, val) => arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  const STATUS_OPTIONS = [
    { value: "eligible", label: "זכאי" },
    { value: "not_eligible", label: "לא זכאי" },
    { value: "received_basket", label: "קיבל סל" },
    { value: "married", label: "התחתן" },
    { value: "closed", label: "סגור" },
    { value: "askanim", label: "פרויקט עסקנים" }
  ];
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("א");
  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error("יש להזין שם");
      return;
    }
    const b = {
      id: crypto.randomUUID(),
      sku: generateSku(bachurim),
      name: newName.trim(),
      classLevel: newClass,
      joinDate: (/* @__PURE__ */ new Date()).toISOString(),
      outings: [],
      married: false,
      receivedBasket: false,
      inAskanim: false,
      closed: false
    };
    persist([...bachurim, b]);
    setNewName("");
    setNewClass("א");
    setAddDialogOpen(false);
    toast.success(`${b.name} נוסף בהצלחה (מק"ט: ${b.sku})`);
  };
  const handleBasket = (b) => {
    const cost = getBasketCost();
    totalIncome(b);
    const subsidy = cost - minimum;
    const updated = bachurim.map(
      (x) => x.id === b.id ? { ...x, receivedBasket: true, basketDate: (/* @__PURE__ */ new Date()).toISOString(), basketCostAtTime: cost, married: true, marriedDate: (/* @__PURE__ */ new Date()).toISOString(), closed: true } : x
    );
    persist(updated);
    if (subsidy > 0) {
      addExpense(`סבסוד סל – ${b.name}`, subsidy);
    }
    setConfirmAction(null);
    setSelectedBachur(null);
    toast.success(`${b.name} קיבל סל ונרשם כנשוי`);
  };
  const [marriedDate, setMarriedDate] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const handleMarried = (b) => {
    const income = totalIncome(b);
    const updated = bachurim.map(
      (x) => x.id === b.id ? { ...x, married: true, marriedDate: confirmAction?.date || (/* @__PURE__ */ new Date()).toISOString(), closed: true } : x
    );
    persist(updated);
    if (!b.receivedBasket && income > 0) {
      addIncome(`תרומה – ${b.name}`, income);
    }
    setConfirmAction(null);
    setSelectedBachur(null);
    toast.success(`${b.name} נרשם כנשוי`);
  };
  const handleAskanim = (b) => {
    const updated = bachurim.map((x) => x.id === b.id ? { ...x, inAskanim: true } : x);
    persist(updated);
    addToAskanim(b.name, b.sku);
    toast.success(`${b.name} צורף לפרויקט עסקנים`);
  };
  const handleCancelClosed = (b) => {
    if (b.married && !b.receivedBasket && totalIncome(b) > 0) {
      try {
        const incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
        const filtered2 = incomes.filter((inc) => inc.description !== `תרומה – ${b.name}`);
        localStorage.setItem("incomes", JSON.stringify(filtered2));
      } catch {
      }
    }
    if (b.receivedBasket) {
      try {
        const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
        const filtered2 = expenses.filter((exp) => exp.description !== `סבסוד סל – ${b.name}`);
        localStorage.setItem("expenses", JSON.stringify(filtered2));
      } catch {
      }
    }
    const updated = bachurim.map(
      (x) => x.id === b.id ? { ...x, married: false, marriedDate: void 0, receivedBasket: false, basketDate: void 0, basketCostAtTime: void 0, closed: false } : x
    );
    persist(updated);
    setConfirmAction(null);
    toast.success(`${b.name} הוחזר לרשימת הפעילים`);
  };
  const [outingName, setOutingName] = useState("");
  const [outingDate, setOutingDate] = useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [outingAmount, setOutingAmount] = useState("");
  const [outingPayment, setOutingPayment] = useState("");
  const [outingPaymentDetail, setOutingPaymentDetail] = useState("");
  const [addOutingOpen, setAddOutingOpen] = useState(false);
  const [editingOuting, setEditingOuting] = useState(null);
  const [editOutingName, setEditOutingName] = useState("");
  const [editOutingDate, setEditOutingDate] = useState("");
  const [editOutingAmount, setEditOutingAmount] = useState("");
  const [editOutingPayment, setEditOutingPayment] = useState("");
  const [editOutingPaymentDetail, setEditOutingPaymentDetail] = useState("");
  const [deleteOutingId, setDeleteOutingId] = useState(null);
  const canSaveOuting = outingName.trim() && Number(outingAmount) > 0 && outingPayment && (outingPayment !== "אחר" || outingPaymentDetail.trim());
  const handleAddOuting = () => {
    if (!selectedBachur || !canSaveOuting) {
      toast.error("יש למלא את כל השדות");
      return;
    }
    const outing = {
      id: crypto.randomUUID(),
      name: outingName.trim(),
      date: new Date(outingDate).toISOString(),
      amount: Number(outingAmount),
      paymentMethod: outingPayment,
      paymentMethodDetail: outingPayment === "אחר" ? outingPaymentDetail.trim() : void 0
    };
    const updated = bachurim.map(
      (x) => x.id === selectedBachur.id ? { ...x, outings: [...x.outings, outing] } : x
    );
    persist(updated);
    setSelectedBachur(updated.find((x) => x.id === selectedBachur.id) || null);
    setOutingName("");
    setOutingAmount("");
    setOutingDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    setOutingPayment("");
    setOutingPaymentDetail("");
    setAddOutingOpen(false);
    toast.success("ההכנסה נוספה בהצלחה");
  };
  const openEditOuting = (o) => {
    setEditingOuting(o);
    setEditOutingName(o.name);
    setEditOutingDate(new Date(o.date).toISOString().slice(0, 10));
    setEditOutingAmount(String(o.amount));
    setEditOutingPayment(o.paymentMethod);
    setEditOutingPaymentDetail(o.paymentMethodDetail || "");
  };
  const handleEditOuting = () => {
    if (!selectedBachur || !editingOuting) return;
    const canSave = editOutingName.trim() && Number(editOutingAmount) > 0 && editOutingPayment && (editOutingPayment !== "אחר" || editOutingPaymentDetail.trim());
    if (!canSave) {
      toast.error("יש למלא את כל השדות");
      return;
    }
    const updatedOuting = {
      ...editingOuting,
      name: editOutingName.trim(),
      date: new Date(editOutingDate).toISOString(),
      amount: Number(editOutingAmount),
      paymentMethod: editOutingPayment,
      paymentMethodDetail: editOutingPayment === "אחר" ? editOutingPaymentDetail.trim() : void 0
    };
    const updated = bachurim.map(
      (x) => x.id === selectedBachur.id ? { ...x, outings: x.outings.map((o) => o.id === editingOuting.id ? updatedOuting : o) } : x
    );
    persist(updated);
    setSelectedBachur(updated.find((x) => x.id === selectedBachur.id) || null);
    setEditingOuting(null);
    toast.success("הפעולה עודכנה בהצלחה");
  };
  const handleDeleteOuting = () => {
    if (!selectedBachur || !deleteOutingId) return;
    const updated = bachurim.map(
      (x) => x.id === selectedBachur.id ? { ...x, outings: x.outings.filter((o) => o.id !== deleteOutingId) } : x
    );
    persist(updated);
    setSelectedBachur(updated.find((x) => x.id === selectedBachur.id) || null);
    setDeleteOutingId(null);
    toast.success("הפעולה נמחקה בהצלחה");
  };
  useRef(null);
  const [importData, setImportData] = useState([]);
  const handleImport = (skipExisting) => {
    const toImport = skipExisting ? importData.filter((r) => !r.exists) : importData;
    let current = [...bachurim];
    for (const row of toImport) {
      if (row.exists && !skipExisting) {
        current = current.map((b) => b.name === row.name ? { ...b, classLevel: row.classLevel } : b);
      } else if (!row.exists) {
        current.push({
          id: crypto.randomUUID(),
          sku: generateSku(current),
          name: row.name,
          classLevel: CLASS_LEVELS.includes(row.classLevel) ? row.classLevel : "א",
          joinDate: (/* @__PURE__ */ new Date()).toISOString(),
          outings: [],
          married: false,
          receivedBasket: false,
          inAskanim: false,
          closed: false
        });
      }
    }
    persist(current);
    setImportDialogOpen(false);
    setImportData([]);
    toast.success(`${toImport.length} בחורים יובאו בהצלחה`);
  };
  const [exportCols, setExportCols] = useState({
    sku: true,
    classLevel: true,
    joinDate: false,
    eligibility: false,
    askanim: false
  });
  const [exportBasketOutings, setExportBasketOutings] = useState(false);
  const [exportAskanimOutings, setExportAskanimOutings] = useState(false);
  const [selectedBasketOutings, setSelectedBasketOutings] = useState(/* @__PURE__ */ new Set());
  const [selectedAskanimOutings, setSelectedAskanimOutings] = useState(/* @__PURE__ */ new Set());
  const [expandedBasketYears, setExpandedBasketYears] = useState(/* @__PURE__ */ new Set());
  const [expandedAskanimYears, setExpandedAskanimYears] = useState(/* @__PURE__ */ new Set());
  const allBasketOutings = active.flatMap((b) => b.outings || []);
  const basketTree = {};
  for (const o of allBasketOutings) {
    const year = new Date(o.date).getFullYear().toString();
    if (!basketTree[year]) basketTree[year] = [];
    if (!basketTree[year].includes(o.name)) basketTree[year].push(o.name);
  }
  const basketYearsSorted = Object.keys(basketTree).sort();
  const allAskanimIncomes = (() => {
    try {
      return JSON.parse(localStorage.getItem("askanimIncomes") || "[]");
    } catch {
      return [];
    }
  })();
  const askanimTree = {};
  for (const a of allAskanimIncomes) {
    const year = new Date(a.date).getFullYear().toString();
    const name = a.notes || "הכנסת עסקנים";
    if (!askanimTree[year]) askanimTree[year] = [];
    if (!askanimTree[year].includes(name)) askanimTree[year].push(name);
  }
  const askanimYearsSorted = Object.keys(askanimTree).sort();
  const toggleBasketYear = (year) => {
    const names = basketTree[year] || [];
    const allSelected = names.every((n) => selectedBasketOutings.has(`${year}::${n}`));
    const next = new Set(selectedBasketOutings);
    names.forEach((n) => allSelected ? next.delete(`${year}::${n}`) : next.add(`${year}::${n}`));
    setSelectedBasketOutings(next);
  };
  const toggleBasketOuting = (year, name) => {
    const key = `${year}::${name}`;
    const next = new Set(selectedBasketOutings);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedBasketOutings(next);
  };
  const toggleAskanimYear = (year) => {
    const names = askanimTree[year] || [];
    const allSelected = names.every((n) => selectedAskanimOutings.has(`${year}::${n}`));
    const next = new Set(selectedAskanimOutings);
    names.forEach((n) => allSelected ? next.delete(`${year}::${n}`) : next.add(`${year}::${n}`));
    setSelectedAskanimOutings(next);
  };
  const toggleAskanimOuting = (year, name) => {
    const key = `${year}::${name}`;
    const next = new Set(selectedAskanimOutings);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedAskanimOutings(next);
  };
  const toggleExpandBasket = (year) => {
    const next = new Set(expandedBasketYears);
    next.has(year) ? next.delete(year) : next.add(year);
    setExpandedBasketYears(next);
  };
  const toggleExpandAskanim = (year) => {
    const next = new Set(expandedAskanimYears);
    next.has(year) ? next.delete(year) : next.add(year);
    setExpandedAskanimYears(next);
  };
  const handleExport = async () => {
    const XLSX2 = await import("xlsx");
    const basketOutingNames = exportBasketOutings ? [...selectedBasketOutings].map((k) => {
      const [, ...rest] = k.split("::");
      return rest.join("::");
    }).filter((v, i, a) => a.indexOf(v) === i) : [];
    const askanimOutingNames = exportAskanimOutings ? [...selectedAskanimOutings].map((k) => {
      const [, ...rest] = k.split("::");
      return rest.join("::");
    }).filter((v, i, a) => a.indexOf(v) === i) : [];
    const isBasketSelected = (o) => {
      const year = new Date(o.date).getFullYear().toString();
      return selectedBasketOutings.has(`${year}::${o.name}`);
    };
    const isAskanimSelected = (a) => {
      const year = new Date(a.date).getFullYear().toString();
      return selectedAskanimOutings.has(`${year}::${a.notes || "הכנסת עסקנים"}`);
    };
    const rows = active.map((b) => {
      const row = { שם: b.name };
      if (exportCols.sku) row['מק"ט'] = b.sku;
      if (exportCols.classLevel) row["שיעור"] = b.classLevel;
      if (exportCols.joinDate) row["תאריך הצטרפות"] = fmtDate(b.joinDate);
      if (exportCols.eligibility) row["סטטוס זכאות"] = totalIncome(b) >= minimum ? "זכאי" : "לא זכאי";
      if (exportCols.askanim) row["פרויקט עסקנים"] = b.inAskanim ? "כן" : "לא";
      if (exportBasketOutings) {
        const filtered2 = (b.outings || []).filter(isBasketSelected);
        for (const name of basketOutingNames) {
          row[name] = filtered2.filter((o) => o.name === name).reduce((s, o) => s + o.amount, 0) || "";
        }
        row['סה"כ סלים'] = filtered2.reduce((s, o) => s + o.amount, 0);
      }
      if (exportAskanimOutings) {
        const bAsk = allAskanimIncomes.filter((a) => a.bachurId === b.id).filter(isAskanimSelected);
        for (const name of askanimOutingNames) {
          row[`${name} (עסקנים)`] = b.inAskanim ? bAsk.filter((a) => (a.notes || "הכנסת עסקנים") === name).reduce((s, a) => s + a.amount, 0) || "" : "";
        }
        row['סה"כ עסקנים'] = b.inAskanim ? bAsk.reduce((s, a) => s + a.amount, 0) : "";
      }
      if (exportBasketOutings || exportAskanimOutings) {
        const basketSum = exportBasketOutings ? (b.outings || []).filter(isBasketSelected).reduce((s, o) => s + o.amount, 0) : 0;
        const askanimSum = exportAskanimOutings && b.inAskanim ? allAskanimIncomes.filter((a) => a.bachurId === b.id).filter(isAskanimSelected).reduce((s, a) => s + a.amount, 0) : 0;
        row['סה"כ כללי'] = basketSum + askanimSum;
      }
      return row;
    });
    const ws = XLSX2.utils.json_to_sheet(rows);
    const range = XLSX2.utils.decode_range(ws["!ref"] || "A1");
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cellRef = XLSX2.utils.encode_cell({ r: 0, c });
      if (ws[cellRef]) {
        ws[cellRef].s = { font: { bold: true } };
      }
    }
    const wb = XLSX2.utils.book_new();
    XLSX2.utils.book_append_sheet(wb, ws, "בחורים");
    XLSX2.writeFile(wb, "bachurim_export.xlsx");
    setExportDialogOpen(false);
    toast.success("הקובץ הורד בהצלחה");
  };
  const getEligibilityBadge = (b) => {
    const income = totalIncome(b);
    const pct = minimum > 0 ? income / minimum : 0;
    if (income >= minimum) return /* @__PURE__ */ jsx(Badge, { className: "bg-green-600 text-white", children: "זכאי" });
    if (pct >= 0.8) return /* @__PURE__ */ jsx(Badge, { className: "bg-orange-500 text-white", children: "קרוב לסל!" });
    return /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "לא זכאי" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      /* @__PURE__ */ jsxs(Button, { onClick: () => setAddDialogOpen(true), className: "gap-1.5", children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" }),
        " הוסף בחור ידנית"
      ] }),
      /* @__PURE__ */ jsx(MasterExcelImport, {}),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-1.5", onClick: () => setExportDialogOpen(true), children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
        " ייצוא Excel"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxs(Button, { variant: showClosed ? "secondary" : "outline", className: "gap-1.5", onClick: () => setShowClosed(!showClosed), children: [
        showClosed ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
        showClosed ? "הסתר סגורים" : `הצג סגורים (${closed.length})`
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-lg border border-border", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "חיפוש לפי שם או מק״ט...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pr-8"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Popover, { children: [
        /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "w-[160px] justify-between gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "truncate", children: filterClass.length === 0 ? "כל השיעורים" : `שיעור: ${filterClass.join(", ")}` }),
          filterClass.length > 0 && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "ms-1", children: filterClass.length })
        ] }) }),
        /* @__PURE__ */ jsx(PopoverContent, { className: "w-[200px] p-2", align: "start", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          CLASS_LEVELS.map((c) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: filterClass.includes(c),
                onCheckedChange: () => setFilterClass((prev) => toggleInArray(prev, c))
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
              "שיעור ",
              c
            ] })
          ] }, c)),
          filterClass.length > 0 && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "w-full mt-1", onClick: () => setFilterClass([]), children: "נקה בחירה" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Popover, { children: [
        /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "w-[180px] justify-between gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "truncate", children: filterStatus.length === 0 ? "כל הסטטוסים" : filterStatus.length === 1 ? STATUS_OPTIONS.find((o) => o.value === filterStatus[0])?.label : `${filterStatus.length} סטטוסים` }),
          filterStatus.length > 0 && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "ms-1", children: filterStatus.length })
        ] }) }),
        /* @__PURE__ */ jsx(PopoverContent, { className: "w-[220px] p-2", align: "start", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          STATUS_OPTIONS.map((o) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: filterStatus.includes(o.value),
                onCheckedChange: () => setFilterStatus((prev) => toggleInArray(prev, o.value))
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: o.label })
          ] }, o.value)),
          filterStatus.length > 0 && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "w-full mt-1", onClick: () => setFilterStatus([]), children: "נקה בחירה" })
        ] }) })
      ] }),
      hasActiveFilter && /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: clearFilters, className: "gap-1", children: [
        /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
        " נקה"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground ms-auto", children: [
        filtered.length,
        " מתוך ",
        bachurim.length
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-card shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/50", children: [
        /* @__PURE__ */ jsx(TableHead, { children: 'מק"ט' }),
        /* @__PURE__ */ jsx(TableHead, { children: "שם" }),
        /* @__PURE__ */ jsx(TableHead, { children: "שיעור" }),
        /* @__PURE__ */ jsx(TableHead, { children: 'סה"כ הכניס' }),
        /* @__PURE__ */ jsx(TableHead, { children: "סטטוס זכאות" }),
        /* @__PURE__ */ jsx(TableHead, { children: "פעולות" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: active.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center py-12 text-muted-foreground", children: 'אין בחורים פעילים. לחץ "הוסף בחור ידנית" להתחלה.' }) }) : active.map((b) => /* @__PURE__ */ jsxs(
        TableRow,
        {
          ref: registerRow(b.id),
          className: `hover:bg-muted/30 ${highlightedId === b.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`,
          children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: b.sku }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("button", { onClick: () => setSelectedBachur(b), className: "text-primary hover:underline font-medium", children: b.name }) }),
            /* @__PURE__ */ jsx(TableCell, { children: b.classLevel }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: fmtCurrency(totalIncome(b)) }),
            /* @__PURE__ */ jsx(TableCell, { children: getEligibilityBadge(b) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1 flex-wrap", children: [
              /* @__PURE__ */ jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "gap-1 text-xs",
                  disabled: totalIncome(b) < minimum,
                  onClick: () => setConfirmAction({ type: "basket", bachur: b }),
                  children: [
                    /* @__PURE__ */ jsx(ShoppingBasket, { className: "h-3 w-3" }),
                    " קיבל סל"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "gap-1 text-xs",
                  onClick: () => {
                    setMarriedDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
                    setConfirmAction({ type: "married", bachur: b });
                  },
                  children: [
                    /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3" }),
                    " התחתן"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  size: "sm",
                  variant: b.inAskanim ? "ghost" : "outline",
                  className: "gap-1 text-xs",
                  disabled: b.inAskanim,
                  onClick: () => handleAskanim(b),
                  children: [
                    /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
                    " ",
                    b.inAskanim ? "מצורף" : "עסקנים"
                  ]
                }
              )
            ] }) })
          ]
        },
        b.id
      )) })
    ] }) }),
    showClosed && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "px-4 py-3 bg-muted/50 border-b border-border", children: /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-foreground", children: [
        "בחורים סגורים (",
        closed.length,
        ")"
      ] }) }),
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "שם" }),
          /* @__PURE__ */ jsx(TableHead, { children: 'מק"ט' }),
          /* @__PURE__ */ jsx(TableHead, { children: "שיעור" }),
          /* @__PURE__ */ jsx(TableHead, { children: "תאריך חתונה" }),
          /* @__PURE__ */ jsx(TableHead, { children: "קיבל סל" }),
          /* @__PURE__ */ jsx(TableHead, { children: 'סה"כ הכניס' }),
          /* @__PURE__ */ jsx(TableHead, { children: "פעולות" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: closed.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground", children: "אין בחורים סגורים" }) }) : closed.map((b) => /* @__PURE__ */ jsxs(
          TableRow,
          {
            ref: registerRow(b.id),
            className: `bg-muted/20 ${highlightedId === b.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`,
            children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: b.name }),
              /* @__PURE__ */ jsx(TableCell, { className: "font-mono text-sm", children: b.sku }),
              /* @__PURE__ */ jsx(TableCell, { children: b.classLevel }),
              /* @__PURE__ */ jsx(TableCell, { children: b.marriedDate ? fmtDate(b.marriedDate) : "—" }),
              /* @__PURE__ */ jsx(TableCell, { children: b.receivedBasket ? /* @__PURE__ */ jsx(Badge, { className: "bg-green-600 text-white", children: "כן" }) : /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "לא" }) }),
              /* @__PURE__ */ jsx(TableCell, { children: fmtCurrency(totalIncome(b)) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "destructive", className: "gap-1 text-xs", onClick: () => setConfirmAction({ type: "cancel", bachur: b }), children: [
                /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }),
                " בטל"
              ] }) })
            ]
          },
          b.id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: addDialogOpen, onOpenChange: setAddDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "הוסף בחור חדש" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "הזן שם מלא ובחר שיעור" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "bachurName", children: "שם מלא" }),
          /* @__PURE__ */ jsx(Input, { id: "bachurName", value: newName, onChange: (e) => setNewName(e.target.value), className: "mt-1", placeholder: "הזן שם מלא" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "שיעור" }),
          /* @__PURE__ */ jsxs(Select, { value: newClass, onValueChange: setNewClass, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: CLASS_LEVELS.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: handleAdd, children: "הוסף" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: importDialogOpen, onOpenChange: setImportDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "ייבוא מ-Excel" }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "נמצאו ",
          importData.length,
          " שורות"
        ] })
      ] }),
      importData.some((r) => r.exists) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsxs("span", { children: [
          importData.filter((r) => r.exists).length,
          " בחורים כבר קיימים במערכת"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-h-60 overflow-auto rounded-lg border border-border", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "שם" }),
          /* @__PURE__ */ jsx(TableHead, { children: "שיעור" }),
          /* @__PURE__ */ jsx(TableHead, { children: "סטטוס" })
        ] }) }),
        /* @__PURE__ */ jsxs(TableBody, { children: [
          /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/60 font-semibold hover:bg-muted/60", children: [
            /* @__PURE__ */ jsxs(TableCell, { children: [
              'סה"כ ',
              importData.length
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: "—" }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              importData.filter((r) => r.exists).length,
              " קיימים / ",
              importData.filter((r) => !r.exists).length,
              " חדשים"
            ] })
          ] }),
          importData.map((r, i) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: r.name }),
            /* @__PURE__ */ jsx(TableCell, { children: r.classLevel }),
            /* @__PURE__ */ jsx(TableCell, { children: r.exists ? /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "קיים" }) : /* @__PURE__ */ jsx(Badge, { className: "bg-green-600 text-white", children: "חדש" }) })
          ] }, i))
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => handleImport(true), children: "דלג על קיימים" }),
        /* @__PURE__ */ jsx(Button, { onClick: () => handleImport(false), children: "עדכן קיימים" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: exportDialogOpen, onOpenChange: setExportDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "ייצוא Excel" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "בחר עמודות לייצוא (בחורים פעילים בלבד)" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Checkbox, { checked: true, disabled: true }),
          /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "שם (חובה)" })
        ] }),
        [
          ["sku", 'מק"ט'],
          ["classLevel", "שיעור"],
          ["joinDate", "תאריך הצטרפות"],
          ["eligibility", "סטטוס זכאות לסל"],
          ["askanim", "פרויקט עסקנים"]
        ].map(([key, label]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: exportCols[key],
              onCheckedChange: (v) => setExportCols({ ...exportCols, [key]: !!v }),
              id: `exp-${key}`
            }
          ),
          /* @__PURE__ */ jsx(Label, { htmlFor: `exp-${key}`, children: label })
        ] }, key)),
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: exportBasketOutings,
                onCheckedChange: (v) => {
                  setExportBasketOutings(!!v);
                  if (!v) setSelectedBasketOutings(/* @__PURE__ */ new Set());
                },
                id: "exp-basket-outings"
              }
            ),
            /* @__PURE__ */ jsx(Label, { htmlFor: "exp-basket-outings", className: "font-semibold", children: "יציאות סלים" })
          ] }),
          exportBasketOutings && basketYearsSorted.length > 0 && /* @__PURE__ */ jsx("div", { className: "mr-6 space-y-1 max-h-40 overflow-y-auto border border-border rounded-md p-2", children: basketYearsSorted.map((year) => {
            const names = basketTree[year];
            const allSel = names.every((n) => selectedBasketOutings.has(`${year}::${n}`));
            const someSel = names.some((n) => selectedBasketOutings.has(`${year}::${n}`));
            return /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Checkbox, { checked: allSel, "data-indeterminate": someSel && !allSel, onCheckedChange: () => toggleBasketYear(year) }),
                /* @__PURE__ */ jsxs("button", { type: "button", className: "text-sm font-medium hover:underline", onClick: () => toggleExpandBasket(year), children: [
                  expandedBasketYears.has(year) ? "▾" : "▸",
                  " ",
                  year
                ] })
              ] }),
              expandedBasketYears.has(year) && /* @__PURE__ */ jsx("div", { className: "mr-6 space-y-0.5 mt-1", children: names.map((name) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Checkbox, { checked: selectedBasketOutings.has(`${year}::${name}`), onCheckedChange: () => toggleBasketOuting(year, name) }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: name })
              ] }, name)) })
            ] }, year);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: exportAskanimOutings,
                onCheckedChange: (v) => {
                  setExportAskanimOutings(!!v);
                  if (!v) setSelectedAskanimOutings(/* @__PURE__ */ new Set());
                },
                id: "exp-askanim-outings"
              }
            ),
            /* @__PURE__ */ jsx(Label, { htmlFor: "exp-askanim-outings", className: "font-semibold", children: "יציאות פרויקט עסקנים" })
          ] }),
          exportAskanimOutings && askanimYearsSorted.length > 0 && /* @__PURE__ */ jsx("div", { className: "mr-6 space-y-1 max-h-40 overflow-y-auto border border-border rounded-md p-2", children: askanimYearsSorted.map((year) => {
            const names = askanimTree[year];
            const allSel = names.every((n) => selectedAskanimOutings.has(`${year}::${n}`));
            const someSel = names.some((n) => selectedAskanimOutings.has(`${year}::${n}`));
            return /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Checkbox, { checked: allSel, "data-indeterminate": someSel && !allSel, onCheckedChange: () => toggleAskanimYear(year) }),
                /* @__PURE__ */ jsxs("button", { type: "button", className: "text-sm font-medium hover:underline", onClick: () => toggleExpandAskanim(year), children: [
                  expandedAskanimYears.has(year) ? "▾" : "▸",
                  " ",
                  year
                ] })
              ] }),
              expandedAskanimYears.has(year) && /* @__PURE__ */ jsx("div", { className: "mr-6 space-y-0.5 mt-1", children: names.map((name) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Checkbox, { checked: selectedAskanimOutings.has(`${year}::${name}`), onCheckedChange: () => toggleAskanimOuting(year, name) }),
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: name })
              ] }, name)) })
            ] }, year);
          }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleExport, className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          " הורד Excel"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Sheet, { open: !!selectedBachur, onOpenChange: (o) => {
      if (!o) setSelectedBachur(null);
    }, children: /* @__PURE__ */ jsx(SheetContent, { side: "left", className: "w-full sm:max-w-md overflow-y-auto", children: selectedBachur && (() => {
      const b = bachurim.find((x) => x.id === selectedBachur.id) || selectedBachur;
      const income = totalIncome(b);
      const pct = minimum > 0 ? income / minimum : 0;
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs(SheetHeader, { children: [
          /* @__PURE__ */ jsx(SheetTitle, { className: "text-xl", children: b.name }),
          /* @__PURE__ */ jsxs(SheetDescription, { children: [
            'מק"ט: ',
            b.sku
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 rounded-lg p-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground block", children: "שיעור" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: b.classLevel })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 rounded-lg p-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground block", children: "תאריך הצטרפות" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: fmtDate(b.joinDate) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 rounded-lg p-3 col-span-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground block", children: 'סה"כ הכניס' }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-lg", children: fmtCurrency(income) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { children: income >= minimum ? /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium", children: "✅ זכאי לסל!" }) : pct >= 0.8 ? /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm font-medium", children: [
            "⚠️ קרוב לסל! (",
            Math.round(pct * 100),
            "%)"
          ] }) : /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium", children: [
            "❌ לא זכאי (",
            fmtCurrency(minimum - income),
            " חסרים)"
          ] }) }),
          /* @__PURE__ */ jsx(Separator, {}),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxs("h4", { className: "font-semibold", children: [
                "פירוט יציאות (",
                b.outings.length,
                ")"
              ] }),
              !b.closed && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", className: "gap-1 text-xs", onClick: () => setAddOutingOpen(true), children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-3 w-3" }),
                " הוסף הכנסה"
              ] })
            ] }),
            b.outings.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "אין יציאות" }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
              /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableHead, { children: "שם יציאה" }),
                /* @__PURE__ */ jsx(TableHead, { children: "תאריך" }),
                /* @__PURE__ */ jsx(TableHead, { children: "סכום" }),
                /* @__PURE__ */ jsx(TableHead, { children: "אופן תשלום" }),
                /* @__PURE__ */ jsx(TableHead, { className: "w-20", children: "פעולות" })
              ] }) }),
              /* @__PURE__ */ jsxs(TableBody, { children: [
                /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/60 font-semibold hover:bg-muted/60", children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: 'סה"כ' }),
                  /* @__PURE__ */ jsxs(TableCell, { className: "text-sm", children: [
                    b.outings.length,
                    " יציאות"
                  ] }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: fmtCurrency(income) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: "—" }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: "—" })
                ] }),
                b.outings.map((o) => /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: o.name }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: fmtDate(o.date) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm font-medium", children: fmtCurrency(o.amount) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: o.paymentMethod === "אחר" ? `אחר: ${o.paymentMethodDetail || ""}` : o.paymentMethod || "—" }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
                    /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7", onClick: () => openEditOuting(o), children: /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
                    /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 text-destructive hover:text-destructive", onClick: () => setDeleteOutingId(o.id), children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
                  ] }) })
                ] }, o.id))
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx(Separator, {}),
          /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "destructive",
              className: "w-full gap-2",
              onClick: () => setDeleteBachurId(b.id),
              children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                " מחק בחור"
              ]
            }
          ) })
        ] })
      ] });
    })() }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!deleteBachurId, onOpenChange: (o) => {
      if (!o) setDeleteBachurId(null);
    }, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "למחוק את הבחור?" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "פעולה זו תמחק לצמיתות את הבחור ואת כל היציאות שלו. לא ניתן לבטל פעולה זו." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDeleteBachur, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "מחק" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: addOutingOpen, onOpenChange: setAddOutingOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "הוסף הכנסה ליציאה" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: selectedBachur?.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "שם היציאה" }),
          /* @__PURE__ */ jsx(Input, { value: outingName, onChange: (e) => setOutingName(e.target.value), className: "mt-1", placeholder: "למשל: מגבית חנוכה" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "תאריך" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: outingDate, onChange: (e) => setOutingDate(e.target.value), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "סכום (₪)" }),
          /* @__PURE__ */ jsx(Input, { type: "number", value: outingAmount, onChange: (e) => setOutingAmount(e.target.value), className: "mt-1", min: 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "אופן תשלום" }),
          /* @__PURE__ */ jsxs(Select, { value: outingPayment, onValueChange: (v) => {
            setOutingPayment(v);
            if (v !== "אחר") setOutingPaymentDetail("");
          }, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "בחר אופן תשלום" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "מזומן", children: "מזומן" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "אשראי", children: "אשראי" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "אחר", children: "אחר" })
            ] })
          ] })
        ] }),
        outingPayment === "אחר" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "פירוט אופן תשלום (חובה)" }),
          /* @__PURE__ */ jsx(Input, { value: outingPaymentDetail, onChange: (e) => setOutingPaymentDetail(e.target.value), className: "mt-1", placeholder: "פרט את אופן התשלום" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: handleAddOuting, disabled: !canSaveOuting, children: "הוסף" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: confirmAction?.type === "basket", onOpenChange: (o) => {
      if (!o) setConfirmAction(null);
    }, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
          "קיבל סל – ",
          confirmAction?.bachur.name
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "הבחור יסומן כמקבל סל ויועבר לרשימת הסגורים. פעולה זו תרשום גם הוצאת סבסוד.",
          /* @__PURE__ */ jsx("br", {}),
          "האם אתה בטוח?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => confirmAction && handleBasket(confirmAction.bachur), children: "אישור" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: confirmAction?.type === "married", onOpenChange: (o) => {
      if (!o) setConfirmAction(null);
    }, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
          "התחתן – ",
          confirmAction?.bachur.name
        ] }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: confirmAction?.bachur && !confirmAction.bachur.receivedBasket && totalIncome(confirmAction.bachur) > 0 ? `כל הכסף שהכניס (${fmtCurrency(totalIncome(confirmAction.bachur))}) יועבר כתרומה לקופת העמותה.` : "הבחור יועבר לרשימת הסגורים." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 pb-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "תאריך חתונה" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: marriedDate, onChange: (e) => {
          setMarriedDate(e.target.value);
          setConfirmAction(confirmAction ? { ...confirmAction, date: new Date(e.target.value).toISOString() } : null);
        }, className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => confirmAction && handleMarried(confirmAction.bachur), children: "אישור" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: confirmAction?.type === "cancel", onOpenChange: (o) => {
      if (!o) setConfirmAction(null);
    }, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
          "ביטול סטטוס – ",
          confirmAction?.bachur.name
        ] }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "הבחור יוחזר לרשימת הפעילים. האם אתה בטוח?" })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => confirmAction && handleCancelClosed(confirmAction.bachur), children: "אישור" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!editingOuting, onOpenChange: (o) => {
      if (!o) setEditingOuting(null);
    }, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "עריכת פעולה" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: selectedBachur?.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "שם היציאה" }),
          /* @__PURE__ */ jsx(Input, { value: editOutingName, onChange: (e) => setEditOutingName(e.target.value), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "תאריך" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: editOutingDate, onChange: (e) => setEditOutingDate(e.target.value), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "סכום (₪)" }),
          /* @__PURE__ */ jsx(Input, { type: "number", value: editOutingAmount, onChange: (e) => setEditOutingAmount(e.target.value), className: "mt-1", min: 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "אופן תשלום" }),
          /* @__PURE__ */ jsxs(Select, { value: editOutingPayment, onValueChange: (v) => {
            setEditOutingPayment(v);
            if (v !== "אחר") setEditOutingPaymentDetail("");
          }, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "מזומן", children: "מזומן" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "אשראי", children: "אשראי" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "אחר", children: "אחר" })
            ] })
          ] })
        ] }),
        editOutingPayment === "אחר" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "פירוט אופן תשלום" }),
          /* @__PURE__ */ jsx(Input, { value: editOutingPaymentDetail, onChange: (e) => setEditOutingPaymentDetail(e.target.value), className: "mt-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: handleEditOuting, children: "שמור שינויים" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!deleteOutingId, onOpenChange: (o) => {
      if (!o) setDeleteOutingId(null);
    }, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "מחיקת פעולה" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "האם אתה בטוח שברצונך למחוק את הפעולה הזו? הפעולה לא ניתנת לשחזור." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDeleteOuting, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "מחק" })
      ] })
    ] }) })
  ] });
}
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      className: cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";
const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    ),
    ...props
  }
));
Card.displayName = "Card";
const CardHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex flex-col space-y-1.5 p-6", className),
    ...props
  }
));
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("font-semibold leading-none tracking-tight", className),
    ...props
  }
));
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props }));
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("flex items-center p-6 pt-0", className),
    ...props
  }
));
CardFooter.displayName = "CardFooter";
function loadBachurim() {
  try {
    return JSON.parse(localStorage.getItem("bachurim") || "[]");
  } catch {
    return [];
  }
}
function loadAskanimIncomes() {
  try {
    return JSON.parse(localStorage.getItem("askanimIncomes") || "[]");
  } catch {
    return [];
  }
}
function saveAskanimIncomes(data) {
  localStorage.setItem("askanimIncomes", JSON.stringify(data));
}
function addToAmutaIncome(description, amount, date) {
  try {
    const incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
    incomes.push({
      id: crypto.randomUUID(),
      description,
      amount,
      date,
      category: "פרויקט עסקנים",
      target: "עמותה"
    });
    localStorage.setItem("incomes", JSON.stringify(incomes));
  } catch {
  }
}
function today$3() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function AskanimModule() {
  const [bachurim, setBachurim] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedBachur, setSelectedBachur] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [removeFromAskanimTarget, setRemoveFromAskanimTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formDate, setFormDate] = useState(today$3());
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const refresh = useCallback(() => {
    setBachurim(loadBachurim());
    setIncomes(loadAskanimIncomes());
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const { highlightedId, registerRow } = useFocusRow("askanim");
  const askanimBachurim = bachurim.filter((b) => b.inAskanim && !b.married);
  const q = searchQuery.trim().toLowerCase();
  const filteredBachurim = q ? askanimBachurim.filter((b) => b.name.toLowerCase().includes(q) || b.sku.toLowerCase().includes(q)) : askanimBachurim;
  const filteredIncomes = q ? incomes.filter((i) => i.bachurName.toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q)) : incomes;
  const totalRaised = incomes.reduce((s, i) => s + i.amount, 0);
  const totalByBachur = (bachurId) => incomes.filter((i) => i.bachurId === bachurId).reduce((s, i) => s + i.amount, 0);
  function openAddDialog(b) {
    setSelectedBachur(b);
    setFormDate(today$3());
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
    const newIncome = {
      id: crypto.randomUUID(),
      bachurId: selectedBachur.id,
      bachurName: selectedBachur.name,
      date: formDate,
      amount,
      notes: formNotes
    };
    const updated = [...incomes, newIncome];
    saveAskanimIncomes(updated);
    setIncomes(updated);
    addToAmutaIncome(`פרויקט עסקנים – ${selectedBachur.name}`, amount, formDate);
    toast.success("ההכנסה נשמרה בהצלחה");
    setAddDialogOpen(false);
  }
  function handleDeleteIncome() {
    if (!deleteTarget) return;
    const updated = incomes.filter((i) => i.id !== deleteTarget.id);
    saveAskanimIncomes(updated);
    setIncomes(updated);
    toast.success("ההכנסה נמחקה");
    setDeleteTarget(null);
  }
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
  async function handleImportExcel(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX2 = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX2.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX2.utils.sheet_to_json(ws);
      const currentBachurim = loadBachurim();
      const askanimNames = new Set(
        currentBachurim.filter((b) => b.inAskanim).map((b) => b.name)
      );
      let imported = 0;
      let skipped = 0;
      const newIncomes = [];
      for (const row of rows) {
        const name = String(row["שם בחור"] || row["שם"] || "").trim();
        const amount = Number(row["סכום"] || 0);
        const date = String(row["תאריך"] || today$3()).trim();
        const notes = String(row["הערות"] || "").trim();
        if (!name || !amount) {
          skipped++;
          continue;
        }
        if (!askanimNames.has(name)) {
          skipped++;
          continue;
        }
        const bachur = currentBachurim.find((b) => b.name === name && b.inAskanim);
        if (!bachur) {
          skipped++;
          continue;
        }
        const income = {
          id: crypto.randomUUID(),
          bachurId: bachur.id,
          bachurName: name,
          date,
          amount,
          notes
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
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", dir: "rtl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[hsl(var(--primary))]", children: "פרויקט עסקנים" }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "relative", asChild: true, children: /* @__PURE__ */ jsxs("label", { className: "cursor-pointer", children: [
        /* @__PURE__ */ jsx(Upload, { className: "ml-2 h-4 w-4" }),
        "ייבוא Excel",
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            accept: ".xlsx,.xls",
            className: "sr-only",
            onChange: handleImportExcel
          }
        )
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsx(CardContent, { className: "py-4 px-6", children: /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold", children: [
      'סה"כ גויס בפרויקט:',
      " ",
      /* @__PURE__ */ jsxs("span", { className: "text-[hsl(var(--accent-foreground))]", children: [
        totalRaised.toLocaleString("he-IL"),
        " ₪"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center bg-muted/30 p-3 rounded-lg border border-border", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "חיפוש לפי שם, מק״ט או הערות...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pr-8"
          }
        )
      ] }),
      q && /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setSearchQuery(""), className: "gap-1", children: [
        /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
        " נקה"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "משתתפים בפרויקט" }),
      filteredBachurim.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: q ? "לא נמצאו תוצאות חיפוש." : "אין בחורים משויכים לפרויקט. ניתן לצרף בחור דרך מודול הבחורים." }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]", children: [
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "שם" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: 'מק"ט' }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "שיעור" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: 'סה"כ גייס' }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "פעולות" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center w-12" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filteredBachurim.map((b) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: b.name }),
          /* @__PURE__ */ jsx(TableCell, { children: b.sku }),
          /* @__PURE__ */ jsx(TableCell, { children: b.classLevel }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            totalByBachur(b.id).toLocaleString("he-IL"),
            " ₪"
          ] }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => openAddDialog(b), children: [
            /* @__PURE__ */ jsx(Plus, { className: "ml-1 h-4 w-4" }),
            "הוסף הכנסה"
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "text-destructive hover:bg-destructive/10",
              title: "הסר מפרויקט עסקנים",
              onClick: () => setRemoveFromAskanimTarget(b),
              children: /* @__PURE__ */ jsx(UserMinus, { className: "h-4 w-4" })
            }
          ) })
        ] }, b.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "הכנסות פרויקט עסקנים" }),
      filteredIncomes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: q ? "לא נמצאו תוצאות חיפוש." : "אין הכנסות עדיין." }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]", children: [
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תאריך" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "שם הבחור" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "סכום" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "הערות" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "פעולות" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filteredIncomes.map((inc) => /* @__PURE__ */ jsxs(
          TableRow,
          {
            ref: registerRow(inc.id),
            className: highlightedId === inc.id ? "ring-2 ring-primary ring-inset bg-primary/5" : "",
            children: [
              /* @__PURE__ */ jsx(TableCell, { children: inc.date }),
              /* @__PURE__ */ jsx(TableCell, { children: inc.bachurName }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                inc.amount.toLocaleString("he-IL"),
                " ₪"
              ] }),
              /* @__PURE__ */ jsx(TableCell, { className: "max-w-[200px] truncate", children: inc.notes || "—" }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "destructive",
                  size: "sm",
                  onClick: () => setDeleteTarget(inc),
                  children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "ml-1 h-4 w-4" }),
                    "מחק"
                  ]
                }
              ) })
            ]
          },
          inc.id
        )) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: addDialogOpen, onOpenChange: setAddDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "הוספת הכנסה לפרויקט עסקנים" }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "הוסף הכנסה עבור ",
          selectedBachur?.name
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "שם הבחור" }),
          /* @__PURE__ */ jsx(Input, { value: selectedBachur?.name || "", disabled: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "תאריך" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: formDate, onChange: (e) => setFormDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "סכום (₪)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              min: "0",
              value: formAmount,
              onChange: (e) => setFormAmount(e.target.value),
              placeholder: "הזן סכום"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "הערות" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              value: formNotes,
              onChange: (e) => setFormNotes(e.target.value),
              placeholder: "הערות (לא חובה)"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSaveIncome, children: "שמור" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (o) => !o && setDeleteTarget(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { dir: "rtl", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "מחיקת הכנסה" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "האם אתה בטוח שברצונך למחוק הכנסה של",
          " ",
          deleteTarget?.amount.toLocaleString("he-IL"),
          " ₪ עבור ",
          deleteTarget?.bachurName,
          "?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDeleteIncome, children: "מחק" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      AlertDialog,
      {
        open: !!removeFromAskanimTarget,
        onOpenChange: (o) => !o && setRemoveFromAskanimTarget(null),
        children: /* @__PURE__ */ jsxs(AlertDialogContent, { dir: "rtl", children: [
          /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsx(AlertDialogTitle, { children: "הסרה מפרויקט עסקנים" }),
            /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
              "האם להסיר את ",
              removeFromAskanimTarget?.name,
              " מרשימת פרויקט עסקנים? ההכנסות הקיימות יישמרו, אך הבחור יוסר מטבלת המשתתפים."
            ] })
          ] }),
          /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
            /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleRemoveFromAskanim, children: "הסר" })
          ] })
        ] })
      }
    )
  ] });
}
function today$2() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function IncomesModule() {
  const { incomes, setIncomes, fundraisers, setFundraisers } = useData();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [manageFundraisersOpen, setManageFundraisersOpen] = useState(false);
  const [newFundraiserName, setNewFundraiserName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(today$2());
  const [formNotes, setFormNotes] = useState("");
  const [formFundraiser, setFormFundraiser] = useState("");
  function openEditById(id) {
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
    setFormDate(today$2());
    setFormNotes("");
    setFormFundraiser("");
    setAddDialogOpen(true);
  }
  function openEdit(inc) {
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
      const updated = incomes.map(
        (i) => i.id === editTarget.id ? { ...i, description: formNotes.trim(), amount, date: formDate, fundraiser: formFundraiser } : i
      );
      setIncomes(updated);
      toast.success("ההכנסה עודכנה");
    } else {
      const newIncome = {
        id: crypto.randomUUID(),
        description: formNotes.trim(),
        amount,
        date: formDate,
        recognized: false,
        fundraiser: formFundraiser
      };
      setIncomes([...incomes, newIncome]);
      toast.success("ההכנסה נוספה בהצלחה");
    }
    setEditTarget(null);
    setAddDialogOpen(false);
  }
  function toggleRecognized(id) {
    const updated = incomes.map(
      (i) => i.id === id ? { ...i, recognized: !i.recognized, recognizedDate: !i.recognized ? today$2() : void 0 } : i
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
  function deleteFundraiser(name) {
    const usedBy = incomes.filter((i) => i.fundraiser === name);
    if (usedBy.length > 0) {
      toast.error(`לא ניתן למחוק – למתרים "${name}" יש ${usedBy.length} הכנסות רשומות`);
      return;
    }
    setFundraisers(fundraisers.filter((f) => f !== name));
    toast.success("מתרים נמחק");
  }
  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX2 = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX2.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX2.utils.sheet_to_json(ws);
      let imported = 0;
      let skipped = 0;
      const newIncomes = [];
      for (const row of rows) {
        const notes = String(row["הערות"] || row["תיאור"] || "").trim();
        const amount = Number(row["סכום"] || 0);
        const date = String(row["תאריך"] || today$2()).trim();
        const fundraiser = String(row["מתרים"] || "שונות").trim();
        if (!notes) {
          skipped++;
          continue;
        }
        if (!amount || amount <= 0) {
          skipped++;
          continue;
        }
        newIncomes.push({
          id: crypto.randomUUID(),
          description: notes,
          amount,
          date,
          recognized: false,
          fundraiser
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
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", dir: "rtl", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between flex-wrap gap-4", children: /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[hsl(var(--primary))]", children: "הכנסות" }) }),
    /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsx(CardContent, { className: "py-4 px-6", children: /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold", children: [
      'סה"כ הכנסות עמותה:',
      " ",
      /* @__PURE__ */ jsxs("span", { className: "text-[hsl(var(--accent-foreground))]", children: [
        total.toLocaleString("he-IL"),
        " ₪"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs(Button, { onClick: openAdd, children: [
        /* @__PURE__ */ jsx(Plus, { className: "ml-1 h-4 w-4" }),
        "הוסף הכנסה"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxs("label", { className: "cursor-pointer", children: [
        /* @__PURE__ */ jsx(Upload, { className: "ml-1 h-4 w-4" }),
        "ייבוא Excel",
        /* @__PURE__ */ jsx("input", { type: "file", accept: ".xlsx,.xls", className: "sr-only", onChange: handleImport })
      ] }) }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => setManageFundraisersOpen(true), children: [
        /* @__PURE__ */ jsx(Settings, { className: "ml-1 h-4 w-4" }),
        "ניהול מתרימים"
      ] })
    ] }),
    incomes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "אין הכנסות עדיין." }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]", children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תאריך" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תיאור / הערות" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "סכום" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "מתרים" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "מוכר בעמותה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "פעולות" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: incomes.map((inc) => /* @__PURE__ */ jsxs(
        TableRow,
        {
          ref: registerRow(inc.id),
          className: `${inc.auto ? "bg-sky-50 dark:bg-sky-950/20" : ""} ${highlightedId === inc.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`,
          children: [
            /* @__PURE__ */ jsx(TableCell, { children: inc.date }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsx("span", { children: inc.description }),
              inc.auto && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "mr-2 text-xs bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300", children: "אוטומטי" })
            ] }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              inc.amount.toLocaleString("he-IL"),
              " ₪"
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: inc.fundraiser || "—" }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: () => toggleRecognized(inc.id),
                className: inc.recognized ? "text-green-600" : "text-muted-foreground",
                children: inc.recognized ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(CheckCircle, { className: "ml-1 h-4 w-4" }),
                  "מוכר"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Circle, { className: "ml-1 h-4 w-4" }),
                  "לא מוכר"
                ] })
              }
            ) }),
            /* @__PURE__ */ jsxs(TableCell, { className: "text-center", children: [
              /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "ml-2", onClick: () => openEdit(inc), children: [
                /* @__PURE__ */ jsx(Pencil, { className: "ml-1 h-4 w-4" }),
                "ערוך"
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "destructive", size: "sm", onClick: () => setDeleteTarget(inc), children: [
                /* @__PURE__ */ jsx(Trash2, { className: "ml-1 h-4 w-4" }),
                "מחק"
              ] })
            ] })
          ]
        },
        inc.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: addDialogOpen, onOpenChange: (o) => {
      setAddDialogOpen(o);
      if (!o) setEditTarget(null);
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: editTarget ? "עריכת הכנסה" : "הוספת הכנסה" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: editTarget ? "עדכן את פרטי ההכנסה" : "הזן פרטי הכנסה חדשה לעמותה" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "סכום (₪)" }),
          /* @__PURE__ */ jsx(Input, { type: "number", min: "0", value: formAmount, onChange: (e) => setFormAmount(e.target.value), placeholder: "הזן סכום" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "תאריך" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: formDate, onChange: (e) => setFormDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "מתרים (חובה)" }),
          /* @__PURE__ */ jsxs(Select, { value: formFundraiser, onValueChange: setFormFundraiser, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "בחר מתרים..." }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: fundraisers.map((f) => /* @__PURE__ */ jsx(SelectItem, { value: f, children: f }, f)) })
          ] }),
          !formFundraiser && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive mt-1", children: "יש לבחור מתרים כדי לשמור" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "הערות (חובה)" }),
          /* @__PURE__ */ jsx(Textarea, { value: formNotes, onChange: (e) => setFormNotes(e.target.value), placeholder: "תיאור ההכנסה" }),
          formNotes.trim().length === 0 && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive mt-1", children: "יש למלא הערות כדי לשמור" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: !canSave, children: "שמור" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: manageFundraisersOpen, onOpenChange: setManageFundraisersOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "ניהול מתרימים" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "הוסף או הסר מתרימים מהרשימה" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              value: newFundraiserName,
              onChange: (e) => setNewFundraiserName(e.target.value),
              placeholder: "שם מתרים חדש",
              onKeyDown: (e) => e.key === "Enter" && addFundraiser()
            }
          ),
          /* @__PURE__ */ jsxs(Button, { onClick: addFundraiser, disabled: !newFundraiserName.trim(), children: [
            /* @__PURE__ */ jsx(Plus, { className: "ml-1 h-4 w-4" }),
            "הוסף"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border rounded-lg divide-y max-h-60 overflow-auto", children: fundraisers.map((f) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm", children: f }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "text-destructive h-7", onClick: () => deleteFundraiser(f), children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] }, f)) })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "סגור" }) }) })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (o) => !o && setDeleteTarget(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { dir: "rtl", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "מחיקת הכנסה" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "האם אתה בטוח שרוצה למחוק הכנסה זו? (",
          deleteTarget?.amount.toLocaleString("he-IL"),
          " ₪ – ",
          deleteTarget?.description,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDelete, children: "מחק" })
      ] })
    ] }) })
  ] });
}
const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Root,
    {
      className: cn("grid gap-2", className),
      ...props,
      ref
    }
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Item,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(Circle, { className: "h-3.5 w-3.5 fill-primary" }) })
    }
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  ScrollAreaPrimitive.Root,
  {
    ref,
    className: cn("relative overflow-hidden", className),
    ...props,
    children: [
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }),
      /* @__PURE__ */ jsx(ScrollBar, {}),
      /* @__PURE__ */ jsx(ScrollAreaPrimitive.Corner, {})
    ]
  }
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsx(
  ScrollAreaPrimitive.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
const DEFAULT_SUB_SALIM = ["גור", "דקל", 'חכ"ם', "אוצרות ההלבשה", "אותיות", "פרוכטר", "גפנרס", "שונות"];
const DEFAULT_SUB_AMUTA = ["משרד", "פרויקט עסקנים", "משכורת", "פעילות", "טלמרקטינג", "שונות"];
function loadExpenses() {
  try {
    const raw = JSON.parse(localStorage.getItem("expenses") || "[]");
    return raw.map((e) => ({ ...e, recognized: e.recognized ?? false }));
  } catch {
    return [];
  }
}
function saveExpenses(data) {
  localStorage.setItem("expenses", JSON.stringify(data));
}
function loadCategories(key, defaults) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return [...new Set(parsed)];
    }
  } catch {
  }
  return defaults;
}
function saveCategories(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function today$1() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function ExpensesModule() {
  const [expenses, setExpenses] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [catOpen, setCatOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [catsSalim, setCatsSalim] = useState(() => loadCategories("expense_cats_salim", DEFAULT_SUB_SALIM));
  const [catsAmuta, setCatsAmuta] = useState(() => loadCategories("expense_cats_amuta", DEFAULT_SUB_AMUTA));
  const [newCatSalim, setNewCatSalim] = useState("");
  const [newCatAmuta, setNewCatAmuta] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(today$1());
  const [formCategory, setFormCategory] = useState("");
  const [formSub, setFormSub] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formRecognized, setFormRecognized] = useState(false);
  const [formInvoiceName, setFormInvoiceName] = useState();
  const [formInvoiceData, setFormInvoiceData] = useState();
  const [formInvoiceType, setFormInvoiceType] = useState();
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadFrom, setDownloadFrom] = useState("");
  const [downloadTo, setDownloadTo] = useState("");
  const refresh = useCallback(() => setExpenses(loadExpenses()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const openEditById = useCallback((id) => {
    const exp = loadExpenses().find((e) => e.id === id);
    if (exp) openEdit(exp);
  }, []);
  const { highlightedId, registerRow } = useFocusRow("expenses", openEditById);
  useEffect(() => {
    saveCategories("expense_cats_salim", catsSalim);
  }, [catsSalim]);
  useEffect(() => {
    saveCategories("expense_cats_amuta", catsAmuta);
  }, [catsAmuta]);
  const totalSalim = expenses.filter((e) => e.category === "סלים").reduce((s, e) => s + e.amount, 0);
  const totalAmuta = expenses.filter((e) => e.category === "עמותה").reduce((s, e) => s + e.amount, 0);
  const subOptions = formCategory === "סלים" ? catsSalim : formCategory === "עמותה" ? catsAmuta : [];
  const needsInvoice = formCategory === "עמותה" && formRecognized;
  const canSave = Number(formAmount) > 0 && formCategory && formSub && (!needsInvoice || !!formInvoiceData);
  function addCategory(type) {
    const name = type === "salim" ? newCatSalim.trim() : newCatAmuta.trim();
    if (!name) return;
    const list = type === "salim" ? catsSalim : catsAmuta;
    if (list.includes(name)) {
      toast.error("קטגוריה כבר קיימת");
      return;
    }
    if (type === "salim") {
      setCatsSalim([...catsSalim, name]);
      setNewCatSalim("");
    } else {
      setCatsAmuta([...catsAmuta, name]);
      setNewCatAmuta("");
    }
    toast.success("קטגוריה נוספה");
  }
  function deleteCategory(type, name) {
    const catKey = type === "salim" ? "סלים" : "עמותה";
    const hasExpenses = expenses.some((e) => e.category === catKey && e.subCategory === name);
    if (hasExpenses) {
      toast.error("לא ניתן למחוק קטגוריה שיש לה הוצאות רשומות");
      return;
    }
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
    if (newName !== oldName && list.includes(newName)) {
      toast.error("קטגוריה כבר קיימת");
      return;
    }
    const updated = [...list];
    updated[editingCat.index] = newName;
    if (editingCat.type === "salim") setCatsSalim(updated);
    else setCatsAmuta(updated);
    if (newName !== oldName) {
      const catKey = editingCat.type === "salim" ? "סלים" : "עמותה";
      const updatedExp = expenses.map(
        (e) => e.category === catKey && e.subCategory === oldName ? { ...e, subCategory: newName } : e
      );
      saveExpenses(updatedExp);
      setExpenses(updatedExp);
    }
    setEditingCat(null);
    toast.success("קטגוריה עודכנה");
  }
  function openAdd() {
    setFormAmount("");
    setFormDate(today$1());
    setFormCategory("");
    setFormSub("");
    setFormNotes("");
    setFormContact("");
    setFormRecognized(false);
    setFormInvoiceName(void 0);
    setFormInvoiceData(void 0);
    setFormInvoiceType(void 0);
    setEditTarget(null);
    setAddOpen(true);
  }
  function openEdit(exp) {
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
    const invoiceFields = recognized ? { invoiceFileName: formInvoiceName, invoiceFileData: formInvoiceData, invoiceFileType: formInvoiceType } : { invoiceFileName: void 0, invoiceFileData: void 0, invoiceFileType: void 0 };
    if (editTarget) {
      const updated = expenses.map(
        (e) => e.id === editTarget.id ? {
          ...e,
          amount,
          date: formDate,
          category: formCategory,
          subCategory: formSub,
          notes: formNotes.trim(),
          contactPerson: formContact.trim(),
          recognized,
          recognizedDate: recognized ? e.recognizedDate || today$1() : void 0,
          ...invoiceFields
        } : e
      );
      saveExpenses(updated);
      setExpenses(updated);
      toast.success("ההוצאה עודכנה בהצלחה");
    } else {
      const newExp = {
        id: crypto.randomUUID(),
        amount,
        date: formDate,
        category: formCategory,
        subCategory: formSub,
        notes: formNotes.trim(),
        contactPerson: formContact.trim(),
        recognized,
        recognizedDate: recognized ? today$1() : void 0,
        ...invoiceFields
      };
      const updated = [...expenses, newExp];
      saveExpenses(updated);
      setExpenses(updated);
      toast.success("ההוצאה נוספה בהצלחה");
    }
    setEditTarget(null);
    setAddOpen(false);
  }
  async function handleInvoiceUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("הקובץ גדול מ-5MB. אנא בחר קובץ קטן יותר.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormInvoiceData(reader.result);
      setFormInvoiceName(file.name);
      setFormInvoiceType(file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  function downloadInvoice(exp) {
    if (!exp.invoiceFileData) return;
    const a = document.createElement("a");
    a.href = exp.invoiceFileData;
    a.download = exp.invoiceFileName || `invoice-${exp.id}`;
    a.click();
  }
  function openDownload() {
    const now = /* @__PURE__ */ new Date();
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
      (e) => e.category === "עמותה" && e.recognized && e.invoiceFileData && e.date >= downloadFrom && e.date <= downloadTo
    );
    if (matches.length === 0) {
      toast.error("לא נמצאו חשבוניות בטווח שנבחר");
      return;
    }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const e of matches) {
        const dataUrl = e.invoiceFileData;
        const base64 = dataUrl.split(",")[1] || "";
        const ext = (e.invoiceFileName?.split(".").pop() || "bin").toLowerCase();
        const safeContact = (e.contactPerson || "ללא").replace(/[\\/:*?"<>|]/g, "_");
        const fname = `${e.date}_${safeContact}_${e.amount}.${ext}`;
        zip.file(fname, base64, { base64: true });
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const HEB_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
      const f = new Date(downloadFrom);
      const t = new Date(downloadTo);
      const isFullMonth = f.getFullYear() === t.getFullYear() && f.getMonth() === t.getMonth() && f.getDate() === 1 && t.getDate() === new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
      const zipName = isFullMonth ? `חשבוניות חודש ${HEB_MONTHS[f.getMonth()]} ${f.getFullYear()}.zip` : `חשבוניות ${downloadFrom} - ${downloadTo}.zip`;
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
  function handleDelete() {
    if (!deleteTarget) return;
    const updated = expenses.filter((e) => e.id !== deleteTarget.id);
    saveExpenses(updated);
    setExpenses(updated);
    toast.success("ההוצאה נמחקה");
    setDeleteTarget(null);
  }
  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const XLSX2 = await import("xlsx");
      const data = await file.arrayBuffer();
      const wb = XLSX2.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX2.utils.sheet_to_json(ws);
      let imported = 0;
      let skipped = 0;
      const newExps = [];
      for (const row of rows) {
        const notes = String(row["הערות"] || "").trim();
        const amount = Number(row["סכום"] || 0);
        const date = String(row["תאריך"] || today$1()).trim();
        const cat = String(row["עבור"] || "").trim();
        const sub = String(row["פרטים"] || "").trim();
        const contact = String(row["איש קשר"] || "").trim();
        if (!notes || !amount || amount <= 0 || !contact) {
          skipped++;
          continue;
        }
        const category = cat === "סלים" || cat === "עבור הסלים" ? "סלים" : cat === "עמותה" || cat === "עבור העמותה" ? "עמותה" : "";
        if (!category) {
          skipped++;
          continue;
        }
        newExps.push({
          id: crypto.randomUUID(),
          amount,
          date,
          category,
          subCategory: sub || "שונות",
          notes,
          contactPerson: contact,
          recognized: false
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
  function renderCategoryList(type, list, newVal, setNewVal) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx(ScrollArea, { className: "max-h-[55vh] pr-2", children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: list.map((cat, idx) => /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 p-2 rounded-md border bg-muted/30", children: editingCat?.type === type && editingCat.index === idx ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            value: editingCat.value,
            onChange: (e) => setEditingCat({ ...editingCat, value: e.target.value }),
            className: "flex-1 h-8",
            autoFocus: true,
            onKeyDown: (e) => e.key === "Enter" && saveEditCategory()
          }
        ),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "default", onClick: saveEditCategory, className: "h-8", children: "שמור" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setEditingCat(null), className: "h-8", children: "ביטול" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm font-medium", children: cat }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", onClick: () => setEditingCat({ type, index: idx, value: cat }), children: /* @__PURE__ */ jsx(Pencil, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0 text-destructive hover:text-destructive", onClick: () => deleteCategory(type, cat), children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
      ] }) }, cat)) }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            value: newVal,
            onChange: (e) => setNewVal(e.target.value),
            placeholder: "שם קטגוריה חדשה",
            className: "flex-1",
            onKeyDown: (e) => e.key === "Enter" && addCategory(type)
          }
        ),
        /* @__PURE__ */ jsxs(Button, { onClick: () => addCategory(type), disabled: !newVal.trim(), children: [
          /* @__PURE__ */ jsx(Plus, { className: "ml-1 h-4 w-4" }),
          "הוסף קטגוריה"
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", dir: "rtl", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[hsl(var(--primary))]", children: "הוצאות" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: 'סה"כ הוצאות סלים' }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold", children: [
          totalSalim.toLocaleString("he-IL"),
          " ₪"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: 'סה"כ הוצאות עמותה' }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold", children: [
          totalAmuta.toLocaleString("he-IL"),
          " ₪"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs(Button, { onClick: openAdd, children: [
        /* @__PURE__ */ jsx(Plus, { className: "ml-1 h-4 w-4" }),
        "הוסף הוצאה"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxs("label", { className: "cursor-pointer", children: [
        /* @__PURE__ */ jsx(Upload, { className: "ml-1 h-4 w-4" }),
        "ייבוא Excel",
        /* @__PURE__ */ jsx("input", { type: "file", accept: ".xlsx,.xls", className: "sr-only", onChange: handleImport })
      ] }) }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => {
        setEditingCat(null);
        setCatOpen(true);
      }, children: [
        /* @__PURE__ */ jsx(Settings, { className: "ml-1 h-4 w-4" }),
        "ניהול קטגוריות ⚙️"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: openDownload, children: [
        /* @__PURE__ */ jsx(Download, { className: "ml-1 h-4 w-4" }),
        "הורד חשבוניות"
      ] })
    ] }),
    expenses.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "אין הוצאות עדיין." }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]", children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תאריך" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "קטגוריה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תת-קטגוריה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "פירוט" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "סכום" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "איש קשר" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "הערות" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "מוכר בעמותה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "פעולות" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: expenses.map((exp) => /* @__PURE__ */ jsxs(
        TableRow,
        {
          ref: registerRow(exp.id),
          className: `${exp.auto ? "bg-sky-50 dark:bg-sky-950/20" : ""} ${highlightedId === exp.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`,
          children: [
            /* @__PURE__ */ jsx(TableCell, { children: exp.date }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: exp.category === "סלים" ? "default" : "secondary", children: exp.category === "סלים" ? "עבור הסלים" : "עבור העמותה" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: exp.subCategory }),
            /* @__PURE__ */ jsxs(TableCell, { className: "max-w-[150px] truncate", children: [
              exp.subCategory,
              exp.auto && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "mr-2 text-xs bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300", children: "אוטומטי" })
            ] }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              exp.amount.toLocaleString("he-IL"),
              " ₪"
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: exp.contactPerson || "—" }),
            /* @__PURE__ */ jsx(TableCell, { className: "max-w-[150px] truncate", children: exp.notes }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: exp.recognized ? "default" : "secondary",
                  className: exp.recognized ? "bg-green-600 hover:bg-green-700" : "",
                  children: exp.recognized ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(CheckCircle, { className: "ml-1 h-3 w-3" }),
                    "מוכר"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Circle, { className: "ml-1 h-3 w-3" }),
                    "לא מוכר"
                  ] })
                }
              ),
              exp.invoiceFileData && /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 w-7 p-0",
                  onClick: () => downloadInvoice(exp),
                  title: `הורד: ${exp.invoiceFileName}`,
                  children: /* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4 text-primary" })
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: exp.auto ? /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "לא ניתן למחיקה" }) : /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-center", children: [
              /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => openEdit(exp), children: [
                /* @__PURE__ */ jsx(Pencil, { className: "ml-1 h-4 w-4" }),
                "ערוך"
              ] }),
              /* @__PURE__ */ jsxs(Button, { variant: "destructive", size: "sm", onClick: () => setDeleteTarget(exp), children: [
                /* @__PURE__ */ jsx(Trash2, { className: "ml-1 h-4 w-4" }),
                "מחק"
              ] })
            ] }) })
          ]
        },
        exp.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) setEditTarget(null);
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md max-h-[85vh] overflow-y-auto", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: editTarget ? "עריכת הוצאה" : "הוספת הוצאה" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: editTarget ? "עדכן את פרטי ההוצאה" : "הזן פרטי הוצאה חדשה" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "סכום (₪)" }),
          /* @__PURE__ */ jsx(Input, { type: "number", min: "0", value: formAmount, onChange: (e) => setFormAmount(e.target.value), placeholder: "הזן סכום" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "תאריך" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: formDate, onChange: (e) => setFormDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "עבור" }),
          /* @__PURE__ */ jsxs(Select, { value: formCategory, onValueChange: (v) => {
            setFormCategory(v);
            setFormSub("");
          }, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "בחר קטגוריה" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "סלים", children: "עבור הסלים" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "עמותה", children: "עבור העמותה" })
            ] })
          ] })
        ] }),
        formCategory && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "פרטים" }),
          /* @__PURE__ */ jsxs(Select, { value: formSub, onValueChange: setFormSub, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "בחר תת-קטגוריה" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: subOptions.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        formCategory === "עמותה" && /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-3 rounded-md border bg-muted/30", children: [
          /* @__PURE__ */ jsx(Label, { children: "סטטוס הכרה בעמותה" }),
          /* @__PURE__ */ jsxs(
            RadioGroup,
            {
              value: formRecognized ? "yes" : "no",
              onValueChange: (v) => setFormRecognized(v === "yes"),
              className: "flex gap-4",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "no", id: "rec-no" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "rec-no", className: "font-normal cursor-pointer", children: "לא מוכר בעמותה" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "yes", id: "rec-yes" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "rec-yes", className: "font-normal cursor-pointer", children: "מוכר בעמותה" })
                ] })
              ]
            }
          ),
          formRecognized && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "חשבונית (חובה)" }),
            formInvoiceName ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 rounded-md border bg-background", children: [
              /* @__PURE__ */ jsx(Paperclip, { className: "h-4 w-4 text-primary shrink-0" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm flex-1 truncate", children: formInvoiceName }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  className: "h-7 w-7 p-0",
                  onClick: () => {
                    setFormInvoiceData(void 0);
                    setFormInvoiceName(void 0);
                    setFormInvoiceType(void 0);
                  },
                  children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
                }
              )
            ] }) : /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", asChild: true, className: "w-full", children: /* @__PURE__ */ jsxs("label", { className: "cursor-pointer", children: [
              /* @__PURE__ */ jsx(Upload, { className: "ml-1 h-4 w-4" }),
              "העלה חשבונית",
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "file",
                  accept: "image/*,application/pdf",
                  className: "sr-only",
                  onChange: handleInvoiceUpload
                }
              )
            ] }) }),
            !formInvoiceData && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: "יש להעלות חשבונית כדי לשמור הוצאה מוכרת" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "איש קשר" }),
          /* @__PURE__ */ jsx(Input, { value: formContact, onChange: (e) => setFormContact(e.target.value), placeholder: "שם איש הקשר" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "הערות" }),
          /* @__PURE__ */ jsx(Textarea, { value: formNotes, onChange: (e) => setFormNotes(e.target.value), placeholder: "תיאור ההוצאה" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: !canSave, children: "שמור" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: downloadOpen, onOpenChange: setDownloadOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "הורדת חשבוניות לפי תקופה" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "בחר טווח תאריכים. הקובץ יישמר כ-ZIP." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "מתאריך" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: downloadFrom, onChange: (e) => setDownloadFrom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "עד תאריך" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: downloadTo, onChange: (e) => setDownloadTo(e.target.value) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleDownloadInvoices, children: [
          /* @__PURE__ */ jsx(Download, { className: "ml-1 h-4 w-4" }),
          "הורד ZIP"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: catOpen, onOpenChange: setCatOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-lg max-h-[85vh] flex flex-col", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "ניהול קטגוריות הוצאות" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "הוסף, ערוך או מחק קטגוריות הוצאות" })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { defaultValue: "salim", className: "w-full", children: [
        /* @__PURE__ */ jsxs(TabsList, { className: "w-full", children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "salim", className: "flex-1", children: "קטגוריות סלים" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "amuta", className: "flex-1", children: "קטגוריות עמותה" })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "salim", className: "mt-4", children: renderCategoryList("salim", catsSalim, newCatSalim, setNewCatSalim) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "amuta", className: "mt-4", children: renderCategoryList("amuta", catsAmuta, newCatAmuta, setNewCatAmuta) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (o) => !o && setDeleteTarget(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { dir: "rtl", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "מחיקת הוצאה" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "האם אתה בטוח שרוצה למחוק הוצאה זו? (",
          deleteTarget?.amount.toLocaleString("he-IL"),
          " ₪ – ",
          deleteTarget?.notes,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDelete, children: "מחק" })
      ] })
    ] }) })
  ] });
}
const PAY_MARKER = "\n__PAYMENTS__:";
const STORAGE_KEY = "debts";
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
}
function parseNotes(d) {
  const raw = d.notes || "";
  const idx = raw.indexOf(PAY_MARKER);
  if (idx !== -1) {
    const generalNote = raw.slice(0, idx);
    try {
      const payments = JSON.parse(raw.slice(idx + PAY_MARKER.length));
      return { generalNote, payments: Array.isArray(payments) ? payments : [] };
    } catch {
      return { generalNote, payments: [] };
    }
  }
  if (d.returned && (d.returnedAmount || 0) > 0) {
    return {
      generalNote: raw,
      payments: [{
        id: crypto.randomUUID(),
        date: d.returnedDate || d.date,
        amount: Number(d.returnedAmount) || 0,
        via: d.returnedVia || "",
        note: ""
      }]
    };
  }
  return { generalNote: raw, payments: [] };
}
function serializeNotes(generalNote, payments) {
  if (payments.length === 0) return generalNote;
  return `${generalNote}${PAY_MARKER}${JSON.stringify(payments)}`;
}
function applyChanges(d, generalNote, payments) {
  const total = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const isReturned = total >= d.amount && payments.length > 0;
  const last = payments[payments.length - 1];
  return {
    ...d,
    notes: serializeNotes(generalNote, payments),
    returned: isReturned,
    returnedAmount: payments.length > 0 ? total : void 0,
    returnedVia: last?.via || void 0,
    returnedDate: last?.date || void 0
  };
}
function loadDebts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveDebts(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function incomeIdForPayment(paymentId) {
  return `debt-pay-${paymentId}`;
}
function DebtsModule() {
  const { incomes, setIncomes } = useData();
  const [debts, setDebts] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [formDate, setFormDate] = useState(today());
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [payDate, setPayDate] = useState(today());
  const [payAmount, setPayAmount] = useState("");
  const [payVia, setPayVia] = useState("");
  const [payNote, setPayNote] = useState("");
  const [editingGeneral, setEditingGeneral] = useState("");
  const [editingDebt, setEditingDebt] = useState(false);
  const [editDebtAmount, setEditDebtAmount] = useState("");
  const [editDebtDate, setEditDebtDate] = useState("");
  const [editDebtName, setEditDebtName] = useState("");
  const [deletePaymentId, setDeletePaymentId] = useState(null);
  const [editPayId, setEditPayId] = useState(null);
  const [editPayDate, setEditPayDate] = useState("");
  const [editPayAmount, setEditPayAmount] = useState("");
  const [editPayVia, setEditPayVia] = useState("");
  const [editPayNote, setEditPayNote] = useState("");
  const refresh = useCallback(() => setDebts(loadDebts()), []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    if (incomes.length === 0 && debts.length === 0) return;
    const existingIncomeIds = new Set(incomes.map((i) => i.id));
    const toAdd = [];
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
            fundraiser: "החזרי הלוואות"
          });
        }
      }
    }
    if (toAdd.length > 0) {
      setIncomes([...incomes, ...toAdd]);
    }
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
    setPayDate(today());
    setPayAmount("");
    setPayVia("");
    setPayNote("");
  }, [detailId]);
  const canSave = formName.trim().length > 0 && Number(formAmount) > 0 && formNotes.trim().length > 0;
  const canAddPayment = Number(payAmount) > 0 && payVia.trim().length > 0;
  function openAdd() {
    setFormDate(today());
    setFormName("");
    setFormAmount("");
    setFormNotes("");
    setAddOpen(true);
  }
  function handleSave() {
    if (!canSave) return;
    const newDebt = {
      id: crypto.randomUUID(),
      date: formDate,
      name: formName.trim(),
      amount: Number(formAmount),
      notes: formNotes.trim(),
      returned: false
    };
    const updated = [...debts, newDebt];
    saveDebts(updated);
    setDebts(updated);
    toast.success("החוב נוסף בהצלחה");
    setAddOpen(false);
  }
  function persistDebt(updated) {
    const next = debts.map((d) => d.id === updated.id ? updated : d);
    saveDebts(next);
    setDebts(next);
  }
  function handleAddPayment() {
    if (!detail || !canAddPayment) return;
    const p = {
      id: crypto.randomUUID(),
      date: payDate,
      amount: Number(payAmount),
      via: payVia.trim(),
      note: payNote.trim()
    };
    const newPayments = [...detail.parsed.payments, p];
    persistDebt(applyChanges(detail.debt, editingGeneral, newPayments));
    const newIncome = {
      id: incomeIdForPayment(p.id),
      description: `החזר הלוואה – ${detail.debt.name}`,
      amount: p.amount,
      date: p.date,
      recognized: true,
      auto: true,
      fundraiser: "החזרי הלוואות"
    };
    setIncomes([...incomes, newIncome]);
    setPayDate(today());
    setPayAmount("");
    setPayVia("");
    setPayNote("");
    toast.success("ההחזר נוסף");
  }
  function handleDeletePayment() {
    if (!detail || !deletePaymentId) return;
    const newPayments = detail.parsed.payments.filter((p) => p.id !== deletePaymentId);
    persistDebt(applyChanges(detail.debt, editingGeneral, newPayments));
    setIncomes(incomes.filter((i) => i.id !== incomeIdForPayment(deletePaymentId)));
    setDeletePaymentId(null);
    toast.success("ההחזר נמחק");
  }
  function startEditPayment(p) {
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
    const newPayments = detail.parsed.payments.map(
      (p) => p.id === editPayId ? { ...p, date: editPayDate, amount: Number(editPayAmount), via: editPayVia.trim(), note: editPayNote.trim() } : p
    );
    persistDebt(applyChanges(detail.debt, editingGeneral, newPayments));
    const incId = incomeIdForPayment(editPayId);
    setIncomes(incomes.map(
      (i) => i.id === incId ? { ...i, amount: Number(editPayAmount), date: editPayDate } : i
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
    saveDebts(next);
    setDebts(next);
    setEditingDebt(false);
    toast.success("פרטי ההלוואה עודכנו");
  }
  function handleDeleteDebt() {
    if (!deleteTarget) return;
    const updated = debts.filter((d) => d.id !== deleteTarget.id);
    saveDebts(updated);
    setDebts(updated);
    toast.success("החוב נמחק");
    setDeleteTarget(null);
    if (detailId === deleteTarget.id) setDetailId(null);
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", dir: "rtl", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[hsl(var(--primary))]", children: "חובות" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: 'סה"כ חובות' }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold", children: [
          totalDebt.toLocaleString("he-IL"),
          " ₪"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: 'סה"כ שולם' }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-green-600", children: [
          totalReturned.toLocaleString("he-IL"),
          " ₪"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "נשאר לגבות" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-red-600", children: [
          remaining.toLocaleString("he-IL"),
          " ₪"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Button, { onClick: openAdd, children: [
      /* @__PURE__ */ jsx(Plus, { className: "ml-1 h-4 w-4" }),
      "הוסף חוב"
    ] }),
    enriched.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "אין חובות עדיין." }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]", children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תאריך" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "שם" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "נשאר לגבות" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "הערה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "סטטוס" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: enriched.map(({ debt: d, parsed, remaining: rem, paid }) => /* @__PURE__ */ jsxs(
        TableRow,
        {
          ref: registerRow(d.id),
          onClick: () => setDetailId(d.id),
          className: `cursor-pointer hover:bg-primary/5 ${rem === 0 ? "bg-green-50 dark:bg-green-950/20" : ""} ${highlightedId === d.id ? "ring-2 ring-primary ring-inset bg-primary/5" : ""}`,
          children: [
            /* @__PURE__ */ jsx(TableCell, { children: d.date }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: d.name }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsxs("div", { className: "font-semibold", children: [
                rem.toLocaleString("he-IL"),
                " ₪"
              ] }),
              paid > 0 && rem > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "מתוך ",
                d.amount.toLocaleString("he-IL"),
                " ₪"
              ] })
            ] }),
            /* @__PURE__ */ jsx(TableCell, { className: "max-w-[260px] truncate", children: parsed.generalNote || "—" }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: rem === 0 ? /* @__PURE__ */ jsx(Badge, { className: "bg-green-600 text-white", children: "שולם" }) : paid > 0 ? /* @__PURE__ */ jsx(Badge, { className: "bg-amber-500 text-white", children: "חלקי" }) : /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "לא שולם" }) })
          ]
        },
        d.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: addOpen, onOpenChange: setAddOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "הוספת חוב" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "הזן פרטי חוב חדש" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "תאריך" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: formDate, onChange: (e) => setFormDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "שם (חובה)" }),
          /* @__PURE__ */ jsx(Input, { value: formName, onChange: (e) => setFormName(e.target.value), placeholder: "שם החייב" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "סכום חוב (₪)" }),
          /* @__PURE__ */ jsx(Input, { type: "number", min: "0", value: formAmount, onChange: (e) => setFormAmount(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "הערה כללית (חובה)" }),
          /* @__PURE__ */ jsx(Textarea, { value: formNotes, onChange: (e) => setFormNotes(e.target.value), placeholder: "הערה שתופיע בעמוד הראשי" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: !canSave, children: "שמור" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!detail, onOpenChange: (o) => !o && setDetailId(null), children: /* @__PURE__ */ jsx(DialogContent, { className: "sm:max-w-2xl max-h-[90vh] overflow-y-auto", dir: "rtl", children: detail && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: detail.debt.name }),
        /* @__PURE__ */ jsxs(DialogDescription, { children: [
          "הלוואה מ-",
          detail.debt.date
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "סכום ההלוואה" }),
          /* @__PURE__ */ jsxs("p", { className: "font-bold", children: [
            detail.debt.amount.toLocaleString("he-IL"),
            " ₪"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "הוחזר" }),
          /* @__PURE__ */ jsxs("p", { className: "font-bold text-green-600", children: [
            detail.paid.toLocaleString("he-IL"),
            " ₪"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "py-3 px-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "נשאר" }),
          /* @__PURE__ */ jsxs("p", { className: "font-bold text-red-600", children: [
            detail.remaining.toLocaleString("he-IL"),
            " ₪"
          ] })
        ] }) })
      ] }),
      editingDebt ? /* @__PURE__ */ jsxs("div", { className: "border rounded p-3 space-y-3 bg-muted/30", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "עריכת פרטי הלוואה" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "שם" }),
            /* @__PURE__ */ jsx(Input, { value: editDebtName, onChange: (e) => setEditDebtName(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "תאריך" }),
            /* @__PURE__ */ jsx(Input, { type: "date", value: editDebtDate, onChange: (e) => setEditDebtDate(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "סכום הלוואה (₪)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: "0", value: editDebtAmount, onChange: (e) => setEditDebtAmount(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Button, { size: "sm", onClick: saveEditDebt, disabled: Number(editDebtAmount) <= 0 || !editDebtName.trim(), children: "שמור" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => setEditingDebt(false), children: "ביטול" })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: openEditDebt, children: [
        /* @__PURE__ */ jsx(Pencil, { className: "ml-1 h-3 w-3" }),
        " ערוך פרטי הלוואה"
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "הערה כללית (מוצגת בעמוד הראשי)" }),
        /* @__PURE__ */ jsx(Textarea, { value: editingGeneral, onChange: (e) => setEditingGeneral(e.target.value) }),
        /* @__PURE__ */ jsx(Button, { size: "sm", className: "mt-2", onClick: handleSaveGeneralNote, children: "שמור הערה" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h3", { className: "font-semibold mb-2", children: [
          "החזרים (",
          detail.parsed.payments.length,
          ")"
        ] }),
        detail.parsed.payments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "לא בוצעו החזרים עדיין." }) : /* @__PURE__ */ jsx("div", { className: "rounded border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "תאריך" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סכום" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "באמצעות" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "הערה" }),
            /* @__PURE__ */ jsx(TableHead, {})
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: detail.parsed.payments.map((p) => editPayId === p.id ? /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/30", children: [
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Input, { type: "date", value: editPayDate, onChange: (e) => setEditPayDate(e.target.value), className: "h-8" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Input, { type: "number", min: "0", value: editPayAmount, onChange: (e) => setEditPayAmount(e.target.value), className: "h-8 w-24" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Input, { value: editPayVia, onChange: (e) => setEditPayVia(e.target.value), className: "h-8" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Input, { value: editPayNote, onChange: (e) => setEditPayNote(e.target.value), className: "h-8" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: saveEditPayment, title: "שמור", children: /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: cancelEditPayment, title: "ביטול", children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) })
            ] }) })
          ] }, p.id) : /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: p.date }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              p.amount.toLocaleString("he-IL"),
              " ₪"
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: p.via }),
            /* @__PURE__ */ jsx(TableCell, { className: "max-w-[200px] truncate", children: p.note || "—" }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => startEditPayment(p), title: "ערוך", children: /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" }) }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setDeletePaymentId(p.id), title: "מחק", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" }) })
            ] }) })
          ] }, p.id)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border rounded p-3 space-y-3 bg-muted/30", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "הוסף החזר חדש" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "תאריך" }),
            /* @__PURE__ */ jsx(Input, { type: "date", value: payDate, onChange: (e) => setPayDate(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "סכום (₪)" }),
            /* @__PURE__ */ jsx(Input, { type: "number", min: "0", value: payAmount, onChange: (e) => setPayAmount(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "באמצעות" }),
            /* @__PURE__ */ jsx(Input, { value: payVia, onChange: (e) => setPayVia(e.target.value), placeholder: "מזומן, העברה..." })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "הערה לפעולה זו" }),
            /* @__PURE__ */ jsx(Input, { value: payNote, onChange: (e) => setPayNote(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleAddPayment, disabled: !canAddPayment, size: "sm", children: [
          /* @__PURE__ */ jsx(Plus, { className: "ml-1 h-3 w-3" }),
          " הוסף החזר"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "flex flex-row-reverse justify-between gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => setDeleteTarget(detail.debt), children: [
          /* @__PURE__ */ jsx(Trash2, { className: "ml-1 h-4 w-4" }),
          " מחק חוב"
        ] }),
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "סגור" }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (o) => !o && setDeleteTarget(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { dir: "rtl", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "מחיקת חוב" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          "למחוק את החוב של ",
          deleteTarget?.name,
          " (",
          deleteTarget?.amount.toLocaleString("he-IL"),
          " ₪)?"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDeleteDebt, children: "מחק" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!deletePaymentId, onOpenChange: (o) => !o && setDeletePaymentId(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { dir: "rtl", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "מחיקת החזר" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "למחוק את ההחזר הזה?" })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDeletePayment, children: "מחק" })
      ] })
    ] }) })
  ] });
}
const PRODUCTS_KEY = "basketProducts";
function loadProducts() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveProducts(data) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));
}
function loadGlobalSettings() {
  try {
    const raw = localStorage.getItem("globalSettings");
    if (!raw) return { basketCost: 6e3, minimumForBasket: 5e3 };
    const parsed = JSON.parse(raw);
    return {
      basketCost: parsed.basketCost ?? 6e3,
      minimumForBasket: parsed.minimumForBasket ?? 5e3
    };
  } catch {
    return { basketCost: 6e3, minimumForBasket: 5e3 };
  }
}
function BasketCostModule({ onOpenSettings }) {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(loadGlobalSettings());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formName, setFormName] = useState("");
  const [formCost, setFormCost] = useState("");
  const refresh = useCallback(() => {
    setProducts(loadProducts());
    setSettings(loadGlobalSettings());
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  const totalCost = products.reduce((s, p) => s + p.cost, 0);
  const diff = totalCost - settings.minimumForBasket;
  useEffect(() => {
    const currentSettings = loadGlobalSettings();
    if (currentSettings.basketCost !== totalCost) {
      try {
        const raw = localStorage.getItem("globalSettings");
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.basketCost = totalCost;
        localStorage.setItem("globalSettings", JSON.stringify(parsed));
      } catch {
      }
    }
  }, [totalCost]);
  function openAdd() {
    setEditTarget(null);
    setFormName("");
    setFormCost("");
    setDialogOpen(true);
  }
  function openEdit(p) {
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
    let updated;
    if (editTarget) {
      updated = products.map(
        (p) => p.id === editTarget.id ? { ...p, name: formName.trim(), cost } : p
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
  function handleDelete() {
    if (!deleteTarget) return;
    const updated = products.filter((p) => p.id !== deleteTarget.id);
    saveProducts(updated);
    setProducts(updated);
    toast.success("המוצר נמחק");
    setDeleteTarget(null);
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", dir: "rtl", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[hsl(var(--primary))]", children: "עלות הסל" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "עלות סל נוכחית" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold", children: [
          totalCost.toLocaleString("he-IL"),
          " ₪"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "סכום מינימום לזכאות" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold", children: [
          settings.minimumForBasket.toLocaleString("he-IL"),
          " ₪"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "bg-muted/50", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6 space-y-2", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        "כשבחור מגיע ל-",
        /* @__PURE__ */ jsxs("strong", { children: [
          settings.minimumForBasket.toLocaleString("he-IL"),
          " ₪"
        ] }),
        " (המינימום), העמותה מוסיפה לו ",
        /* @__PURE__ */ jsxs("strong", { children: [
          diff > 0 ? diff.toLocaleString("he-IL") : 0,
          " ₪"
        ] }),
        " (ההפרש) להשלמת הסל."
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "עלות הסל ועדכון המינימום מנוהלים בהגדרות הגלובליות ⚙️" }),
        onOpenSettings && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: onOpenSettings, children: [
          /* @__PURE__ */ jsx(Settings, { className: "ml-1 h-4 w-4" }),
          "עבור להגדרות"
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "שינוי בעלות המוצרים משפיע רק על בחורים שעוד לא קיבלו סל." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "מוצרים בסל" }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsx(Plus, { className: "ml-1 h-4 w-4" }),
          "הוסף מוצר"
        ] })
      ] }),
      products.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "לא הוגדרו מוצרים עדיין." }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]", children: [
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "שם מוצר" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "עלות" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "פעולות" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: products.map((p) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: p.name }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            p.cost.toLocaleString("he-IL"),
            " ₪"
          ] }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-center", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => openEdit(p), children: [
              /* @__PURE__ */ jsx(Pencil, { className: "ml-1 h-3 w-3" }),
              "ערוך"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: "destructive", size: "sm", onClick: () => setDeleteTarget(p), children: [
              /* @__PURE__ */ jsx(Trash2, { className: "ml-1 h-3 w-3" }),
              "מחק"
            ] })
          ] }) })
        ] }, p.id)) }),
        /* @__PURE__ */ jsx(TableFooter, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-bold", children: 'סה"כ' }),
          /* @__PURE__ */ jsxs(TableCell, { className: "font-bold", children: [
            totalCost.toLocaleString("he-IL"),
            " ₪"
          ] }),
          /* @__PURE__ */ jsx(TableCell, {})
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", dir: "rtl", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: editTarget ? "עריכת מוצר" : "הוספת מוצר" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: editTarget ? "עדכן את פרטי המוצר" : "הזן שם מוצר ועלות" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "שם מוצר" }),
          /* @__PURE__ */ jsx(Input, { value: formName, onChange: (e) => setFormName(e.target.value), placeholder: "שם המוצר" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "עלות (₪)" }),
          /* @__PURE__ */ jsx(Input, { type: "number", min: "0", value: formCost, onChange: (e) => setFormCost(e.target.value), placeholder: "עלות" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2 sm:gap-0", children: [
        /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "ביטול" }) }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSave, disabled: !formName.trim() || Number(formCost) <= 0, children: "שמור" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!deleteTarget, onOpenChange: (o) => !o && setDeleteTarget(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { dir: "rtl", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "מחיקת מוצר" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          'האם אתה בטוח שרוצה למחוק את "',
          deleteTarget?.name,
          '"?'
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "ביטול" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDelete, children: "מחק" })
      ] })
    ] }) })
  ] });
}
function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function fmt$1(n) {
  return n.toLocaleString("he-IL") + " ₪";
}
function match(query, ...fields) {
  const q = query.toLowerCase();
  return fields.some((f) => f != null && String(f).toLowerCase().includes(q));
}
function SearchModule() {
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const bachurim = useMemo(() => load("bachurim"), [type, query]);
  const askanimIncomes = useMemo(() => load("askanim"), [type, query]);
  const incomes = useMemo(() => load("incomes"), [type, query]);
  const expenses = useMemo(() => load("expenses"), [type, query]);
  const q = query.trim();
  const filteredBachurim = useMemo(() => {
    if (type !== "bachur" || !q) return [];
    return bachurim.filter((b) => match(q, b.name, b.sku));
  }, [bachurim, q, type]);
  const filteredIncomes = useMemo(() => {
    if (type !== "income" || !q) return [];
    return incomes.filter((i) => match(q, i.description, String(i.amount), i.date));
  }, [incomes, q, type]);
  const filteredExpenses = useMemo(() => {
    if (type !== "expense" || !q) return [];
    return expenses.filter((e) => match(q, e.notes, e.category, e.subCategory, String(e.amount), e.date));
  }, [expenses, q, type]);
  const hasResults = type === "bachur" && filteredBachurim.length > 0 || type === "income" && filteredIncomes.length > 0 || type === "expense" && filteredExpenses.length > 0;
  function clear() {
    setQuery("");
    setExpandedId(null);
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", dir: "rtl", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[hsl(var(--primary))]", children: "חיפוש" }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 items-end", children: [
      /* @__PURE__ */ jsx("div", { className: "w-56", children: /* @__PURE__ */ jsxs(Select, { value: type, onValueChange: (v) => {
        setType(v);
        setQuery("");
        setExpandedId(null);
      }, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "בחר סוג חיפוש..." }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "bachur", children: "שם בחור" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "income", children: "הכנסה" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "expense", children: "הוצאה" })
        ] })
      ] }) }),
      type && /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-[200px] flex gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              className: "pr-9",
              placeholder: type === "bachur" ? 'הקלד שם בחור או מק"ט...' : type === "income" ? "חפש לפי תיאור, סכום או תאריך..." : "חפש לפי הערות, קטגוריה, סכום או תאריך...",
              value: query,
              onChange: (e) => {
                setQuery(e.target.value);
                setExpandedId(null);
              },
              autoFocus: true
            }
          )
        ] }),
        q && /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", onClick: clear, children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] })
    ] }),
    type && q && !hasResults && /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "לא נמצאו תוצאות" }),
    type === "bachur" && filteredBachurim.map((b) => {
      const basketTotal = (b.outings || []).reduce((s, o) => s + o.amount, 0);
      const bachurAskanim = askanimIncomes.filter((a) => a.bachurId === b.id);
      const askanimTotal = bachurAskanim.reduce((s, a) => s + a.amount, 0);
      const grandTotal = basketTotal + askanimTotal;
      const status = b.married ? b.receivedBasket ? "קיבל סל + התחתן" : "התחתן" : "פעיל";
      const allRows = [
        ...(b.outings || []).map((o) => ({ id: o.id, name: o.name, date: o.date, amount: o.amount, type: "סל" })),
        ...bachurAskanim.map((a) => ({ id: a.id, name: a.notes || "הכנסת עסקנים", date: a.date, amount: a.amount, type: "עסקנים" }))
      ];
      return /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-4 px-6 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-x-6 gap-y-1 items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-lg", children: b.name }),
          /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
            'מק"ט: ',
            b.sku
          ] }),
          /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
            "שיעור ",
            b.classLevel
          ] }),
          /* @__PURE__ */ jsx(Badge, { variant: b.married ? "destructive" : "default", children: status }),
          b.inAskanim && /* @__PURE__ */ jsx(Badge, { className: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300", children: "פרויקט עסקנים" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "תאריך הצטרפות:" }),
            " ",
            b.joinDate
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: 'סה"כ לסלים:' }),
            " ",
            fmt$1(basketTotal)
          ] }),
          b.inAskanim && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: 'סה"כ לפרויקט עסקנים:' }),
            " ",
            fmt$1(askanimTotal)
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: 'סה"כ כללי:' }),
            " ",
            fmt$1(grandTotal)
          ] }),
          b.married && b.marriedDate && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "תאריך חתונה:" }),
            " ",
            b.marriedDate
          ] }),
          b.receivedBasket && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "תאריך קבלת סל:" }),
              " ",
              b.basketDate
            ] }),
            b.basketCostAtTime != null && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "עלות סל:" }),
              " ",
              fmt$1(b.basketCostAtTime)
            ] })
          ] })
        ] }),
        allRows.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold mb-1", children: "יציאות:" }),
          /* @__PURE__ */ jsx("div", { className: "rounded border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שם יציאה" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "תאריך" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סכום" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סוג" })
            ] }) }),
            /* @__PURE__ */ jsxs(TableBody, { children: [
              allRows.map((o) => /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { children: o.name }),
                /* @__PURE__ */ jsx(TableCell, { children: o.date }),
                /* @__PURE__ */ jsx(TableCell, { children: fmt$1(o.amount) }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: o.type === "סל" ? "default" : "secondary", children: o.type }) })
              ] }, o.id)),
              /* @__PURE__ */ jsxs(TableRow, { className: "bg-muted/50 font-bold", children: [
                /* @__PURE__ */ jsx(TableCell, { colSpan: 2, className: "text-left", children: "סיכום" }),
                /* @__PURE__ */ jsx(TableCell, { colSpan: 2, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-sm", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    'סה"כ סלים: ',
                    fmt$1(basketTotal)
                  ] }),
                  askanimTotal > 0 && /* @__PURE__ */ jsxs("span", { children: [
                    'סה"כ עסקנים: ',
                    fmt$1(askanimTotal)
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "font-extrabold", children: [
                    'סה"כ כללי: ',
                    fmt$1(grandTotal)
                  ] })
                ] }) })
              ] })
            ] })
          ] }) })
        ] })
      ] }) }, b.id);
    }),
    type === "income" && filteredIncomes.length > 0 && /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]", children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תאריך" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תיאור" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "סכום" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "מוכר" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground w-10" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: filteredIncomes.map((inc) => {
        const expanded = expandedId === inc.id;
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            TableRow,
            {
              className: `cursor-pointer ${inc.auto ? "bg-sky-50 dark:bg-sky-950/20" : ""}`,
              onClick: () => setExpandedId(expanded ? null : inc.id),
              children: [
                /* @__PURE__ */ jsx(TableCell, { children: inc.date }),
                /* @__PURE__ */ jsxs(TableCell, { children: [
                  inc.description,
                  inc.auto && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "mr-2 text-xs bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300", children: "אוטומטי" })
                ] }),
                /* @__PURE__ */ jsx(TableCell, { children: fmt$1(inc.amount) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: inc.recognized ? "✅" : "—" }),
                /* @__PURE__ */ jsx(TableCell, { children: expanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) })
              ]
            },
            inc.id
          ),
          expanded && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 5, className: "bg-muted/30 text-sm", children: /* @__PURE__ */ jsxs("div", { className: "p-2 space-y-1", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "תיאור:" }),
              " ",
              inc.description
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "סכום:" }),
              " ",
              fmt$1(inc.amount)
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "תאריך:" }),
              " ",
              inc.date
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "מוכר בעמותה:" }),
              " ",
              inc.recognized ? "כן" : "לא"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "סוג:" }),
              " ",
              inc.auto ? "אוטומטי" : "ידני"
            ] })
          ] }) }) }, `${inc.id}-detail`)
        ] });
      }) })
    ] }) }),
    type === "expense" && filteredExpenses.length > 0 && /* @__PURE__ */ jsx("div", { className: "rounded-lg border overflow-hidden", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]", children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תאריך" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "קטגוריה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "תת-קטגוריה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "הערות" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-right", children: "סכום" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground text-center", children: "מוכר" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-primary-foreground w-10" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: filteredExpenses.map((exp) => {
        const expanded = expandedId === exp.id;
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            TableRow,
            {
              className: `cursor-pointer ${exp.auto ? "bg-sky-50 dark:bg-sky-950/20" : ""}`,
              onClick: () => setExpandedId(expanded ? null : exp.id),
              children: [
                /* @__PURE__ */ jsx(TableCell, { children: exp.date }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: exp.category === "סלים" ? "default" : "secondary", children: exp.category === "סלים" ? "עבור הסלים" : "עבור העמותה" }) }),
                /* @__PURE__ */ jsx(TableCell, { children: exp.subCategory }),
                /* @__PURE__ */ jsx(TableCell, { className: "max-w-[150px] truncate", children: exp.notes }),
                /* @__PURE__ */ jsx(TableCell, { children: fmt$1(exp.amount) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: exp.recognized ? "✅" : "—" }),
                /* @__PURE__ */ jsx(TableCell, { children: expanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" }) })
              ]
            },
            exp.id
          ),
          expanded && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "bg-muted/30 text-sm", children: /* @__PURE__ */ jsxs("div", { className: "p-2 space-y-1", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "הערות:" }),
              " ",
              exp.notes
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "קטגוריה:" }),
              " ",
              exp.category === "סלים" ? "עבור הסלים" : "עבור העמותה"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "תת-קטגוריה:" }),
              " ",
              exp.subCategory
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "סכום:" }),
              " ",
              fmt$1(exp.amount)
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "תאריך:" }),
              " ",
              exp.date
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "מוכר בעמותה:" }),
              " ",
              exp.recognized ? "כן" : "לא"
            ] }),
            /* @__PURE__ */ jsxs("p", { children: [
              /* @__PURE__ */ jsx("strong", { children: "סוג:" }),
              " ",
              exp.auto ? "אוטומטי" : "ידני"
            ] })
          ] }) }) }, `${exp.id}-detail`)
        ] });
      }) })
    ] }) })
  ] });
}
const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;
function fmt(n) {
  return n.toLocaleString("he-IL");
}
function monthRange(offset) {
  const d = /* @__PURE__ */ new Date();
  d.setMonth(d.getMonth() + offset);
  const y = d.getFullYear(), m = d.getMonth();
  return {
    from: new Date(y, m, 1).toISOString().split("T")[0],
    to: new Date(y, m + 1, 0).toISOString().split("T")[0]
  };
}
function yearRange() {
  const y = (/* @__PURE__ */ new Date()).getFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}
function inRange(date, from, to) {
  return date >= from && date <= to;
}
function exportExcel(data, fileName) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, fileName);
}
function exportPdfHtml(title, html) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:Arial,sans-serif;padding:40px;direction:rtl}
table{width:100%;border-collapse:collapse;margin:16px 0}
th,td{border:1px solid #ccc;padding:8px;text-align:right}
th{background:#f0f0f0}h1{font-size:22px}h2{font-size:18px;margin-top:24px}
.green{color:green}.red{color:red}.summary{background:#f8f8f8;padding:16px;border-radius:8px;margin:12px 0}
@media print{body{padding:20px}}</style></head><body>${html}
<script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
}
function ReportsModule() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    const iv = setInterval(refresh, 3e3);
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => {
      clearInterval(iv);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);
  const bachurim = loadLocal("bachurim");
  const incomes = loadLocal("incomes");
  const expenses = loadLocal("expenses");
  const settings = loadSettingsLocal();
  const minimum = settings.minimumForBasket || 5e3;
  return /* @__PURE__ */ jsxs("div", { className: "p-4 md:p-6 space-y-4", dir: "rtl", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "דוחות" }),
    /* @__PURE__ */ jsx(Report1Period, { incomes, expenses, bachurim }),
    /* @__PURE__ */ jsx(Report2Bachurim, { bachurim, minimum }),
    /* @__PURE__ */ jsx(Report3Funds, { incomes, expenses, bachurim }),
    /* @__PURE__ */ jsx(Report4History, {})
  ] });
}
function loadLocal(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function loadSettingsLocal() {
  try {
    return JSON.parse(localStorage.getItem("globalSettings") || "{}");
  } catch {
    return {};
  }
}
function ReportCard({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsx(Collapsible, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsx(CardHeader, { className: "cursor-pointer hover:bg-muted/50 transition-colors", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
        icon,
        title
      ] }),
      open ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-5 w-5" })
    ] }) }) }),
    /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-0", children }) })
  ] }) });
}
function Report1Period({ incomes, expenses, bachurim }) {
  const cur = monthRange(0);
  const [from, setFrom] = useState(cur.from);
  const [to, setTo] = useState(cur.to);
  const data = useMemo(() => {
    const fi = incomes.filter((i) => inRange(i.date, from, to));
    const fe = expenses.filter((e) => inRange(e.date, from, to));
    const manualInc = fi.filter((i) => !i.auto).reduce((s, i) => s + i.amount, 0);
    const askanimInc = fi.filter((i) => i.auto && i.description?.includes("פרויקט עסקנים")).reduce((s, i) => s + i.amount, 0);
    const donationInc = fi.filter((i) => i.auto && !i.description?.includes("פרויקט עסקנים")).reduce((s, i) => s + i.amount, 0);
    const totalInc = fi.reduce((s, i) => s + i.amount, 0);
    const expSalim = fe.filter((e) => e.category === "סלים").reduce((s, e) => s + e.amount, 0);
    const expAmuta = fe.filter((e) => e.category === "עמותה").reduce((s, e) => s + e.amount, 0);
    const totalExp = fe.reduce((s, e) => s + e.amount, 0);
    const basketCount = bachurim.filter((b) => b.receivedBasket && b.basketDate && inRange(b.basketDate, from, to)).length;
    const marriedCount = bachurim.filter((b) => b.married && b.marriedDate && inRange(b.marriedDate, from, to)).length;
    return { manualInc, askanimInc, donationInc, totalInc, expSalim, expAmuta, totalExp, basketCount, marriedCount };
  }, [incomes, expenses, bachurim, from, to]);
  function handleExportExcel() {
    exportExcel([{
      'סה"כ הכנסות': data.totalInc,
      "הכנסות ידניות": data.manualInc,
      "פרויקט עסקנים": data.askanimInc,
      "תרומות מבחורים": data.donationInc,
      'סה"כ הוצאות': data.totalExp,
      "הוצאות סלים": data.expSalim,
      "הוצאות עמותה": data.expAmuta,
      "מאזן": data.totalInc - data.totalExp,
      "בחורים קיבלו סל": data.basketCount,
      "בחורים התחתנו": data.marriedCount,
      "מתאריך": from,
      "עד תאריך": to
    }], `סיכום_תקופתי_${from}_${to}.xlsx`);
  }
  function handleExportPdf() {
    const balance = data.totalInc - data.totalExp;
    exportPdfHtml("סיכום תקופתי", `
      <h1>סיכום תקופתי</h1>
      <p>מתאריך: ${from} &nbsp; עד: ${to}</p>
      <div class="summary">
        <h2>הכנסות: ${fmt(data.totalInc)} ₪</h2>
        <table><tr><th>ידניות</th><th>פרויקט עסקנים</th><th>תרומות מבחורים</th></tr>
        <tr><td>${fmt(data.manualInc)} ₪</td><td>${fmt(data.askanimInc)} ₪</td><td>${fmt(data.donationInc)} ₪</td></tr></table>
        <h2>הוצאות: ${fmt(data.totalExp)} ₪</h2>
        <table><tr><th>סלים</th><th>עמותה</th></tr>
        <tr><td>${fmt(data.expSalim)} ₪</td><td>${fmt(data.expAmuta)} ₪</td></tr></table>
        <h2 class="${balance >= 0 ? "green" : "red"}">מאזן תקופה: ${fmt(balance)} ₪</h2>
        <p>בחורים שקיבלו סל: ${data.basketCount} | בחורים שהתחתנו: ${data.marriedCount}</p>
      </div>
    `);
  }
  return /* @__PURE__ */ jsxs(ReportCard, { title: "סיכום תקופתי", icon: /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5" }), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-end mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "מתאריך" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: from, onChange: (e) => setFrom(e.target.value), className: "w-40" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "עד תאריך" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: to, onChange: (e) => setTo(e.target.value), className: "w-40" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => {
          const r = monthRange(0);
          setFrom(r.from);
          setTo(r.to);
        }, children: "החודש הנוכחי" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => {
          const r = monthRange(-1);
          setFrom(r.from);
          setTo(r.to);
        }, children: "החודש הקודם" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: () => {
          const r = yearRange();
          setFrom(r.from);
          setTo(r.to);
        }, children: "השנה הנוכחית" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: 'סה"כ הכנסות' }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-green-600", children: [
          fmt(data.totalInc),
          " ₪"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "ידניות: ",
          fmt(data.manualInc),
          " | עסקנים: ",
          fmt(data.askanimInc),
          " | תרומות: ",
          fmt(data.donationInc)
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: 'סה"כ הוצאות' }),
        /* @__PURE__ */ jsxs("p", { className: "text-xl font-bold text-red-600", children: [
          fmt(data.totalExp),
          " ₪"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "סלים: ",
          fmt(data.expSalim),
          " | עמותה: ",
          fmt(data.expAmuta)
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "מאזן תקופה" }),
        /* @__PURE__ */ jsxs("p", { className: `text-xl font-bold ${data.totalInc - data.totalExp >= 0 ? "text-green-600" : "text-red-600"}`, children: [
          fmt(data.totalInc - data.totalExp),
          " ₪"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "קיבלו סל: ",
          data.basketCount,
          " | התחתנו: ",
          data.marriedCount
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: handleExportPdf, children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 ml-1" }),
        "הורד PDF"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: handleExportExcel, children: [
        /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 ml-1" }),
        "הורד Excel"
      ] })
    ] })
  ] });
}
function Report2Bachurim({ bachurim, minimum }) {
  const active = useMemo(() => {
    return bachurim.filter((b) => !b.married && !b.receivedBasket).map((b) => {
      const total = (b.outings || []).reduce((s, o) => s + o.amount, 0);
      const pct = minimum > 0 ? total / minimum * 100 : 0;
      let status = "עוד רחוק";
      if (total >= minimum) status = "זכאי";
      else if (pct >= 70) status = "קרוב לסל";
      return { ...b, total, pct, status };
    }).sort((a, b) => b.total - a.total);
  }, [bachurim, minimum]);
  function handleExport() {
    exportExcel(
      active.map((b) => ({
        "שם": b.name,
        'מק"ט': b.sku,
        "שיעור": b.classLevel,
        'סה"כ הכניס': b.total,
        "אחוז מהמינימום": `${b.pct.toFixed(1)}%`,
        "סטטוס": b.status
      })),
      "סטטוס_בחורים.xlsx"
    );
  }
  return /* @__PURE__ */ jsxs(ReportCard, { title: "סטטוס בחורים", icon: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }), children: [
    /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
      active.length,
      " בחורים פעילים"
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "overflow-auto max-h-96", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שם" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: 'מק"ט' }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "שיעור" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: 'סה"כ הכניס' }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "% מהמינימום" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סטטוס" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: active.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground", children: "אין בחורים פעילים" }) }) : active.map((b) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: b.name }),
        /* @__PURE__ */ jsx(TableCell, { children: b.sku }),
        /* @__PURE__ */ jsx(TableCell, { children: b.classLevel }),
        /* @__PURE__ */ jsxs(TableCell, { children: [
          fmt(b.total),
          " ₪"
        ] }),
        /* @__PURE__ */ jsxs(TableCell, { children: [
          b.pct.toFixed(1),
          "%"
        ] }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: b.status === "זכאי" ? "default" : b.status === "קרוב לסל" ? "secondary" : "outline", children: b.status }) })
      ] }, b.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: handleExport, children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 ml-1" }),
      "הורד Excel"
    ] }) })
  ] });
}
function Report3Funds({ incomes, expenses, bachurim }) {
  const data = useMemo(() => {
    const active = bachurim.filter((b) => !b.married);
    const totalActiveBachurimIncome = active.reduce(
      (s, b) => s + (b.outings || []).reduce((os, o) => os + o.amount, 0),
      0
    );
    const expSalim = expenses.filter((e) => e.category === "סלים").reduce((s, e) => s + e.amount, 0);
    const basketFund = totalActiveBachurimIncome - expSalim;
    const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);
    const expAmuta = expenses.filter((e) => e.category === "עמותה").reduce((s, e) => s + e.amount, 0);
    const orgFund = totalIncomes - expAmuta;
    const totalBank = basketFund + orgFund;
    const balanced = totalActiveBachurimIncome === basketFund + expSalim;
    return {
      basketInc: totalActiveBachurimIncome,
      basketExp: expSalim,
      basketFund,
      orgInc: totalIncomes,
      orgExp: expAmuta,
      orgFund,
      totalBank,
      balanced,
      diff: totalActiveBachurimIncome - basketFund
    };
  }, [incomes, expenses, bachurim]);
  function handleExportPdf() {
    exportPdfHtml("דוח קופות", `
      <h1>דוח קופות</h1>
      <table>
        <tr><th></th><th>הכנסות</th><th>הוצאות</th><th>יתרה</th></tr>
        <tr><td><strong>קופת סלים</strong></td><td>${fmt(data.basketInc)} ₪</td><td>${fmt(data.basketExp)} ₪</td><td>${fmt(data.basketFund)} ₪</td></tr>
        <tr><td><strong>קופת עמותה</strong></td><td>${fmt(data.orgInc)} ₪</td><td>${fmt(data.orgExp)} ₪</td><td>${fmt(data.orgFund)} ₪</td></tr>
        <tr><td><strong>סה"כ בנק</strong></td><td colspan="2"></td><td><strong>${fmt(data.totalBank)} ₪</strong></td></tr>
      </table>
      <p class="${data.balanced ? "green" : "red"}">${data.balanced ? "✅ החשבון מאוזן" : `⚠️ יש הפרש של ${fmt(data.diff)} ₪`}</p>
    `);
  }
  return /* @__PURE__ */ jsxs(ReportCard, { title: "דוח קופות", icon: /* @__PURE__ */ jsx(Landmark, { className: "h-5 w-5" }), children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Wallet, { className: "h-4 w-4" }),
          "קופת סלים"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs mt-1", children: [
          "הכנסות: ",
          fmt(data.basketInc),
          " ₪"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
          "הוצאות: ",
          fmt(data.basketExp),
          " ₪"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold mt-1", children: [
          fmt(data.basketFund),
          " ₪"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
          "קופת עמותה"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs mt-1", children: [
          "הכנסות: ",
          fmt(data.orgInc),
          " ₪"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
          "הוצאות: ",
          fmt(data.orgExp),
          " ₪"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold mt-1", children: [
          fmt(data.orgFund),
          " ₪"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Landmark, { className: "h-4 w-4" }),
          'סה"כ בנק'
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold mt-2", children: [
          fmt(data.totalBank),
          " ₪"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: data.balanced ? "border-green-500" : "border-red-500", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4 flex items-center gap-2", children: data.balanced ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-green-600" }),
      /* @__PURE__ */ jsx("span", { className: "text-green-600 font-medium", children: "✅ החשבון מאוזן" })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }),
      /* @__PURE__ */ jsxs("span", { className: "text-red-600 font-medium", children: [
        "⚠️ יש הפרש של ",
        fmt(data.diff),
        " ₪ – יש לבדוק"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: handleExportPdf, children: [
      /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 ml-1" }),
      "הורד PDF"
    ] }) })
  ] });
}
const ACTION_TYPES = [
  { value: "all", label: "הכל" },
  { value: "הוספת בחור", label: "הוספת בחור" },
  { value: "הכנסת כסף", label: "הכנסת כסף לבחור" },
  { value: "קיבל סל", label: "קיבל סל" },
  { value: "התחתן", label: "התחתן" },
  { value: "הכנסה", label: "הכנסה" },
  { value: "הוצאה", label: "הוצאה" },
  { value: "שינוי הגדרות", label: "שינוי הגדרות" }
];
function Report4History() {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  useEffect(() => {
    fetchActivityLog().then((data) => {
      setLogs(data);
      setLoadingLogs(false);
    });
  }, []);
  const filtered = useMemo(() => {
    let result = [...logs];
    if (typeFilter !== "all") {
      result = result.filter((l) => l.action_type.includes(typeFilter));
    }
    if (dateFrom) result = result.filter((l) => l.created_at >= dateFrom);
    if (dateTo) result = result.filter((l) => l.created_at <= dateTo + "T99");
    return result;
  }, [logs, typeFilter, dateFrom, dateTo]);
  function handleExport() {
    exportExcel(
      filtered.map((l) => ({
        "תאריך ושעה": l.created_at,
        "סוג פעולה": l.action_type,
        "פרטים": l.details,
        "סכום": l.amount ?? ""
      })),
      "היסטוריית_פעולות.xlsx"
    );
  }
  return /* @__PURE__ */ jsxs(ReportCard, { title: "היסטוריית פעולות", icon: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-end mb-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "סוג פעולה" }),
        /* @__PURE__ */ jsxs(Select, { value: typeFilter, onValueChange: setTypeFilter, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-44", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: ACTION_TYPES.map((t) => /* @__PURE__ */ jsx(SelectItem, { value: t.value, children: t.label }, t.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "מתאריך" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), className: "w-40" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { children: "עד תאריך" }),
        /* @__PURE__ */ jsx(Input, { type: "date", value: dateTo, onChange: (e) => setDateTo(e.target.value), className: "w-40" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "overflow-auto max-h-96", children: loadingLogs ? /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-muted-foreground", children: "טוען היסטוריית פעולות..." }) : /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "תאריך ושעה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סוג פעולה" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "פרטים" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "סכום" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground", children: "אין פעולות להצגה" }) }) : filtered.map((l) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "text-xs", children: new Date(l.created_at).toLocaleString("he-IL") }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", children: l.action_type }) }),
        /* @__PURE__ */ jsx(TableCell, { children: l.details }),
        /* @__PURE__ */ jsx(TableCell, { children: l.amount != null ? `${fmt(l.amount)} ₪` : "—" })
      ] }, l.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: handleExport, children: [
      /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 ml-1" }),
      "הורד Excel"
    ] }) })
  ] });
}
function TabPlaceholder({ title }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-24 text-muted-foreground", children: [
    /* @__PURE__ */ jsx(Construction, { className: "h-12 w-12 mb-4 text-gold" }),
    /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-1", children: title }),
    /* @__PURE__ */ jsx("p", { className: "text-sm", children: "תוכן זה יתווסף בקרוב" })
  ] });
}
function AuthScreen() {
  const { signIn, signUp, signOut, session, profileStatus, isAdmin } = useAuth();
  const [mode, setMode] = useState("signin");
  const isPendingSession = !!session && !isAdmin && profileStatus !== "approved";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [blockedMsg, setBlockedMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    try {
      const reason = sessionStorage.getItem("forced_signout_reason");
      if (reason) {
        setBlockedMsg(reason);
        sessionStorage.removeItem("forced_signout_reason");
      }
    } catch {
    }
  }, []);
  const switchMode = (m) => {
    setMode(m);
    setError(null);
    setInfo(null);
    if (m !== "signin") setBlockedMsg(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBlockedMsg(null);
    setLoading(true);
    if (mode === "signin") {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) setError(err);
    } else if (mode === "signup") {
      const { error: err, pending } = await signUp(email, password);
      setLoading(false);
      if (err) {
        setError(err);
      } else if (pending) {
        setInfo("בקשתך נשלחה למנהל לאישור. תוכל להיכנס עם המייל והסיסמה רק לאחר שתאושר.");
        setMode("signin");
        setPassword("");
      }
    } else {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      setLoading(false);
      if (resetError) {
        setError(`שגיאה: ${resetError.message}`);
      } else {
        setInfo("נשלח אליך מייל לאיפוס סיסמה. בדוק את תיבת הדואר (כולל ספאם).");
        setMode("signin");
      }
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", dir: "rtl", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md p-8 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsx("img", { src: ringsIcon, alt: "", width: 56, height: 56, className: "mx-auto" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "קול מצהלות חתנים" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: isPendingSession ? "החשבון שלך ממתין לאישור" : mode === "signin" ? "התחבר כדי לגשת למערכת" : mode === "signup" ? "צור חשבון חדש" : "שחזור סיסמה דרך המנהל" })
    ] }),
    isPendingSession && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-3 rounded", children: [
        /* @__PURE__ */ jsx("strong", { children: "חשבונך ממתין לאישור מנהל." }),
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: "אנא המתן — תקבל גישה לאחר שהמנהל יאשר את הבקשה. אין לך גישה לאתר עד אז." })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", className: "w-full", onClick: signOut, children: "יציאה" })
    ] }),
    !isPendingSession && /* @__PURE__ */ jsxs(Fragment, { children: [
      blockedMsg && /* @__PURE__ */ jsx("div", { className: "text-sm text-destructive bg-destructive/10 border border-destructive/30 px-3 py-2 rounded", children: blockedMsg }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "כתובת מייל" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "email",
              type: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              required: true,
              dir: "ltr",
              className: "text-left",
              autoComplete: "email"
            }
          )
        ] }),
        mode !== "forgot" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "סיסמה" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              minLength: 6,
              dir: "ltr",
              className: "text-left",
              autoComplete: mode === "signin" ? "current-password" : "new-password"
            }
          )
        ] }),
        mode === "forgot" && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "נשלח אליך למייל סיסמה זמנית. היכנס איתה ושנה אותה דרך תפריט הפרופיל." }),
        error && /* @__PURE__ */ jsx("div", { className: "text-sm text-destructive bg-destructive/10 px-3 py-2 rounded", children: error }),
        info && /* @__PURE__ */ jsx("div", { className: "text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded", children: info }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "טוען..." : mode === "signin" ? "התחבר" : mode === "signup" ? "הרשם" : "שלח בקשה למנהל" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center text-sm space-y-2", children: [
        mode === "signin" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { children: [
            "אין לך חשבון?",
            " ",
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => switchMode("signup"),
                className: "text-primary hover:underline font-medium",
                children: "הרשמה"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                switchMode("forgot");
                setPassword("");
              },
              className: "inline-block px-4 py-2 rounded-md border border-primary/30 text-primary hover:bg-primary/5 font-semibold text-sm",
              children: "שכחתי סיסמה — קבלת סיסמה חדשה במייל"
            }
          ) })
        ] }),
        mode === "signup" && /* @__PURE__ */ jsxs("div", { children: [
          "כבר יש לך חשבון?",
          " ",
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => switchMode("signin"),
              className: "text-primary hover:underline font-medium",
              children: "התחבר"
            }
          )
        ] }),
        mode === "forgot" && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => switchMode("signin"),
            className: "text-primary hover:underline font-medium",
            children: "חזרה להתחברות"
          }
        ) })
      ] })
    ] })
  ] }) });
}
function UsersAdminModule() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const load2 = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("id, email, status, is_admin, created_at").order("created_at", { ascending: false });
    if (!error && data) setRows(data);
    setLoading(false);
  }, []);
  useEffect(() => {
    load2();
  }, [load2]);
  const setStatus = async (id, status) => {
    setBusy(id);
    const { error } = await supabase.rpc("admin_set_user_status", { _user_id: id, _status: status });
    setBusy(null);
    if (error) {
      alert("שגיאה: " + error.message);
      return;
    }
    await load2();
  };
  if (!isAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "p-6", dir: "rtl", children: /* @__PURE__ */ jsx(Card, { className: "p-6 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "דף זה זמין רק למנהלים." }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 md:p-6 space-y-4", dir: "rtl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "ניהול משתמשים" }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: load2, children: "רענן" })
    ] }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "טוען..." }) : rows.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "אין משתמשים." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: rows.map((r) => /* @__PURE__ */ jsxs(Card, { className: "p-4 flex flex-wrap items-center gap-3 justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium", dir: "ltr", children: r.email }),
          r.is_admin && /* @__PURE__ */ jsx(Badge, { variant: "default", children: "מנהל" }),
          /* @__PURE__ */ jsx(Badge, { variant: r.status === "approved" ? "default" : r.status === "pending" ? "secondary" : "destructive", children: r.status === "approved" ? "מאושר" : r.status === "pending" ? "ממתין" : "נדחה" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "נרשם: ",
          new Date(r.created_at).toLocaleString("he-IL")
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        r.status !== "approved" && /* @__PURE__ */ jsx(Button, { size: "sm", disabled: busy === r.id, onClick: () => setStatus(r.id, "approved"), children: "אשר" }),
        r.status !== "rejected" && !r.is_admin && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "destructive", disabled: busy === r.id, onClick: () => setStatus(r.id, "rejected"), children: "דחה" }),
        r.status === "approved" && !r.is_admin && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", disabled: busy === r.id, onClick: () => setStatus(r.id, "pending"), children: "השעה" })
      ] })
    ] }, r.id)) })
  ] });
}
async function fetchChatUsers() {
  const { data, error } = await supabase.from("profiles").select("id, email, display_name").eq("status", "approved");
  if (error) {
    console.error("fetchChatUsers", error);
    return [];
  }
  return data || [];
}
async function fetchMyConversations() {
  const { data: myMemberships, error: mErr } = await supabase.from("conversation_members").select("conversation_id, user_id, joined_at, last_read_at");
  if (mErr) {
    console.error("fetchMyConversations members", mErr);
    return { conversations: [], membersByConv: {} };
  }
  const convIds = Array.from(new Set((myMemberships || []).map((m) => m.conversation_id)));
  if (convIds.length === 0) return { conversations: [], membersByConv: {} };
  const { data: convs, error: cErr } = await supabase.from("conversations").select("*").in("id", convIds).order("created_at", { ascending: false });
  if (cErr) {
    console.error("fetchMyConversations convs", cErr);
    return { conversations: [], membersByConv: {} };
  }
  const { data: allMembers, error: amErr } = await supabase.from("conversation_members").select("*").in("conversation_id", convIds);
  if (amErr) console.error("fetchMyConversations all members", amErr);
  const membersByConv = {};
  for (const m of allMembers || []) {
    const list = membersByConv[m.conversation_id] || [];
    list.push(m);
    membersByConv[m.conversation_id] = list;
  }
  return { conversations: convs || [], membersByConv };
}
async function createDmConversation(otherUserId) {
  const { data: convId, error } = await supabase.rpc("create_dm_conversation", {
    _other_user_id: otherUserId
  });
  if (error || !convId) {
    console.error("createDm", error);
    return null;
  }
  const { data: conv } = await supabase.from("conversations").select("*").eq("id", convId).single();
  return conv || null;
}
async function createGroupConversation(name, memberIds) {
  const { data: convId, error } = await supabase.rpc("create_group_conversation", {
    _name: name,
    _member_ids: memberIds
  });
  if (error || !convId) {
    console.error("createGroup", error);
    return null;
  }
  const { data: conv } = await supabase.from("conversations").select("*").eq("id", convId).single();
  return conv || null;
}
async function fetchMessages(conversationId) {
  const { data, error } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(500);
  if (error) {
    console.error("fetchMessages", error);
    return [];
  }
  return data || [];
}
async function sendMessage(params) {
  const { data: me } = await supabase.auth.getUser();
  const myId = me.user?.id;
  if (!myId) return null;
  const { data, error } = await supabase.from("messages").insert({
    conversation_id: params.conversationId,
    sender_id: myId,
    content: params.content || null,
    attachment_url: params.attachmentUrl || null,
    attachment_type: params.attachmentType || null
  }).select().single();
  if (error) {
    console.error("sendMessage", error);
    return null;
  }
  return data;
}
async function uploadChatMedia(conversationId, file, ext) {
  const filename = `${conversationId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("chat-media").upload(filename, file, {
    contentType: file.type || void 0,
    upsert: false
  });
  if (error) {
    console.error("uploadChatMedia", error);
    return null;
  }
  return filename;
}
async function getSignedMediaUrl(path) {
  const { data, error } = await supabase.storage.from("chat-media").createSignedUrl(path, 3600);
  if (error) {
    console.error("getSignedMediaUrl", error);
    return null;
  }
  return data.signedUrl;
}
async function markConversationRead(conversationId) {
  const { data: me } = await supabase.auth.getUser();
  const myId = me.user?.id;
  if (!myId) return;
  await supabase.from("conversation_members").update({ last_read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("conversation_id", conversationId).eq("user_id", myId);
}
async function addGroupMembers(conversationId, userIds) {
  const rows = userIds.map((uid) => ({ conversation_id: conversationId, user_id: uid }));
  const { error } = await supabase.from("conversation_members").insert(rows);
  if (error) console.error("addGroupMembers", error);
}
async function removeGroupMember(conversationId, userId) {
  const { error } = await supabase.from("conversation_members").delete().eq("conversation_id", conversationId).eq("user_id", userId);
  if (error) console.error("removeGroupMember", error);
}
const Avatar = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    ),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Image,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AvatarPrimitive.Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
function initials(name, email) {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}
function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("he-IL");
}
function ChatModule() {
  const { user } = useAuth();
  const myId = user?.id || "";
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [membersByConv, setMembersByConv] = useState({});
  const [unreadByConv, setUnreadByConv] = useState({});
  const [activeConvId, setActiveConvId] = useState(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const usersById = useMemo(() => {
    const m = {};
    for (const u of users) m[u.id] = u;
    return m;
  }, [users]);
  const loadAll = async () => {
    const [u, conv] = await Promise.all([fetchChatUsers(), fetchMyConversations()]);
    setUsers(u);
    setConversations(conv.conversations);
    setMembersByConv(conv.membersByConv);
  };
  useEffect(() => {
    loadAll();
  }, []);
  useEffect(() => {
    if (!myId) return;
    const ch = supabase.channel(`chat-list-${myId}`).on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, () => loadAll()).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      const msg = payload.new;
      const members = membersByConv[msg.conversation_id];
      if (!members || !members.some((m) => m.user_id === myId)) return;
      if (msg.conversation_id === activeConvId) return;
      if (msg.sender_id === myId) return;
      setUnreadByConv((prev) => ({ ...prev, [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1 }));
    }).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [myId, membersByConv, activeConvId]);
  useEffect(() => {
    (async () => {
      const counts = {};
      for (const conv of conversations) {
        const myMem = membersByConv[conv.id]?.find((m) => m.user_id === myId);
        if (!myMem) continue;
        const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", conv.id).gt("created_at", myMem.last_read_at).neq("sender_id", myId);
        if (count && count > 0) counts[conv.id] = count;
      }
      setUnreadByConv(counts);
    })();
  }, [conversations, membersByConv, myId]);
  const handleSelectConv = async (convId) => {
    setActiveConvId(convId);
    setUnreadByConv((p) => {
      const n = { ...p };
      delete n[convId];
      return n;
    });
    await markConversationRead(convId);
  };
  const conversationLabel = (conv) => {
    if (conv.type === "group") return conv.name || "קבוצה";
    const others = (membersByConv[conv.id] || []).filter((m) => m.user_id !== myId);
    const other = others[0];
    if (!other) return "שיחה";
    const u = usersById[other.user_id];
    return u?.display_name || u?.email || "משתמש";
  };
  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full gap-3 p-3 overflow-hidden", dir: "rtl", children: [
    /* @__PURE__ */ jsxs(
      "aside",
      {
        className: `w-full flex flex-col bg-card border rounded-lg ${activeConvId ? "hidden" : "flex"}`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 border-b", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "שיחות" }),
            /* @__PURE__ */ jsxs(Dialog, { open: newChatOpen, onOpenChange: setNewChatOpen, children: [
              /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "default", children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                " חדש"
              ] }) }),
              /* @__PURE__ */ jsx(
                NewChatDialog,
                {
                  users: users.filter((u) => u.id !== myId),
                  onCreated: async (convId) => {
                    setNewChatOpen(false);
                    await loadAll();
                    handleSelectConv(convId);
                  }
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs(ScrollArea, { className: "flex-1", children: [
            conversations.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-6 text-sm text-muted-foreground text-center", children: 'אין שיחות עדיין. לחץ "חדש" כדי להתחיל.' }),
            conversations.map((conv) => {
              const label = conversationLabel(conv);
              const unread = unreadByConv[conv.id] || 0;
              const isActive = conv.id === activeConvId;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleSelectConv(conv.id),
                  className: `w-full flex items-center gap-3 p-3 hover:bg-accent text-right border-b ${isActive ? "bg-accent" : ""}`,
                  children: [
                    /* @__PURE__ */ jsx(Avatar, { children: /* @__PURE__ */ jsx(AvatarFallback, { children: conv.type === "group" ? /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }) : initials(null, label) }) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                        /* @__PURE__ */ jsx("span", { className: "font-medium truncate", children: label }),
                        unread > 0 && /* @__PURE__ */ jsx(Badge, { variant: "default", children: unread })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: conv.type === "group" ? `${(membersByConv[conv.id] || []).length} משתתפים` : "שיחה אישית" })
                    ] })
                  ]
                },
                conv.id
              );
            })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("section", { className: `flex-1 flex-col bg-card border rounded-lg ${activeConvId ? "flex" : "hidden"}`, children: activeConv ? /* @__PURE__ */ jsx(
      ChatWindow,
      {
        conversation: activeConv,
        members: membersByConv[activeConv.id] || [],
        usersById,
        myId,
        label: conversationLabel(activeConv),
        onBack: () => setActiveConvId(null),
        onMembersChanged: loadAll
      },
      activeConv.id
    ) : /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center text-muted-foreground", children: "בחר שיחה להתחיל" }) })
  ] });
}
function NewChatDialog({
  users,
  onCreated
}) {
  const [mode, setMode] = useState("dm");
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [groupName, setGroupName] = useState("");
  const [busy, setBusy] = useState(false);
  const toggle = (id) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (mode === "dm") {
        n.clear();
        n.add(id);
        return n;
      }
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const submit = async () => {
    if (selected.size === 0) {
      toast.error("בחר לפחות משתמש אחד");
      return;
    }
    setBusy(true);
    try {
      let conv = null;
      if (mode === "dm") {
        const [otherId] = Array.from(selected);
        conv = await createDmConversation(otherId);
      } else {
        if (!groupName.trim()) {
          toast.error("הזן שם לקבוצה");
          setBusy(false);
          return;
        }
        conv = await createGroupConversation(groupName.trim(), Array.from(selected));
      }
      if (!conv) {
        toast.error("שגיאה ביצירת שיחה");
        return;
      }
      onCreated(conv.id);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs(DialogContent, { dir: "rtl", className: "max-w-md", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "שיחה חדשה" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Button, { variant: mode === "dm" ? "default" : "outline", size: "sm", onClick: () => {
        setMode("dm");
        setSelected(/* @__PURE__ */ new Set());
      }, children: "הודעה אישית" }),
      /* @__PURE__ */ jsx(Button, { variant: mode === "group" ? "default" : "outline", size: "sm", onClick: () => {
        setMode("group");
        setSelected(/* @__PURE__ */ new Set());
      }, children: "קבוצה" })
    ] }),
    mode === "group" && /* @__PURE__ */ jsx(Input, { placeholder: "שם הקבוצה", value: groupName, onChange: (e) => setGroupName(e.target.value) }),
    /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: mode === "dm" ? "בחר משתמש לשיחה" : `בחר משתתפים (${selected.size} נבחרו)` }),
    /* @__PURE__ */ jsxs(ScrollArea, { className: "h-64 border rounded-md", children: [
      users.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-4 text-sm text-muted-foreground", children: "אין משתמשים נוספים" }),
      users.map((u) => {
        const isSel = selected.has(u.id);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => toggle(u.id),
            className: `w-full flex items-center gap-3 p-2 hover:bg-accent text-right ${isSel ? "bg-accent" : ""}`,
            children: [
              /* @__PURE__ */ jsx(Avatar, { children: /* @__PURE__ */ jsx(AvatarFallback, { children: initials(u.display_name, u.email) }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium truncate", children: u.display_name || u.email }),
                u.display_name && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground truncate", dir: "ltr", children: u.email })
              ] }),
              isSel && /* @__PURE__ */ jsx(Badge, { children: "נבחר" })
            ]
          },
          u.id
        );
      })
    ] }),
    /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { onClick: submit, disabled: busy, children: "צור שיחה" }) })
  ] });
}
function ChatWindow({
  conversation,
  members,
  usersById,
  myId,
  label,
  onBack,
  onMembersChanged
}) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [pendingIds, setPendingIds] = useState(/* @__PURE__ */ new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const typingChannelRef = useRef(null);
  const lastTypingSentRef = useRef(0);
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const onlineList = useOnlineUsers(user?.email ?? null, user?.id ?? null);
  const onlineIds = useMemo(() => new Set(onlineList.map((u) => u.userId)), [onlineList]);
  const otherUserId = conversation.type === "dm" ? members.find((m) => m.user_id !== myId)?.user_id ?? null : null;
  const isOtherOnline = otherUserId ? onlineIds.has(otherUserId) : false;
  const othersMinLastRead = useMemo(() => {
    const others = members.filter((m) => m.user_id !== myId);
    if (others.length === 0) return null;
    let min = others[0].last_read_at;
    for (const m of others) if (m.last_read_at < min) min = m.last_read_at;
    return min;
  }, [members, myId]);
  useEffect(() => {
    fetchMessages(conversation.id).then(setMessages);
  }, [conversation.id]);
  useEffect(() => {
    const ch = supabase.channel(`chat-${conversation.id}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
      (payload) => {
        const msg = payload.new;
        setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
      }
    ).on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` },
      (payload) => {
        const oldMsg = payload.old;
        setMessages((prev) => prev.filter((m) => m.id !== oldMsg.id));
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [conversation.id]);
  useEffect(() => {
    const ch = supabase.channel(`typing-${conversation.id}`, {
      config: { broadcast: { self: false } }
    });
    ch.on("broadcast", { event: "typing" }, (payload) => {
      const uid = payload.payload?.userId;
      if (!uid || uid === myId) return;
      setTypingUsers((prev) => ({ ...prev, [uid]: Date.now() }));
    });
    ch.subscribe();
    typingChannelRef.current = ch;
    const interval = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const next = {};
        let changed = false;
        for (const [uid, t] of Object.entries(prev)) {
          if (now - t < 3500) next[uid] = t;
          else changed = true;
        }
        return changed ? next : prev;
      });
    }, 1e3);
    return () => {
      clearInterval(interval);
      supabase.removeChannel(ch);
      typingChannelRef.current = null;
    };
  }, [conversation.id, myId]);
  const sendTyping = () => {
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    lastTypingSentRef.current = now;
    typingChannelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: myId }
    });
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [messages]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollDown(distance > 150);
    };
    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (el && messages.length > 0) el.scrollTop = el.scrollHeight;
  }, [conversation.id]);
  useEffect(() => {
    if (messages.length > 0) markConversationRead(conversation.id);
  }, [messages, conversation.id]);
  const handleSend = async () => {
    const t = text.trim();
    if (!t) return;
    const tempId = `pending-${Date.now()}-${Math.random()}`;
    const optimistic = {
      id: tempId,
      conversation_id: conversation.id,
      sender_id: myId,
      content: t,
      attachment_url: null,
      attachment_type: null,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    setPendingIds((p) => new Set(p).add(tempId));
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    setText("");
    const msg = await sendMessage({ conversationId: conversation.id, content: t });
    setMessages((prev) => {
      const without = prev.filter((m) => m.id !== tempId);
      if (msg && !without.some((m) => m.id === msg.id)) return [...without, msg];
      return without;
    });
    setPendingIds((p) => {
      const n = new Set(p);
      n.delete(tempId);
      return n;
    });
    setSending(false);
  };
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("יש לבחור תמונה");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("הקובץ חורג מ-10MB");
      return;
    }
    setSending(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = await uploadChatMedia(conversation.id, file, ext);
    if (!path) {
      toast.error("העלאה נכשלה");
      setSending(false);
      return;
    }
    const msg = await sendMessage({
      conversationId: conversation.id,
      attachmentUrl: path,
      attachmentType: "image"
    });
    if (msg) setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
    setSending(false);
  };
  const handleAudioRecorded = async (blob) => {
    if (blob.size > MAX_FILE_SIZE) {
      toast.error("ההקלטה חורגת מ-10MB");
      return;
    }
    setSending(true);
    const path = await uploadChatMedia(conversation.id, blob, "webm");
    if (!path) {
      toast.error("העלאה נכשלה");
      setSending(false);
      return;
    }
    const msg = await sendMessage({
      conversationId: conversation.id,
      attachmentUrl: path,
      attachmentType: "audio"
    });
    if (msg) setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
    setSending(false);
  };
  const handlePasteImage = async (blob, ext) => {
    if (blob.size > MAX_FILE_SIZE) {
      toast.error("התמונה חורגת מ-10MB");
      return;
    }
    setSending(true);
    const path = await uploadChatMedia(conversation.id, blob, ext);
    if (!path) {
      toast.error("העלאה נכשלה");
      setSending(false);
      return;
    }
    const msg = await sendMessage({
      conversationId: conversation.id,
      attachmentUrl: path,
      attachmentType: "image"
    });
    if (msg) setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]);
    setSending(false);
  };
  const onPaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          const ext = (file.type.split("/")[1] || "png").split("+")[0];
          handlePasteImage(file, ext);
          return;
        }
      }
    }
  };
  const insertEmoji = (emoji) => {
    const ta = textareaRef.current;
    if (!ta) {
      setText((t) => t + emoji);
      return;
    }
    const start = ta.selectionStart ?? text.length;
    const end = ta.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + emoji.length;
      ta.setSelectionRange(pos, pos);
    });
  };
  const typingNames = Object.keys(typingUsers).filter((uid) => uid !== myId).map((uid) => usersById[uid]?.display_name || usersById[uid]?.email?.split("@")[0] || "מישהו");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 border-b bg-card", children: [
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: onBack, "aria-label": "חזרה לרשימה", children: /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Avatar, { children: /* @__PURE__ */ jsx(AvatarFallback, { children: conversation.type === "group" ? /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }) : initials(null, label) }) }),
        conversation.type === "dm" && isOtherOnline && /* @__PURE__ */ jsx("span", { className: "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-card" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "font-semibold truncate", children: label }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground truncate", children: typingNames.length > 0 ? /* @__PURE__ */ jsxs("span", { className: "text-primary", children: [
          typingNames[0],
          " מקליד",
          /* @__PURE__ */ jsx(TypingDots, {})
        ] }) : conversation.type === "group" ? `${members.length} משתתפים` : isOtherOnline ? "מחובר" : "לא מחובר" })
      ] }),
      conversation.type === "group" && /* @__PURE__ */ jsxs(Dialog, { open: groupInfoOpen, onOpenChange: setGroupInfoOpen, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", children: /* @__PURE__ */ jsx(Users, { className: "w-4 h-4" }) }) }),
        /* @__PURE__ */ jsx(
          GroupInfoDialog,
          {
            conversation,
            members,
            usersById,
            myId,
            onChanged: () => {
              onMembersChanged();
            }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { ref: scrollRef, className: "flex-1 overflow-y-auto p-3 space-y-1 chat-pattern relative", children: [
      messages.map((m, idx) => {
        const isMe = m.sender_id === myId;
        const sender = usersById[m.sender_id];
        const showSender = conversation.type === "group" && !isMe && (idx === 0 || messages[idx - 1].sender_id !== m.sender_id);
        const prevDate = idx > 0 ? formatDate(messages[idx - 1].created_at) : null;
        const curDate = formatDate(m.created_at);
        const showDate = prevDate !== curDate;
        const isPending = pendingIds.has(m.id);
        const isRead = isMe && !isPending && othersMinLastRead !== null && othersMinLastRead >= m.created_at;
        return /* @__PURE__ */ jsxs("div", { children: [
          showDate && /* @__PURE__ */ jsx("div", { className: "text-center my-3", children: /* @__PURE__ */ jsx("span", { className: "text-xs bg-background/90 px-3 py-1 rounded-full text-muted-foreground shadow-sm", children: curDate }) }),
          /* @__PURE__ */ jsx("div", { className: `flex ${isMe ? "justify-start" : "justify-end"}`, children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: "max-w-[78%] rounded-2xl px-3 py-1.5 shadow-sm",
              style: {
                backgroundColor: isMe ? "var(--chat-sent)" : "var(--chat-received)",
                color: isMe ? "var(--chat-sent-foreground)" : "var(--chat-received-foreground)"
              },
              children: [
                showSender && /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold mb-0.5", style: { color: "var(--chat-read)" }, children: sender?.display_name || sender?.email || "משתמש" }),
                /* @__PURE__ */ jsx(MessageBody, { msg: m, onOpenImage: setLightboxUrl }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-1 mt-0.5 -mb-0.5 opacity-70", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] tabular-nums", children: formatTime(m.created_at) }),
                  isMe && (isPending ? /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }) : isRead ? /* @__PURE__ */ jsx(CheckCheck, { className: "w-3.5 h-3.5", style: { color: "var(--chat-read)" } }) : /* @__PURE__ */ jsx(CheckCheck, { className: "w-3.5 h-3.5" }))
                ] })
              ]
            }
          ) })
        ] }, m.id);
      }),
      messages.length === 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center text-sm text-muted-foreground gap-2 py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-background/80 rounded-full p-4 shadow-sm", children: /* @__PURE__ */ jsx(Send, { className: "w-6 h-6 opacity-50" }) }),
        /* @__PURE__ */ jsx("div", { children: "אין הודעות עדיין" }),
        /* @__PURE__ */ jsx("div", { className: "text-xs", children: "כתוב הודעה כדי להתחיל" })
      ] }),
      typingNames.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx("div", { className: "rounded-lg px-3 py-2 shadow-sm", style: { backgroundColor: "var(--chat-received)" }, children: /* @__PURE__ */ jsx(TypingDots, {}) }) })
    ] }),
    showScrollDown && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: scrollToBottom,
        className: "absolute bottom-20 left-3 z-10 bg-background border shadow-lg rounded-full p-2 hover:bg-accent",
        "aria-label": "גלול לתחתית",
        children: /* @__PURE__ */ jsx(ArrowDown, { className: "w-4 h-4" })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "border-t p-2 flex items-end gap-1 bg-card", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: fileRef,
          type: "file",
          accept: "image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx",
          className: "hidden",
          onChange: handleFile
        }
      ),
      /* @__PURE__ */ jsxs(Popover, { open: emojiOpen, onOpenChange: setEmojiOpen, children: [
        /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", type: "button", disabled: sending, title: "אימוג'י", children: /* @__PURE__ */ jsx(Smile, { className: "w-5 h-5" }) }) }),
        /* @__PURE__ */ jsx(PopoverContent, { className: "p-0 w-auto", align: "start", side: "top", children: /* @__PURE__ */ jsx(
          EmojiPicker,
          {
            theme: Theme.AUTO,
            onEmojiClick: (d) => {
              insertEmoji(d.emoji);
              setEmojiOpen(false);
            },
            width: 320,
            height: 380
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          type: "button",
          onClick: () => fileRef.current?.click(),
          disabled: sending,
          title: "צרף תמונה",
          children: /* @__PURE__ */ jsx(Image, { className: "w-5 h-5" })
        }
      ),
      /* @__PURE__ */ jsx(VoiceRecorder, { onRecorded: handleAudioRecorded, disabled: sending }),
      /* @__PURE__ */ jsx(
        Textarea,
        {
          ref: textareaRef,
          value: text,
          onChange: (e) => {
            setText(e.target.value);
            sendTyping();
          },
          onPaste,
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          },
          placeholder: "הודעה...",
          rows: 1,
          className: "flex-1 resize-none min-h-[40px] max-h-32 rounded-full bg-background"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleSend,
          disabled: sending || !text.trim(),
          size: "icon",
          title: "שלח",
          className: "rounded-full",
          children: /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: !!lightboxUrl, onOpenChange: (o) => !o && setLightboxUrl(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-4xl p-0 bg-black/95 border-0", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setLightboxUrl(null),
          className: "absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2",
          "aria-label": "סגור",
          children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
        }
      ),
      lightboxUrl && /* @__PURE__ */ jsx("img", { src: lightboxUrl, alt: "תמונה", className: "w-full h-auto max-h-[85vh] object-contain" })
    ] }) })
  ] });
}
function TypingDots() {
  return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-end gap-0.5 ms-1 align-middle", children: [
    /* @__PURE__ */ jsx("span", { className: "w-1 h-1 bg-current rounded-full animate-bounce", style: { animationDelay: "0ms" } }),
    /* @__PURE__ */ jsx("span", { className: "w-1 h-1 bg-current rounded-full animate-bounce", style: { animationDelay: "150ms" } }),
    /* @__PURE__ */ jsx("span", { className: "w-1 h-1 bg-current rounded-full animate-bounce", style: { animationDelay: "300ms" } })
  ] });
}
function MessageBody({ msg, onOpenImage }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (msg.attachment_url) {
      getSignedMediaUrl(msg.attachment_url).then(setUrl);
    }
  }, [msg.attachment_url]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    msg.attachment_type === "image" && url && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => onOpenImage(url), className: "block", children: /* @__PURE__ */ jsx("img", { src: url, alt: "תמונה", className: "rounded max-w-full max-h-64 object-contain cursor-zoom-in" }) }),
    msg.attachment_type === "audio" && url && /* @__PURE__ */ jsx("audio", { controls: true, src: url, className: "max-w-full h-10" }),
    msg.attachment_type && !url && /* @__PURE__ */ jsx("div", { className: "text-xs italic opacity-75", children: "טוען קובץ..." }),
    msg.content && /* @__PURE__ */ jsx("div", { className: "whitespace-pre-wrap break-words", children: msg.content })
  ] });
}
function VoiceRecorder({ onRecorded, disabled }) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        onRecorded(blob);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1e3);
    } catch (err) {
      console.error(err);
      toast.error("לא ניתן לגשת למיקרופון");
    }
  };
  const stop = (cancel = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const rec = recorderRef.current;
    if (!rec) return;
    if (cancel) {
      rec.onstop = null;
      try {
        rec.stop();
      } catch {
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      chunksRef.current = [];
    } else {
      try {
        rec.stop();
      } catch {
      }
    }
    recorderRef.current = null;
    setRecording(false);
    setElapsed(0);
  };
  useEffect(() => () => stop(true), []);
  if (!recording) {
    return /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", type: "button", onClick: start, disabled, title: "הקלט הודעה קולית", children: /* @__PURE__ */ jsx(Mic, { className: "w-5 h-5" }) });
  }
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 px-2 bg-destructive/10 rounded-md", children: [
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", type: "button", onClick: () => stop(true), title: "בטל", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 text-destructive" }) }),
    /* @__PURE__ */ jsxs("span", { className: "text-xs tabular-nums text-destructive font-mono", children: [
      "● ",
      mm,
      ":",
      ss
    ] }),
    /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", type: "button", onClick: () => stop(false), title: "סיים ושלח", children: /* @__PURE__ */ jsx(Square, { className: "w-4 h-4 text-destructive" }) })
  ] });
}
function GroupInfoDialog({
  conversation,
  members,
  usersById,
  myId,
  onChanged
}) {
  const [allUsers, setAllUsers] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState(/* @__PURE__ */ new Set());
  const isCreator = conversation.created_by === myId;
  const memberIds = new Set(members.map((m) => m.user_id));
  useEffect(() => {
    fetchChatUsers().then(setAllUsers);
  }, []);
  const candidates = allUsers.filter((u) => !memberIds.has(u.id));
  const handleAdd = async () => {
    if (picked.size === 0) return;
    await addGroupMembers(conversation.id, Array.from(picked));
    setPicked(/* @__PURE__ */ new Set());
    setPickerOpen(false);
    onChanged();
    toast.success("נוספו לקבוצה");
  };
  const handleRemove = async (uid) => {
    if (!isCreator && uid !== myId) return;
    await removeGroupMember(conversation.id, uid);
    onChanged();
  };
  return /* @__PURE__ */ jsxs(DialogContent, { dir: "rtl", className: "max-w-md", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: conversation.name || "קבוצה" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium", children: [
        "חברי הקבוצה (",
        members.length,
        ")"
      ] }),
      isCreator && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => setPickerOpen((p) => !p), children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4" }),
        " הוסף"
      ] })
    ] }),
    pickerOpen && /* @__PURE__ */ jsxs("div", { className: "border rounded-md max-h-48 overflow-y-auto", children: [
      candidates.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-3 text-sm text-muted-foreground", children: "אין משתמשים להוספה" }),
      candidates.map((u) => {
        const isSel = picked.has(u.id);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setPicked((p) => {
              const n = new Set(p);
              if (n.has(u.id)) n.delete(u.id);
              else n.add(u.id);
              return n;
            }),
            className: `w-full flex items-center gap-2 p-2 hover:bg-accent text-right ${isSel ? "bg-accent" : ""}`,
            children: [
              /* @__PURE__ */ jsx(Avatar, { children: /* @__PURE__ */ jsx(AvatarFallback, { children: initials(u.display_name, u.email) }) }),
              /* @__PURE__ */ jsx("span", { className: "flex-1 truncate text-sm", children: u.display_name || u.email }),
              isSel && /* @__PURE__ */ jsx(Badge, { children: "נבחר" })
            ]
          },
          u.id
        );
      }),
      /* @__PURE__ */ jsx("div", { className: "p-2 border-t", children: /* @__PURE__ */ jsx(Button, { size: "sm", onClick: handleAdd, disabled: picked.size === 0, className: "w-full", children: "הוסף נבחרים" }) })
    ] }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "h-64 border rounded-md", children: members.map((m) => {
      const u = usersById[m.user_id];
      const canRemove = isCreator && m.user_id !== conversation.created_by || m.user_id === myId;
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-2 border-b", children: [
        /* @__PURE__ */ jsx(Avatar, { children: /* @__PURE__ */ jsx(AvatarFallback, { children: initials(u?.display_name, u?.email || "?") }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium truncate", children: u?.display_name || u?.email || "משתמש" }),
          m.user_id === conversation.created_by && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "יוצר הקבוצה" })
        ] }),
        canRemove && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => handleRemove(m.user_id), title: m.user_id === myId ? "עזוב" : "הסר", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 text-destructive" }) })
      ] }, m.user_id);
    }) })
  ] });
}
function ChatPanel() {
  const { open, setOpen } = useChatPanel();
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
  if (!open) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-40 bg-black/40 md:hidden",
        onClick: () => setOpen(false)
      }
    ),
    /* @__PURE__ */ jsxs(
      "aside",
      {
        dir: "rtl",
        className: "fixed top-0 right-0 z-50 h-screen w-full md:w-[380px] lg:w-[420px] bg-background border-l shadow-2xl flex flex-col animate-in slide-in-from-right duration-200",
        style: { maxWidth: "100vw" },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 h-12 border-b shrink-0", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "צ'אט" }),
            /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => setOpen(false), "aria-label": "סגור", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-h-0 overflow-hidden", children: /* @__PURE__ */ jsx(ChatModule, {}) })
        ]
      }
    )
  ] });
}
const SYNCED_KEYS = /* @__PURE__ */ new Set([
  "bachurim",
  "incomes",
  "expenses",
  "debts",
  "askanimIncomes",
  "basketProducts",
  "globalSettings",
  "fundraisers",
  "expense_cats_salim",
  "expense_cats_amuta"
]);
const flushTimers = {};
const FLUSH_DELAY = 500;
const LOG_LABELS = {
  bachurim: "בחורים",
  incomes: "הכנסות",
  expenses: "הוצאות",
  debts: "חובות",
  askanimIncomes: "הכנסות עסקנים",
  basketProducts: "מוצרי סל",
  globalSettings: "הגדרות",
  fundraisers: "גיוס"
};
function detectAndLog(key, oldRaw, newRaw) {
  try {
    if (key === "globalSettings") {
      const oldObj = safeParse(oldRaw, {});
      const newObj = safeParse(newRaw, {});
      if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
        addActivityLog("שינוי הגדרות", "עדכון הגדרות מערכת").catch(console.error);
      }
      return;
    }
    const oldArr = safeParse(oldRaw, []);
    const newArr = safeParse(newRaw, []);
    const label = LOG_LABELS[key] || key;
    if (newArr.length > oldArr.length) {
      const diff = newArr.length - oldArr.length;
      const lastItem = newArr[newArr.length - 1];
      const name = lastItem?.name || lastItem?.description || "";
      const amount = lastItem?.amount;
      addActivityLog(
        `הוספה - ${label}`,
        name ? `${name}${diff > 1 ? ` (+${diff - 1} נוספים)` : ""}` : `${diff} רשומות חדשות`,
        amount
      ).catch(console.error);
    } else if (newArr.length < oldArr.length) {
      const diff = oldArr.length - newArr.length;
      addActivityLog(`מחיקה - ${label}`, `${diff} רשומות נמחקו`).catch(console.error);
    } else if (JSON.stringify(oldArr) !== JSON.stringify(newArr)) {
      addActivityLog(`עדכון - ${label}`, `עדכון נתונים`).catch(console.error);
    }
  } catch {
  }
}
function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
async function flushKey(key) {
  try {
    const raw = localStorage.getItem(key);
    switch (key) {
      case "bachurim":
        await saveBachurimToDb(safeParse(raw, []));
        break;
      case "incomes":
        await saveIncomesToDb(safeParse(raw, []));
        break;
      case "expenses":
        await saveExpensesToDb(safeParse(raw, []));
        break;
      case "debts":
        await saveDebtsToDb(safeParse(raw, []));
        break;
      case "askanimIncomes":
        await saveAskanimIncomesToDb(safeParse(raw, []));
        break;
      case "basketProducts":
        await saveBasketProductsToDb(safeParse(raw, []));
        break;
      case "globalSettings":
        await saveGlobalSettingsToDb(safeParse(raw, {}));
        break;
      case "fundraisers":
        await saveFundraisersToDb(safeParse(raw, []));
        break;
      case "expense_cats_salim":
      case "expense_cats_amuta": {
        const salim = safeParse(localStorage.getItem("expense_cats_salim"), []);
        const amuta = safeParse(localStorage.getItem("expense_cats_amuta"), []);
        await saveExpenseCategoriesToDb(salim, amuta);
        break;
      }
    }
  } catch (err) {
    console.error("storageSync flush failed for", key, err);
  }
}
function scheduleFlush(key) {
  if (flushTimers[key]) clearTimeout(flushTimers[key]);
  flushTimers[key] = setTimeout(() => {
    delete flushTimers[key];
    flushKey(key);
  }, FLUSH_DELAY);
}
function writeWithoutSync(key, value) {
  const proto = Object.getPrototypeOf(localStorage);
  const original = proto.setItem ?? Storage.prototype.setItem;
  original.call(localStorage, key, value);
}
let patched = false;
function patchLocalStorage() {
  if (patched) return;
  patched = true;
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    const oldRaw = localStorage.getItem(key);
    originalSetItem(key, value);
    if (SYNCED_KEYS.has(key)) {
      scheduleFlush(key);
      detectAndLog(key, oldRaw, value);
      try {
        window.dispatchEvent(new StorageEvent("storage", { key }));
      } catch {
      }
    }
  };
  localStorage.removeItem = function(key) {
    originalRemoveItem(key);
    if (SYNCED_KEYS.has(key)) scheduleFlush(key);
  };
}
let bootstrapped = false;
let bootstrapPromise = null;
function bootstrapStorage() {
  if (bootstrapped) return Promise.resolve();
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const [
      cloudBachurim,
      cloudIncomes,
      cloudExpenses,
      cloudDebts,
      cloudAskanimIncomes,
      cloudBasketProducts,
      cloudGlobalSettings,
      cloudFundraisers,
      cloudCats
    ] = await Promise.all([
      fetchBachurim(),
      fetchIncomes(),
      fetchExpenses(),
      fetchDebts(),
      fetchAskanimIncomes(),
      fetchBasketProducts(),
      fetchGlobalSettings(),
      fetchFundraisers(),
      fetchExpenseCategories()
    ]);
    const migrationPromises = [];
    const syncOne = (key, cloudData, saver) => {
      const localRaw = localStorage.getItem(key);
      const localData = safeParse(localRaw, []);
      if (cloudData.length === 0 && localData.length > 0) {
        migrationPromises.push(saver(localData));
        console.log(`[storageSync] Migrating ${localData.length} ${key} from localStorage → Supabase`);
      } else {
        localStorage.setItem(key, JSON.stringify(cloudData));
      }
    };
    syncOne("bachurim", cloudBachurim, saveBachurimToDb);
    syncOne("incomes", cloudIncomes, saveIncomesToDb);
    syncOne("expenses", cloudExpenses, saveExpensesToDb);
    syncOne("debts", cloudDebts, saveDebtsToDb);
    syncOne("askanimIncomes", cloudAskanimIncomes, saveAskanimIncomesToDb);
    syncOne("basketProducts", cloudBasketProducts, saveBasketProductsToDb);
    syncOne("fundraisers", cloudFundraisers, saveFundraisersToDb);
    {
      const localRaw = localStorage.getItem("globalSettings");
      const cloudIsDefault = cloudGlobalSettings.basketCost === 6e3 && cloudGlobalSettings.basketCostHistory.length === 0 && cloudGlobalSettings.classUpgradeHistory.length === 0 && cloudGlobalSettings.lastClassUpgrade === null;
      if (localRaw && cloudIsDefault) {
        const localSettings = safeParse(localRaw, cloudGlobalSettings);
        migrationPromises.push(saveGlobalSettingsToDb(localSettings));
        console.log("[storageSync] Migrating globalSettings from localStorage → Supabase");
      } else {
        localStorage.setItem("globalSettings", JSON.stringify(cloudGlobalSettings));
      }
    }
    {
      const localSalim = safeParse(localStorage.getItem("expense_cats_salim"), []);
      const localAmuta = safeParse(localStorage.getItem("expense_cats_amuta"), []);
      const cloudIsDefault = cloudCats.salim.length === 8 && cloudCats.amuta.length === 6 && cloudCats.salim.includes("גור");
      const localHasData = localSalim.length > 0 || localAmuta.length > 0;
      if (localHasData && cloudIsDefault) {
        migrationPromises.push(
          saveExpenseCategoriesToDb(
            localSalim.length > 0 ? localSalim : cloudCats.salim,
            localAmuta.length > 0 ? localAmuta : cloudCats.amuta
          )
        );
        console.log("[storageSync] Migrating expense categories from localStorage → Supabase");
      } else {
        localStorage.setItem("expense_cats_salim", JSON.stringify(cloudCats.salim));
        localStorage.setItem("expense_cats_amuta", JSON.stringify(cloudCats.amuta));
      }
    }
    if (migrationPromises.length > 0) {
      await Promise.all(migrationPromises);
    }
    patchLocalStorage();
    bootstrapped = true;
  })();
  return bootstrapPromise;
}
const refreshers = {
  bachurim: async () => {
    const data = await fetchBachurim();
    writeWithoutSync("bachurim", JSON.stringify(data));
  },
  outings: async () => {
    const data = await fetchBachurim();
    writeWithoutSync("bachurim", JSON.stringify(data));
  },
  incomes: async () => {
    const data = await fetchIncomes();
    writeWithoutSync("incomes", JSON.stringify(data));
  },
  expenses: async () => {
    const data = await fetchExpenses();
    writeWithoutSync("expenses", JSON.stringify(data));
  },
  debts: async () => {
    const data = await fetchDebts();
    writeWithoutSync("debts", JSON.stringify(data));
  },
  askanim_incomes: async () => {
    const data = await fetchAskanimIncomes();
    writeWithoutSync("askanimIncomes", JSON.stringify(data));
  },
  basket_products: async () => {
    const data = await fetchBasketProducts();
    writeWithoutSync("basketProducts", JSON.stringify(data));
  },
  global_settings: async () => {
    const data = await fetchGlobalSettings();
    writeWithoutSync("globalSettings", JSON.stringify(data));
  },
  fundraisers: async () => {
    const data = await fetchFundraisers();
    writeWithoutSync("fundraisers", JSON.stringify(data));
  },
  expense_categories: async () => {
    const data = await fetchExpenseCategories();
    writeWithoutSync("expense_cats_salim", JSON.stringify(data.salim));
    writeWithoutSync("expense_cats_amuta", JSON.stringify(data.amuta));
  }
};
const refreshTimers = {};
const REFRESH_DELAY = 300;
function scheduleRefresh(table) {
  if (refreshTimers[table]) clearTimeout(refreshTimers[table]);
  refreshTimers[table] = setTimeout(async () => {
    delete refreshTimers[table];
    const fn = refreshers[table];
    if (!fn) return;
    try {
      await fn();
      window.dispatchEvent(new StorageEvent("storage", { key: table }));
    } catch (err) {
      console.error(`[realtimeSync] refresh failed for ${table}`, err);
    }
  }, REFRESH_DELAY);
}
let started = false;
function startRealtimeSync() {
  if (started) return;
  started = true;
  const channel = supabase.channel("app-realtime-sync");
  for (const table of Object.keys(refreshers)) {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      () => scheduleRefresh(table)
    );
  }
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      console.log("[realtimeSync] connected");
    } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      console.warn("[realtimeSync] channel status:", status);
    }
  });
}
const tabTitles = {
  dashboard: "ראשי",
  bachurim: "בחורים",
  askanim: "פרויקט עסקנים",
  income: "הכנסות",
  expenses: "הוצאות",
  debts: "חובות",
  "basket-cost": "עלות הסל",
  search: "חיפוש",
  reports: "דוחות",
  users: "משתמשים"
};
function Index() {
  const {
    session,
    loading: authLoading,
    profileStatus,
    isAdmin,
    registering
  } = useAuth();
  useEffect(() => {
    if (!authLoading && session && profileStatus !== "unknown" && profileStatus !== "approved" && !isAdmin) {
      try {
        sessionStorage.setItem("forced_signout_reason", profileStatus === "rejected" ? "הגישה שלך לאתר בוטלה על ידי המנהל." : "הגישה שלך הושעתה ומחכה לאישור המנהל.");
      } catch {
      }
      supabase.auth.signOut().then(() => window.location.reload());
    }
  }, [authLoading, session, profileStatus, isAdmin]);
  if (authLoading || registering) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" }) });
  }
  if (!session) {
    return /* @__PURE__ */ jsx(AuthScreen, {});
  }
  if (profileStatus !== "approved" && !isAdmin) {
    return /* @__PURE__ */ jsx(AuthScreen, {});
  }
  return /* @__PURE__ */ jsx(AuthenticatedApp, {});
}
function AuthenticatedApp() {
  return /* @__PURE__ */ jsx(ChatPanelProvider, { children: /* @__PURE__ */ jsxs(NavigationProvider, { children: [
    /* @__PURE__ */ jsx(AuthenticatedAppInner, {}),
    /* @__PURE__ */ jsx(ChatPanel, {})
  ] }) });
}
function AuthenticatedAppInner() {
  const {
    activeTab,
    setActiveTab
  } = useNavigation();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const settingsBtnRef = useRef(null);
  useEffect(() => {
    bootstrapStorage().then(() => {
      startRealtimeSync();
      setReady(true);
    }).catch((err) => {
      console.error("Bootstrap failed", err);
      setError(err?.message || "שגיאה בטעינת נתונים");
      setReady(true);
    });
  }, []);
  function handleOpenSettings() {
    settingsBtnRef.current?.click();
  }
  if (!ready) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "טוען נתונים מהענן..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    error && /* @__PURE__ */ jsx("div", { className: "bg-destructive/10 text-destructive text-center text-sm py-2", children: error }),
    /* @__PURE__ */ jsx(AppHeader, { activeTab, onTabChange: setActiveTab, settingsBtnRef }),
    /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-7xl", children: activeTab === "dashboard" ? /* @__PURE__ */ jsx(Dashboard, {}) : activeTab === "bachurim" ? /* @__PURE__ */ jsx(BachurimModule, {}) : activeTab === "askanim" ? /* @__PURE__ */ jsx(AskanimModule, {}) : activeTab === "income" ? /* @__PURE__ */ jsx(IncomesModule, {}) : activeTab === "expenses" ? /* @__PURE__ */ jsx(ExpensesModule, {}) : activeTab === "debts" ? /* @__PURE__ */ jsx(DebtsModule, {}) : activeTab === "basket-cost" ? /* @__PURE__ */ jsx(BasketCostModule, { onOpenSettings: handleOpenSettings }) : activeTab === "search" ? /* @__PURE__ */ jsx(SearchModule, {}) : activeTab === "reports" ? /* @__PURE__ */ jsx(ReportsModule, {}) : activeTab === "users" ? /* @__PURE__ */ jsx(UsersAdminModule, {}) : /* @__PURE__ */ jsx(TabPlaceholder, { title: tabTitles[activeTab] }) })
  ] });
}
export {
  Index as component
};
