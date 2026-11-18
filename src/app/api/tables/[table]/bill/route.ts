import { NextRequest, NextResponse } from 'next/server';
import { isStaffAuthenticated } from '@/lib/staffAuth';
import { enqueueTableBillPrint } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest, { params }: { params: { table: string } }) {
  if (!isStaffAuthenticated()) {
    return NextResponse.json({ error: 'PIN richiesto' }, { status: 401 });
  }
  try {
    const printJob = await enqueueTableBillPrint(Number(params.table));
    return NextResponse.json({ printJob });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
