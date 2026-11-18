/**
 * Where the money is, and whose it is.
 *
 * Every shekel the amuta holds sits in one of two pockets. The salim pocket
 * is money already spoken for: what bachurim put in towards their own
 * basket, what the amuta has set aside to top those baskets up, and what is
 * still owed to shops for baskets already handed over. The amuta pocket is
 * everything else, and only the part of it that nothing is claiming can
 * actually be spent.
 *
 * The two pockets are a way of reading the same bank balance, never a
 * movement of money: nothing in this file is written anywhere. It is all
 * derived on the spot from the bachurim, the expenses and the incomes, so a
 * change to the minimum or to a shop's price is reflected everywhere at once
 * and no stale figure can survive in a corner.
 *
 *   salim + amuta-free + open shop debts = the bank
 *
 * That identity holds after every operation, and `reconcile()` checks it.
 */

import { CLOSE_TO_BASKET_RATIO } from "./db";
import type {
  AskanimIncome, Bachur, BasketProduct, BasketShare, Expense, Income,
} from "./db";

// ─── Input ────────────────────────────────────────────────────

export interface MoneyInput {
  bachurim: Bachur[];
  incomes: Income[];
  askanimIncomes: AskanimIncome[];
  expenses: Expense[];
  products: BasketProduct[];
  /** The amount a bachur has to reach before he is entitled to a basket. */
  minimum: number;
  /** What was in the bank on the day the books were opened, so that money
   *  which came in before the system did is not mistaken for nothing. */
  openingBalance?: number;
  /** What the bank statement says today. Nothing is computed from it; it is
   *  compared against `bank` so that a shortfall shows up on its own. */
  actualBank?: number;
  /** The books-minus-bank difference measured on the day the statement was
   *  read. The bank figure is derived from it, so it follows every entry
   *  without being typed again. */
  bankGap?: number;
}

// ─── Per bachur ───────────────────────────────────────────────

/** One shop's share of one bachur's basket, and whether it has been paid. */
export interface ShareState extends BasketShare {
  settled: boolean;
  /** The expense that settled it, when it has been settled. */
  expenseId?: string;
}

export interface BachurMoney {
  id: string;
  name: string;
  /** Everything he has put in, over all his outings. */
  given: number;
  /** His own money held against his basket — never more than the minimum,
   *  because anything above it belongs to the amuta from the moment it
   *  arrives. */
  inSalim: number;
  /** What he gave beyond the minimum. The amuta's, immediately. */
  excess: number;
  /** He has reached the minimum and has not married. */
  eligible: boolean;
  /** Between the minimum and the basket — a promise, not yet money. */
  closeToBasket: boolean;
  /** What the amuta has set aside to complete his basket. Fixed when he
   *  became eligible; money he adds afterwards does not reduce it. */
  allocation: number;
  /** The shops his basket was made of, with what is still owed to each. */
  shares: ShareState[];
  /** Still owed to shops for a basket he has already received. */
  owedToShops: number;
  /** Nothing is outstanding for him any more. */
  closed: boolean;
}

// ─── Totals ───────────────────────────────────────────────────

export interface Pockets {
  /** Bachurim's own money, up to the minimum. */
  salimFromBachurim: number;
  /** Set aside by the amuta for bachurim who are entitled but have not yet
   *  received a basket. */
  salimAllocations: number;
  /** Owed to shops for baskets already handed over. */
  salimOwedToShops: number;
  salimTotal: number;

  amutaAskanim: number;
  amutaDonations: number;
  /** Bachurim's money above the minimum. */
  amutaExcess: number;
  amutaOpening: number;
  /** What the amuta has lent out to the salim pocket. */
  amutaLentOut: number;
  /** What is left once every promise is honoured. Negative means the amuta
   *  has promised more baskets than it can pay for. */
  amutaFree: number;

