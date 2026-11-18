import { NextRequest, NextResponse } from 'next/server';
import { verifyTableToken } from '@/lib/security';
import { submitOrder } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tableNumber = Number(body.tableNumber);
    if (!verifyTableToken(tableNumber, body.qrToken)) {
      return NextResponse.json({ error: 'QR non valido', code: 'INVALID_QR' }, { status: 403 });
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const result = await submitOrder({
      tableNumber,
      source: 'customer',
      sessionCode: body.sessionCode,
      generalNote: body.generalNote,
      clientId: body.clientId,
      ipAddress: ip,
      items: body.items || [],
    });
    return NextResponse.json(result);
  } catch (err) {
    const code = (err as Error).message;
    const status = code.startsWith('RATE_LIMIT') ? 429 : 400;
    return NextResponse.json({ error: code, code }, { status });
  }
}
