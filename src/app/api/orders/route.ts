import { NextRequest, NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { submitOrder } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const res = await submitOrder({
      tableNumber: Number(body.tableNumber),
      source: 'staff',
      covers: Number(body.covers || 2),
      generalNote: body.generalNote,
      clientId: body.clientId,
      items: body.items || [],
    });
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
