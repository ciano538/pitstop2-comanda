import { cookies } from 'next/headers';
import { verifyStaffSessionToken } from './security';

export const STAFF_COOKIE_NAME = 'pitstop2_staff';

export function isStaffAuthenticated(): boolean {
  const token = cookies().get(STAFF_COOKIE_NAME)?.value;
  return verifyStaffSessionToken(token);
}
