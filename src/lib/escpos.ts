import type { Department, Order, OrderLineItem, TableState } from '../shared/types';

// ESC/POS control constants
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const CMD_INIT = [ESC, 0x40]; // ESC @ Initialize
const CMD_CP858 = [ESC, 0x74, 19]; // ESC t 19 -> PC858 (Euro + Latin-1)
const CMD_ALIGN_LEFT = [ESC, 0x61, 0];
const CMD_ALIGN_CENTER = [ESC, 0x61, 1];
const CMD_ALIGN_RIGHT = [ESC, 0x61, 2];
const CMD_BOLD_ON = [ESC, 0x45, 1];
const CMD_BOLD_OFF = [ESC, 0x45, 0];
const CMD_SIZE_NORMAL = [GS, 0x21, 0x00];
const CMD_SIZE_DOUBLE_H = [GS, 0x21, 0x01];
const CMD_SIZE_DOUBLE_WH = [GS, 0x21, 0x11]; // Double width & height
const CMD_CUT_PARTIAL = [GS, 0x56, 66, 12]; // Feed & partial cut

// CP858 character table for Italian, German, Euro & common punctuation
const CP858_MAP: Record<string, number> = {
  '€': 0xd5,
  'à': 0x85,
  'á': 0xa0,
  'â': 0x83,
  'ä': 0x84,
  'è': 0x8a,
  'é': 0x82,
  'ê': 0x88,
  'ë': 0x89,
  'ì': 0x8d,
  'í': 0xa1,
  'î': 0x8c,
  'ï': 0x8b,
  'ò': 0x95,
  'ó': 0xa2,
  'ô': 0x93,
  'ö': 0x94,
  'ù': 0x97,
  'ú': 0xa3,
  'û': 0x96,
  'ü': 0x81,
  'À': 0xb7,
  'È': 0xd4,
  'É': 0x90,
  'Ì': 0xde,
  'Ò': 0xe3,
  'Ù': 0xeb,
  'Ä': 0x8e,
  'Ö': 0x99,
  'Ü': 0x9a,
  'ß': 0xe1,
  'ç': 0x87,
  'Ç': 0x80,
  '°': 0xf8,
  '’': 0x27,
  '‘': 0x27,
  '“': 0x22,
  '”': 0x22,
  '–': 0x2d,
  '—': 0x2d,
  '·': 0xfa,
};

export function encodeCp858(text: string): number[] {
  const bytes: number[] = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0x20 && code <= 0x7e) {
      bytes.push(code);
    } else if (CP858_MAP[ch] !== undefined) {
      bytes.push(CP858_MAP[ch]);
    } else {
      bytes.push(0x3f); // '?'
    }
  }
  return bytes;
}

export function getPrintCols(): number {
  const parsed = Number(process.env.PRINT_COLS || 48);
  return Number.isFinite(parsed) && parsed >= 32 && parsed <= 64 ? parsed : 48;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
  });
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome',
  });
}

function formatEuro(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')} €`;
}

