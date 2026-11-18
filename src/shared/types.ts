export type Department = 'CUCINA' | 'BAR';
export type Lang = 'it' | 'en' | 'de';
export type OrderSource = 'staff' | 'customer';
export type PrintJobType = 'CUCINA' | 'BAR' | 'CASSA' | 'CONTO' | 'TEST';
export type PrintJobStatus = 'pending' | 'printed';

export interface LocalizedText {
  it: string;
  en: string;
  de: string;
}

export interface MenuOptionChoice {
  id: string;
  label: LocalizedText;
  priceDelta?: number;
}

export interface MenuOptionGroup {
  id: string;
  label: LocalizedText;
  required?: boolean;
  choices: MenuOptionChoice[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: LocalizedText;
  description: LocalizedText;
  price: number;
  allergens?: string[];
  optionGroups?: MenuOptionGroup[];
}

export interface MenuCategory {
  id: string;
  order: number;
  department: Department;
  name: LocalizedText;
  items: MenuItem[];
}

export interface QuickNote {
  id: string;
  department: Department | 'ALL';
  label: LocalizedText;
}

export interface OrderLineItem {
  lineId: string;
  itemId: string;
  categoryId: string;
  department: Department;
  name: string; // Italian canonical name for kitchen/bar tickets
  displayName?: string;
  qty: number;
  unitPrice: number;
  selectedOptions: string[]; // e.g. ["Frizzante", "1L"]
  quickNotes: string[];
  customNote?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  source: OrderSource;
  covers: number;
  items: OrderLineItem[];
  generalNote?: string;
  total: number;
  createdAt: number;
  clientId?: string;
  printJobIds: string[];
}

export interface TableState {
  tableNumber: number;
  status: 'closed' | 'open';
  sessionCode: string | null;
  covers: number;
  openedAt: number | null;
  orders: Order[];
  total: number;
  qrToken?: string;
}

export interface ShiftState {
  isOpen: boolean;
  shiftId: string | null;
  openedAt: number | null;
  closedAt: number | null;
  autoClosesAt: number | null;
}

export interface PrintJob {
  id: string;
  type: PrintJobType;
  tableNumber: number;
  orderId?: string;
  source?: OrderSource;
  createdAt: number;
  printedAt?: number;
  status: PrintJobStatus;
  previewText: string;
  payloadBase64: string;
  reprintOf?: string;
}

export interface BridgeHeartbeat {
  lastSeenAt: number | null;
  lastAckAt: number | null;
  printerHost: string | null;
  mode: 'tcp' | 'spooler' | null;
  lastError: string | null;
  status: 'online' | 'warning' | 'offline';
}

export interface AppStateResponse {
  shift: ShiftState;
  tables: TableState[];
  bridge: BridgeHeartbeat;
  pendingJobsCount: number;
  serverTime: number;
  storageMode: 'upstash' | 'memory' | 'upstash-readonly-fallback';
  storageWarning?: string;
}
