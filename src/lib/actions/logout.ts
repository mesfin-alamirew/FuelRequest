'use server';

import { cookies } from 'next/headers';

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set('app_session', '', { expires: new Date(0), path: '/' });
}
