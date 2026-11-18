import { NextRequest, NextResponse } from 'next/server';
import { createStaffSessionToken, verifyStaffPin } from '@/lib/security';
import { STAFF_COOKIE_NAME } from '@/lib/staffAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!verifyStaffPin(body.pin)) {
    return NextResponse.json({ error: 'PIN non valido' }, { status: 401 });
  }
  const token = createStaffSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 16,
  });
  return res;
}
