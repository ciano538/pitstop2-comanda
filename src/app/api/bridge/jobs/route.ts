import { NextRequest, NextResponse } from 'next/server';
import { verifyBridgeAuth } from '@/lib/security';
import { pollPendingJobsForBridge } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!verifyBridgeAuth(req.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const printerHost = req.nextUrl.searchParams.get('printerHost') || undefined;
  const modeParam = req.nextUrl.searchParams.get('mode');
  const mode = modeParam === 'spooler' ? 'spooler' : modeParam === 'tcp' ? 'tcp' : undefined;
  const jobs = await pollPendingJobsForBridge({ printerHost, mode });
  return NextResponse.json({ jobs });
}