  bank: number;
  /** The hand-typed bank figure, or null when none has been entered. */
  actualBank: number | null;
  /** actualBank - bank. Negative means money the books expect is not there.
   *  Null when nothing was entered, so that "no answer" is never drawn as
   *  a zero that looks like everything agrees. */
  bankDiff: number | null;
  /** What must be put back so the bachurim's money is all in the account. */
  holeInSalim: number | null;
  /** How much of the shortfall came out of the amuta's own free money. */
  missingFromAmuta: number | null;
  totalIncome: number;
  totalExpenses: number;
  /** Agreed with a shop but not yet handed over. */
  openShopDebts: number;
}

export interface Expected {
  /** Bachurim past 80% of the minimum but not yet entitled. A forecast —
   *  nothing is set aside for them. */
  approaching: number;
  approachingCount: number;
  /** Entitled, no basket yet. Already set aside in the salim pocket. */
  allocated: number;
  allocatedCount: number;
  /** Baskets handed over whose shops have not been paid. */
  shopDebt: number;
  shopDebtCount: number;
}

/** One shop, against the baskets it is owed for. */
export interface ShopLine {
  productId: string;
  name: string;
  active: boolean;
  /** The sum each unsettled bachur locked for this shop. */
  expected: number;
  openBachurim: { id: string; name: string; cost: number; date?: string }[];
  /** Everything paid to this shop for baskets. */
  paid: number;
  /** Settled bachurim, and what they had locked. */
  settledExpected: number;
  /** What the shop charged beyond — or below — what was locked. */
  gap: number;
}

export interface MoneyState {
  perBachur: BachurMoney[];
  byId: Map<string, BachurMoney>;
  pockets: Pockets;
  expected: Expected;
  shops: ShopLine[];
  /** Baskets handed over with at least one shop unpaid, oldest first. The
   *  first of them is the date from which the books stop agreeing. */
  openBaskets: BachurMoney[];
  minimum: number;
  basketCost: number;
}

// ─── Helpers ──────────────────────────────────────────────────

export function totalGiven(b: Bachur): number {
  return (b.outings || []).reduce((s, o) => s + (Number(o.amount) || 0), 0);
}

/** What a basket costs today: the active products, nothing withdrawn. */
export function currentBasketCost(products: BasketProduct[]): number {
  return products
    .filter((p) => p.active !== false)
    .reduce((s, p) => s + (Number(p.cost) || 0), 0);
}

/** The shops a basket going out today is made of. */
export function currentBreakdown(products: BasketProduct[]): BasketShare[] {
  return products
    .filter((p) => p.active !== false)
    .map((p) => ({ productId: p.id, name: p.name, cost: Number(p.cost) || 0 }));
}

/** An askan income is written twice — once of its own and once mirrored
 *  into the amuta incomes. Counting both would double that money, so the
 *  mirrors are dropped and the askanim list is the single source. */
export function withoutAskanimMirrors(incomes: Income[]): Income[] {
  return incomes.filter((i) => i.category !== "פרויקט עסקנים");
}

/** Who has been paid for whom. Keyed "<productId>|<bachurId>". */
function settlements(expenses: Expense[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const e of expenses) {
    if (!e.basketProductId) continue;
    for (const bachurId of e.basketBachurIds || []) {
      map.set(`${e.basketProductId}|${bachurId}`, e.id);
    }
  }
  return map;
}

// ─── The calculation ──────────────────────────────────────────

