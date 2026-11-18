import { NextRequest, NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { closeTable } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { table: string } }) {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const result = await closeTable(Number(params.table), Boolean(body.printBill));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
