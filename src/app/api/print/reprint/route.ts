import { NextRequest, NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { reprintJob } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const printJob = await reprintJob(body.jobId);
    return NextResponse.json({ printJob });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
