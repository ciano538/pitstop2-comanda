import { NextRequest, NextResponse } from 'next/server';
import { verifyBridgeAuth } from '@/lib/security';
import { recordBridgeHeartbeat } from '@/lib/store';

export async function POST(req: NextRequest) {
  if (!verifyBridgeAuth(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const bridge = await recordBridgeHeartbeat({
    printerHost: body.printerHost,
    mode: body.mode,
    lastError: body.lastError ?? null,
  });
  return NextResponse.json({ ok: true, bridge });
}