export function computeMoney(input: MoneyInput): MoneyState {
  const { bachurim, incomes, askanimIncomes, expenses, products } = input;
  const minimum = Number(input.minimum) || 0;
  const basketCost = currentBasketCost(products);
  const settled = settlements(expenses);

  // ── per bachur ──────────────────────────────────────────────
  const perBachur: BachurMoney[] = bachurim.map((b) => {
    const given = totalGiven(b);
    const live = !b.married;
    const eligible = live && minimum > 0 && given >= minimum;

    // A basket that has gone out carries the breakdown frozen onto it. One
    // handed over before that was recorded falls back to today's shops,
    // which is the best that can be said about it.
    const locked: BasketShare[] = b.receivedBasket
      ? (b.basketBreakdownAtTime?.length ? b.basketBreakdownAtTime : currentBreakdown(products))
      : [];

    const shares: ShareState[] = locked.map((s) => {
      const expenseId = settled.get(`${s.productId}|${b.id}`);
      return { ...s, settled: !!expenseId, expenseId };
    });
    const owedToShops = shares
      .filter((s) => !s.settled)
      .reduce((sum, s) => sum + s.cost, 0);

    return {
      id: b.id,
      name: b.name,
      given,
      inSalim: live ? Math.min(given, minimum) : 0,
      excess: live ? Math.max(0, given - minimum) : 0,
      eligible,
      closeToBasket:
        live && !eligible && minimum > 0 && given >= minimum * CLOSE_TO_BASKET_RATIO,
      // Set aside only while the basket is still to come.
      allocation:
        eligible && !b.receivedBasket ? Math.max(0, basketCost - minimum) : 0,
      shares,
      owedToShops,
      closed: !live && owedToShops === 0,
    };
  });

  // ── the two pockets ─────────────────────────────────────────
  const sum = (f: (m: BachurMoney) => number) => perBachur.reduce((s, m) => s + f(m), 0);

  const salimFromBachurim = sum((m) => m.inSalim);
  const salimAllocations = sum((m) => m.allocation);
  const salimOwedToShops = sum((m) => m.owedToShops);
  const salimTotal = salimFromBachurim + salimAllocations + salimOwedToShops;

  const generalIncomes = withoutAskanimMirrors(incomes);
  const amutaAskanim = askanimIncomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const amutaDonations = generalIncomes.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const amutaExcess = sum((m) => m.excess);
  const amutaOpening = Number(input.openingBalance) || 0;

  // Money a bachur gave stays income for good. It is in the bank whether he
  // has married or not, and dropping it when he marries would make it
  // vanish from the books while it is still sitting in the account.
  const totalIncome =
    sum((m) => m.given) + amutaDonations + amutaAskanim + amutaOpening;
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const bank = totalIncome - totalExpenses;

  // Agreed with a shop, not yet handed over, so still in the bank and not
  // the amuta's to spend.
  const openShopDebts = expenses
    .filter((e) => e.basketGapKind === "debt")
    .reduce((s, e) => s + (Number(e.basketGapAmount) || 0), 0);

  const amutaFree = bank - salimTotal - openShopDebts;

  // Comparing only the total means a shekel filed under the wrong pocket
  // still leaves the difference at zero. This catches money that is missing
  // altogether, not money that is merely misfiled.
  // Measured once, then derived. Money entered afterwards raises the books
  // and the bank together, so a bachur's deposit leaves the hole where it
  // was while a donation closes it — without any rule that tells the two
  // kinds of money apart.
  const gapRaw = input.bankGap;
  const bankGap =
    gapRaw === undefined || gapRaw === null || !Number.isFinite(Number(gapRaw))
      ? null
      : Number(gapRaw);
  const actualBank = bankGap === null ? null : bank - bankGap;
  const bankDiff = bankGap === null ? null : -bankGap;

  // Money that is simply not there. A shortfall eats the amuta's own free
  // money first — that is a loss and nothing has to be repaid — and only
  // what is left over bites into the bachurim's money, which does.
  const unexplained = bankDiff === null ? 0 : Math.max(0, -bankDiff);
  const missingFromAmuta =
    actualBank === null ? null : Math.min(unexplained, Math.max(0, amutaFree));
  // What has to be put back so that every shekel promised to a bachur is
  // actually in the account. A real donation arriving lowers this, and
  // rightly so: the cover really did improve. It does not lower the books
  // gap, because bank and books rise together — which is what makes that
  // figure the one a mistake cannot quietly erase.
  const holeInSalim =
    actualBank === null ? null : Math.max(0, salimTotal + openShopDebts - actualBank);

  const pockets: Pockets = {
    salimFromBachurim, salimAllocations, salimOwedToShops, salimTotal,
    amutaAskanim, amutaDonations, amutaExcess, amutaOpening,
    amutaLentOut: salimAllocations,
    amutaFree,
    bank, actualBank, bankDiff, holeInSalim, missingFromAmuta,
    totalIncome, totalExpenses, openShopDebts,
  };

  // ── what is still to come ───────────────────────────────────
  const approachingList = perBachur.filter((m) => m.closeToBasket);
  const allocatedList = perBachur.filter((m) => m.allocation > 0);
  const shopDebtList = perBachur.filter((m) => m.owedToShops > 0);

  const expected: Expected = {
    approaching: approachingList.length * Math.max(0, basketCost - minimum),
    approachingCount: approachingList.length,
    allocated: allocatedList.reduce((s, m) => s + m.allocation, 0),
    allocatedCount: allocatedList.length,
    shopDebt: shopDebtList.reduce((s, m) => s + m.owedToShops, 0),
    shopDebtCount: shopDebtList.length,
  };

  // ── shop by shop ────────────────────────────────────────────
  const shops: ShopLine[] = products.map((p) => {
    const openBachurim: ShopLine["openBachurim"] = [];
    let settledExpected = 0;
    for (const m of perBachur) {
      const share = m.shares.find((s) => s.productId === p.id);
      if (!share) continue;
      if (share.settled) settledExpected += share.cost;
      else openBachurim.push({ id: m.id, name: m.name, cost: share.cost });
    }
    const paid = expenses
      .filter((e) => e.basketProductId === p.id)
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    return {
      productId: p.id,
      name: p.name,
      active: p.active !== false,
      expected: openBachurim.reduce((s, x) => s + x.cost, 0),
      openBachurim,
      paid,
      settledExpected,
      // What the shop charged against what those baskets had locked.
      gap: paid - settledExpected,
    };
  });

  const bachurById = new Map(bachurim.map((b) => [b.id, b]));
  const openBaskets = perBachur
    .filter((m) => m.owedToShops > 0)
    .sort((a, b) => {
      const da = bachurById.get(a.id)?.basketDate || "";
      const db = bachurById.get(b.id)?.basketDate || "";
      return da.localeCompare(db);
    });

  return {
    perBachur,
    byId: new Map(perBachur.map((m) => [m.id, m])),
    pockets, expected, shops, openBaskets,
    minimum, basketCost,
  };
}

