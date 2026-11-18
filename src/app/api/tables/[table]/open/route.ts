import { NextRequest, NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { openTable } from '@/lib/store';

export async function POST(req: NextRequest, { params }: { params: { table: string } }) {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const table = await openTable(Number(params.table), Number(body.covers || 2));
    return NextResponse.json({ table });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore';
    return NextResponse.json(
      { error: message === 'SHIFT_CLOSED' ? 'Apri prima il turno da /turno' : message },
      { status: 400 }
    );
  }
}
