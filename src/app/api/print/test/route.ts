import { NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { enqueueTestPrint } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const printJob = await enqueueTestPrint();
    return NextResponse.json({ printJob });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
