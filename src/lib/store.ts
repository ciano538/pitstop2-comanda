import crypto from 'node:crypto';
import { ALL_MENU_ITEMS_MAP, TOTAL_TABLES } from '../shared/menu';
import type {
  AppStateResponse,
  BridgeHeartbeat,
  Order,
  OrderLineItem,
  OrderSource,
  PrintJob,
  ShiftState,
  TableState,
} from '../shared/types';
import {
  buildCashierOrderReceipt,
  buildDepartmentReceipt,
  buildTableBillReceipt,
  buildTestPrintReceipt,
} from './escpos';
import { generateSessionCode, signTableToken } from './security';

const FOURTEEN_HOURS_MS = 14 * 60 * 60 * 1000;
const STATE_KEY = 'pitstop2:state:v1';

interface PersistedState {
  shift: ShiftState;
  tables: Record<number, TableState>;
  todayDateKey: string;
  todayOrders: Order[];
  printJobs: PrintJob[];
  bridge: {
    lastSeenAt: number | null;
    lastAckAt: number | null;
    printerHost: string | null;
    mode: 'tcp' | 'spooler' | null;
    lastError: string | null;
  };
  rateLimits: {
    tableLastOrder: Record<number, number>;
    tableWindow: Record<number, number[]>;
    ipWindow: Record<string, number[]>;
  };
  clientIds: Record<string, { orderId: string; createdAt: number }>;
}

function getTodayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' }); // YYYY-MM-DD
}

function createInitialTables(): Record<number, TableState> {
  const tables: Record<number, TableState> = {};
  for (let i = 1; i <= TOTAL_TABLES; i++) {
    tables[i] = {
      tableNumber: i,
      status: 'closed',
      sessionCode: null,
      covers: 0,
      openedAt: null,
      orders: [],
      total: 0,
      qrToken: signTableToken(i),
    };
  }
  return tables;
}

function createInitialState(): PersistedState {
  return {
    shift: {
      isOpen: false,
      shiftId: null,
      openedAt: null,
      closedAt: null,
      autoClosesAt: null,
    },
    tables: createInitialTables(),
    todayDateKey: getTodayKey(),
    todayOrders: [],
    printJobs: [],
    bridge: {
      lastSeenAt: null,
      lastAckAt: null,
      printerHost: null,
      mode: null,
      lastError: null,
    },
    rateLimits: {
      tableLastOrder: {},
      tableWindow: {},
      ipWindow: {},
    },
    clientIds: {},
  };
}

// In-memory fallback store across HMR/requests in dev
const globalMemory = globalThis as unknown as {
  __pitstop2Memory?: Map<string, string>;
  __pitstop2UpstashReadOnly?: boolean;
};
if (!globalMemory.__pitstop2Memory) {
  globalMemory.__pitstop2Memory = new Map<string, string>();
}

function cleanEnv(val: string | undefined): string | undefined {
  if (!val) return undefined;
  const t = val.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

function getUpstashCredentials(): { url?: string; token?: string } {
  const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL) || cleanEnv(process.env.KV_REST_API_URL);
  const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN) || cleanEnv(process.env.KV_REST_API_TOKEN);
  return { url, token };
}

export function isUpstashConfigured(): boolean {
  const { url, token } = getUpstashCredentials();
  return Boolean(url && token);
}