/** The invariants the model rests on.
 *
 *  The pocket identity itself cannot fail — `amutaFree` is defined as what
 *  is left of the bank — so checking it would prove nothing. These are the
 *  things that can actually go wrong: money appearing in a pocket that owns
 *  none, a bachur owing a shop more than his basket was ever worth, or the
 *  bank drifting away from income less expenses.
 */
export function reconcile(state: MoneyState): { ok: boolean; problems: string[] } {
  const { pockets, perBachur } = state;
  const problems: string[] = [];

  if (pockets.salimTotal < 0) {
    problems.push(`כיס הסלים שלילי: ${pockets.salimTotal}`);
  }
  if (Math.abs(pockets.bank - (pockets.totalIncome - pockets.totalExpenses)) > 0.5) {
    problems.push("היתרה בבנק לא שווה להכנסות פחות ההוצאות");
  }
  for (const m of perBachur) {
    const locked = m.shares.reduce((s, x) => s + x.cost, 0);
    if (m.owedToShops > locked + 0.5) {
      problems.push(`${m.name}: חוב לחנויות גדול מעלות הסל שננעלה`);
    }
    if (m.inSalim < 0 || m.excess < 0 || m.allocation < 0) {
      problems.push(`${m.name}: סכום שלילי`);
    }
  }
  return { ok: problems.length === 0, problems };
}
