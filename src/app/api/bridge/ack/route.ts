import { NextRequest, NextResponse } from 'next/server';
import { verifyBridgeAuth } from '@/lib/security';
import { ackPrintJobs } from '@/lib/store';

export async function POST(req: NextRequest) {
  if (!verifyBridgeAuth(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const acked = await ackPrintJobs(Array.isArray(body.jobIds) ? body.jobIds : [], body.error ?? null);
  return NextResponse.json({ ok: true, acked });
}