async function upstashCommand<T = unknown>(command: unknown[]): Promise<T> {
  const { url: raw, token } = getUpstashCredentials();
  const rawUrl = raw?.replace(/\/$/, '');
  if (!rawUrl || !token) {
    throw new Error('UPSTASH_NOT_CONFIGURED');
  }
  const url = rawUrl.startsWith('http://') || rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Upstash HTTP ${res.status}: ${text.slice(0, 180)}`);
  }
  const data = JSON.parse(text) as { result?: T; error?: string };
  if (data.error) {
    throw new Error(`Upstash error: ${data.error}`);
  }
  return (data.result ?? null) as T;
}

function isReadOnlyPermissionError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('403') || msg.includes('NOPERM') || msg.toLowerCase().includes('no permissions');
}

async function redisGet(key: string): Promise<string | null> {
  if (isUpstashConfigured() && !globalMemory.__pitstop2UpstashReadOnly) {
    return upstashCommand<string | null>(['GET', key]);
  }
  return globalMemory.__pitstop2Memory!.get(key) ?? null;
}

async function redisSet(key: string, value: string): Promise<void> {
  if (isUpstashConfigured() && !globalMemory.__pitstop2UpstashReadOnly) {
    try {
      await upstashCommand(['SET', key, value]);
      return;
    } catch (err) {
      if (isReadOnlyPermissionError(err)) {
        globalMemory.__pitstop2UpstashReadOnly = true;
        globalMemory.__pitstop2Memory!.set(key, value);
        console.warn('[PitStop2] Upstash token is read-only (403 NOPERM); switched to in-memory fallback.');
        return;
      }
      throw err;
    }
  }
  globalMemory.__pitstop2Memory!.set(key, value);
}

// Simple serialized async lock per process to prevent race conditions during state mutations
let mutationQueue: Promise<unknown> = Promise.resolve();
export function withStateLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = mutationQueue.then(fn, fn);
  mutationQueue = next.catch(() => {});
  return next;
}

async function loadState(): Promise<{ state: PersistedState; dirty: boolean }> {
  const raw = await redisGet(STATE_KEY);
  let state: PersistedState = createInitialState();
  let dirty = false;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.tables && parsed.shift) {
        state = parsed as PersistedState;
      } else if (typeof parsed === 'string') {
        const inner = JSON.parse(parsed);
        if (inner && typeof inner === 'object' && inner.tables && inner.shift) {
          state = inner as PersistedState;
          dirty = true;
        }
      }
    } catch {
      state = createInitialState();
      dirty = true;
    }
  }

  const now = Date.now();
  const today = getTodayKey();

  // Roll over daily history at midnight (Europe/Rome)
  if (state.todayDateKey !== today) {
    state.todayDateKey = today;
    state.todayOrders = [];
    // Keep only pending print jobs across midnight, purge old printed jobs
    state.printJobs = state.printJobs.filter((j) => j.status === 'pending');
    dirty = true;
  }

  // Ensure all 15 tables exist and QR tokens stay current
  for (let i = 1; i <= TOTAL_TABLES; i++) {
    if (!state.tables[i]) {
      state.tables[i] = {
        tableNumber: i,
        status: 'closed',
        sessionCode: null,
        covers: 0,
        openedAt: null,
        orders: [],
        total: 0,
        qrToken: signTableToken(i),
      };
      dirty = true;
    } else {
      const currentSig = signTableToken(i);
      if (state.tables[i].qrToken !== currentSig) {
        state.tables[i].qrToken = currentSig;
        dirty = true;
      }
    }
  }

  // Auto-close shift after 14 hours
  if (state.shift.isOpen && state.shift.openedAt && now - state.shift.openedAt >= FOURTEEN_HOURS_MS) {
    state.shift.isOpen = false;
    state.shift.closedAt = now;
    for (let i = 1; i <= TOTAL_TABLES; i++) {
      if (state.tables[i].status === 'open') {
        state.tables[i].status = 'closed';
        state.tables[i].sessionCode = null;
        state.tables[i].covers = 0;
        state.tables[i].openedAt = null;
        state.tables[i].orders = [];
        state.tables[i].total = 0;
      }
    }
    dirty = true;
  }

  // Auto-close forgotten tables after 14 hours
  for (let i = 1; i <= TOTAL_TABLES; i++) {
    const tbl = state.tables[i];
    if (tbl.status === 'open' && tbl.openedAt && now - tbl.openedAt >= FOURTEEN_HOURS_MS) {
      tbl.status = 'closed';
      tbl.sessionCode = null;
      tbl.covers = 0;
      tbl.openedAt = null;
      tbl.orders = [];
      tbl.total = 0;
      dirty = true;
    }
  }

  // Prune expired clientIds (> 30 mins)
  for (const [cid, entry] of Object.entries(state.clientIds)) {
    if (now - entry.createdAt > 30 * 60 * 1000) {
      delete state.clientIds[cid];
      dirty = true;
    }
  }

  if (dirty) {
    await redisSet(STATE_KEY, JSON.stringify(state));
  }

  return { state, dirty };
}

async function saveState(state: PersistedState): Promise<void> {
  await redisSet(STATE_KEY, JSON.stringify(state));
}

export function computeBridgeStatus(bridge: PersistedState['bridge']): BridgeHeartbeat {
  const now = Date.now();
  let status: BridgeHeartbeat['status'] = 'offline';
  if (bridge.lastSeenAt) {
    const diff = now - bridge.lastSeenAt;
    if (diff <= 15_000) status = 'online';
    else if (diff <= 45_000) status = 'warning';
    else status = 'offline';
  }
  return {
    ...bridge,
    status,
  };
}

export async function getAppState(): Promise<AppStateResponse> {
  const { state } = await loadState();
  const tablesList = Object.values(state.tables).sort((a, b) => a.tableNumber - b.tableNumber);
  const readOnly = Boolean(globalMemory.__pitstop2UpstashReadOnly);
  const storageMode: AppStateResponse['storageMode'] = readOnly
    ? 'upstash-readonly-fallback'
    : isUpstashConfigured()
      ? 'upstash'
      : 'memory';
  return {
    shift: state.shift,
    tables: tablesList,
    bridge: computeBridgeStatus(state.bridge),
    pendingJobsCount: state.printJobs.filter((j) => j.status === 'pending').length,
    serverTime: Date.now(),
    storageMode,
    storageWarning: readOnly
      ? 'UPSTASH_REDIS_REST_TOKEN è un token di sola lettura (HTTP 403 NOPERM su SET). È attivo il fallback in memoria: sostituisci il token nei Secrets con il token Standard (Read/Write) di Upstash per attivare la persistenza su Redis.'
      : undefined,
  };
}

export async function openShift(): Promise<ShiftState> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const now = Date.now();
    state.shift = {
      isOpen: true,
      shiftId: `S-${now}`,
      openedAt: now,
      closedAt: null,
      autoClosesAt: now + FOURTEEN_HOURS_MS,
    };
    await saveState(state);
    return state.shift;
  });
}

export async function closeShift(): Promise<ShiftState> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const now = Date.now();
    state.shift.isOpen = false;
    state.shift.closedAt = now;
    // Also close any leftover open tables when shift closes
    for (let i = 1; i <= TOTAL_TABLES; i++) {
      state.tables[i] = {
        ...state.tables[i],
        status: 'closed',
        sessionCode: null,
        covers: 0,
        openedAt: null,
        orders: [],
        total: 0,
      };
    }
    await saveState(state);
    return state.shift;
  });
}

export async function openTable(tableNumber: number, covers: number): Promise<TableState> {
  return withStateLock(async () => {
    const { state } = await loadState();
    if (!state.shift.isOpen) {
      throw new Error('SHIFT_CLOSED');
    }
    const tbl = state.tables[tableNumber];
    if (!tbl) throw new Error('INVALID_TABLE');
    if (tbl.status === 'open') {
      if (covers > 0) tbl.covers = covers;
      await saveState(state);
      return tbl;
    }
    tbl.status = 'open';
    tbl.sessionCode = generateSessionCode();
    tbl.covers = Math.max(1, Math.min(30, covers || 2));
    tbl.openedAt = Date.now();
    tbl.orders = [];
    tbl.total = 0;
    await saveState(state);
    return tbl;
  });
}

export async function updateTableCovers(tableNumber: number, covers: number): Promise<TableState> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const tbl = state.tables[tableNumber];
    if (!tbl) throw new Error('INVALID_TABLE');
    tbl.covers = Math.max(1, Math.min(30, covers));
    await saveState(state);
    return tbl;
  });
}

export async function closeTable(tableNumber: number, printBill = false): Promise<{ table: TableState; printJob?: PrintJob }> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const tbl = state.tables[tableNumber];
    if (!tbl) throw new Error('INVALID_TABLE');

    let billJob: PrintJob | undefined;
    if (printBill && tbl.orders.length > 0) {
      const built = buildTableBillReceipt(tbl);
      billJob = {
        id: `PJ-${crypto.randomUUID().slice(0, 8)}`,
        type: 'CONTO',
        tableNumber,
        createdAt: Date.now(),
        status: 'pending',
        payloadBase64: built.payloadBase64,
        previewText: built.previewText,
      };
      state.printJobs.unshift(billJob);
    }

    tbl.status = 'closed';
    tbl.sessionCode = null;
    tbl.covers = 0;
    tbl.openedAt = null;
    tbl.orders = [];
    tbl.total = 0;
    await saveState(state);
    return { table: tbl, printJob: billJob };
  });
}

export async function enqueueTableBillPrint(tableNumber: number): Promise<PrintJob> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const tbl = state.tables[tableNumber];
    if (!tbl || tbl.status !== 'open') throw new Error('TABLE_CLOSED');
    const built = buildTableBillReceipt(tbl);
    const job: PrintJob = {
      id: `PJ-${crypto.randomUUID().slice(0, 8)}`,
      type: 'CONTO',
      tableNumber,
      createdAt: Date.now(),
      status: 'pending',
      payloadBase64: built.payloadBase64,
      previewText: built.previewText,
    };
    state.printJobs.unshift(job);
    await saveState(state);
    return job;
  });
}

export interface SubmitOrderInput {
  tableNumber: number;
  source: OrderSource;
  covers?: number;
  sessionCode?: string;
  clientId?: string;
  ipAddress?: string;
  generalNote?: string;
  items: Array<{
    itemId: string;
    qty: number;
    selectedOptions: string[];
    quickNotes: string[];
    customNote?: string;
  }>;
}

export async function submitOrder(input: SubmitOrderInput): Promise<{ order: Order; table: TableState; deduplicated?: boolean }> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const now = Date.now();

    if (!state.shift.isOpen) {
      throw new Error('SHIFT_CLOSED');
    }

    const tbl = state.tables[input.tableNumber];
    if (!tbl) throw new Error('INVALID_TABLE');

    // Double-submit idempotency check
    if (input.clientId && state.clientIds[input.clientId]) {
      const prevId = state.clientIds[input.clientId].orderId;
      const existingOrder = state.todayOrders.find((o) => o.id === prevId);
      if (existingOrder) {
        return { order: existingOrder, table: tbl, deduplicated: true };
      }
    }

    if (input.source === 'customer') {
      if (tbl.status !== 'open') {
        throw new Error('TABLE_CLOSED');
      }
      if (!tbl.sessionCode || input.sessionCode?.trim() !== tbl.sessionCode) {
        throw new Error('INVALID_SESSION_CODE');
      }

      // Anti-abuse rate limits for customer orders:
      // 1) 1 order per 15 seconds per table
      const lastOrderTs = state.rateLimits.tableLastOrder[input.tableNumber] || 0;
      if (now - lastOrderTs < 15_000) {
        throw new Error('RATE_LIMIT_15S');
      }

      // 2) 8 orders per 10 minutes per table
      const tenMinAgo = now - 10 * 60 * 1000;
      const tWin = (state.rateLimits.tableWindow[input.tableNumber] || []).filter((ts) => ts > tenMinAgo);
      if (tWin.length >= 8) {
        throw new Error('RATE_LIMIT_TABLE_10M');
      }

      // 3) 25 orders per 10 minutes per network IP
      const ipKey = input.ipAddress || 'unknown';
      const ipWin = (state.rateLimits.ipWindow[ipKey] || []).filter((ts) => ts > tenMinAgo);
      if (ipWin.length >= 25) {
        throw new Error('RATE_LIMIT_IP_10M');
      }

      state.rateLimits.tableLastOrder[input.tableNumber] = now;
      state.rateLimits.tableWindow[input.tableNumber] = [...tWin, now];
      state.rateLimits.ipWindow[ipKey] = [...ipWin, now];
    } else {
      // Staff order: auto-open table if closed
      if (tbl.status === 'closed') {
        tbl.status = 'open';
        tbl.sessionCode = generateSessionCode();
        tbl.covers = Math.max(1, input.covers || 2);
        tbl.openedAt = now;
        tbl.orders = [];
        tbl.total = 0;
      } else if (input.covers && input.covers > 0) {
        tbl.covers = input.covers;
      }
    }

    if (!input.items || input.items.length === 0) {
      throw new Error('EMPTY_ORDER');
    }

    // Reconstruct canonical line items & calculate server-verified prices
    const canonicalItems: OrderLineItem[] = [];
    for (const raw of input.items) {
      const found = ALL_MENU_ITEMS_MAP.get(raw.itemId);
      if (!found) continue;
      const qty = Math.max(1, Math.min(50, Math.floor(raw.qty || 1)));

      // Calculate option price delta
      let unitPrice = found.item.price;
      if (found.item.optionGroups) {
        for (const group of found.item.optionGroups) {
          for (const choice of group.choices) {
            if (
              choice.priceDelta &&
              (raw.selectedOptions.includes(choice.label.it) ||
                raw.selectedOptions.includes(choice.label.en) ||
                raw.selectedOptions.includes(choice.label.de))
            ) {
              unitPrice += choice.priceDelta;
            }
          }
        }
      }

      // Normalize selected options to Italian canonical label for kitchen/bar
      const normalizedOptions: string[] = [];
      if (found.item.optionGroups) {
        for (const optText of raw.selectedOptions) {
          let matchedIt = optText;
          for (const group of found.item.optionGroups) {
            const c = group.choices.find(
              (ch) => ch.label.it === optText || ch.label.en === optText || ch.label.de === optText
            );
            if (c) {
              matchedIt = c.label.it;
              break;
            }
          }
          normalizedOptions.push(matchedIt);
        }
      } else {
        normalizedOptions.push(...raw.selectedOptions);
      }

      canonicalItems.push({
        lineId: crypto.randomUUID().slice(0, 8),
        itemId: found.item.id,
        categoryId: found.category.id,
        department: found.category.department,
        name: found.item.name.it,
        qty,
        unitPrice: Math.max(0.5, Number(unitPrice.toFixed(2))),
        selectedOptions: normalizedOptions,
        quickNotes: (raw.quickNotes || []).slice(0, 6),
        customNote: raw.customNote?.slice(0, 140),
      });
    }

    if (canonicalItems.length === 0) {
      throw new Error('EMPTY_ORDER');
    }

    const total = Number(
      canonicalItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0).toFixed(2)
    );

    const orderId = `ORD-${now}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const order: Order = {
      id: orderId,
      tableNumber: input.tableNumber,
      source: input.source,
      covers: tbl.covers,
      items: canonicalItems,
      generalNote: input.generalNote?.trim().slice(0, 240) || undefined,
      total,
      createdAt: now,
      clientId: input.clientId,
      printJobIds: [],
    };

    // Generate 2 receipt streams: Department(s) (CUCINA / BAR without prices, double size) + CASSA (with prices, non fiscale)
    const kitchenItems = canonicalItems.filter((i) => i.department === 'CUCINA');
    const barItems = canonicalItems.filter((i) => i.department === 'BAR');

    const newJobs: PrintJob[] = [];

    if (kitchenItems.length > 0) {
      const built = buildDepartmentReceipt(order, 'CUCINA', kitchenItems);
      const job: PrintJob = {
        id: `PJ-${crypto.randomUUID().slice(0, 8)}`,
        type: 'CUCINA',
        tableNumber: order.tableNumber,
        orderId: order.id,
        source: order.source,
        createdAt: now,
        status: 'pending',
        payloadBase64: built.payloadBase64,
        previewText: built.previewText,
      };
      newJobs.push(job);
      order.printJobIds.push(job.id);
    }

    if (barItems.length > 0) {
      const built = buildDepartmentReceipt(order, 'BAR', barItems);
      const job: PrintJob = {
        id: `PJ-${crypto.randomUUID().slice(0, 8)}`,
        type: 'BAR',
        tableNumber: order.tableNumber,
        orderId: order.id,
        source: order.source,
        createdAt: now,
        status: 'pending',
        payloadBase64: built.payloadBase64,
        previewText: built.previewText,
      };
      newJobs.push(job);
      order.printJobIds.push(job.id);
    }

    // Cashier copy
    const cassaBuilt = buildCashierOrderReceipt(order);
    const cassaJob: PrintJob = {
      id: `PJ-${crypto.randomUUID().slice(0, 8)}`,
      type: 'CASSA',
      tableNumber: order.tableNumber,
      orderId: order.id,
      source: order.source,
      createdAt: now,
      status: 'pending',
      payloadBase64: cassaBuilt.payloadBase64,
      previewText: cassaBuilt.previewText,
    };
    newJobs.push(cassaJob);
    order.printJobIds.push(cassaJob.id);

    // Persist
    tbl.orders.push(order);
    tbl.total = Number((tbl.total + order.total).toFixed(2));
    state.todayOrders.unshift(order);
    state.printJobs.unshift(...newJobs);

    if (input.clientId) {
      state.clientIds[input.clientId] = { orderId: order.id, createdAt: now };
    }

    await saveState(state);
    return { order, table: tbl };
  });
}

