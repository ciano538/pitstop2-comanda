import { NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { getAppState } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const state = await getAppState();
    return NextResponse.json(state);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