function padLine(left: string, right: string, cols: number): string {
  const cleanLeft = left.trim();
  const cleanRight = right.trim();
  const space = cols - cleanLeft.length - cleanRight.length;
  if (space >= 1) {
    return `${cleanLeft}${' '.repeat(space)}${cleanRight}`;
  }
  const maxLeft = Math.max(8, cols - cleanRight.length - 1);
  return `${cleanLeft.slice(0, maxLeft)} ${cleanRight}`;
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if (!current) {
      current = w;
    } else if (current.length + 1 + w.length <= maxLen) {
      current += ` ${w}`;
    } else {
      lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

class EscPosBuilder {
  private buf: number[] = [];
  private preview: string[] = [];

  init() {
    this.buf.push(...CMD_INIT, ...CMD_CP858);
    return this;
  }

  align(mode: 'left' | 'center' | 'right') {
    if (mode === 'center') this.buf.push(...CMD_ALIGN_CENTER);
    else if (mode === 'right') this.buf.push(...CMD_ALIGN_RIGHT);
    else this.buf.push(...CMD_ALIGN_LEFT);
    return this;
  }

  bold(on: boolean) {
    this.buf.push(...(on ? CMD_BOLD_ON : CMD_BOLD_OFF));
    return this;
  }

  size(mode: 'normal' | 'doubleH' | 'doubleWH') {
    if (mode === 'doubleWH') this.buf.push(...CMD_SIZE_DOUBLE_WH);
    else if (mode === 'doubleH') this.buf.push(...CMD_SIZE_DOUBLE_H);
    else this.buf.push(...CMD_SIZE_NORMAL);
    return this;
  }

  line(text = '', cols = getPrintCols(), centerInPreview = false) {
    this.buf.push(...encodeCp858(text), LF);
    if (centerInPreview && text.length < cols) {
      const pad = Math.floor((cols - text.length) / 2);
      this.preview.push(`${' '.repeat(pad)}${text}`);
    } else {
      this.preview.push(text);
    }
    return this;
  }

  hr(char = '-', cols = getPrintCols()) {
    return this.line(char.repeat(cols), cols);
  }

  feed(lines = 2) {
    for (let i = 0; i < lines; i++) {
      this.buf.push(LF);
      this.preview.push('');
    }
    return this;
  }

  cut() {
    this.buf.push(...CMD_CUT_PARTIAL);
    return this;
  }

  build(): { payloadBase64: string; previewText: string } {
    return {
      payloadBase64: Buffer.from(this.buf).toString('base64'),
      previewText: this.preview.join('\n'),
    };
  }
}

/**
 * Generates Department Ticket (CUCINA or BAR):
 * - Double-width/double-height text for immediate legibility
 * - NO prices
 * - Explicitly marks COMANDA DA CLIENTE when ordered by guest
 */
export function buildDepartmentReceipt(
  order: Order,
  department: Department,
  deptItems: OrderLineItem[]
): { payloadBase64: string; previewText: string } {
  const cols = getPrintCols();
  const doubleCols = Math.floor(cols / 2); // 24 cols in double width
  const b = new EscPosBuilder().init();

  b.align('center')
    .bold(true)
    .size('doubleWH')
    .line(`REPARTO ${department}`, doubleCols, true)
    .line(`TAVOLO ${order.tableNumber}`, doubleCols, true)
    .size('normal')
    .bold(false);

  if (order.source === 'customer') {
    b.bold(true)
      .size('doubleH')
      .line('*** COMANDA DA CLIENTE ***', cols, true)
      .size('normal')
      .bold(false);
  } else {
    b.bold(true).line('COMANDA CAMERIERE', cols, true).bold(false);
  }

  b.align('left')
    .hr('=', cols)
    .line(padLine(`Coperti: ${order.covers}`, `Ora: ${formatTime(order.createdAt)}`, cols), cols)
    .line(`Comanda #${order.id.slice(-6).toUpperCase()}`, cols)
    .hr('-', cols);

  for (const item of deptItems) {
    b.bold(true).size('doubleWH');
    for (const line of wrapText(`${item.qty}x ${item.name}`, doubleCols)) {
      b.line(line, doubleCols);
    }
    b.size('normal').bold(false);

    if (item.selectedOptions.length > 0) {
      b.bold(true);
      for (const optLine of wrapText(`  > ${item.selectedOptions.join(' / ')}`, cols)) {
        b.line(optLine, cols);
      }
      b.bold(false);
    }

    const notes = [...item.quickNotes];
    if (item.customNote?.trim()) notes.push(item.customNote.trim());
    if (notes.length > 0) {
      b.size('doubleH').bold(true);
      for (const nLine of wrapText(`  NOTE: ${notes.join(', ')}`, cols)) {
        b.line(nLine, cols);
      }
      b.bold(false).size('normal');
    }
    b.line('', cols);
  }

  if (order.generalNote?.trim()) {
    b.hr('-', cols)
      .bold(true)
      .size('doubleH')
      .line('NOTA GENERALE:', cols);
    for (const gLine of wrapText(order.generalNote.trim(), cols)) {
      b.line(gLine, cols);
    }
    b.size('normal').bold(false);
  }

  b.hr('=', cols).feed(3).cut();
  return b.build();
}

/**
 * Generates Cashier Order Ticket (CASSA):
 * - Itemized prices & order total in €
 * - Includes "Documento non fiscale"
 */
export function buildCashierOrderReceipt(order: Order): { payloadBase64: string; previewText: string } {
  const cols = getPrintCols();
  const b = new EscPosBuilder().init();

  b.align('center')
    .bold(true)
    .size('doubleWH')
    .line('PIT STOP 2.0', Math.floor(cols / 2), true)
    .size('normal')
    .line('COPIA CASSA - COMANDA', cols, true)
    .bold(false);

  if (order.source === 'customer') {
    b.bold(true).line('*** COMANDA DA CLIENTE ***', cols, true).bold(false);
  }

  b.align('left')
    .hr('-', cols)
    .line(padLine(`Tavolo: ${order.tableNumber}`, `Coperti: ${order.covers}`, cols), cols)
    .line(padLine(`Data: ${formatDateTime(order.createdAt)}`, `#${order.id.slice(-6).toUpperCase()}`, cols), cols)
    .hr('-', cols);

  for (const item of order.items) {
    const lineTotal = item.qty * item.unitPrice;
    b.bold(true)
      .line(padLine(`${item.qty}x ${item.name}`, formatEuro(lineTotal), cols), cols)
      .bold(false);

    if (item.selectedOptions.length > 0) {
      b.line(`   (${item.selectedOptions.join(', ')})`, cols);
    }
    const notes = [...item.quickNotes];
    if (item.customNote?.trim()) notes.push(item.customNote.trim());
    if (notes.length > 0) {
      b.line(`   Nota: ${notes.join(', ')}`, cols);
    }
  }

  if (order.generalNote?.trim()) {
    b.hr('-', cols).line(`Nota generale: ${order.generalNote.trim()}`, cols);
  }

  b.hr('=', cols)
    .bold(true)
    .size('doubleH')
    .line(padLine('TOTALE COMANDA', formatEuro(order.total), cols), cols)
    .size('normal')
    .bold(false)
    .hr('-', cols)
    .align('center')
    .line('Documento non fiscale', cols, true)
    .feed(3)
    .cut();

  return b.build();
}

/**
 * Generates Table Closing Bill (CONTO TAVOLO - Non Fiscale)
 */
export function buildTableBillReceipt(table: TableState): { payloadBase64: string; previewText: string } {
  const cols = getPrintCols();
  const b = new EscPosBuilder().init();

  b.align('center')
    .bold(true)
    .size('doubleWH')
    .line('PIT STOP 2.0', Math.floor(cols / 2), true)
    .size('normal')
    .line('PIZZERIA RISTORANTE', cols, true)
    .line('CONTO TAVOLO (RIEPILOGO)', cols, true)
    .bold(false)
    .align('left')
    .hr('=', cols)
    .line(padLine(`TAVOLO ${table.tableNumber}`, `Coperti: ${table.covers}`, cols), cols)
    .line(`Stampato il: ${formatDateTime(Date.now())}`, cols)
    .hr('-', cols);

  // Aggregate identical items across all orders in the table session
  const aggregated = new Map<string, { label: string; qty: number; total: number }>();
  for (const order of table.orders) {
    for (const item of order.items) {
      const opts = item.selectedOptions.length > 0 ? ` (${item.selectedOptions.join(', ')})` : '';
      const key = `${item.itemId}|${opts}|${item.unitPrice}`;
      const existing = aggregated.get(key);
      if (existing) {
        existing.qty += item.qty;
        existing.total += item.qty * item.unitPrice;
      } else {
        aggregated.set(key, {
          label: `${item.name}${opts}`,
          qty: item.qty,
          total: item.qty * item.unitPrice,
        });
      }
    }
  }

  for (const entry of Array.from(aggregated.values())) {
    b.line(padLine(`${entry.qty}x ${entry.label}`, formatEuro(entry.total), cols), cols);
  }

  b.hr('=', cols)
    .bold(true)
    .size('doubleWH')
    .line(padLine('TOTALE', formatEuro(table.total), Math.floor(cols / 2)), Math.floor(cols / 2))
    .size('normal')
    .bold(false)
    .hr('-', cols)
    .align('center')
    .bold(true)
    .line('Documento non fiscale', cols, true)
    .bold(false)
    .line('Grazie per la visita!', cols, true)
    .feed(3)
    .cut();

  return b.build();
}

/**
 * Diagnostic Test Ticket (PROVA STAMPA)
 */
export function buildTestPrintReceipt(): { payloadBase64: string; previewText: string } {
  const cols = getPrintCols();
  const b = new EscPosBuilder().init();

  b.align('center')
    .bold(true)
    .size('doubleWH')
    .line('PIT STOP 2.0', Math.floor(cols / 2), true)
    .size('normal')
    .line('PROVA STAMPA BRIDGE ESC/POS', cols, true)
    .bold(false)
    .align('left')
    .hr('=', cols)
    .line(`Data/Ora: ${formatDateTime(Date.now())}`, cols)
    .line(`Colonne configurate: ${cols}`, cols)
    .line('Codifica: CP858 (Euro € & Accenti)', cols)
    .line('Accenti IT/DE: à è é ì ò ù ä ö ü ß €', cols)
    .hr('-', cols)
    .size('doubleWH')
    .line('CARATTERE DOPPIO OK', Math.floor(cols / 2))
    .size('normal')
    .hr('=', cols)
    .align('center')
    .line('Stampante pronta per il servizio', cols, true)
    .line('Documento non fiscale', cols, true)
    .feed(3)
    .cut();

  return b.build();
}
