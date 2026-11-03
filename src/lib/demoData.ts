/** Invented data for demo mode.
 *
 *  Generated from a fixed seed rather than written out row by row, so the
 *  set is large enough to look like a real year of work while staying a
 *  file someone can still read. The same seed every time also means a
 *  recorded walkthrough matches what the next viewer sees.
 *
 *  Every name here is made up. Nothing in this file comes from the real
 *  database.
 */

/** Deterministic PRNG — mulberry32. */
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "אברהם", "יצחק", "יעקב", "משה", "אהרן", "דוד", "שלמה", "שמואל", "יוסף", "בנימין",
  "מנחם", "מרדכי", "נתן", "אליהו", "זאב", "חיים", "ישראל", "יהודה", "לוי", "נפתלי",
  "עזריאל", "פנחס", "צבי", "קלמן", "ראובן", "שמעון", "אשר", "גרשון", "דניאל", "הלל",
];
const LAST = [
  "רוזנברג", "פרידמן", "שטרן", "גולדשטיין", "וייס", "כץ", "לוי", "הורוביץ", "ברנשטיין",
  "אפשטיין", "זילברמן", "גרינבאום", "מנדלבוים", "פישר", "אדלר", "שפירא", "בלום", "קליין",
];
const CLASSES = ["א", "ב", "ג", "ד", "ה", "ו"];

const OUTING_NAMES = [
  "מכירת יינות — סוכות", "קמפיין חנוכה", "יריד פורים", "מגבית פסח",
  "מכירת ספרים — שבועות", "התרמת בין הזמנים", "יציאה לבני ברק", "יציאה לירושלים",
];
const PAYMENTS = ["מזומן", "מזומן", "מזומן", "אשראי", "אשראי", "אחר"];
const PAYMENT_DETAIL: Record<string, string> = { אחר: "העברה בביט" };

const uid = (p: string, n: number) => `demo-${p}-${String(n).padStart(4, "0")}`;
const iso = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

export interface DemoSet {
  bachurim: any[];
  incomes: any[];
  expenses: any[];
  debts: any[];
  askanimIncomes: any[];
  basketProducts: any[];
  globalSettings: any;
  fundraisers: string[];
  expense_cats_salim: string[];
  expense_cats_amuta: string[];
  tasks: any[];
  employees: any[];
}

