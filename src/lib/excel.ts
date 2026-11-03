/** Shared Excel reading helpers.
 *
 *  MasterExcelImport.tsx carries its own private copies of most of these.
 *  They are duplicated here on purpose rather than lifted out of it: that
 *  wizard is the one import path the office relies on daily, and a refactor
 *  of it to share code is risk with no payoff for the caller here.
 */

export function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export function toStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

/** Strict amount parser.
 *
 *  Deliberately unlike MasterExcelImport's toNum, which strips any
 *  non-numeric character and so turns "אין" into 0 — silently importing a
 *  typo as a real zero. Here anything that is not a number is reported.
 */
export function parseAmount(v: unknown): { ok: boolean; value: number } {
  const s = toStr(v).replace(/[,\s₪]/g, "");
  if (s === "") return { ok: true, value: 0 };
  const n = Number(s);
  if (!isFinite(n)) return { ok: false, value: 0 };
  return { ok: true, value: n };
}

/** Excel serial date or a written date → ISO YYYY-MM-DD. */
export function parseDate(v: unknown): string {
  if (v === null || v === undefined || v === "") return todayIso();
  if (typeof v === "number" && v > 1000 && v < 100000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + v * 86400000).toISOString().split("T")[0];
  }
  const s = String(v).trim().split(" ")[0];
  const m = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return todayIso();
}

export function normalizeName(n: string): string {
  return n.replace(/["׳״'`]/g, "").replace(/\s+/g, " ").trim();
}

/** Strip the quoting variants Hebrew headers are written with, so that
 *  'מק"ט', 'מקט' and 'מק״ט' all compare equal. */
export function normalizeHeader(h: unknown): string {
  return toStr(h).replace(/["׳״'`.]/g, "").replace(/\s+/g, " ").trim();
}

export function fmtDateHe(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("he-IL");
}
