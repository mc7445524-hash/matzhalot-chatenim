/** Writes a locked Excel form by hand, as raw OOXML inside a zip.
 *
 *  The `xlsx` package in this project is the community build: it can read
 *  styles but cannot write them, and it cannot write sheet protection at
 *  all. Both are the whole point of this form — the office fills in a few
 *  yellow cells and must not be able to insert a row, move a name, or
 *  retype a sum that the system calculated. So the file is assembled here
 *  from the four XML parts Excel actually needs, zipped with jszip, which
 *  is already a dependency.
 *
 *  Deliberately not a general spreadsheet writer. It does exactly what the
 *  outing form needs and nothing else.
 */

export type CellKind =
  | "banner"   // the red warning strip across the top
  | "label"    // "שם היציאה:" and friends
  | "header"   // the column headings
  | "locked"   // data the office must not touch — red
  | "lockedNum"// the same, shown as a number
  | "fill";    // the only cells that can be typed into — yellow

export interface Cell {
  v: string | number | null;
  k: CellKind;
}

export interface SheetSpec {
  sheetName: string;
  rows: Cell[][];
  /** Column widths, in Excel's character units, left to right. */
  colWidths: number[];
  /** Ranges such as "A1:I2". */
  merges?: string[];
  /** 1-based row number → height in points. */
  rowHeights?: Record<number, number>;
  /** 1-based row number the sheet freezes above (headers stay visible). */
  freezeBelowRow?: number;
  /** Columns (0-based) that may only receive a number ≥ 0. */
  numericCols?: number[];
  /** 1-based first and last row the numeric rule covers. */
  numericRange?: [number, number];
}

const STYLE_INDEX: Record<CellKind, number> = {
  banner: 1,
  label: 2,
  header: 3,
  locked: 4,
  lockedNum: 5,
  fill: 6,
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\r?\n/g, "&#10;");
}

export function colLetter(i: number): string {
  let s = "";
  let n = i;
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

/** Fonts, fills, borders and the cell formats that combine them.
 *
 *  Index 0 of fonts/fills/borders must exist and fill index 1 must be
 *  gray125 — Excel rejects the file otherwise, even though nothing uses
 *  either of them.
 */
function stylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="6">
<font><sz val="11"/><name val="Arial"/></font>
<font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
<font><b/><sz val="11"/><color rgb="FF1F3864"/><name val="Arial"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
<font><sz val="11"/><color rgb="FF9C0006"/><name val="Arial"/></font>
<font><b/><sz val="11"/><color rgb="FF7F6000"/><name val="Arial"/></font>
</fonts>
<fills count="6">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFC00000"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF1F4E79"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFC7CE"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFEB9C"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFBFBFBF"/></left><right style="thin"><color rgb="FFBFBFBF"/></right><top style="thin"><color rgb="FFBFBFBF"/></top><bottom style="thin"><color rgb="FFBFBFBF"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="7">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1" applyProtection="1"><alignment horizontal="center" vertical="center" wrapText="1"/><protection locked="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1" applyProtection="1"><alignment vertical="center"/><protection locked="1"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1" applyProtection="1"><alignment horizontal="center" vertical="center" wrapText="1"/><protection locked="1"/></xf>
<xf numFmtId="0" fontId="4" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1" applyProtection="1"><alignment vertical="center"/><protection locked="1"/></xf>
<xf numFmtId="3" fontId="4" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1" applyProtection="1"><alignment vertical="center"/><protection locked="1"/></xf>
<xf numFmtId="0" fontId="5" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1" applyProtection="1"><alignment vertical="center"/><protection locked="0"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function sheetXml(spec: SheetSpec): string {
  const cols = spec.colWidths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join("");

  const rowsXml = spec.rows
    .map((cells, r) => {
      const rowNum = r + 1;
      const h = spec.rowHeights?.[rowNum];
      const attrs = h ? ` ht="${h}" customHeight="1"` : "";
      const cellsXml = cells
        .map((c, i) => {
          const ref = `${colLetter(i)}${rowNum}`;
          const s = STYLE_INDEX[c.k];
          if (c.v === null || c.v === "") return `<c r="${ref}" s="${s}"/>`;
          if (typeof c.v === "number") return `<c r="${ref}" s="${s}"><v>${c.v}</v></c>`;
          return `<c r="${ref}" s="${s}" t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowNum}"${attrs}>${cellsXml}</row>`;
    })
    .join("");

  const pane = spec.freezeBelowRow
    ? `<pane ySplit="${spec.freezeBelowRow}" topLeftCell="A${spec.freezeBelowRow + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/>`
    : "";

  // Every attribute set to 1 is an action Excel will refuse. Selecting
  // cells stays allowed, otherwise the sheet cannot even be read
  // comfortably. No password: a locked-out user with no way back would be
  // a worse failure than an edit made on purpose.
  const protection =
    `<sheetProtection sheet="1" objects="1" scenarios="1" formatCells="1" formatColumns="1"` +
    ` formatRows="1" insertColumns="1" insertRows="1" insertHyperlinks="1" deleteColumns="1"` +
    ` deleteRows="1" sort="1" autoFilter="1" pivotTables="1"` +
    ` selectLockedCells="0" selectUnlockedCells="0"/>`;

  const merges = spec.merges?.length
    ? `<mergeCells count="${spec.merges.length}">${spec.merges
        .map((m) => `<mergeCell ref="${m}"/>`)
        .join("")}</mergeCells>`
    : "";

  let validations = "";
  if (spec.numericCols?.length && spec.numericRange) {
    const [from, to] = spec.numericRange;
    const sqref = spec.numericCols
      .map((c) => `${colLetter(c)}${from}:${colLetter(c)}${to}`)
      .join(" ");
    validations =
      `<dataValidations count="1"><dataValidation type="decimal" operator="greaterThanOrEqual"` +
      ` allowBlank="1" showInputMessage="1" showErrorMessage="1"` +
      ` errorTitle="${esc("רק מספרים")}" error="${esc("בתא הזה אפשר לכתוב רק סכום במספרים, לא אותיות.")}"` +
      ` sqref="${sqref}"><formula1>0</formula1></dataValidation></dataValidations>`;
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView rightToLeft="1" tabSelected="1" workbookViewId="0">${pane}</sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="15"/>
<cols>${cols}</cols>
<sheetData>${rowsXml}</sheetData>
${protection}
${merges}
${validations}
</worksheet>`;
}

/** Builds the workbook and hands the browser the download. */
export async function downloadProtectedSheet(fileName: string, spec: SheetSpec): Promise<void> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`
  );

  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${esc(spec.sheetName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
  );

  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
  );

  zip.file("xl/styles.xml", stylesXml());
  zip.file("xl/worksheets/sheet1.xml", sheetXml(spec));

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
