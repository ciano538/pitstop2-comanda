import { NextRequest, NextResponse } from 'next/server';
import { verifyTableToken } from '@/lib/security';
import { getCustomerTableInfo } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { table: string } }) {
  const tableNumber = Number(params.table);
  const k = req.nextUrl.searchParams.get('k');
  if (!Number.isInteger(tableNumber) || tableNumber < 1 || tableNumber > 15) {
    return NextResponse.json({ error: 'Tavolo non valido' }, { status: 400 });
  }
  if (!verifyTableToken(tableNumber, k)) {
    return NextResponse.json({ error: 'QR non valido' }, { status: 403 });
  }
  try {
    const info = await getCustomerTableInfo(tableNumber);
    return NextResponse.json(info);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
