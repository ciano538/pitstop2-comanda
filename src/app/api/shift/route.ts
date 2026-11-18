import { NextRequest, NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { closeShift, openShift } from '@/lib/store';

export async function POST(req: NextRequest) {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const shift = body.action === 'open' ? await openShift() : await closeShift();
    return NextResponse.json({ shift });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