export function buildDemoData(): DemoSet {
  const r = rng(20261103);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

  const MINIMUM = 5000;
  const BASKET_COST = 6000;

  // ── bachurim ──────────────────────────────────────────────
  const used = new Set<string>();
  const bachurim: any[] = [];
  for (let i = 0; i < 34; i++) {
    let sku: string;
    do { sku = String(int(1, 49999)).padStart(5, "0"); } while (used.has(sku));
    used.add(sku);

    const name = `${FIRST[i % FIRST.length]} ${pick(LAST)}`;
    // Spread the intake so every status in the app is represented: some
    // well past the minimum, some just under it, some barely started.
    const band = i % 5;
    const target =
      band === 0 ? int(5200, 9000) :
      band === 1 ? int(4100, 4950) :
      band === 2 ? int(2000, 3800) :
      band === 3 ? int(200, 1500) : 0;

    const outings: any[] = [];
    let left = target;
    let guard = 0;
    while (left > 250 && guard++ < 6) {
      const amount = guard === 6 ? left : Math.min(left, int(300, 2200));
      const method = pick(PAYMENTS);
      outings.push({
        id: uid("out", bachurim.length * 10 + outings.length),
        name: pick(OUTING_NAMES),
        date: iso(int(10, 330)),
        amount,
        paymentMethod: method,
        paymentMethodDetail: PAYMENT_DETAIL[method],
      });
      left -= amount;
    }

    const total = outings.reduce((s, o) => s + o.amount, 0);
    const married = i % 11 === 7;
    const receivedBasket = !married && total >= MINIMUM && i % 3 === 0;

    bachurim.push({
      id: uid("b", i),
      sku,
      name,
      classLevel: CLASSES[Math.min(5, Math.floor(i / 6))],
      joinDate: iso(int(340, 900)),
      outings,
      married,
      marriedDate: married ? iso(int(5, 120)) : undefined,
      receivedBasket,
      basketDate: receivedBasket ? iso(int(5, 150)) : undefined,
      basketCostAtTime: receivedBasket ? BASKET_COST : undefined,
      inAskanim: i % 4 === 1,
      closed: i % 17 === 5,
    });
  }

  // ── askanim incomes (mirrored into incomes, as the app does) ──
  const askanimIncomes: any[] = [];
  const incomes: any[] = [];
  bachurim.filter((b) => b.inAskanim && !b.married).forEach((b, k) => {
    for (let j = 0; j < int(1, 3); j++) {
      const amount = int(300, 1800);
      const date = iso(int(20, 300)).slice(0, 10);
      askanimIncomes.push({
        id: uid("ask", k * 10 + j),
        bachurId: b.id,
        bachurName: b.name,
        date,
        amount,
        notes: pick(["סבב עסקנים — חורף", "סבב עסקנים — קיץ", "גיוס עסקנים"]),
      });
      incomes.push({
        id: uid("askmir", k * 10 + j),
        description: `פרויקט עסקנים – ${b.name}`,
        amount,
        date,
        category: "פרויקט עסקנים",
        target: "עמותה",
        recognized: false,
      });
    }
  });

  // ── general incomes ───────────────────────────────────────
  const fundraisers = ["ר' מאיר גולד", "ר' אלימלך בר", "ר' שמעון דר"];
  const DONORS = [
    "תרומת משפחת פרידמן", "מגבית שנתית", "תרומה מקרן חסדי לב", "הכנסות מהגרלה",
    "תרומת עלמוני", "מכירת לוחות שנה", "השתתפות הורים", "תרומה מבית הכנסת המרכזי",
  ];
  DONORS.forEach((d, i) => {
    incomes.push({
      id: uid("inc", i),
      description: d,
      amount: int(1500, 14000),
      date: iso(int(15, 320)).slice(0, 10),
      category: "תרומות",
      target: i % 3 === 0 ? "סלים" : "עמותה",
      recognized: i % 2 === 0,
      recognizedDate: i % 2 === 0 ? iso(int(5, 200)).slice(0, 10) : undefined,
      fundraiser: pick(fundraisers),
    });
  });

  // ── expenses ──────────────────────────────────────────────
  const expense_cats_salim = ["רכישת סלים", "הובלות", "אריזה"];
  const expense_cats_amuta = ["שכירות", "משרד", "פרסום", "הנהלת חשבונות", "אירועים"];
  const expenses: any[] = ([
    ["רכישת 8 סלים", 48000, "סלים", "רכישת סלים", "ספק הסלים המרכזי"],
    ["הובלת סלים לבתים", 2400, "סלים", "הובלות", "הובלות אחים"],
    ["חומרי אריזה", 1150, "סלים", "אריזה", "מחסן האריזות"],
    ["שכירות משרד — רבעון", 7200, "עמותה", "שכירות", "בעל הנכס"],
    ["הדפסות ופרסום", 3100, "עמותה", "פרסום", "דפוס מהיר"],
    ["הנהלת חשבונות שנתית", 4800, "עמותה", "הנהלת חשבונות", 'רו"ח שטרן'],
    ["ערב התרמה", 6400, "עמותה", "אירועים", "אולמי השלום"],
    ["ציוד משרדי", 980, "עמותה", "משרד", "סטימצקי"],
  ] as [string, number, string, string, string][]).map(([notes, amount, category, subCategory, contactPerson], i) => ({
    id: uid("exp", i),
    amount,
    date: iso(int(10, 300)).slice(0, 10),
    category,
    subCategory,
    notes,
    contactPerson,
    recognized: i % 3 !== 2,
    recognizedDate: i % 3 !== 2 ? iso(int(5, 200)).slice(0, 10) : undefined,
  }));

  // ── debts ─────────────────────────────────────────────────
  const debts = ([
    ['הלוואה מגמ"ח מרכזי', 20000, 12000],
    ["הלוואה מר' יצחק", 8000, 8000],
    ["אשראי מול ספק הסלים", 15000, 0],
  ] as [string, number, number][]).map(([name, amount, returnedAmount], i) => ({
    id: uid("debt", i),
    date: iso(int(30, 260)).slice(0, 10),
    name,
    amount,
    notes: "",
    returned: returnedAmount >= amount,
    returnedAmount,
    returnedVia: returnedAmount ? "העברה בנקאית" : undefined,
    returnedDate: returnedAmount ? iso(int(5, 100)).slice(0, 10) : undefined,
  }));

  // ── basket products ───────────────────────────────────────
  const basketProducts = ([
    ['ש"ס מהדורה מאירת עיניים', 2400],
    ['מערכת רמב"ם', 900],
    ["שולחן ערוך", 750],
    ["ארון ספרים", 1200],
    ["מנורת לימוד", 300],
    ["שטיח", 450],
  ] as [string, number][]).map(([name, cost], i) => ({ id: uid("prod", i), name, cost }));

  const globalSettings = {
    basketCost: BASKET_COST,
    minimumForBasket: MINIMUM,
    amutaSupplement: 1500,
    basketCostHistory: [],
  };

  // ── tasks + employees ─────────────────────────────────────
  const employees = ["מנחם", "דוד", "יוסי"].map((name, i) => ({
    id: uid("emp", i), name, archived: false,
  }));
  const tasks = ([
    ["להזמין סלים לחודש הבא", "in_progress", 0, 2],
    ["לסגור חשבון מול ספק ההובלות", "todo", 1, -1],
    ["לעדכן את רשימת העסקנים", "todo", 2, 5],
    ["לשלוח קבלות לתורמים", "done", 0, 9],
    ["לבדוק מי קרוב לסל ולהתקשר", "todo", 1, 1],
  ] as [string, string, number, number][]).map(([title, status, emp, due], i) => ({
    id: uid("task", i),
    title,
    description: "",
    status,
    assignee: employees[emp].name,
    due_date: iso(-due).slice(0, 10),
    created_at: iso(int(2, 30)),
    remind_at: null,
    reminded_at: null,
  }));

  return {
    bachurim, incomes, expenses, debts, askanimIncomes, basketProducts,
    globalSettings, fundraisers, expense_cats_salim, expense_cats_amuta,
    tasks, employees,
  };
}
