import { NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { getTodayHistory } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const history = await getTodayHistory();
    return NextResponse.json(history);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
