import crypto from 'node:crypto';

const DEFAULT_TABLE_SECRET = 'pitstop2-dev-table-secret-change-me';
const DEFAULT_STAFF_PIN = '1234';
const DEFAULT_BRIDGE_TOKEN = 'pitstop2-dev-bridge-token';

export function getTableSecret(): string {
  return process.env.TABLE_SECRET?.trim() || DEFAULT_TABLE_SECRET;
}

export function getStaffPin(): string {
  return process.env.STAFF_PIN?.trim() || DEFAULT_STAFF_PIN;
}

export function getBridgeToken(): string {
  return process.env.BRIDGE_TOKEN?.trim() || DEFAULT_BRIDGE_TOKEN;
}

export function signTableToken(tableNumber: number): string {
  const hmac = crypto.createHmac('sha256', getTableSecret());
  hmac.update(`pitstop2:table:${tableNumber}`);
  return hmac.digest('base64url').slice(0, 16);
}

export function verifyTableToken(tableNumber: number, token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const expected = signTableToken(tableNumber);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(token.trim(), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyStaffPin(pin: string | undefined | null): boolean {
  if (!pin || typeof pin !== 'string') return false;
  const expected = getStaffPin();
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(pin.trim(), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyBridgeAuth(authHeader: string | undefined | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  const expected = getBridgeToken();
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(token, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function generateSessionCode(): string {
  const num = crypto.randomInt(1000, 10000);
  return String(num);
}

export function createStaffSessionToken(): string {
  const hmac = crypto.createHmac('sha256', getTableSecret() + ':staff');
  hmac.update(getStaffPin());
  return hmac.digest('base64url');
}

export function verifyStaffSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== 'string') return false;
  const expected = createStaffSessionToken();
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(token.trim(), 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