export async function getTodayHistory(): Promise<{ orders: Order[]; printJobs: PrintJob[]; bridge: BridgeHeartbeat }> {
  const { state } = await loadState();
  return {
    orders: state.todayOrders,
    printJobs: state.printJobs.slice(0, 150),
    bridge: computeBridgeStatus(state.bridge),
  };
}

export async function reprintJob(jobId: string): Promise<PrintJob> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const original = state.printJobs.find((j) => j.id === jobId);
    if (!original) throw new Error('JOB_NOT_FOUND');

    const copy: PrintJob = {
      ...original,
      id: `PJ-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: Date.now(),
      printedAt: undefined,
      status: 'pending',
      reprintOf: original.id,
    };
    state.printJobs.unshift(copy);
    await saveState(state);
    return copy;
  });
}

export async function enqueueTestPrint(): Promise<PrintJob> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const built = buildTestPrintReceipt();
    const job: PrintJob = {
      id: `PJ-${crypto.randomUUID().slice(0, 8)}`,
      type: 'TEST',
      tableNumber: 0,
      createdAt: Date.now(),
      status: 'pending',
      payloadBase64: built.payloadBase64,
      previewText: built.previewText,
    };
    state.printJobs.unshift(job);
    await saveState(state);
    return job;
  });
}

export async function pollPendingJobsForBridge(meta?: {
  printerHost?: string;
  mode?: 'tcp' | 'spooler';
  lastError?: string | null;
}): Promise<PrintJob[]> {
  return withStateLock(async () => {
    const { state } = await loadState();
    state.bridge.lastSeenAt = Date.now();
    if (meta?.printerHost) state.bridge.printerHost = meta.printerHost;
    if (meta?.mode) state.bridge.mode = meta.mode;
    if (meta?.lastError !== undefined) state.bridge.lastError = meta.lastError;
    await saveState(state);

    // Return oldest-first pending jobs so kitchen prints in chronological order
    return state.printJobs
      .filter((j) => j.status === 'pending')
      .slice()
      .reverse();
  });
}

export async function ackPrintJobs(jobIds: string[], errorMsg?: string | null): Promise<number> {
  return withStateLock(async () => {
    const { state } = await loadState();
    const now = Date.now();
    state.bridge.lastSeenAt = now;
    if (errorMsg) {
      state.bridge.lastError = errorMsg;
    } else {
      state.bridge.lastAckAt = now;
      state.bridge.lastError = null;
    }

    let acked = 0;
    for (const job of state.printJobs) {
      if (jobIds.includes(job.id) && job.status === 'pending') {
        job.status = 'printed';
        job.printedAt = now;
        acked++;
      }
    }
    await saveState(state);
    return acked;
  });
}

export async function recordBridgeHeartbeat(meta: {
  printerHost?: string;
  mode?: 'tcp' | 'spooler';
  lastError?: string | null;
}): Promise<BridgeHeartbeat> {
  return withStateLock(async () => {
    const { state } = await loadState();
    state.bridge.lastSeenAt = Date.now();
    if (meta.printerHost) state.bridge.printerHost = meta.printerHost;
    if (meta.mode) state.bridge.mode = meta.mode;
    if (meta.lastError !== undefined) state.bridge.lastError = meta.lastError;
    await saveState(state);
    return computeBridgeStatus(state.bridge);
  });
}

export async function getCustomerTableInfo(tableNumber: number): Promise<{
  shiftOpen: boolean;
  table: { tableNumber: number; status: 'closed' | 'open'; covers: number; total: number };
}> {
  const { state } = await loadState();
  const tbl = state.tables[tableNumber];
  if (!tbl) throw new Error('INVALID_TABLE');
  return {
    shiftOpen: state.shift.isOpen,
    table: {
      tableNumber: tbl.tableNumber,
      status: tbl.status,
      covers: tbl.covers,
      total: tbl.total,
    },
  };
}
